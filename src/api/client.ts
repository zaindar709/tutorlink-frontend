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

const LOG = '[API]';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  const firebaseUser = getCurrentFirebaseUser();

  if (firebaseUser) {
    try {
      return await getFirebaseIdToken(false, firebaseUser);
    } catch (error) {
      console.warn(LOG, 'token from Firebase failed', error);
    }
  }

  const storedToken = await getToken();
  if (storedToken) {
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
  if (isFormDataLike(config.data)) {
    deleteRequestHeader(config, 'Content-Type');
  }

  const authToken = await resolveAuthToken();
  if (authToken) {
    setRequestHeader(config, 'Authorization', `Bearer ${authToken}`);
  }

  const url = `${config.baseURL ?? ''}${config.url ?? ''}`;
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
    const url = response?.config?.url ?? '';
    if (url.includes('/api/tutor/onboarding') || url.includes('/api/auth/')) {
      console.log(LOG, 'response OK', {
        url,
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  async error => {
    const requestUrl = error?.config?.url ?? '';
    const isOnboardingRoute = requestUrl.includes('/api/tutor/onboarding');
    const isAuthRoute = requestUrl.includes('/api/auth/');

    console.error(LOG, 'response ERROR', {
      url: requestUrl,
      status: error?.response?.status,
      message: error?.message,
      data: error?.response?.data,
      hasAuthHeader: !!error?.config?.headers?.Authorization,
    });

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
      await clearAuthSession();
      store.dispatch(logout());
      resetToAuth();
    }
    return Promise.reject(error);
  }
);

export default api;
