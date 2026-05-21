import api from './client';

export interface SignupPayload {
  fullName: string;
  email: string;
  password: string;
  confirmPassword?: string;
  role: 'student' | 'tutor' | 'parent';
}

export const signupAPI = (data: SignupPayload) => {
  return api.post('/auth/signup', data);
};

export const loginAPI = (data: { email: string; password: string }) => {
  return api.post('/auth/login', data);
};