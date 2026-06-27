import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { getFirebaseIdToken, getCurrentFirebaseUser } from '../services/auth/firebaseAuthService';
import { clearAuthSession, getToken } from '../services/storage';
import { resetToAuth } from '../navigation/navigationRef';
import { store } from '../store/store';
import { logout } from '../store/auth/authSlice';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async config => {
  const firebaseUser = getCurrentFirebaseUser();

  if (firebaseUser) {
    try {
      const idToken = await getFirebaseIdToken();
      if (config.headers) {
        config.headers.Authorization = `Bearer ${idToken}`;
      }
      return config;
    } catch {
      const storedToken = await getToken();
      if (storedToken && config.headers) {
        config.headers.Authorization = `Bearer ${storedToken}`;
      }
    }
  }

  return config;
});

api.interceptors.response.use(
  response => response,
  async error => {
    if (error?.response?.status === 401) {
      await clearAuthSession();
      store.dispatch(logout());
      resetToAuth();
    }
    return Promise.reject(error);
  }
);

export default api;
