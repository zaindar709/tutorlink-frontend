import {
  getTutorOnboardingStatusAPI,
  scheduleTutorOnboardingInterviewAPI,
  submitTutorOnboardingStep1API,
} from '../../api/tutorOnboarding.api';
import { TutorOnboardingStatusData } from '../../types/api.types';
import {
  buildUploadFile,
  guessMimeType,
} from '../../utils/upload/fileUpload';
import {
  maskToken,
  postMultipart,
  resolveUploadAuthToken,
} from '../../utils/upload/uploadDebug';
import { saveTutorOnboardingCache } from './tutorOnboardingCache';

const LOG = '[TutorUpload]';

export const getTutorOnboardingStatus =
  async (): Promise<TutorOnboardingStatusData> => {
    console.log(LOG, 'GET /onboarding/status');
    const response = await getTutorOnboardingStatusAPI({ timeout: 12000 });
    const data = response.data.data ?? {};
    console.log(LOG, 'status response', data);
    await saveTutorOnboardingCache(data);
    return data;
  };

export const submitTutorOnboardingStep1 = async (payload: {
  subject: string;
  grades: string[];
  hourlyRate?: number;
  availability?: boolean;
  qualification?: string;
  experience?: string;
  experienceYears?: number;
  bio?: string;
  name?: string;
  phoneNumber?: string;
}): Promise<TutorOnboardingStatusData> => {
  console.log(LOG, 'PATCH /onboarding/step-1', payload);
  const response = await submitTutorOnboardingStep1API(payload);
  console.log(LOG, 'step-1 response', response.data?.data ?? response.data);
  return response.data.data ?? {};
};

const ensureOnboardingStep1 = async (fallback?: {
  subject?: string;
  grades?: string[];
}) => {
  console.log(LOG, 'ensureOnboardingStep1 fallback', fallback);
  const status = await getTutorOnboardingStatus();
  const step = status.onboardingStep ?? 1;
  console.log(LOG, 'current onboarding step', {
    step,
    subjects: status.subjects,
    grades: status.grades,
    onboardingStatus: status.onboardingStatus,
  });

  if (step >= 2) {
    console.log(LOG, 'step-1 already complete, skipping');
    return status;
  }

  const subject = status.subjects?.[0] || fallback?.subject;
  const grades =
    status.grades && status.grades.length > 0
      ? status.grades
      : fallback?.grades || [];

  console.log(LOG, 'resolved step-1 payload', { subject, grades });

  if (!subject || grades.length === 0) {
    throw new Error(
      'Tutor profile is incomplete. Go back and finish subject/class selection first.'
    );
  }

  return submitTutorOnboardingStep1({ subject, grades });
};

export const uploadTutorDocuments = async (
  files: {
    cnicFrontUri: string;
    cnicBackUri: string;
    cnicFrontType?: string;
    cnicBackType?: string;
    degreeUri: string;
    degreeName?: string;
    degreeType?: string;
  },
  onboardingFallback?: {
    subject?: string;
    grades?: string[];
  }
): Promise<TutorOnboardingStatusData> => {
  console.log(LOG, 'uploadTutorDocuments START', {
    files: {
      cnicFrontUri: files.cnicFrontUri,
      cnicBackUri: files.cnicBackUri,
      degreeUri: files.degreeUri,
      degreeName: files.degreeName,
      cnicFrontType: files.cnicFrontType,
      cnicBackType: files.cnicBackType,
      degreeType: files.degreeType,
    },
    onboardingFallback,
  });

  const token = await resolveUploadAuthToken();
  if (!token) {
    console.error(LOG, 'NO AUTH TOKEN — upload will get 401');
  } else {
    console.log(LOG, 'using token', maskToken(token));
  }

  await ensureOnboardingStep1(onboardingFallback);

  const front = buildUploadFile(
    files.cnicFrontUri,
    'cnic-front.jpg',
    files.cnicFrontType || guessMimeType(files.cnicFrontUri, 'image/jpeg')
  );
  const back = buildUploadFile(
    files.cnicBackUri,
    'cnic-back.jpg',
    files.cnicBackType || guessMimeType(files.cnicBackUri, 'image/jpeg')
  );
  const degreeMime =
    files.degreeType || guessMimeType(files.degreeUri, 'application/pdf');
  const isPdf = degreeMime.includes('pdf');
  const degree = buildUploadFile(
    files.degreeUri,
    files.degreeName || (isPdf ? 'degree.pdf' : 'degree.jpg'),
    degreeMime
  );

  console.log(LOG, 'FormData parts', { front, back, degree });

  const formData = new FormData();
  formData.append('cnicFront', front as unknown as Blob);
  formData.append('cnicBack', back as unknown as Blob);
  formData.append('degree', degree as unknown as Blob);

  // Prefer fetch for RN multipart — axios often drops auth / breaks boundary.
  const json = await postMultipart<{
    data?: TutorOnboardingStatusData;
    message?: string;
  }>('/api/tutor/onboarding/documents', formData, token);

  console.log(LOG, 'uploadTutorDocuments SUCCESS', json?.data ?? json);
  const result = json?.data ?? {};
  await saveTutorOnboardingCache({
    ...result,
    onboardingStatus:
      result.onboardingStatus ||
      result.verificationStatus ||
      'under_review',
  });
  return result;
};

export const scheduleTutorOnboardingInterview = async (
  interviewDate: string
): Promise<TutorOnboardingStatusData> => {
  const response = await scheduleTutorOnboardingInterviewAPI({ interviewDate });
  return response.data.data ?? {};
};
