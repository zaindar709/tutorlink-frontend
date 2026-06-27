import {
  firebaseSignIn,
  firebaseSignUp,
  firebaseSignOut,
  getFirebaseIdToken,
  getCurrentFirebaseUser,
  deleteFirebaseUser,
} from './firebaseAuthService';
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
  firebaseUid?: string
): Promise<AuthSession> => {
  const idToken = await getFirebaseIdToken();
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
  return persistSession(user, credentials.role, firebaseUser.uid);
};

export const registerWithEmail = async (
  payload: AuthSignupData
): Promise<AuthSession> => {
  let firebaseUser;

  try {
    firebaseUser = await firebaseSignUp(payload.email, payload.password);
  } catch (error) {
    if (!isEmailAlreadyInUse(error)) {
      throw error;
    }

    firebaseUser = await firebaseSignIn(payload.email, payload.password);

    try {
      const loginResponse = await loginAPI({
        email: payload.email,
        firebaseUid: firebaseUser.uid,
      });
      return persistSession(
        loginResponse.data.user,
        payload.role,
        firebaseUser.uid
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
      firebaseUser.uid
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
        firebaseUser.uid
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
  const session = await getAuthSession();
  if (!session) {
    return null;
  }

  const firebaseUser = getCurrentFirebaseUser();
  if (!firebaseUser) {
    await clearAuthSession();
    return null;
  }

  try {
    const idToken = await getFirebaseIdToken(true);
    const userId = getUserId(session.user);

    if (!userId) {
      await clearAuthSession();
      return null;
    }

    const profileResponse = await getAuthProfileAPI(userId);
    const persistedUser = profileResponse.data?.user || session.user;

    const restoredSession: AuthSession = {
      ...session,
      token: idToken,
      role: (persistedUser.role as AuthRole) || session.role,
      user: {
        ...session.user,
        ...persistedUser,
        id: persistedUser.id || persistedUser._id || userId,
        _id: persistedUser._id || persistedUser.id || userId,
      },
    };

    await saveAuthSession(restoredSession);
    return restoredSession;
  } catch {
    await clearAuthSession();
    return null;
  }
};
