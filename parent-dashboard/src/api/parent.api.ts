import { parentRequest, ParentApiError } from './client';
import type {
  AiRecommendation,
  LinkedChild,
  ParentDashboardData,
  ParentNotification,
  ParentProfile,
  ParentSession,
  ParentSettings,
  PaymentRecord,
  ProgressSnapshot,
  ChildWeeklyProgress,
} from '../types/parent.types';

export type ParentMe = ParentProfile & {
  _id?: string;
  role?: string;
  linkedChildrenCount?: number;
};

export type RedeemResult = {
  linkId: string;
  student: {
    id: string;
    studentId?: string;
    userId?: string;
    name: string;
    email?: string;
    grade?: string;
    board?: string;
    subjects?: string[];
  };
  linkedAt: string;
  linkedStudentsCount?: number;
};

export type Paginated<T> = {
  items: T[];
  unreadCount?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type DeviceSession = {
  id: string;
  platform?: string;
  userAgent?: string;
  ip?: string;
  lastSeenAt?: string;
  createdAt?: string;
  current?: boolean;
};

export type AuthUser = {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
  phoneNumber?: string;
};

export const loginParentApi = (token: string, email: string, firebaseUid: string) =>
  parentRequest<{ user?: AuthUser } & AuthUser>('/api/auth/login', {
    method: 'POST',
    token,
    body: { email, firebaseUid },
  });

export const registerParentApi = (
  token: string,
  body: { name: string; email: string; firebaseUid: string; phoneNumber?: string }
) =>
  parentRequest<{ user?: AuthUser } & AuthUser>('/api/auth/register', {
    method: 'POST',
    token,
    body: { ...body, role: 'parent' },
  });

export const getParentMe = () => parentRequest<ParentMe>('/api/parent/me');

export const patchParentMe = (body: { name?: string; phone?: string }) =>
  parentRequest<ParentMe>('/api/parent/me', { method: 'PATCH', body });

export const uploadParentAvatar = (file: File) => {
  const formData = new FormData();
  formData.append('avatar', file);
  return parentRequest<ParentMe>('/api/parent/me/avatar', {
    method: 'POST',
    formData,
  });
};

const appendQuery = (path: string, params: { code?: string }) => {
  const qIndex = path.indexOf('?');
  const base = qIndex === -1 ? path : path.slice(0, qIndex);
  const qs = new URLSearchParams(qIndex === -1 ? '' : path.slice(qIndex + 1));
  if (params.code) qs.set('code', params.code);
  const serialized = qs.toString();
  return serialized ? `${base}?${serialized}` : base;
};

const codeRequest = (code?: string) => ({
  auth: false as const,
  linkCode: code || undefined,
});

export type CodeAccessPayload = {
  student?: RedeemResult['student'];
  dashboard?: ParentDashboardData;
  linkId?: string;
  linkedAt?: string;
} & Partial<ParentDashboardData>;

export const accessDashboardByCode = (code: string) =>
  parentRequest<CodeAccessPayload>('/api/parent/access-by-code', {
    method: 'POST',
    body: { code: code.trim() },
    ...codeRequest(code),
  });

/** First access: POST access-by-code. Fallback GET only if that route is missing. */
export const openDashboardByCode = async (code: string) => {
  const trimmed = code.trim();
  try {
    return await accessDashboardByCode(trimmed);
  } catch (err) {
    if (
      err instanceof ParentApiError &&
      (err.status === 404 || err.status === 405 || err.status === 501)
    ) {
      return getParentDashboard(trimmed);
    }
    throw err;
  }
};

/** Refresh a saved child with GET dashboard?code= — never mix two codes. */
export const refreshDashboardByCode = async (code: string) => {
  const trimmed = code.trim();
  try {
    return await getParentDashboard(trimmed);
  } catch (err) {
    if (
      err instanceof ParentApiError &&
      (err.status === 404 || err.status === 405 || err.status === 501)
    ) {
      return accessDashboardByCode(trimmed);
    }
    throw err;
  }
};

export const redeemLinkCode = (code: string) =>
  parentRequest<RedeemResult>('/api/parent/link-code/redeem', {
    method: 'POST',
    body: { code: code.trim() },
    ...codeRequest(code),
  });

export const getParentDashboard = (code?: string) =>
  parentRequest<CodeAccessPayload>(
    appendQuery('/api/parent/dashboard', { code }),
    codeRequest(code)
  );

export const getParentChildren = (code?: string) =>
  parentRequest<{ items: LinkedChild[] } | LinkedChild[]>(
    appendQuery('/api/parent/children', { code }),
    codeRequest(code)
  );

export const unlinkChild = (studentId: string, code?: string) =>
  parentRequest<{ revoked?: boolean; studentId?: string }>(
    appendQuery(`/api/parent/children/${encodeURIComponent(studentId)}`, {
      code,
    }),
    { method: 'DELETE', ...codeRequest(code) }
  );

export const getParentSessions = (status = 'all', code?: string) =>
  parentRequest<Paginated<ParentSession>>(
    appendQuery(
      `/api/parent/sessions?status=${encodeURIComponent(status)}&page=1&limit=50`,
      { code }
    ),
    codeRequest(code)
  );

export const getParentProgress = (code?: string) =>
  parentRequest<{
    progress: ProgressSnapshot[];
    weeklyProgress: ChildWeeklyProgress[];
  }>(appendQuery('/api/parent/progress', { code }), codeRequest(code));

export const getParentAiInsights = (code?: string) =>
  parentRequest<AiRecommendation>(
    appendQuery('/api/parent/ai-insights', { code }),
    codeRequest(code)
  );

export const getParentPayments = (code?: string) =>
  parentRequest<{
    monthlySpend: number;
    currency?: string;
    items: PaymentRecord[];
  }>(appendQuery('/api/parent/payments', { code }), codeRequest(code));

export const getParentNotifications = (filter = 'all', code?: string) =>
  parentRequest<Paginated<ParentNotification>>(
    appendQuery(
      `/api/parent/notifications?filter=${encodeURIComponent(filter)}&page=1&limit=30`,
      { code }
    ),
    codeRequest(code)
  );

export const markParentNotificationRead = (id: string, code?: string) =>
  parentRequest<{ read: boolean }>(
    appendQuery(`/api/parent/notifications/${id}/read`, { code }),
    { method: 'PATCH', ...codeRequest(code) }
  );

export const markAllParentNotificationsRead = (code?: string) =>
  parentRequest<{ read: boolean }>(
    appendQuery('/api/parent/notifications/read-all', { code }),
    { method: 'PATCH', ...codeRequest(code) }
  );

export const deleteParentNotification = (id: string, code?: string) =>
  parentRequest<unknown>(appendQuery(`/api/parent/notifications/${id}`, { code }), {
    method: 'DELETE',
    ...codeRequest(code),
  });

export const getParentSettings = () =>
  parentRequest<ParentSettings>('/api/parent/settings');

export const patchParentSettings = (body: Partial<ParentSettings>) =>
  parentRequest<ParentSettings>('/api/parent/settings', {
    method: 'PATCH',
    body,
  });

export const getSecuritySessions = () =>
  parentRequest<{ items: DeviceSession[] } | DeviceSession[]>(
    '/api/parent/security/sessions'
  );

export const signOutOtherSessions = () =>
  parentRequest<{ signedOutCount?: number; items?: DeviceSession[] }>(
    '/api/parent/security/sign-out-others',
    { method: 'POST' }
  );

export const exportParentData = () =>
  parentRequest<Record<string, unknown>>('/api/parent/data-export', {
    method: 'POST',
  });
