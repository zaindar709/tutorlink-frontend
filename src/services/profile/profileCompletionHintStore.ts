import AsyncStorage from '@react-native-async-storage/async-storage';

export const profileCompletionHintKey = (userId?: string | null) => {
  const rawUserId = String(userId || '').trim();
  if (!rawUserId) return null;
  return `tutorlink_profile_hint_shown_${rawUserId}`;
};

export const hasProfileHintBeenShown = async (
  userId?: string | null
): Promise<boolean> => {
  const key = profileCompletionHintKey(userId);
  if (!key) return false;

  try {
    const raw = await AsyncStorage.getItem(key);
    return raw === '1';
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
    await AsyncStorage.setItem(key, '1');
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
