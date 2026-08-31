import { getTutorByIdAPI, searchTutorsAPI } from '../../api/tutors.api';
import { TutorProfile, TutorSearchPayload } from '../../types/api.types';

/** Walk response and collect the most likely tutor array. */
const extractTutorList = (payload: unknown): Record<string, unknown>[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) {
    return payload as Record<string, unknown>[];
  }
  if (typeof payload !== 'object') return [];

  const root = payload as Record<string, unknown>;
  const candidates: unknown[] = [
    root.data,
    root.tutors,
    root.results,
    root.items,
    root.docs,
    (root.data as Record<string, unknown> | undefined)?.tutors,
    (root.data as Record<string, unknown> | undefined)?.items,
    (root.data as Record<string, unknown> | undefined)?.results,
    (root.data as Record<string, unknown> | undefined)?.docs,
    (root.data as Record<string, unknown> | undefined)?.data,
  ];

  for (const c of candidates) {
    if (!Array.isArray(c) || c.length === 0) continue;
    if (typeof c[0] === 'object' && c[0] !== null) {
      return c as Record<string, unknown>[];
    }
  }

  return [];
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : null;

/** Pull hourly rate from common / nested backend shapes. */
export const extractHourlyRate = (raw: Record<string, unknown>): number | undefined => {
  const nested = [
    raw,
    asRecord(raw.profile),
    asRecord(raw.tutorProfile),
    asRecord(raw.tutor),
    asRecord(raw.details),
    asRecord(raw.pricing),
    asRecord(raw.user),
  ].filter(Boolean) as Record<string, unknown>[];

  for (const obj of nested) {
    const candidate =
      obj.hourlyRate ??
      obj.hourly_rate ??
      obj.rate ??
      obj.pricePerHour ??
      obj.price_per_hour ??
      obj.price ??
      obj.fee ??
      obj.sessionRate;
    if (candidate == null || candidate === '') continue;
    const num = Number(candidate);
    if (Number.isFinite(num) && num > 0) return num;
  }
  return undefined;
};

const asUser = (
  raw: Record<string, unknown>,
  _profileId: string
): TutorProfile['user'] => {
  const rawUser = raw.user;
  const userObj =
    rawUser && typeof rawUser === 'object'
      ? (rawUser as Record<string, unknown>)
      : {};
  const userIdFromString =
    typeof rawUser === 'string' && rawUser.trim() ? rawUser.trim() : '';

  const resolvedUserId = String(
    userObj._id ||
      userObj.id ||
      raw.userId ||
      raw.user_id ||
      userIdFromString ||
      ''
  ).trim();

  // Never fall back to TutorProfile._id — booking.confirm compares against User._id.
  const userId = resolvedUserId;

  const name = String(
    userObj.name ||
      userObj.fullName ||
      userObj.displayName ||
      raw.name ||
      raw.fullName ||
      'Tutor'
  );

  return {
    ...(userObj as TutorProfile['user']),
    _id: userId,
    id: userId || undefined,
    name,
    email: userObj.email
      ? String(userObj.email)
      : raw.email
        ? String(raw.email)
        : undefined,
    avatarUrl: userObj.avatarUrl
      ? String(userObj.avatarUrl)
      : userObj.photoURL
        ? String(userObj.photoURL)
        : raw.avatarUrl
          ? String(raw.avatarUrl)
          : undefined,
  };
};

