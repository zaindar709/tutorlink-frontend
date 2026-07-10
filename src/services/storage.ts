import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_SESSION_KEY, AUTH_TOKEN_KEY } from '../config/api';

export interface AuthUser {
  uid?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  expertise?: string;
  subjects?: string[];
  selectedClass?: string;
  [key: string]: any;
}

export interface AuthSession {
  token: string;
  role: 'student' | 'tutor' | 'parent';
  user: AuthUser;
}

export const saveToken = async (token: string) => {
  await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
};

export const getToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
};

export const clearToken = async () => {
  await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
};

export const saveAuthSession = async (session: AuthSession) => {
  await AsyncStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  await saveToken(session.token);
};

export const getAuthSession = async (): Promise<AuthSession | null> => {
  const raw = await AsyncStorage.getItem(AUTH_SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    await clearAuthSession();
    return null;
  }
};

export const clearAuthSession = async () => {
  await AsyncStorage.removeItem(AUTH_SESSION_KEY);
  await clearToken();
};