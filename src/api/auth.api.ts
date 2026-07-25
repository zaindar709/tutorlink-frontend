import api from './client';
import {
  AuthGoogleLoginPayload,
  AuthLoginPayload,
  AuthLoginResponse,
  AuthProfileResponse,
  AuthRegisterPayload,
} from '../types/api.types';

/** Allow cold-start wake on Render free tier, but fail before a 2-minute hang. */
const AUTH_REQUEST_TIMEOUT_MS = 35000;

export const registerAPI = (data: AuthRegisterPayload) => {
  return api.post<{ message: string; user: AuthLoginResponse['user'] }>(
    '/api/auth/register',
    data,
    { timeout: AUTH_REQUEST_TIMEOUT_MS }
  );
};

export const loginAPI = (data: AuthLoginPayload) => {
  return api.post<AuthLoginResponse>('/api/auth/login', data, {
    timeout: AUTH_REQUEST_TIMEOUT_MS,
  });
};

export const googleLoginAPI = (data: AuthGoogleLoginPayload) => {
  return api.post<AuthLoginResponse>('/api/auth/google-login', data, {
    timeout: AUTH_REQUEST_TIMEOUT_MS,
  });
};

export const getAuthProfileAPI = (
  id: string,
  config?: { timeout?: number }
) => {
  return api.get<AuthProfileResponse>(`/api/auth/profile/${id}`, config);
};
