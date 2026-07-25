import { searchTutorsAPI } from '../../api/tutors.api';
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

const asUser = (
  raw: Record<string, unknown>,
  fallbackId: string
): TutorProfile['user'] => {
  const user =
    raw.user && typeof raw.user === 'object'
      ? (raw.user as Record<string, unknown>)
      : {};

  const name = String(
    user.name ||
      user.fullName ||
      user.displayName ||
      raw.name ||
      raw.fullName ||
      'Tutor'
  );

  return {
    ...(user as TutorProfile['user']),
    _id: String(user._id || user.id || raw.userId || fallbackId),
    name,
    email: user.email
      ? String(user.email)
      : raw.email
        ? String(raw.email)
        : undefined,
    avatarUrl: user.avatarUrl
      ? String(user.avatarUrl)
      : user.photoURL
        ? String(user.photoURL)
        : raw.avatarUrl
          ? String(raw.avatarUrl)
          : undefined,
  };
};

const normalizeTutor = (
  raw: Record<string, unknown>,
  index: number
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

  return {
    _id: id,
    user: asUser(raw, id),
    qualification: raw.qualification ? String(raw.qualification) : undefined,
    experience: raw.experience != null ? String(raw.experience) : undefined,
    experienceYears:
      raw.experienceYears != null ? Number(raw.experienceYears) : undefined,
    hourlyRate: raw.hourlyRate != null ? Number(raw.hourlyRate) : undefined,
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
  };
};

const postSearch = async (
  filters: TutorSearchPayload
): Promise<TutorProfile[]> => {
  console.log('[TutorSearch] POST /api/tutors/search', filters);
  const response = await searchTutorsAPI(filters);
  const body = response.data as unknown;

  try {
    console.log('[TutorSearch] raw preview', JSON.stringify(body)?.slice(0, 600));
  } catch {
    console.log('[TutorSearch] raw type', typeof body);
  }

  const list = extractTutorList(body).map((raw, index) =>
    normalizeTutor(raw, index)
  );
  console.log(
    '[TutorSearch] parsed',
    list.length,
    list.map(t => `${t.user?.name}(v=${t.isVerified})`)
  );
  return list;
};

/**
 * Student Home / Search / Map:
 * Return every tutor the backend sends for this query.
 * Do NOT client-filter by interests, minRating, or availability.
 *
 * After admin Approve → backend sets isVerified=true → these tutors MUST appear.
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

  // 1) Empty body (most compatible with current backend)
  try {
    const all = await postSearch({});
    if (all.length > 0) return all;
  } catch (error) {
    console.warn('[TutorSearch] empty body failed', error);
  }

  // 2) Explicit verified filter (docs contract)
  try {
    const verified = await postSearch({ isVerified: true });
    if (verified.length > 0) return verified;
  } catch (error) {
    console.warn('[TutorSearch] isVerified filter failed', error);
  }

  return [];
};
