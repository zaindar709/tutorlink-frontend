import AsyncStorage from '@react-native-async-storage/async-storage';

const introKey = (userId: string) =>
  `@TutorLink:aiAssistantIntroSeen:${userId || 'guest'}`;

export const hasSeenAiAssistantIntro = async (
  userId: string
): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(introKey(userId));
    return value === '1';
  } catch {
    return false;
  }
};

export const markAiAssistantIntroSeen = async (
  userId: string
): Promise<void> => {
  try {
    await AsyncStorage.setItem(introKey(userId), '1');
  } catch {
    // ignore persistence failures
  }
};
