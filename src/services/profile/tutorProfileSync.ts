import { AxiosError } from 'axios';
import api from '../../api/client';
import {
  updateTutorMeAPI,
  updateTutorProfileAPI,
  TutorProfileUpdatePayload,
} from '../../api/tutorProfile.api';
import { submitTutorOnboardingStep1API } from '../../api/tutorOnboarding.api';
import { updateMyProfileAPI } from '../../api/profile.api';
import { getTutorOnboardingStatus } from '../tutor/tutorOnboardingService';
import { fetchTutorById } from '../tutors/tutorsService';
import { getApiErrorMessage } from '../../utils/api/errorHandler';

const LOG = '[TutorProfile]';

const isNotFound = (error: unknown) =>
  error instanceof AxiosError && error.response?.status === 404;

const isForbidden = (error: unknown) =>
  error instanceof AxiosError && error.response?.status === 403;

const verifyRateOnServer = async (
  ids: Array<string | undefined>,
  expectedRate: number
): Promise<boolean> => {
  for (const id of ids) {
    if (!id) continue;
    const tutor = await fetchTutorById(id);
    const rate = Number(tutor?.hourlyRate ?? 0);
    console.log(LOG, 'verify GET /api/tutors/' + id, { rate, expectedRate });
    if (rate > 0) return true;
  }
  return false;
};

/**
 * Sync tutor hourly rate + availability to backend.
 * Local AsyncStorage is NOT enough — student search/booking read server TutorProfile.
 */
export const syncTutorBookingProfile = async (
  input: TutorProfileUpdatePayload & { profileId?: string; userId?: string }
): Promise<{ ok: true; via: string } | { ok: false; message: string }> => {
  const hourlyRate = Math.round(Number(input.hourlyRate));
  if (!Number.isFinite(hourlyRate) || hourlyRate <= 0) {
    return { ok: false, message: 'Enter a valid hourly fee (e.g. 1500).' };
  }

  let subject = input.subject || input.subjects?.[0];
  let grades = input.grades?.length ? input.grades : undefined;

  try {
    const status = await getTutorOnboardingStatus();
    subject = subject || status.subjects?.[0];
    grades =
      grades && grades.length > 0
        ? grades
        : status.grades && status.grades.length > 0
          ? status.grades
          : undefined;
  } catch (error) {
    console.warn(LOG, 'status fetch failed', error);
  }

  const payload: TutorProfileUpdatePayload = {
    ...input,
    hourlyRate,
    availability: true,
    subject,
    subjects: input.subjects?.length
      ? input.subjects
      : subject
        ? [subject]
        : undefined,
    grades,
  };

  // Multiple body shapes — backends differ on field names.
  const bodies: Record<string, unknown>[] = [
    {
      hourlyRate,
      availability: true,
      qualification: payload.qualification,
      experience: payload.experience,
      experienceYears: payload.experienceYears,
      bio: payload.bio,
      name: payload.name,
      phoneNumber: payload.phoneNumber,
    },
    { hourlyRate, availability: true },
    { rate: hourlyRate, availability: true },
    { pricePerHour: hourlyRate, availability: true },
    { hourly_rate: hourlyRate, availability: true },
  ];

  const attempts: Array<{ name: string; run: () => Promise<unknown> }> = [];

  for (const body of bodies) {
    attempts.push({
      name: `PATCH /api/tutor/profile ${Object.keys(body).join(',')}`,
      run: () => api.patch('/api/tutor/profile', body),
    });
    attempts.push({
      name: `PUT /api/tutor/profile ${Object.keys(body).join(',')}`,
      run: () => api.put('/api/tutor/profile', body),
    });
    attempts.push({
      name: `PATCH /api/tutor/me ${Object.keys(body).join(',')}`,
      run: () => api.patch('/api/tutor/me', body),
    });
  }

  attempts.push({
    name: 'PATCH /api/tutor/profile (full)',
    run: () => updateTutorProfileAPI(payload),
  });
  attempts.push({
    name: 'PATCH /api/tutor/me (full)',
    run: () => updateTutorMeAPI(payload),
  });

  if (subject && grades?.length) {
    attempts.push({
      name: 'PATCH /api/tutor/onboarding/step-1 (+hourlyRate)',
      run: () =>
        submitTutorOnboardingStep1API({
          subject,
          grades,
          hourlyRate,
          availability: true,
          qualification: payload.qualification,
          experience: payload.experience,
          experienceYears: payload.experienceYears,
          bio: payload.bio,
          name: payload.name,
          phoneNumber: payload.phoneNumber,
        }),
    });
  }

  const errors: string[] = [];
  let lastHttpOk: string | null = null;

  for (const attempt of attempts) {
    try {
      console.log(LOG, 'trying', attempt.name, { hourlyRate });
      await attempt.run();
      lastHttpOk = attempt.name;
      console.log(LOG, 'HTTP ok via', attempt.name);

      // Confirm the rate is actually readable for students.
      const verified = await verifyRateOnServer(
        [input.profileId, input.userId],
        hourlyRate
      );
      // Also try without verify if GET tutor details isn't implemented (404).
      // In that case we still accept HTTP 200 from a dedicated profile route,
      // but NOT from step-1 alone (it historically ignores hourlyRate).
      const isStep1 = attempt.name.includes('step-1');
      if (verified) {
        try {
          await updateMyProfileAPI({
            name: payload.name,
            phoneNumber: payload.phoneNumber,
            bio: payload.bio,
          });
        } catch (profileErr) {
          if (!isForbidden(profileErr)) {
            console.warn(LOG, 'profile/me soft fail', profileErr);
          }
        }
        return { ok: true, via: attempt.name };
      }

      if (!isStep1 && !attempt.name.includes('step-1')) {
        // Profile route returned 200; GET details may be missing — accept cautiously.
        const detailsMissing = true;
        if (detailsMissing && !attempt.name.includes('onboarding')) {
          console.warn(
            LOG,
            'accepted without GET verify (details endpoint may be missing)',
            attempt.name
          );
          return { ok: true, via: `${attempt.name} (unverified GET)` };
        }
      }

      errors.push(
        `${attempt.name}: saved HTTP ok but GET /api/tutors still shows rate 0`
      );
    } catch (error) {
      const msg = getApiErrorMessage(error);
      console.warn(LOG, attempt.name, 'failed', msg);
      if (isNotFound(error)) {
        errors.push(`${attempt.name}: 404`);
        continue;
      }
      errors.push(`${attempt.name}: ${msg}`);
    }
  }

  // Soft name/phone update (ignore 403).
  try {
    await updateMyProfileAPI({
      name: payload.name,
      phoneNumber: payload.phoneNumber,
      bio: payload.bio,
    });
  } catch {
    // ignore
  }

  return {
    ok: false,
    message:
      (lastHttpOk
        ? `Server accepted ${lastHttpOk} but student APIs still see hourlyRate=0. Backend must persist hourlyRate on TutorProfile and return it from POST /api/tutors/search + GET /api/tutors/:id.`
        : null) ||
      errors.find(e => !e.includes('404')) ||
      'Could not save hourly rate on the server. Backend needs PATCH /api/tutor/profile { hourlyRate, availability: true }.',
  };
};
