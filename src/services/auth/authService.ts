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
  googleLoginAPI,
  loginAPI,
  registerAPI,
} from '../../api/auth.api';
import { clearCachedAuthToken, setCachedAuthToken } from '../../api/client';
import {
  AuthSession,
  clearAuthSession,
  saveAuthSession,
} from '../storage';
import { ApiUser } from '../../types/api.types';
import { AxiosError } from 'axios';
import { warmupApi } from '../api/apiWarmup';
import { createSpeedTimer, speedDone, speedLog } from '../../utils/debug/speedLog';

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
  // Prefer cached token — force-refresh adds another network hop after login.
  let idToken: string;
  try {
    idToken = await getFirebaseIdToken(false, firebaseUser);
  } catch {
    idToken = await getFirebaseIdToken(true, firebaseUser);
  }

  const session: AuthSession = {
    ...buildSession(user, role, firebaseUid),
    token: idToken,
  };
  setCachedAuthToken(idToken);
  await saveAuthSession(session);

  // Defer FCM register — permission dialog must not race Alert/navigation.reset.
  void import('../notifications/pushNotificationService')
    .then(({ scheduleRegisterDeviceForPush }) =>
      scheduleRegisterDeviceForPush()
    )
    .catch(error => console.warn('[Auth] push register failed', error));

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

const attachFirebaseBearer = async (
  firebaseUser: FirebaseAuthTypes.User
): Promise<string> => {
  // Backend auth routes require Bearer = Firebase ID token.
  clearCachedAuthToken();
  const started = Date.now();
  const idToken = await getFirebaseIdToken(false, firebaseUser);
  setCachedAuthToken(idToken);
  speedDone('getIdToken (Bearer)', started, {
    tokenPreview: `${idToken.slice(0, 20)}…`,
  });
  // Full token for Postman — filter Metro by BEARER_TOKEN
  console.log('[SPEED] BEARER_TOKEN (Postman)', idToken);
  return idToken;
};

export const loginWithEmail = async (
  credentials: AuthCredentials
): Promise<AuthSession> => {
  const timer = createSpeedTimer('LOGIN');
  try {
    // Wake Render in parallel with Firebase so backend is ready when loginAPI runs.
    const warmupStarted = Date.now();
    const warmupPromise = warmupApi().then(ok => {
      timer.step('backend warmup', warmupStarted, { ok });
      return ok;
    });

    const firebaseStarted = Date.now();
    const firebaseUser = await firebaseSignIn(
      credentials.email,
      credentials.password
    );
    timer.step('firebaseSignIn', firebaseStarted, { uid: firebaseUser.uid });

    const tokenStarted = Date.now();
    await attachFirebaseBearer(firebaseUser);
    timer.step('getIdToken', tokenStarted);

    await warmupPromise;

    const apiStarted = Date.now();
    try {
      const response = await loginAPI({
        email: credentials.email,
        firebaseUid: firebaseUser.uid,
      });
      timer.step('POST /api/auth/login', apiStarted, {
        status: response.status,
      });

      const persistStarted = Date.now();
      const { user } = response.data;
      const session = await persistSession(
        user,
        credentials.role,
        firebaseUser.uid,
        firebaseUser
      );
      timer.step('persistSession', persistStarted);
      timer.end({
        ok: true,
        email: credentials.email,
        role: credentials.role,
      });
      return session;
    } catch (loginError) {
      timer.step('POST /api/auth/login', apiStarted, {
        failed: true,
        status:
          loginError instanceof AxiosError
            ? loginError.response?.status
            : undefined,
      });

      // Firebase user exists but backend profile missing (common after failed signup).
      if (!isProfileNotFound(loginError)) {
        throw loginError;
      }

      speedLog('login 404 — creating missing backend profile');
      const registerStarted = Date.now();
      const displayName =
        firebaseUser.displayName ||
        credentials.email.split('@')[0] ||
        'Student';
      const registerResponse = await registerAPI({
        firebaseUid: firebaseUser.uid,
        name: displayName,
        email: credentials.email,
        role: credentials.role,
      });
      timer.step('POST /api/auth/register (heal 404)', registerStarted, {
        status: registerResponse.status,
      });

      const persistStarted = Date.now();
      const session = await persistSession(
        registerResponse.data.user,
        credentials.role,
        firebaseUser.uid,
        firebaseUser
      );
      timer.step('persistSession', persistStarted);
      timer.end({
        ok: true,
        email: credentials.email,
        role: credentials.role,
        extra: 'Profile was missing — created on login',
      });
      return session;
    }
  } catch (error) {
    const status =
      error instanceof AxiosError ? error.response?.status : undefined;
    const message = error instanceof Error ? error.message : String(error);
    timer.end({
      ok: false,
      failed: true,
      message,
      extra: status ? `HTTP ${status}` : undefined,
    });
    throw error;
  }
};

