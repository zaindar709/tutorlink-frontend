import AsyncStorage from '@react-native-async-storage/async-storage';
import { AttemptAnswer } from '../../types/assessment.types';

const keyFor = (attemptId: string) => `@tutorlink/attempt-answers:${attemptId}`;

export const saveLocalAnswers = async (
  attemptId: string,
  answers: AttemptAnswer[]
) => {
  try {
    await AsyncStorage.setItem(keyFor(attemptId), JSON.stringify(answers));
  } catch {
    /* ignore */
  }
};

export const loadLocalAnswers = async (
  attemptId: string
): Promise<AttemptAnswer[] | null> => {
  try {
    const raw = await AsyncStorage.getItem(keyFor(attemptId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const clearLocalAnswers = async (attemptId: string) => {
  try {
    await AsyncStorage.removeItem(keyFor(attemptId));
  } catch {
    /* ignore */
  }
};
