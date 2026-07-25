import { AxiosError } from 'axios';
import { getFirebaseIdToken } from '../auth/firebaseAuthService';
import { getAuthProfileAPI } from '../../api/auth.api';
import {
  downloadCertificateAPI,
  generateLinkCodeAPI,
  getAllStudentSettingsAPI,
  getAppSettingsAPI,
  getCertificatesAPI,
  getInterestsAPI,
  getLinkedParentsAPI,
  getMyProfileAPI,
  getNotificationSettingsAPI,
  getPrivacySettingsAPI,
  getSessionHistoryAPI,
  rateSessionAPI,
  redeemLinkCodeAPI,
  unlinkParentAPI,
  updateAppSettingsAPI,
  updateInterestsAPI,
  updateMyProfileAPI,
  updateNotificationSettingsAPI,
  updatePrivacySettingsAPI,
  uploadProfileAvatarAPI,
} from '../../api/profile.api';
import { getAuthSession, saveAuthSession } from '../storage';
import {
  LinkCodeData,
  LinkedParent,
  RedeemLinkCodePayload,
  StudentAppSettings,
  StudentCertificateItem,
  StudentNotificationSettings,
  StudentPrivacySettings,
  StudentProfile,
  StudentSessionHistoryItem,
  StudentSettingsBundle,
  UpdateInterestsPayload,
  UpdateProfilePayload,
} from '../../types/api.types';
import { getUserId } from '../../utils/api/userId';

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

export const extractData = <T = unknown>(payload: unknown): T => {
  const root = asRecord(payload);
  if ('data' in root) return root.data as T;
  return payload as T;
};

const extractList = <T>(payload: unknown): T[] => {
  const data = extractData(payload);
  if (Array.isArray(data)) return data as T[];
  const nested = asRecord(data);
  if (Array.isArray(nested.items)) return nested.items as T[];
  if (Array.isArray(nested.linkedParents)) {
    return nested.linkedParents as T[];
  }
  return [];
};

const normalizeProfile = (raw: unknown): StudentProfile | null => {
  if (!raw || typeof raw !== 'object') return null;
  const data = asRecord(raw);
  const screen = asRecord(data.screen);
  const header = asRecord(data.header || screen.header);

  return {
    ...(data as StudentProfile),
    name: String(data.name || header.name || ''),
    email: String(data.email || header.email || ''),
    phoneNumber: String(data.phoneNumber || header.phoneNumber || ''),
    grade: String(data.grade || header.grade || data.displayGrade || ''),
    board: String(data.board || header.board || ''),
    bio: String(data.bio || header.bio || ''),
    avatarUrl: String(data.avatarUrl || header.avatarUrl || ''),
    publicId: String(
      data.publicId || data.displayStudentId || header.displayStudentId || ''
    ),
    interests: Array.isArray(data.interests)
      ? (data.interests as string[])
      : [],
    parentLinkCard: (data.parentLinkCard ||
      screen.parentLinkCard) as StudentProfile['parentLinkCard'],
    menuPreview: (data.menuPreview ||
      screen.menuPreview) as StudentProfile['menuPreview'],
    preferences: (data.preferences ||
      screen.preferences) as StudentProfile['preferences'],
    settingsMenu: (data.settingsMenu ||
      screen.settingsMenu) as StudentProfile['settingsMenu'],
    screen: data.screen as StudentProfile['screen'],
  };
};

export const fetchMyProfile = async (): Promise<StudentProfile> => {
  const response = await getMyProfileAPI();
  const profile = normalizeProfile(extractData(response.data));
  if (!profile) throw new Error('Profile is unavailable');
  return profile;
};

export const updateProfile = async (
  payload: UpdateProfilePayload
): Promise<StudentProfile> => {
  const response = await updateMyProfileAPI(payload);
  const profile = normalizeProfile(extractData(response.data));
  if (!profile) throw new Error('Failed to update profile');

  const session = await getAuthSession();
  if (session) {
    await saveAuthSession({
      ...session,
      user: {
        ...session.user,
        name: profile.name || session.user.name,
        phoneNumber: profile.phoneNumber || session.user.phoneNumber,
        avatarUrl: profile.avatarUrl || session.user.avatarUrl,
        grade: profile.grade || session.user.grade,
        interests: profile.interests || session.user.interests,
      },
    });
  }

  return profile;
};

export const uploadProfileAvatar = async (file: {
  uri: string;
  type?: string;
  name?: string;
}): Promise<string> => {
  const response = await uploadProfileAvatarAPI(file);
  const data = extractData<{ avatarUrl?: string }>(response.data);
  const url = data?.avatarUrl;
  if (!url) throw new Error('Avatar upload failed');
  return url;
};

export const fetchInterests = async (): Promise<{
  interests: string[];
  grade?: string;
}> => {
  const response = await getInterestsAPI();
  const data = extractData<{ interests?: string[]; grade?: string }>(
    response.data
  );
  return {
    interests: Array.isArray(data?.interests) ? data.interests : [],
    grade: data?.grade,
  };
};

