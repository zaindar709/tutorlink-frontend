/**
 * Compatibility shim — prefer notificationInboxStore.
 */
export {
  getNotificationInbox as getLocalInbox,
  subscribeNotificationInbox as subscribeLocalInbox,
  clearNotificationInbox as clearLocalInbox,
  upsertNotification,
} from './notificationInboxStore';

export type { AppNotification as LocalInboxItem } from '../../types/notification.types';

import { upsertNotification } from './notificationInboxStore';
import { AppNotification } from '../../types/notification.types';

export const prependLocalInboxItem = async (item: {
  id?: string;
  title: string;
  body: string;
  type?: string;
  data?: Record<string, string>;
  read?: boolean;
  createdAt?: string;
  source: 'push' | 'api' | 'test' | 'local';
}): Promise<AppNotification> => {
  return upsertNotification({
    id: item.id || `local-${Date.now()}`,
    title: item.title,
    body: item.body,
    type: item.type || 'general',
    data: item.data || {},
    read: item.read ?? false,
    createdAt: item.createdAt || new Date().toISOString(),
    source:
      item.source === 'push'
        ? 'push'
        : item.source === 'test'
          ? 'test'
          : 'local',
  });
};
