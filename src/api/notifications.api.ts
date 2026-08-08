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

export type ServerInboxItem = {
  _id?: string;
  id?: string;
  type?: string;
  title: string;
  body: string;
  bookingId?: string;
  screen?: string;
  data?: Record<string, string | undefined>;
  read?: boolean;
  createdAt?: string;
  recipientUserId?: string;
  userId?: string;
};

export type InboxListData = {
  items: ServerInboxItem[];
  unreadCount?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export const registerDeviceTokenAPI = (data: RegisterDeviceTokenPayload) =>
  api.post<ApiSuccessResponse<{ registered: boolean; tokenCount?: number }>>(
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
  unreadOnly?: boolean;
}) =>
  api.get<ApiSuccessResponse<InboxListData>>('/api/notifications', {
    params: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 30,
      unreadOnly: params?.unreadOnly ?? false,
    },
  });

export const markNotificationReadAPI = (id: string) =>
  api.patch<ApiSuccessResponse<{ read: boolean }>>(
    `/api/notifications/${id}/read`
  );

export const markAllNotificationsReadAPI = () =>
  api.patch<ApiSuccessResponse<{ read: boolean }>>(
    '/api/notifications/read-all'
  );
