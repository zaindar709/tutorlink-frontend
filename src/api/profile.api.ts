import api from './client';
import {
  ApiSuccessResponse,
  LinkCodeData,
  LinkedParent,
  RedeemLinkCodePayload,
  StudentAppSettings,
  StudentCertificateItem,
  StudentNotificationSettings,
  StudentPrivacySettings,
  StudentProfile,
  StudentSessionHistoryItem,
  StudentSettingsBundle,
  UpdateInterestsPayload,
  UpdateProfilePayload,
} from '../types/api.types';

export const getMyProfileAPI = () =>
  api.get<ApiSuccessResponse<StudentProfile>>('/api/profile/me');

export const updateMyProfileAPI = (data: UpdateProfilePayload) =>
  api.patch<ApiSuccessResponse<StudentProfile>>('/api/profile/me', data);

export const uploadProfileAvatarAPI = (file: {
  uri: string;
  type?: string;
  name?: string;
}) => {
  const formData = new FormData();
  formData.append('avatar', {
    uri: file.uri,
    type: file.type || 'image/jpeg',
    name: file.name || `avatar-${Date.now()}.jpg`,
  } as any);

  return api.post<ApiSuccessResponse<{ avatarUrl: string }>>(
    '/api/profile/avatar',
    formData,
    { timeout: 60000 }
  );
};

export const getInterestsAPI = () =>
  api.get<ApiSuccessResponse<{ interests: string[]; grade?: string }>>(
    '/api/profile/interests'
  );

export const updateInterestsAPI = (data: UpdateInterestsPayload) =>
  api.put<
    ApiSuccessResponse<{
      interests: string[];
      grade?: string;
      interestsCount: number;
    }>
  >('/api/profile/interests', data);

export const generateLinkCodeAPI = () =>
  api.post<ApiSuccessResponse<LinkCodeData>>(
    '/api/profile/link-code/generate'
  );

export const redeemLinkCodeAPI = (data: RedeemLinkCodePayload) =>
  api.post<ApiSuccessResponse<unknown>>('/api/profile/link-code/redeem', data);

export const getLinkedParentsAPI = () =>
  api.get<ApiSuccessResponse<LinkedParent[] | { items: LinkedParent[] }>>(
    '/api/profile/linked-parents'
  );

export const unlinkParentAPI = (linkId: string) =>
  api.delete<ApiSuccessResponse<{ id: string; unlinked: boolean }>>(
    `/api/profile/linked-parents/${linkId}`
  );

export const getSessionHistoryAPI = (params?: {
  page?: number;
  limit?: number;
  status?: 'all' | 'completed' | 'cancelled' | 'missed';
}) =>
  api.get<
    ApiSuccessResponse<{
      items: StudentSessionHistoryItem[];
      total?: number;
      pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>
  >('/api/student/sessions/history', {
    params: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
      status: params?.status ?? 'all',
    },
  });

export const rateSessionAPI = (
  bookingId: string,
  data: { rating: number; review?: string }
) =>
  api.post<
    ApiSuccessResponse<{
      id: string;
      rating: number;
      review?: string;
      ratedAt?: string;
    }>
  >(`/api/student/sessions/${bookingId}/rate`, data);

export const getCertificatesAPI = (params?: {
  page?: number;
  limit?: number;
  filter?: 'all' | 'recent';
}) =>
  api.get<
    ApiSuccessResponse<{
      items: StudentCertificateItem[];
      total?: number;
      pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>
  >('/api/student/certificates', {
    params: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
      filter: params?.filter ?? 'all',
    },
  });

export const downloadCertificateAPI = (id: string) =>
  api.get<
    ApiSuccessResponse<{
      url: string;
      expiresIn?: number;
      certificate?: StudentCertificateItem;
    }>
  >(`/api/student/certificates/${id}/download`);

export const getNotificationSettingsAPI = () =>
  api.get<ApiSuccessResponse<StudentNotificationSettings>>(
    '/api/student/settings/notifications'
  );

export const updateNotificationSettingsAPI = (
  data: Partial<StudentNotificationSettings>
) =>
  api.patch<ApiSuccessResponse<StudentNotificationSettings>>(
    '/api/student/settings/notifications',
    data
  );

export const getAppSettingsAPI = () =>
  api.get<ApiSuccessResponse<StudentAppSettings>>('/api/student/settings/app');

export const updateAppSettingsAPI = (data: Partial<StudentAppSettings>) =>
  api.patch<ApiSuccessResponse<StudentAppSettings>>(
    '/api/student/settings/app',
    data
  );

export const getPrivacySettingsAPI = () =>
  api.get<ApiSuccessResponse<StudentPrivacySettings>>(
    '/api/student/settings/privacy'
  );

export const updatePrivacySettingsAPI = (
  data: Partial<StudentPrivacySettings>
) =>
  api.patch<ApiSuccessResponse<StudentPrivacySettings>>(
    '/api/student/settings/privacy',
    data
  );

export const getAllStudentSettingsAPI = () =>
  api.get<ApiSuccessResponse<StudentSettingsBundle>>('/api/student/settings');

export const updateAllStudentSettingsAPI = (
  data: Partial<{
    notifications: Partial<StudentNotificationSettings>;
    app: Partial<StudentAppSettings>;
    privacy: Partial<StudentPrivacySettings>;
  }>
) =>
  api.patch<ApiSuccessResponse<StudentSettingsBundle>>(
    '/api/student/settings',
    data
  );
