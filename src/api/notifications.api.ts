import api from './client';
import { ApiSuccessResponse } from '../types/api.types';

export type DevicePlatform = 'android' | 'ios';

export type RegisterDeviceTokenPayload = {
  token: string;
  platform: DevicePlatform;
  /** App role on this device */
  role?: 'student' | 'tutor' | 'parent';
  /** Optional device label */
  deviceId?: string;
};

export const registerDeviceTokenAPI = (data: RegisterDeviceTokenPayload) =>
  api.post<ApiSuccessResponse<{ registered: boolean }>>(
    '/api/notifications/device-token',
    data
  );

export const unregisterDeviceTokenAPI = (data: { token: string }) =>
  api.delete<ApiSuccessResponse<{ unregistered: boolean }>>(
    '/api/notifications/device-token',
    { data }
  );

export const listInboxNotificationsAPI = (params?: {
  page?: number;
  limit?: number;
}) =>
  api.get<
    ApiSuccessResponse<{
      items: Array<{
        id: string;
        title: string;
        body: string;
        type?: string;
        data?: Record<string, string>;
        read?: boolean;
        createdAt?: string;
      }>;
    }>
  >('/api/notifications', {
    params: { page: params?.page ?? 1, limit: params?.limit ?? 30 },
  });
