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
  getStudentProgressAPI,
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
  StudentProgressData,
  StudentProgressSubject,
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
    userId: String(data.userId || data._id || data.id || ''),
    profileCompleted:
      data.profileCompleted === true
        ? true
        : data.profileCompleted === false
          ? false
          : undefined,
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

let memoryProfile: StudentProfile | null = null;
let memoryProfileAt = 0;
const PROFILE_CACHE_TTL_MS = 20_000;

export const peekCachedMyProfile = () => memoryProfile;

export const rememberMyProfile = (profile: StudentProfile | null) => {
  memoryProfile = profile;
  memoryProfileAt = profile ? Date.now() : 0;
};

export const clearCachedMyProfile = () => {
  memoryProfile = null;
  memoryProfileAt = 0;
};

const isMyProfileCacheFresh = () =>
  Boolean(
    memoryProfile && Date.now() - memoryProfileAt < PROFILE_CACHE_TTL_MS
  );

export const fetchMyProfile = async (
  opts?: { force?: boolean }
): Promise<StudentProfile> => {
  if (!opts?.force && isMyProfileCacheFresh() && memoryProfile) {
    return memoryProfile;
  }
  const response = await getMyProfileAPI();
  const profile = normalizeProfile(extractData(response.data));
  if (!profile) throw new Error('Profile is unavailable');
  rememberMyProfile(profile);

  void getAuthSession().then(session => {
    if (
      !session ||
      (profile.profileCompleted !== true && profile.profileCompleted !== false)
    ) {
      return;
    }
    void saveAuthSession({
      ...session,
      user: {
        ...session.user,
        userId: profile.userId || session.user.userId,
        profileCompleted: profile.profileCompleted,
      },
    });
  });

  return profile;
};

export const updateProfile = async (
  payload: UpdateProfilePayload
): Promise<StudentProfile> => {
  const response = await updateMyProfileAPI(payload);
  const profile = normalizeProfile(extractData(response.data));
  if (!profile) throw new Error('Failed to update profile');
  rememberMyProfile(profile);

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
        userId: profile.userId || session.user.userId,
        profileCompleted:
          profile.profileCompleted === true
            ? true
            : profile.profileCompleted === false
              ? false
              : session.user.profileCompleted,
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

const num = (value: unknown, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const scoreToGrade = (score: number) => {
  if (score >= 90) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 80) return 'B+';
  if (score >= 75) return 'B';
  if (score >= 70) return 'C+';
  if (score <= 0) return '—';
  return 'C';
};

export const emptyStudentProgress = (): StudentProgressData => ({
  overallProgress: 0,
  attendanceRate: 0,
  sessionsThisMonth: 0,
  completedSessions: 0,
  upcomingSessions: 0,
  subjects: [],
  weeklyProgress: [],
  summary: 'Book a class to start tracking your learning progress.',
  tips: [
    'Complete sessions to fill subject scores.',
    'Attendance and weekly charts update after each class.',
  ],
});

const normalizeStudentProgress = (raw: unknown): StudentProgressData => {
  const data = asRecord(raw);
  const subjectsRaw = Array.isArray(data.subjects)
    ? data.subjects
    : Array.isArray(data.progress)
      ? data.progress
      : [];
  const subjects: StudentProgressSubject[] = subjectsRaw.map(item => {
    const row = asRecord(item);
    const score = num(row.score);
    const bars = Array.isArray(row.weeklyBars)
      ? row.weeklyBars.map(v => num(v)).slice(0, 5)
      : [0, 0, 0, 0, 0];
    while (bars.length < 5) bars.push(0);
    const trendRaw = String(row.trend || 'stable');
    const trend =
      trendRaw === 'up' || trendRaw === 'down' ? trendRaw : 'stable';
    return {
      subject: String(row.subject || 'Subject'),
      score,
      grade: String(row.grade || '') || scoreToGrade(score),
      syllabusCovered: num(row.syllabusCovered, score),
      trend,
      trendDelta: num(row.trendDelta),
      weeklyBars: bars,
      sessionsCompleted: num(row.sessionsCompleted),
      lastUpdated: String(row.lastUpdated || ''),
    };
  });
  const weeks = Array.isArray(data.weeklyProgress)
    ? data.weeklyProgress.map(item => {
        const row = asRecord(item);
        return { label: String(row.label || ''), score: num(row.score) };
      })
    : [];
  return {
    overallProgress: num(data.overallProgress, num(data.avgScore)),
    attendanceRate: num(data.attendanceRate),
    sessionsThisMonth: num(data.sessionsThisMonth),
    completedSessions: num(data.completedSessions),
    upcomingSessions: num(data.upcomingSessions),
    subjects,
    weeklyProgress: weeks,
    summary: String(
      data.summary ||
        (subjects.length
          ? 'Keep going — your scores update after each completed class.'
          : emptyStudentProgress().summary)
    ),
    tips: Array.isArray(data.tips)
      ? data.tips.map(t => String(t))
      : emptyStudentProgress().tips,
  };
};

const progressFromHistory = (
  sessions: StudentSessionHistoryItem[]
): StudentProgressData => {
  const completed = sessions.filter(s => s.status === 'completed');
  const missed = sessions.filter(s => s.status === 'missed');
  const attendanceDenom = completed.length + missed.length;
  const subjects = Array.from(
    new Set(completed.map(s => s.subject).filter(Boolean))
  ).map(subject => {
    const count = completed.filter(s => s.subject === subject).length;
    return {
      subject,
      score: 0,
      grade: '—',
      syllabusCovered: 0,
      trend: 'stable' as const,
      trendDelta: 0,
      weeklyBars: [0, 0, 0, 0, 0],
      sessionsCompleted: count,
      lastUpdated: completed.find(s => s.subject === subject)?.date || '',
    };
  });
  return {
    overallProgress: 0,
    attendanceRate: attendanceDenom
      ? Math.round((100 * completed.length) / attendanceDenom)
      : 0,
    sessionsThisMonth: completed.length,
    completedSessions: completed.length,
    upcomingSessions: 0,
    subjects,
    weeklyProgress: [],
    summary:
      completed.length === 0
        ? 'No completed classes yet. Progress stays at 0% until you finish a session.'
        : `${completed.length} class${completed.length === 1 ? '' : 'es'} completed. Subject scores fill in after quizzes or session summaries.`,
    tips: emptyStudentProgress().tips,
  };
};

export const fetchStudentProgress = async (): Promise<StudentProgressData> => {
  try {
    const response = await getStudentProgressAPI();
    return normalizeStudentProgress(extractData(response.data));
  } catch (error) {
    const status =
      error instanceof AxiosError ? error.response?.status : undefined;
    if (status === 401 || status === 403) throw error;
    try {
      const history = await fetchSessionHistory({ status: 'all', limit: 50 });
      return progressFromHistory(history);
    } catch {
      return emptyStudentProgress();
    }
  }
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
