import { AxiosError } from 'axios';
import {
  firebaseSignOut,
  getFirebaseIdToken,
  waitForFirebaseAuth,
} from './firebaseAuthService';
import { getAuthProfileAPI } from '../../api/auth.api';
import { clearCachedAuthToken, setCachedAuthToken } from '../../api/client';
import {
  AuthSession,
  clearAuthSession,
  getAuthSession,
  saveAuthSession,
} from '../storage';
import { getUserId } from '../../utils/api/userId';
import { withTimeout } from '../../utils/async/withTimeout';
import { warmupApi } from '../api/apiWarmup';

const LOG = '[Bootstrap]';

export const clearAllAuth = async () => {
  try {
    const { unregisterDeviceForPush } = await import(
      '../notifications/pushNotificationService'
    );
    await unregisterDeviceForPush();
  } catch {
    // ignore
  }
  try {
    await firebaseSignOut();
  } catch {
    // ignore
  }
  clearCachedAuthToken();
  await clearAuthSession();
};

/**
 * Restore local session quickly for splash.
 * - Waits briefly for Firebase persistence
 * - Uses short API timeout so splash never hangs ~2 minutes
 * - Clears stale Firebase + storage on auth failure
 */
export const restoreAuthSessionFast = async (): Promise<AuthSession | null> => {
  console.log(LOG, 'restore start');
  void warmupApi();

  const session = await getAuthSession();
  if (!session) {
    console.log(LOG, 'no stored session');
    // Stale Firebase user without app session → sign out so next launch is clean
    const firebaseUser = await waitForFirebaseAuth(1000);
    if (firebaseUser) {
      console.log(LOG, 'firebase user without session — clearing');
      await clearAllAuth();
    }
    return null;
  }

  const firebaseUser = await waitForFirebaseAuth(1800);
  if (!firebaseUser) {
    console.log(LOG, 'stored session but no firebase user — clearing');
    await clearAuthSession();
    clearCachedAuthToken();
    return null;
  }

  try {
    // Cached token first — force refresh can stall splash on bad networks.
    const idToken = await withTimeout(
      getFirebaseIdToken(false, firebaseUser),
      4000,
      'getIdToken'
    );

    const userId = getUserId(session.user);
    if (!userId) {
      console.log(LOG, 'session missing userId — clearing');
      await clearAllAuth();
      return null;
    }

    const profileResponse = await withTimeout(
      getAuthProfileAPI(userId, { timeout: 8000 }),
      9000,
      'getAuthProfile'
    );

    const persistedUser = profileResponse.data?.user || session.user;
    const restoredSession: AuthSession = {
      ...session,
      token: idToken,
      role: (persistedUser.role as AuthSession['role']) || session.role,
      user: {
        ...session.user,
        ...persistedUser,
        id: persistedUser.id || persistedUser._id || userId,
        _id: persistedUser._id || persistedUser.id || userId,
      },
    };

    setCachedAuthToken(idToken);
    await saveAuthSession(restoredSession);
    console.log(LOG, 'restore OK', {
      role: restoredSession.role,
      userId: getUserId(restoredSession.user),
    });

    void import('../notifications/pushNotificationService')
      .then(({ scheduleRegisterDeviceForPush }) =>
        scheduleRegisterDeviceForPush()
      )
      .catch(error => console.warn(LOG, 'push register failed', error));

    return restoredSession;
  } catch (error) {
    const status = error instanceof AxiosError ? error.response?.status : undefined;
    const message = error instanceof Error ? error.message : String(error);
    const isAuthError = status === 401 || status === 403;
    const isTransient =
      !status ||
      status >= 500 ||
      message.includes('timed out') ||
      message.includes('Network Error');

    console.warn(LOG, 'restore profile step failed', {
      status,
      message,
      isAuthError,
      isTransient,
    });

    if (isAuthError) {
      await clearAllAuth();
      return null;
    }

    try {
      const idToken = await withTimeout(
        getFirebaseIdToken(false, firebaseUser),
        5000,
        'getIdToken-fallback'
      );
      const fallbackSession: AuthSession = {
        ...session,
        token: idToken || session.token,
      };
      setCachedAuthToken(fallbackSession.token);
      await saveAuthSession(fallbackSession);
      console.log(LOG, 'restore using cached session (backend slow/unreachable)');
      void import('../notifications/pushNotificationService')
        .then(({ scheduleRegisterDeviceForPush }) =>
          scheduleRegisterDeviceForPush()
        )
        .catch(() => undefined);
      return fallbackSession;
    } catch {
      if (isTransient) {
        console.log(LOG, 'restore using stored session without refresh');
        if (session.token) {
          setCachedAuthToken(session.token);
        }
        void import('../notifications/pushNotificationService')
          .then(({ scheduleRegisterDeviceForPush }) =>
            scheduleRegisterDeviceForPush()
          )
          .catch(() => undefined);
        return session;
      }
      await clearAllAuth();
      return null;
    }
  }
};
