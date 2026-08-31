import {
  firebaseSignIn,
  firebaseSignUp,
  firebaseSignOut,
  getFirebaseIdToken,
  getCurrentFirebaseUser,
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
import { getApiErrorMessage } from '../../utils/api/errorHandler';
import { markProfileSuggestionNeeded } from '../profile/profileSuggestionStore';

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

const normalizeEmail = (email: string) => email.trim().toLowerCase();

/** Do NOT trim passwords — trailing spaces may be part of a saved credential. */
const normalizePassword = (password: string) => password;

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

/** Backend sometimes wraps user in `data` — accept both shapes. */
const extractUser = (payload: unknown): ApiUser | null => {
  const root = asRecord(payload);
  if (root.user && typeof root.user === 'object') {
    return root.user as ApiUser;
  }
  const nested = asRecord(root.data);
  if (nested.user && typeof nested.user === 'object') {
    return nested.user as ApiUser;
  }
  if (nested.email || nested._id || nested.id) {
    return nested as ApiUser;
  }
  if (root.email || root._id || root.id) {
    return root as ApiUser;
  }
  return null;
};

const roleConflictError = (actual: string, requested: AuthRole) =>
  new Error(
    `This email is registered as a ${actual}. Use ${actual} login, or sign up with a different email for ${requested}.`
  );

/**
 * If backend role conflicts with the screen the user opened, surface a clear
 * error — except when backend omits role (then trust the requested role).
 */
const resolveSessionRole = (
  user: ApiUser,
  requestedRole: AuthRole
): AuthRole => {
  const actual = String(user.role || '')
    .trim()
    .toLowerCase() as AuthRole | '';
  if (!actual) return requestedRole;
  if (actual !== requestedRole) {
    throw roleConflictError(actual, requestedRole);
  }
  return actual;
};

const buildSession = (
  user: ApiUser,
  role: AuthRole,
  firebaseUid?: string
): AuthSession => {
  return {
    token: '',
    role,
    user: {
      ...user,
      id: user.id || user._id,
      _id: user._id || user.id,
      role,
      uid: firebaseUid,
    },
  };
};

const persistSession = async (
  user: ApiUser,
  role: AuthRole,
  firebaseUid?: string,
  firebaseUser?: FirebaseAuthTypes.User | null,
  options?: { suggestCompleteProfile?: boolean }
): Promise<AuthSession> => {
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

  if (options?.suggestCompleteProfile) {
    const suggestionId =
      firebaseUid ||
      String(session.user.uid || session.user.id || session.user._id || '');
    const normalizedRole = role === 'parent' ? 'student' : role;
    void markProfileSuggestionNeeded(
      normalizedRole === 'student' || normalizedRole === 'tutor'
        ? normalizedRole
        : 'student',
      suggestionId
    );
  }

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
  clearCachedAuthToken();
  const started = Date.now();
  const idToken = await getFirebaseIdToken(false, firebaseUser);
  setCachedAuthToken(idToken);
  speedDone('getIdToken (Bearer)', started, {
    tokenPreview: `${idToken.slice(0, 20)}…`,
  });
  console.log('[SPEED] BEARER_TOKEN (Postman)', idToken);
  return idToken;
};

const logAuthFailure = (stage: string, error: unknown) => {
  const code = (error as { code?: string })?.code;
  const status =
    error instanceof AxiosError ? error.response?.status : undefined;
  const data =
    error instanceof AxiosError ? error.response?.data : undefined;
  console.error('[Auth] failure', {
    stage,
    code,
    status,
    message: error instanceof Error ? error.message : String(error),
    data,
  });
};

export const loginWithEmail = async (
  credentials: AuthCredentials
): Promise<AuthSession> => {
  const timer = createSpeedTimer('LOGIN');
  const email = normalizeEmail(credentials.email);
  const password = normalizePassword(credentials.password);

  console.error('[Auth] login start', {
    email,
    role: credentials.role,
    passwordLen: password.length,
  });

  try {
    const warmupStarted = Date.now();
    const warmupPromise = warmupApi().then(ok => {
      timer.step('backend warmup', warmupStarted, { ok });
      return ok;
    });

    const firebaseStarted = Date.now();
    let firebaseUser: FirebaseAuthTypes.User;
    try {
      firebaseUser = await firebaseSignIn(email, password);
    } catch (firebaseError) {
      logAuthFailure('firebaseSignIn', firebaseError);
      const firebaseMessage = getFirebaseErrorMessage(firebaseError);
      throw new Error(
        firebaseMessage ||
          'Incorrect email or password. Please try again.'
      );
    }
    timer.step('firebaseSignIn', firebaseStarted, { uid: firebaseUser.uid });

    const tokenStarted = Date.now();
    await attachFirebaseBearer(firebaseUser);
    timer.step('getIdToken', tokenStarted);

    await warmupPromise;

    const apiStarted = Date.now();
    try {
      const response = await loginAPI({
        email,
        firebaseUid: firebaseUser.uid,
      });
      timer.step('POST /api/auth/login', apiStarted, {
        status: response.status,
      });

      const user = extractUser(response.data);
      if (!user) {
        throw new Error('Login succeeded but user profile was empty.');
      }

      const sessionRole = resolveSessionRole(user, credentials.role);
      const persistStarted = Date.now();
      const session = await persistSession(
        user,
        sessionRole,
        firebaseUser.uid,
        firebaseUser
      );
      timer.step('persistSession', persistStarted);
      timer.end({
        ok: true,
        email,
        role: sessionRole,
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

      if (
        loginError instanceof Error &&
        loginError.message.toLowerCase().includes('registered as')
      ) {
        throw loginError;
      }

      if (!isProfileNotFound(loginError)) {
        logAuthFailure('loginAPI', loginError);
        throw loginError;
      }

      // Firebase OK, backend profile missing → create with the requested role.
      speedLog('login 404 — creating missing backend profile', {
        role: credentials.role,
      });
      const registerStarted = Date.now();
      const displayName =
        firebaseUser.displayName || email.split('@')[0] || 'User';
      const registerResponse = await registerAPI({
        firebaseUid: firebaseUser.uid,
        name: displayName,
        email,
        role: credentials.role,
      });
      timer.step('POST /api/auth/register (heal 404)', registerStarted, {
        status: registerResponse.status,
      });

      const user = extractUser(registerResponse.data);
      if (!user) {
        throw new Error('Could not create user profile on server.');
      }

      const sessionRole = resolveSessionRole(user, credentials.role);
      const persistStarted = Date.now();
      const session = await persistSession(
        user,
        sessionRole,
        firebaseUser.uid,
        firebaseUser
      );
      timer.step('persistSession', persistStarted);
      timer.end({
        ok: true,
        email,
        role: sessionRole,
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
  const email = normalizeEmail(payload.email);
  const password = normalizePassword(payload.password);

  console.error('[Auth] signup start', {
    email,
    role: payload.role,
    passwordLen: password.length,
    hasPhone: Boolean(payload.phone?.trim()),
  });

  try {
    const warmupStarted = Date.now();
    const warmupPromise = warmupApi().then(ok => {
      speedDone('backend warmup', warmupStarted, { ok });
      return ok;
    });

    if (getCurrentFirebaseUser()) {
      try {
        clearCachedAuthToken();
        await firebaseSignOut();
      } catch {
        // ignore
      }
    } else {
      clearCachedAuthToken();
    }

    let firebaseUser: FirebaseAuthTypes.User;
    let createdNewFirebaseUser = false;

    try {
      const firebaseStarted = Date.now();
      firebaseUser = await firebaseSignUp(email, password);
      createdNewFirebaseUser = true;
      speedDone('firebaseSignUp', firebaseStarted, { uid: firebaseUser.uid });
    } catch (error) {
      if (!isEmailAlreadyInUse(error)) {
        logAuthFailure('firebaseSignUp', error);
        const firebaseMessage = getFirebaseErrorMessage(error);
        throw new Error(firebaseMessage || 'Sign up failed. Please try again.');
      }

      // Email already in Firebase — sign in and attach/create backend profile.
      try {
        const firebaseStarted = Date.now();
        firebaseUser = await firebaseSignIn(email, password);
        speedDone('firebaseSignIn (existing email)', firebaseStarted, {
          uid: firebaseUser.uid,
        });
      } catch (signInError) {
        logAuthFailure('firebaseSignIn existing email', signInError);
        throw new Error(
          'This email is already registered with a different password. Use Tutor Login, or tap Forgot Password to reset it.'
        );
      }

      try {
        await attachFirebaseBearer(firebaseUser);
        await warmupPromise;
        const apiStarted = Date.now();
        const loginResponse = await loginAPI({
          email,
          firebaseUid: firebaseUser.uid,
        });
        speedDone('POST /api/auth/login (signup fallback)', apiStarted, {
          status: loginResponse.status,
        });
        const existingUser = extractUser(loginResponse.data);
        if (!existingUser) {
          throw new Error('Could not load existing profile.');
        }
        const sessionRole = resolveSessionRole(existingUser, payload.role);
        const session = await persistSession(
          existingUser,
          sessionRole,
          firebaseUser.uid,
          firebaseUser
        );
        timer.end({ path: 'existing-email-login' });
        return session;
      } catch (loginError) {
        if (
          loginError instanceof Error &&
          loginError.message.toLowerCase().includes('registered as')
        ) {
          throw loginError;
        }
        if (!isProfileNotFound(loginError)) {
          logAuthFailure('signup fallback login', loginError);
          throw loginError;
        }
        // Fall through — create missing backend profile below.
      }
    }

    try {
      await attachFirebaseBearer(firebaseUser);
      await warmupPromise;
      const apiStarted = Date.now();
      const response = await registerAPI({
        firebaseUid: firebaseUser.uid,
        name: payload.fullName.trim(),
        email,
        role: payload.role,
        phoneNumber: payload.phone?.trim() || undefined,
      });
      speedDone('POST /api/auth/register', apiStarted, {
        status: response.status,
      });

      const user = extractUser(response.data);
      if (!user) {
        throw new Error('Sign up succeeded but user profile was empty.');
      }

      const sessionRole = resolveSessionRole(user, payload.role);
      const session = await persistSession(
        user,
        sessionRole,
        firebaseUser.uid,
        firebaseUser,
        { suggestCompleteProfile: true }
      );
      timer.end({ path: 'register', role: sessionRole });
      return session;
    } catch (error) {
      if (isProfileAlreadyExists(error)) {
        await attachFirebaseBearer(firebaseUser);
        const apiStarted = Date.now();
        const loginResponse = await loginAPI({
          email,
          firebaseUid: firebaseUser.uid,
        });
        speedDone('POST /api/auth/login (profile exists)', apiStarted, {
          status: loginResponse.status,
        });
        const user = extractUser(loginResponse.data);
        if (!user) {
          throw new Error('Could not load existing profile after register conflict.');
        }
        const sessionRole = resolveSessionRole(user, payload.role);
        const session = await persistSession(
          user,
          sessionRole,
          firebaseUser.uid,
          firebaseUser
        );
        timer.end({ path: 'profile-exists-login' });
        return session;
      }

      logAuthFailure('registerAPI', error);
      if (createdNewFirebaseUser) {
        console.warn(
          '[Auth] Backend register failed after Firebase signup — keeping Firebase user for login retry',
          getApiErrorMessage(error)
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

    const user = extractUser(response.data);
    if (!user) {
      throw new Error('Google login succeeded but user profile was empty.');
    }
    const sessionRole = resolveSessionRole(user, role);
    const session = await persistSession(user, sessionRole, firebaseUid);
    timer.end({ email, role: sessionRole });
    return session;
  } catch (error) {
    logAuthFailure('googleLogin', error);
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
  const { restoreAuthSessionFast } = await import('./bootstrapAuth');
  return restoreAuthSessionFast();
};
