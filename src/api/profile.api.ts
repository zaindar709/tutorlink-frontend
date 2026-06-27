import api from './client';
import {
  ApiSuccessResponse,
  LinkCodeData,
  RedeemLinkCodePayload,
  StudentProfile,
  UpdateInterestsPayload,
  UpdateProfilePayload,
} from '../types/api.types';

export const getMyProfileAPI = () => {
  return api.get<ApiSuccessResponse<StudentProfile>>('/api/profile/me');
};

export const updateMyProfileAPI = (data: UpdateProfilePayload) => {
  return api.patch<ApiSuccessResponse<StudentProfile>>('/api/profile/me', data);
};

export const updateInterestsAPI = (data: UpdateInterestsPayload) => {
  return api.put<{ interests: string[]; interestsCount: number }>(
    '/api/profile/interests',
    data
  );
};

export const generateLinkCodeAPI = () => {
  return api.post<ApiSuccessResponse<LinkCodeData>>(
    '/api/profile/link-code/generate'
  );
};

export const redeemLinkCodeAPI = (data: RedeemLinkCodePayload) => {
  return api.post<ApiSuccessResponse<unknown>>(
    '/api/profile/link-code/redeem',
    data
  );
};
