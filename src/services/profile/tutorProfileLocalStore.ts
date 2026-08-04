import AsyncStorage from '@react-native-async-storage/async-storage';

export type TutorEditableProfile = {
  fullName: string;
  email: string;
  phone: string;
  experience: string;
  education: string;
  hourlyRate: string;
  address: string;
  bio: string;
};

const LEGACY_KEY = '@TutorLink:tutorEditableProfile';

const storageKey = (userId?: string | null) =>
  userId
    ? `@TutorLink:tutorEditableProfile:${userId}`
    : LEGACY_KEY;

const emptyProfile = (): TutorEditableProfile => ({
  fullName: '',
  email: '',
  phone: '',
  experience: '',
  education: '',
  hourlyRate: '',
  address: '',
  bio: '',
});

export const loadTutorEditableProfile = async (
  userId?: string | null
): Promise<TutorEditableProfile> => {
  try {
    // Prefer per-user key so a new tutor never inherits another account's data.
    if (userId) {
      const raw = await AsyncStorage.getItem(storageKey(userId));
      if (raw) {
        return { ...emptyProfile(), ...JSON.parse(raw) };
      }
      // Fresh account → empty. Do NOT fall back to legacy shared key.
      return emptyProfile();
    }

    const legacy = await AsyncStorage.getItem(LEGACY_KEY);
    if (!legacy) return emptyProfile();
    return { ...emptyProfile(), ...JSON.parse(legacy) };
  } catch {
    return emptyProfile();
  }
};

export const saveTutorEditableProfile = async (
  profile: Partial<TutorEditableProfile>,
  userId?: string | null
): Promise<TutorEditableProfile> => {
  const current = await loadTutorEditableProfile(userId);
  const next = { ...current, ...profile };
  await AsyncStorage.setItem(storageKey(userId), JSON.stringify(next));
  return next;
};
