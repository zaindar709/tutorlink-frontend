import api from './client';
import {
  AuthGoogleLoginPayload,
  AuthLoginPayload,
  AuthLoginResponse,
  AuthProfileResponse,
  AuthRegisterPayload,
} from '../types/api.types';

const AUTH_REQUEST_TIMEOUT_MS = 45000;

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
  return api.post<AuthLoginResponse>('/api/auth/google-login', data);
};

export const getAuthProfileAPI = (
  id: string,
  config?: { timeout?: number }
) => {
  return api.get<AuthProfileResponse>(`/api/auth/profile/${id}`, config);
};
