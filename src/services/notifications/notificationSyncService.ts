import {
  listInboxNotificationsAPI,
  markAllNotificationsReadAPI,
  markNotificationReadAPI,
  ServerInboxItem,
} from '../../api/notifications.api';
import { AppNotification } from '../../types/notification.types';
import { upsertNotification } from './notificationInboxStore';

const asStringRecord = (
  data?: Record<string, string | undefined> | null
): Record<string, string> => {
  if (!data || typeof data !== 'object') return {};
  return Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, v == null ? '' : String(v)])
  );
};

export const mapServerInboxItem = (
  item: ServerInboxItem,
  fallbackUserId?: string | null
): AppNotification => {
  const id = String(item._id || item.id || '');
  const data = asStringRecord(item.data);
  const bookingId = String(item.bookingId || data.bookingId || '');
  const screen = String(item.screen || data.screen || '');
  const type = String(item.type || data.type || 'general');
  const recipientUserId = String(
    item.recipientUserId ||
      item.userId ||
      data.recipientUserId ||
      data.userId ||
      fallbackUserId ||
      ''
  );

  if (bookingId && !data.bookingId) data.bookingId = bookingId;
  if (screen && !data.screen) data.screen = screen;
  if (type && !data.type) data.type = type;
  if (recipientUserId && !data.recipientUserId) {
    data.recipientUserId = recipientUserId;
  }

  return {
    id: id || `server-${Date.now()}`,
    title: item.title,
    body: item.body,
    type,
    createdAt: item.createdAt || new Date().toISOString(),
    read: Boolean(item.read),
    recipientUserId: recipientUserId || undefined,
    data,
    source: 'server',
  };
};

/**
 * Merge server inbox rows into local Notification Center (FCM + backend events).
 * GET /api/notifications is required for cross-device accept/reject alerts.
 */
export const syncServerNotifications = async (
  userId?: string | null
): Promise<number> => {
  try {
    const response = await listInboxNotificationsAPI({
      page: 1,
      limit: 50,
      unreadOnly: false,
    });
    const items = response.data.data?.items ?? [];
    let merged = 0;
    for (const item of items) {
      const mapped = mapServerInboxItem(item, userId);
      if (
        userId &&
        mapped.recipientUserId &&
        String(mapped.recipientUserId) !== String(userId)
      ) {
        continue;
      }
      await upsertNotification(mapped);
      merged += 1;
    }
    return merged;
  } catch (error) {
    console.warn('[Notifications] inbox sync failed', error);
    return 0;
  }
};

export const markServerNotificationRead = async (id: string): Promise<void> => {
  try {
    await markNotificationReadAPI(id);
  } catch (error) {
    console.warn('[Notifications] mark read failed', id, error);
  }
};

export const markAllServerNotificationsRead = async (): Promise<void> => {
  try {
    await markAllNotificationsReadAPI();
  } catch (error) {
    console.warn('[Notifications] mark-all read failed', error);
  }
};