export const updateInterests = async (
  payload: UpdateInterestsPayload
): Promise<{ interests: string[]; grade?: string; interestsCount: number }> => {
  const response = await updateInterestsAPI(payload);
  const data = extractData<{
    interests?: string[];
    grade?: string;
    interestsCount?: number;
  }>(response.data);
  return {
    interests: Array.isArray(data?.interests)
      ? data.interests
      : payload.interests,
    grade: data?.grade ?? payload.grade,
    interestsCount:
      data?.interestsCount ??
      (Array.isArray(data?.interests)
        ? data.interests.length
        : payload.interests.length),
  };
};

export const completeStudentOnboarding = async (payload: {
  interests: string[];
  grade: string;
}): Promise<void> => {
  await getFirebaseIdToken(true);

  const session = await getAuthSession();
  const userId = getUserId(session?.user ?? null);

  if (userId) {
    try {
      await getAuthProfileAPI(userId);
    } catch {
      // Prefer /api/profile/me going forward; legacy call is best-effort.
    }
  }

  await updateMyProfileAPI({ grade: payload.grade });
  await updateInterestsAPI({
    interests: payload.interests,
    grade: payload.grade,
  });

  if (session) {
    await saveAuthSession({
      ...session,
      user: {
        ...session.user,
        grade: payload.grade,
        interests: payload.interests,
      },
    });
  }
};

export const generateParentLinkCode = async (): Promise<LinkCodeData> => {
  const response = await generateLinkCodeAPI();
  const data = extractData<LinkCodeData>(response.data);
  if (!data?.code) {
    throw new Error('Failed to generate link code');
  }
  return data;
};

export const redeemParentLinkCode = async (
  payload: RedeemLinkCodePayload
): Promise<void> => {
  await redeemLinkCodeAPI(payload);
};

export const fetchLinkedParents = async (): Promise<LinkedParent[]> => {
  try {
    const response = await getLinkedParentsAPI();
    return extractList<LinkedParent>(response.data).map(item => ({
      ...item,
      id: String(item.id || item._id || ''),
      name: String(item.name || 'Parent'),
    }));
  } catch (error) {
    // Backend may not deploy this route yet, or return 404 when empty.
    // Treat as no linked parents so Profile tab stays quiet.
    if (isNotFoundError(error)) {
      return [];
    }
    throw error;
  }
};

export const unlinkParent = async (linkId: string): Promise<void> => {
  await unlinkParentAPI(linkId);
};

export const fetchSessionHistory = async (params?: {
  page?: number;
  limit?: number;
  status?: 'all' | 'completed' | 'cancelled' | 'missed';
}): Promise<StudentSessionHistoryItem[]> => {
  const response = await getSessionHistoryAPI(params);
  const data = extractData<{ items?: StudentSessionHistoryItem[] }>(
    response.data
  );
  if (Array.isArray(data)) return data as StudentSessionHistoryItem[];
  return Array.isArray(data?.items) ? data.items : [];
};

export const rateCompletedSession = async (
  bookingId: string,
  rating: number,
  review?: string
) => {
  const response = await rateSessionAPI(bookingId, { rating, review });
  return extractData(response.data);
};

export const fetchCertificates = async (params?: {
  page?: number;
  limit?: number;
  filter?: 'all' | 'recent';
}): Promise<StudentCertificateItem[]> => {
  const response = await getCertificatesAPI(params);
  const data = extractData<{ items?: StudentCertificateItem[] }>(response.data);
  if (Array.isArray(data)) return data as StudentCertificateItem[];
  return Array.isArray(data?.items) ? data.items : [];
};

export const getCertificateDownloadUrl = async (
  id: string
): Promise<string> => {
  const response = await downloadCertificateAPI(id);
  const data = extractData<{
    url?: string;
    certificate?: { fileUrl?: string };
  }>(response.data);
  const url = data?.url || data?.certificate?.fileUrl;
  if (!url) throw new Error('Download URL unavailable');
  return url;
};

export const fetchNotificationSettings =
  async (): Promise<StudentNotificationSettings> => {
    const response = await getNotificationSettingsAPI();
    return extractData<StudentNotificationSettings>(response.data);
  };

export const saveNotificationSettings = async (
  payload: Partial<StudentNotificationSettings>
): Promise<StudentNotificationSettings> => {
  const response = await updateNotificationSettingsAPI(payload);
  return extractData<StudentNotificationSettings>(response.data);
};

export const fetchAppSettings = async (): Promise<StudentAppSettings> => {
  const response = await getAppSettingsAPI();
  return extractData<StudentAppSettings>(response.data);
};

export const saveAppSettings = async (
  payload: Partial<StudentAppSettings>
): Promise<StudentAppSettings> => {
  const response = await updateAppSettingsAPI(payload);
  return extractData<StudentAppSettings>(response.data);
};

export const fetchPrivacySettings =
  async (): Promise<StudentPrivacySettings> => {
    const response = await getPrivacySettingsAPI();
    return extractData<StudentPrivacySettings>(response.data);
  };

export const savePrivacySettings = async (
  payload: Partial<StudentPrivacySettings>
): Promise<StudentPrivacySettings> => {
  const response = await updatePrivacySettingsAPI(payload);
  return extractData<StudentPrivacySettings>(response.data);
};

export const fetchAllStudentSettings =
  async (): Promise<StudentSettingsBundle> => {
    const response = await getAllStudentSettingsAPI();
    return extractData<StudentSettingsBundle>(response.data);
  };

export const isNotFoundError = (error: unknown): boolean =>
  error instanceof AxiosError && error.response?.status === 404;
