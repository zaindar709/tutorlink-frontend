import axios, { AxiosHeaders, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../config/api';
import {
  getFirebaseIdToken,
  getCurrentFirebaseUser,
} from '../services/auth/firebaseAuthService';
import { clearAuthSession, getToken } from '../services/storage';
import { navigationRef, resetToAuth } from '../navigation/navigationRef';
import { store } from '../store/store';
import { logout } from '../store/auth/authSlice';
import { isFormDataLike, maskToken } from '../utils/upload/uploadDebug';
import { withTimeout } from '../utils/async/withTimeout';
import { speedLog } from '../utils/debug/speedLog';

const LOG = '[API]';

/** Avoid hanging every request on a slow Firebase token refresh. */
const TOKEN_RESOLVE_TIMEOUT_MS = 4000;
/** Reuse token briefly so list/dashboard calls don't wait on Firebase each time. */
const TOKEN_CACHE_TTL_MS = 4 * 60 * 1000;

const api = axios.create({
  baseURL: API_BASE_URL,
  // Render free tier cold-starts can exceed 15s — keep patient for release testing.
  timeout: 35000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

type CachedToken = { value: string; expiresAt: number };
let cachedAuthToken: CachedToken | null = null;

type TimedConfig = InternalAxiosRequestConfig & {
  metadata?: { startTime: number };
};

export const setCachedAuthToken = (token: string | null) => {
  if (!token) {
    cachedAuthToken = null;
    return;
  }
  cachedAuthToken = {
    value: token,
    expiresAt: Date.now() + TOKEN_CACHE_TTL_MS,
  };
};

export const clearCachedAuthToken = () => {
  cachedAuthToken = null;
};

const setRequestHeader = (
  config: InternalAxiosRequestConfig,
  key: string,
  value: string
) => {
  if (!config.headers) {
    config.headers = new AxiosHeaders();
  }

  if (config.headers instanceof AxiosHeaders) {
    config.headers.set(key, value);
    return;
  }

  (config.headers as Record<string, string>)[key] = value;
};

const deleteRequestHeader = (
  config: InternalAxiosRequestConfig,
  key: string
) => {
  if (!config.headers) {
    return;
  }

  if (config.headers instanceof AxiosHeaders) {
    config.headers.delete(key);
    return;
  }

  delete (config.headers as Record<string, string>)[key];
};

const resolveAuthToken = async (): Promise<string | null> => {
  // Prefer live Firebase user — required for /api/auth/register|login.
  const firebaseUser = getCurrentFirebaseUser();

  if (firebaseUser) {
    if (cachedAuthToken && Date.now() < cachedAuthToken.expiresAt) {
      return cachedAuthToken.value;
    }

    try {
      const token = await withTimeout(
        getFirebaseIdToken(false, firebaseUser),
        TOKEN_RESOLVE_TIMEOUT_MS,
        'Auth token'
      );
      setCachedAuthToken(token);
      return token;
    } catch (error) {
      console.warn(LOG, 'token from Firebase failed/timed out', error);
    }
  }

  if (cachedAuthToken && Date.now() < cachedAuthToken.expiresAt) {
    return cachedAuthToken.value;
  }

  const storedToken = await getToken();
  if (storedToken) {
    setCachedAuthToken(storedToken);
    return storedToken;
  }

  return store.getState().auth.token;
};

const isOnAuthFlowScreen = () => {
  if (!navigationRef.isReady()) return true;
  const route = navigationRef.getCurrentRoute();
  const name = route?.name ?? '';
  return (
    name === 'SplashScreen' ||
    name === 'OnboardingScreens' ||
    name === 'RoleSelectionScreen' ||
    name === 'AuthSelectionScreen' ||
    name.includes('Login') ||
    name.includes('SignUp') ||
    name.includes('Document') ||
    name.includes('Forgot') ||
    name.includes('Verify') ||
    name.includes('Password')
  );
};

api.interceptors.request.use(async config => {
  const timed = config as TimedConfig;
  timed.metadata = { startTime: Date.now() };

  if (isFormDataLike(config.data)) {
    deleteRequestHeader(config, 'Content-Type');
  }

  const tokenStarted = Date.now();
  const authToken = await resolveAuthToken();
  const tokenMs = Date.now() - tokenStarted;

  if (authToken) {
    setRequestHeader(config, 'Authorization', `Bearer ${authToken}`);
  }

  const url = `${config.baseURL ?? ''}${config.url ?? ''}`;
  speedLog('API →', {
    method: (config.method || 'get').toUpperCase(),
    url,
    hasAuth: !!authToken,
    tokenResolveMs: tokenMs,
  });

  if (url.includes('/api/tutor/onboarding') || url.includes('/api/auth/')) {
    console.log(LOG, 'request', {
      method: config.method,
      url,
      hasAuth: !!authToken,
      token: maskToken(authToken),
      isFormData: isFormDataLike(config.data),
      contentType:
        config.headers instanceof AxiosHeaders
          ? config.headers.get('Content-Type')
          : (config.headers as any)?.['Content-Type'],
    });
  }

  return config;
});

api.interceptors.response.use(
  response => {
    const timed = response.config as TimedConfig;
    const ms = timed.metadata?.startTime
      ? Date.now() - timed.metadata.startTime
      : undefined;
    const url = `${response.config.baseURL ?? ''}${response.config.url ?? ''}`;

    speedLog('API ← OK', {
      method: (response.config.method || 'get').toUpperCase(),
      url,
      status: response.status,
      ms,
    });

    if (
      (response.config.url ?? '').includes('/api/tutor/onboarding') ||
      (response.config.url ?? '').includes('/api/auth/')
    ) {
      console.log(LOG, 'response OK', {
        url: response.config.url,
        status: response.status,
        ms,
        data: response.data,
      });
    }
    return response;
  },
  async error => {
    const timed = error?.config as TimedConfig | undefined;
    const ms = timed?.metadata?.startTime
      ? Date.now() - timed.metadata.startTime
      : undefined;
    const requestUrl = error?.config?.url ?? '';
    const fullUrl = `${error?.config?.baseURL ?? ''}${requestUrl}`;
    const isOnboardingRoute = requestUrl.includes('/api/tutor/onboarding');
    const isAuthRoute = requestUrl.includes('/api/auth/');
    const isSoftLinkedParents404 =
      error?.response?.status === 404 &&
      typeof requestUrl === 'string' &&
      requestUrl.includes('/api/profile/linked-parents');
    const isSoftDeviceToken404 =
      error?.response?.status === 404 &&
      typeof requestUrl === 'string' &&
      requestUrl.includes('/api/notifications/device-token');
    // Inbox list route may not be deployed yet.
    const isSoftNotificationsInbox404 =
      error?.response?.status === 404 &&
      typeof requestUrl === 'string' &&
      requestUrl.includes('/api/notifications') &&
      !requestUrl.includes('device-token');
    // Login may 404 when Firebase user exists but backend profile is missing —
    // authService heals this with register. Don't spam LogBox as a red error.
    const isSoftAuthLogin404 =
      error?.response?.status === 404 &&
      typeof requestUrl === 'string' &&
      (requestUrl.includes('/api/auth/login') ||
        requestUrl.includes('/api/auth/register'));

    const isSoftExpected =
      isSoftLinkedParents404 ||
      isSoftDeviceToken404 ||
      isSoftNotificationsInbox404 ||
      isSoftAuthLogin404;

    if (isSoftExpected) {
      speedLog('API ← soft', {
        method: (error?.config?.method || '?').toUpperCase(),
        url: fullUrl,
        status: error?.response?.status,
        ms,
        note: isSoftAuthLogin404
          ? 'expected if profile missing — will auto-heal'
          : 'ignored empty/missing route',
      });
    } else {
      speedLog('API ← ERR', {
        method: (error?.config?.method || '?').toUpperCase(),
        url: fullUrl,
        status: error?.response?.status,
        ms,
        message: error?.message,
      });
      console.error(LOG, 'response ERROR', {
        url: requestUrl,
        status: error?.response?.status,
        message: error?.message,
        data: error?.response?.data,
        ms,
        hasAuthHeader: !!error?.config?.headers?.Authorization,
      });
    }

    // Only kick to auth when a real authenticated request was rejected.
    // Preview/UI mode (no Bearer token) must not bounce to onboarding.
    const authHeader =
      error?.config?.headers?.Authorization ||
      error?.config?.headers?.authorization;
    const hadAuthHeader = typeof authHeader === 'string' && authHeader.length > 0;

    if (
      error?.response?.status === 401 &&
      hadAuthHeader &&
      !isOnboardingRoute &&
      !isAuthRoute &&
      !isOnAuthFlowScreen()
    ) {
      clearCachedAuthToken();
      await clearAuthSession();
      store.dispatch(logout());
      resetToAuth();
    }
    return Promise.reject(error);
  }
);

export default api;
