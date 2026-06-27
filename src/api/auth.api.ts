import api from './client';

export interface SignupPayload {
  firebaseUid: string;
  idToken?: string;
  name?: string;
  fullName?: string;
  email: string;
  password?: string;
  role: 'student' | 'tutor' | 'parent';
  phoneNumber?: string;
  expertise?: string;
  subjects?: string[];
  selectedClass?: string;
}

export interface LoginPayload {
  email: string;
  firebaseUid: string;
  idToken?: string;
  role?: 'student' | 'tutor' | 'parent';
}

export interface GoogleLoginPayload {
  name: string;
  email: string;
  firebaseUid: string;
  role: 'student' | 'tutor' | 'parent';
}

export interface AuthResponse<TUser = any> {
  user: TUser;
  token?: string;
}

export const signupAPI = (data: SignupPayload) => {
  return api.post<AuthResponse>('/register', data);
};

export const loginAPI = (data: LoginPayload) => {
  return api.post<AuthResponse>('/login', data);
};

export const googleLoginAPI = (data: GoogleLoginPayload) => {
  return api.post<AuthResponse>('/google-login', data);
};

export const getProfileAPI = (id: string) => {
  return api.get<{ user: any; details?: any }>(`/profile/${id}`);
};