export const normalizeTutor = (
  raw: Record<string, unknown>,
  index = 0
): TutorProfile => {
  const id = String(
    raw._id ||
      raw.id ||
      (raw.user && typeof raw.user === 'object'
        ? (raw.user as Record<string, unknown>)._id ||
          (raw.user as Record<string, unknown>).id
        : raw.user) ||
      `tutor-${index}`
  );

  const subjectsRaw = raw.subjects ?? raw.expertise ?? raw.subject;
  const subjects = Array.isArray(subjectsRaw)
    ? subjectsRaw.map(String)
    : typeof subjectsRaw === 'string' && subjectsRaw.trim()
      ? subjectsRaw
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
      : [];

  const status = String(
    raw.verificationStatus || raw.onboardingStatus || ''
  ).toLowerCase();

  const hourlyRate = extractHourlyRate(raw);

  const relationRaw = asRecord(raw.relation);
  const relation = relationRaw
    ? {
        hasPending: Boolean(
          relationRaw.hasPending || relationRaw.hasPendingPackage
        ),
        hasActive: Boolean(
          relationRaw.hasActive || relationRaw.hasActivePackage
        ),
        canRequest:
          relationRaw.canRequest === undefined
            ? !relationRaw.hasPending &&
              !relationRaw.hasActive &&
              !relationRaw.hasPendingPackage &&
              !relationRaw.hasActivePackage
            : Boolean(relationRaw.canRequest),
        hasPendingPackage: Boolean(relationRaw.hasPendingPackage),
        hasActivePackage: Boolean(relationRaw.hasActivePackage),
      }
    : undefined;

  return {
    _id: id,
    user: asUser(raw, id),
    qualification: raw.qualification
      ? String(raw.qualification)
      : raw.education
        ? String(raw.education)
        : undefined,
    experience: raw.experience != null ? String(raw.experience) : undefined,
    experienceYears:
      raw.experienceYears != null ? Number(raw.experienceYears) : undefined,
    hourlyRate,
    subjects,
    isVerified:
      raw.isVerified === true ||
      status === 'approved' ||
      status === 'verified',
    grades: Array.isArray(raw.grades) ? (raw.grades as string[]) : [],
    rating: Number(raw.rating ?? raw.averageRating ?? 0) || 0,
    availability:
      raw.availability === undefined || raw.availability === null
        ? true
        : Boolean(raw.availability),
    location: raw.location as TutorProfile['location'],
    distanceKm: raw.distanceKm != null ? Number(raw.distanceKm) : undefined,
    relation,
  };
};

const postSearch = async (
  filters: TutorSearchPayload
): Promise<TutorProfile[]> => {
  console.log('[TutorSearch] POST /api/tutors/search', filters);
  const response = await searchTutorsAPI(filters);
  const body = response.data as unknown;

  try {
    console.log('[TutorSearch] raw preview', JSON.stringify(body)?.slice(0, 800));
  } catch {
    console.log('[TutorSearch] raw type', typeof body);
  }

  const list = extractTutorList(body).map((raw, index) =>
    normalizeTutor(raw, index)
  );
  console.log(
    '[TutorSearch] parsed',
    list.length,
    list.map(
      t =>
        `${t.user?.name}(v=${t.isVerified},rate=${t.hourlyRate ?? 0},uid=${t.user?._id})`
    )
  );
  return list;
};

/**
 * Fetch one tutor by profile id or user id (backend may accept either).
 */
export const fetchTutorById = async (
  tutorId: string
): Promise<TutorProfile | null> => {
  if (!tutorId) return null;
  try {
    const response = await getTutorByIdAPI(tutorId);
    const body = response.data as unknown;
    const root = asRecord(body) || {};
    const data = asRecord(root.data) || root;
    if (!data || Object.keys(data).length === 0) return null;
    return normalizeTutor(data, 0);
  } catch (error) {
    console.warn('[TutorSearch] GET /api/tutors/:id failed', tutorId, error);
    return null;
  }
};

/**
 * Student Home / Search / Map:
 * Return every tutor the backend sends for this query.
 */
export const searchTutors = async (
  filters: TutorSearchPayload = {}
): Promise<TutorProfile[]> => {
  const hasExtraFilters = Object.keys(filters).some(
    k => filters[k as keyof TutorSearchPayload] !== undefined
  );

  if (hasExtraFilters) {
    return postSearch(filters);
  }

  try {
    const all = await postSearch({});
    if (all.length > 0) return all;
  } catch (error) {
    console.warn('[TutorSearch] empty body failed', error);
  }

  try {
    const verified = await postSearch({ isVerified: true });
    if (verified.length > 0) return verified;
  } catch (error) {
    console.warn('[TutorSearch] isVerified filter failed', error);
  }

  return [];
};
