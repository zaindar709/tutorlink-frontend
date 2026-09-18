import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchDashboard } from '../home/homeService';
import { getTutorMeAPI, getTutorProfileAPI } from '../../api/tutorProfile.api';
import type { ApiUser } from '../../types/api.types';

/** Backend contract: profile_completion_tooltip_shown_<USER_ID> */
export const profileCompletionHintKey = (userId?: string | null) => {
  const rawUserId = String(userId || '').trim();
  if (!rawUserId) return null;
  return `profile_completion_tooltip_shown_${rawUserId}`;
};

const legacyHintKeys = (userId?: string | null) => {
  const rawUserId = String(userId || '').trim();
  if (!rawUserId) return [];
  return [
    `tutorlink_profile_hint_shown_${rawUserId}`,
    `@TutorLink:profileSuggestionDismissed:student:${rawUserId}`,
    `@TutorLink:profileSuggestionDismissed:tutor:${rawUserId}`,
  ];
};

export const parseProfileCompleted = (value: unknown): boolean | null => {
  if (value === true) return true;
  if (value === false) return false;
  return null;
};

/** Mongo User._id — never Firebase uid. */
export const resolveProfileUserId = (
  user?: ApiUser | Record<string, unknown> | null
): string | null => {
  if (!user || typeof user !== 'object') return null;
  const record = user as Record<string, unknown>;
  const id = String(
    record.userId || record.id || record._id || ''
  ).trim();
  return id || null;
};

export const hasProfileHintBeenShown = async (
  userId?: string | null
): Promise<boolean> => {
  const key = profileCompletionHintKey(userId);
  if (!key) return false;

  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === 'true' || raw === '1') return true;
    for (const legacy of legacyHintKeys(userId)) {
      const old = await AsyncStorage.getItem(legacy);
      if (old === 'true' || old === '1') return true;
    }
    return false;
  } catch {
    return false;
  }
};

export const markProfileHintAsShown = async (
  userId?: string | null
): Promise<void> => {
  const key = profileCompletionHintKey(userId);
  if (!key) return;

  try {
    await AsyncStorage.setItem(key, 'true');
  } catch {
    // ignore storage failures; the dashboard should degrade safely.
  }
};

export const clearProfileHintShown = async (
  userId?: string | null
): Promise<void> => {
  const key = profileCompletionHintKey(userId);
  if (!key) return;

  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // ignore storage failures.
  }
};

export const shouldShowProfileCompletionTooltip = async (
  profileCompleted: boolean | null,
  userId?: string | null,
  extraLegacyIds: Array<string | null | undefined> = []
): Promise<boolean> => {
  if (profileCompleted !== false) return false;
  if (!userId) return false;
  const alreadyShown = await hasProfileHintBeenShown(userId);
  if (alreadyShown) return false;
  for (const extra of extraLegacyIds) {
    if (extra && extra !== userId && (await hasProfileHintBeenShown(extra))) {
      return false;
    }
  }
  return true;
};

export const fetchLiveProfileCompleted = async (
  role: 'student' | 'tutor' | 'parent'
): Promise<{ userId: string | null; profileCompleted: boolean | null }> => {
  try {
    if (role === 'student') {
      const dashboard = await fetchDashboard();
      return {
        userId: String(dashboard.userId || '').trim() || null,
        profileCompleted: parseProfileCompleted(dashboard.profileCompleted),
      };
    }
    if (role === 'tutor') {
      let response;
      try {
        response = await getTutorMeAPI();
      } catch {
        response = await getTutorProfileAPI();
      }
      const root =
        response.data && typeof response.data === 'object'
          ? (response.data as Record<string, unknown>)
          : {};
      const data =
        root.data && typeof root.data === 'object'
          ? (root.data as Record<string, unknown>)
          : root;
      const nestedUser =
        data?.user && typeof data.user === 'object'
          ? (data.user as Record<string, unknown>)
          : {};
      return {
        userId:
          String(data?.userId || nestedUser._id || nestedUser.id || '').trim() ||
          null,
        profileCompleted: parseProfileCompleted(data?.profileCompleted),
      };
    }
  } catch {
    // Keep the auth-payload flag if the extra GET fails.
  }
  return { userId: null, profileCompleted: null };
};
