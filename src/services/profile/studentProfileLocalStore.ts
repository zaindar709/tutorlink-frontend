import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_STUDENT_PROFILE } from '../../constants/studentProfileMockData';

export type LocalStudentProfile = typeof DEFAULT_STUDENT_PROFILE;

const STORAGE_KEY = '@tutorlink/student_profile_local';

export const loadLocalStudentProfile =
  async (): Promise<LocalStudentProfile> => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_STUDENT_PROFILE };
      return { ...DEFAULT_STUDENT_PROFILE, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_STUDENT_PROFILE };
    }
  };

export const saveLocalStudentProfile = async (
  profile: Partial<LocalStudentProfile>
): Promise<LocalStudentProfile> => {
  const current = await loadLocalStudentProfile();
  const next = { ...current, ...profile };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
};

export const clearLocalStudentProfileAvatar = async () => {
  const current = await loadLocalStudentProfile();
  const next = { ...current, avatarUri: null };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
};
