import AsyncStorage from '@react-native-async-storage/async-storage';
import { TutorOnboardingStatusData } from '../types/api.types';

const TUTOR_ONBOARDING_CACHE_KEY = '@TutorLink:tutorOnboardingCache';

export const saveTutorOnboardingCache = async (
  data: Partial<TutorOnboardingStatusData>
) => {
  try {
    const existing = await getTutorOnboardingCache();
    await AsyncStorage.setItem(
      TUTOR_ONBOARDING_CACHE_KEY,
      JSON.stringify({ ...existing, ...data })
    );
  } catch (error) {
    console.warn('[TutorOnboardingCache] save failed', error);
  }
};

export const getTutorOnboardingCache =
  async (): Promise<Partial<TutorOnboardingStatusData> | null> => {
    try {
      const raw = await AsyncStorage.getItem(TUTOR_ONBOARDING_CACHE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as Partial<TutorOnboardingStatusData>;
    } catch {
      return null;
    }
  };

export const clearTutorOnboardingCache = async () => {
  await AsyncStorage.removeItem(TUTOR_ONBOARDING_CACHE_KEY);
};

export const mergeOnboardingStatus = (
  remote: TutorOnboardingStatusData | null | undefined,
  cached: Partial<TutorOnboardingStatusData> | null
): TutorOnboardingStatusData => {
  return {
    ...(cached || {}),
    ...(remote || {}),
    onboardingStatus:
      remote?.onboardingStatus ||
      remote?.verificationStatus ||
      cached?.onboardingStatus ||
      cached?.verificationStatus,
    isVerified: remote?.isVerified ?? cached?.isVerified,
  };
};
