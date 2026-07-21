import {
  firebaseSignIn,
  firebaseSignUp,
  firebaseSignOut,
  getFirebaseIdToken,
  getCurrentFirebaseUser,
  deleteFirebaseUser,
} from './firebaseAuthService';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { getFirebaseErrorMessage } from '../../utils/auth/firebaseErrorHandler';
import {
  getAuthProfileAPI,
  googleLoginAPI,
  loginAPI,
  registerAPI,
} from '../../api/auth.api';
import {
  AuthSession,
  clearAuthSession,
  getAuthSession,
  saveAuthSession,
} from '../storage';
import { ApiUser } from '../../types/api.types';
import { getUserId } from '../../utils/api/userId';
import { AxiosError } from 'axios';

export type AuthRole = 'student' | 'tutor' | 'parent';

export interface AuthCredentials {
  email: string;
  password: string;
  role: AuthRole;
}

export interface AuthSignupData extends AuthCredentials {
  fullName: string;
  phone?: string;
  expertise?: string;
  subjects?: string[];
  selectedClass?: string;
}

const buildSession = (
  user: ApiUser,
  role: AuthRole,
  firebaseUid?: string
): AuthSession => {
  return {
    token: '',
    role: (user.role as AuthRole) || role,
    user: {
      ...user,
      id: user.id || user._id,
      _id: user._id || user.id,
      uid: firebaseUid,
    },
  };
};

const persistSession = async (
  user: ApiUser,
  role: AuthRole,
  firebaseUid?: string,
  firebaseUser?: FirebaseAuthTypes.User | null
): Promise<AuthSession> => {
  const idToken = await getFirebaseIdToken(true, firebaseUser);
  const session: AuthSession = {
    ...buildSession(user, role, firebaseUid),
    token: idToken,
  };
  await saveAuthSession(session);
  return session;
};

const isEmailAlreadyInUse = (error: unknown): boolean => {
  const firebaseCode = (error as { code?: string })?.code;
  return firebaseCode === 'auth/email-already-in-use';
};

const isProfileAlreadyExists = (error: unknown): boolean => {
  if (!(error instanceof AxiosError)) return false;
  const status = error.response?.status;
  const message = String(error.response?.data?.message || '').toLowerCase();
  return status === 400 && message.includes('already');
};

const isProfileNotFound = (error: unknown): boolean => {
  return error instanceof AxiosError && error.response?.status === 404;
};

export const loginWithEmail = async (
  credentials: AuthCredentials
): Promise<AuthSession> => {
  const firebaseUser = await firebaseSignIn(
    credentials.email,
    credentials.password
  );

  const response = await loginAPI({
    email: credentials.email,
    firebaseUid: firebaseUser.uid,
  });

  const { user } = response.data;
  return persistSession(user, credentials.role, firebaseUser.uid, firebaseUser);
};

export const registerWithEmail = async (
  payload: AuthSignupData
): Promise<AuthSession> => {
  // Only sign out when a stale session exists — avoids unnecessary delay.
  if (getCurrentFirebaseUser()) {
    try {
      await firebaseSignOut();
    } catch {
      // Ignore — signup can proceed without a prior session.
    }
  }

  let firebaseUser: FirebaseAuthTypes.User;

  try {
    firebaseUser = await firebaseSignUp(payload.email, payload.password);
  } catch (error) {
    if (!isEmailAlreadyInUse(error)) {
      const firebaseMessage = getFirebaseErrorMessage(error);
      throw new Error(firebaseMessage || 'Sign up failed. Please try again.');
    }

    try {
      firebaseUser = await firebaseSignIn(payload.email, payload.password);
    } catch (signInError) {
      const firebaseMessage = getFirebaseErrorMessage(signInError);
      throw new Error(
        firebaseMessage ||
          'This email is already registered. Please log in with your existing password.'
      );
    }

    try {
      const loginResponse = await loginAPI({
        email: payload.email,
        firebaseUid: firebaseUser.uid,
      });
      return persistSession(
        loginResponse.data.user,
        payload.role,
        firebaseUser.uid,
        firebaseUser
      );
    } catch (loginError) {
      if (!isProfileNotFound(loginError)) {
        throw loginError;
      }
    }
  }

  try {
    const response = await registerAPI({
      firebaseUid: firebaseUser.uid,
      name: payload.fullName,
      email: payload.email,
      role: payload.role,
      phoneNumber: payload.phone,
    });

    return persistSession(
      response.data.user,
      payload.role,
      firebaseUser.uid,
      firebaseUser
    );
  } catch (error) {
    if (isProfileAlreadyExists(error)) {
      const loginResponse = await loginAPI({
        email: payload.email,
        firebaseUid: firebaseUser.uid,
      });
      return persistSession(
        loginResponse.data.user,
        payload.role,
        firebaseUser.uid,
        firebaseUser
      );
    }

    try {
      await deleteFirebaseUser();
    } catch (deleteError) {
      console.error(
        'Failed to delete Firebase user after signup error:',
        deleteError
      );
    }
    throw error;
  }
};

export const loginWithGoogle = async (
  name: string,
  email: string,
  firebaseUid: string,
  role: AuthRole
): Promise<AuthSession> => {
  const response = await googleLoginAPI({
    name,
    email,
    firebaseUid,
    role,
  });

  const { user } = response.data;
  return persistSession(user, role, firebaseUid);
};

export const logoutUser = async () => {
  await firebaseSignOut();
  await clearAuthSession();
};

export const restoreAuthSession = async (): Promise<AuthSession | null> => {
  // Prefer the fast bootstrap path used by splash / cold start.
  const { restoreAuthSessionFast } = await import('./bootstrapAuth');
  return restoreAuthSessionFast();
};
