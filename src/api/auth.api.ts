import api from './client';
import {
  AuthGoogleLoginPayload,
  AuthLoginPayload,
  AuthLoginResponse,
  AuthProfileResponse,
  AuthRegisterPayload,
} from '../types/api.types';

export const registerAPI = (data: AuthRegisterPayload) => {
  return api.post<{ message: string; user: AuthLoginResponse['user'] }>(
    '/api/auth/register',
    data
  );
};

export const loginAPI = (data: AuthLoginPayload) => {
  return api.post<AuthLoginResponse>('/api/auth/login', data);
};

export const googleLoginAPI = (data: AuthGoogleLoginPayload) => {
  return api.post<AuthLoginResponse>('/api/auth/google-login', data);
};

export const getAuthProfileAPI = (id: string) => {
  return api.get<AuthProfileResponse>(`/api/auth/profile/${id}`);
};