export const registerWithEmail = async (
  payload: AuthSignupData
): Promise<AuthSession> => {
  const timer = createSpeedTimer('SIGNUP');
  try {
    const warmupStarted = Date.now();
    const warmupPromise = warmupApi().then(ok => {
      speedDone('backend warmup', warmupStarted, { ok });
      return ok;
    });

    // Only sign out when a stale session exists — avoids unnecessary delay.
    if (getCurrentFirebaseUser()) {
      try {
        clearCachedAuthToken();
        await firebaseSignOut();
      } catch {
        // Ignore — signup can proceed without a prior session.
      }
    } else {
      clearCachedAuthToken();
    }

    let firebaseUser: FirebaseAuthTypes.User;

    try {
      const firebaseStarted = Date.now();
      firebaseUser = await firebaseSignUp(payload.email, payload.password);
      speedDone('firebaseSignUp', firebaseStarted, { uid: firebaseUser.uid });
    } catch (error) {
      if (!isEmailAlreadyInUse(error)) {
        const firebaseMessage = getFirebaseErrorMessage(error);
        throw new Error(firebaseMessage || 'Sign up failed. Please try again.');
      }

      try {
        const firebaseStarted = Date.now();
        firebaseUser = await firebaseSignIn(payload.email, payload.password);
        speedDone('firebaseSignIn (existing email)', firebaseStarted, {
          uid: firebaseUser.uid,
        });
      } catch (signInError) {
        const firebaseMessage = getFirebaseErrorMessage(signInError);
        throw new Error(
          firebaseMessage ||
            'This email is already registered. Please log in with your existing password.'
        );
      }

      try {
        await attachFirebaseBearer(firebaseUser);
        await warmupPromise;
        const apiStarted = Date.now();
        const loginResponse = await loginAPI({
          email: payload.email,
          firebaseUid: firebaseUser.uid,
        });
        speedDone('POST /api/auth/login (signup fallback)', apiStarted, {
          status: loginResponse.status,
        });
        const session = await persistSession(
          loginResponse.data.user,
          payload.role,
          firebaseUser.uid,
          firebaseUser
        );
        timer.end({ path: 'existing-email-login' });
        return session;
      } catch (loginError) {
        if (!isProfileNotFound(loginError)) {
          throw loginError;
        }
      }
    }

    try {
      await attachFirebaseBearer(firebaseUser);
      await warmupPromise;
      const apiStarted = Date.now();
      const response = await registerAPI({
        firebaseUid: firebaseUser.uid,
        name: payload.fullName,
        email: payload.email,
        role: payload.role,
        phoneNumber: payload.phone,
      });
      speedDone('POST /api/auth/register', apiStarted, {
        status: response.status,
      });

      const session = await persistSession(
        response.data.user,
        payload.role,
        firebaseUser.uid,
        firebaseUser
      );
      timer.end({ path: 'register', role: payload.role });
      return session;
    } catch (error) {
      if (isProfileAlreadyExists(error)) {
        await attachFirebaseBearer(firebaseUser);
        const apiStarted = Date.now();
        const loginResponse = await loginAPI({
          email: payload.email,
          firebaseUid: firebaseUser.uid,
        });
        speedDone('POST /api/auth/login (profile exists)', apiStarted, {
          status: loginResponse.status,
        });
        const session = await persistSession(
          loginResponse.data.user,
          payload.role,
          firebaseUser.uid,
          firebaseUser
        );
        timer.end({ path: 'profile-exists-login' });
        return session;
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
  } catch (error) {
    timer.end({
      failed: true,
      message: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
};

export const loginWithGoogle = async (
  name: string,
  email: string,
  firebaseUid: string,
  role: AuthRole
): Promise<AuthSession> => {
  const timer = createSpeedTimer('GOOGLE_LOGIN');
  try {
    await warmupApi();
    const firebaseUser = getCurrentFirebaseUser();
    if (firebaseUser) {
      await attachFirebaseBearer(firebaseUser);
    }
    const apiStarted = Date.now();
    const response = await googleLoginAPI({
      name,
      email,
      firebaseUid,
      role,
    });
    speedDone('POST /api/auth/google-login', apiStarted, {
      status: response.status,
    });

    const { user } = response.data;
    const session = await persistSession(user, role, firebaseUid);
    timer.end({ email, role });
    return session;
  } catch (error) {
    timer.end({
      failed: true,
      message: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
};

export const logoutUser = async () => {
  const timer = createSpeedTimer('LOGOUT');
  try {
    const { unregisterDeviceForPush } = await import(
      '../notifications/pushNotificationService'
    );
    await unregisterDeviceForPush();
  } catch (error) {
    console.warn('[Auth] push unregister failed', error);
  }
  clearCachedAuthToken();
  await firebaseSignOut();
  await clearAuthSession();
  timer.end();
  speedLog('Ready for next login — watch [SPEED] LOGIN logs');
};

export const restoreAuthSession = async (): Promise<AuthSession | null> => {
  // Prefer the fast bootstrap path used by splash / cold start.
  const { restoreAuthSessionFast } = await import('./bootstrapAuth');
  return restoreAuthSessionFast();
};
