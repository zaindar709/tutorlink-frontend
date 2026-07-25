import { searchTutorsAPI } from '../../api/tutors.api';
import { TutorProfile, TutorSearchPayload } from '../../types/api.types';

const extractTutorList = (payload: unknown): Record<string, unknown>[] => {
  if (!payload || typeof payload !== 'object') return [];
  const root = payload as Record<string, unknown>;
  const data = root.data;

  if (Array.isArray(data)) return data as Record<string, unknown>[];
  if (data && typeof data === 'object') {
    const nested = data as Record<string, unknown>;
    if (Array.isArray(nested.tutors)) {
      return nested.tutors as Record<string, unknown>[];
    }
    if (Array.isArray(nested.items)) {
      return nested.items as Record<string, unknown>[];
    }
  }
  if (Array.isArray(root.tutors)) {
    return root.tutors as Record<string, unknown>[];
  }
  return [];
};

const normalizeTutor = (
  raw: Record<string, unknown>,
  index: number
): TutorProfile => {
  const user = (raw.user || {}) as Record<string, unknown>;
  const id = String(
    raw._id || raw.id || user._id || user.id || `tutor-${index}`
  );

  return {
    _id: id,
    user: {
      ...(user as TutorProfile['user']),
      _id: String(user._id || user.id || id),
      name: String(user.name || 'Tutor'),
      email: user.email ? String(user.email) : undefined,
      avatarUrl: user.avatarUrl ? String(user.avatarUrl) : undefined,
    },
    qualification: raw.qualification ? String(raw.qualification) : undefined,
    experience: raw.experience ? String(raw.experience) : undefined,
    experienceYears:
      raw.experienceYears != null ? Number(raw.experienceYears) : undefined,
    hourlyRate: raw.hourlyRate != null ? Number(raw.hourlyRate) : undefined,
    subjects: (raw.subjects as string[]) || [],
    isVerified: raw.isVerified !== false,
    grades: (raw.grades as string[]) || [],
    rating: Number(raw.rating ?? 4),
    availability: raw.availability !== false,
    location: raw.location as TutorProfile['location'],
    distanceKm: raw.distanceKm != null ? Number(raw.distanceKm) : undefined,
  };
};

export const searchTutors = async (
  filters: TutorSearchPayload
): Promise<TutorProfile[]> => {
  const response = await searchTutorsAPI(filters);
  const payload = response.data;

  if (Array.isArray(payload?.data)) {
    return payload.data.map((tutor, index) =>
      normalizeTutor(tutor as Record<string, unknown>, index)
    );
  }

  const list = extractTutorList(payload);
  return list.map((raw, index) => normalizeTutor(raw, index));
};
