export type AppNotificationType =
  | 'chat'
  | 'message'
  | 'booking'
  | 'session'
  | 'schedule'
  | 'payment'
  | 'reminder'
  | 'verification'
  | 'request'
  | 'certificate'
  | 'welcome'
  | 'general'
  | string;

/** Normalized payload stored in Notification Center + passed through FCM/Notifee data. */
export type AppNotification = {
  id: string;
  title: string;
  body: string;
  type: AppNotificationType;
  createdAt: string;
  read: boolean;
  /** Related entity ids / deep-link fields (all stringified for FCM). */
  data: Record<string, string>;
  source: 'push' | 'local' | 'test';
};

export type PushNotificationData = Record<string, string | undefined>;

export const NOTIFICATION_CHANNEL_ID = 'tutorlink_default';
export const NOTIFICATION_CHANNEL_NAME = 'TutorLink';
