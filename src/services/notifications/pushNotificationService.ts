import {
  Platform,
  PermissionsAndroid,
  InteractionManager,
  AppState,
} from 'react-native';
import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import notifee, {
  AndroidImportance,
  AndroidVisibility,
  EventType,
} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  registerDeviceTokenAPI,
  unregisterDeviceTokenAPI,
} from '../../api/notifications.api';
import { navigationRef } from '../../navigation/navigationRef';
import { getAuthSession } from '../storage';
import {
  AppNotification,
  NOTIFICATION_CHANNEL_ID,
  NOTIFICATION_CHANNEL_NAME,
  PushNotificationData,
} from '../../types/notification.types';
import { upsertNotification } from './notificationInboxStore';
import { getUserId } from '../../utils/api/userId';

const LOG = '[Push]';
const TOKEN_KEY = '@TutorLink:fcmDeviceToken';
const SMALL_ICON = 'ic_notification';

/** Avoid racing permission dialogs with Alert/navigation after login. */
let registerTimer: ReturnType<typeof setTimeout> | null = null;
let registerInFlight: Promise<string | null> | null = null;
let channelReady = false;

export type { PushNotificationData };

const getStoredToken = async () => AsyncStorage.getItem(TOKEN_KEY);
const storeToken = async (token: string) =>
  AsyncStorage.setItem(TOKEN_KEY, token);
const clearStoredToken = async () => AsyncStorage.removeItem(TOKEN_KEY);

const toStringData = (
  data?: Record<string, unknown> | null
): Record<string, string> => {
  if (!data) return {};
  return Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, v == null ? '' : String(v)])
  );
};

/** Android 8+ channel — HIGH importance + default sound (lock screen / heads-up). */
export const ensureAndroidNotificationChannel = async (): Promise<string> => {
  if (Platform.OS !== 'android') return NOTIFICATION_CHANNEL_ID;
  if (channelReady) return NOTIFICATION_CHANNEL_ID;

  await notifee.createChannel({
    id: NOTIFICATION_CHANNEL_ID,
    name: NOTIFICATION_CHANNEL_NAME,
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
    visibility: AndroidVisibility.PUBLIC,
  });
  channelReady = true;
  return NOTIFICATION_CHANNEL_ID;
};

/**
 * Display a real Android system notification via Notifee.
 * Used for foreground FCM and data-only background messages (never duplicate
 * when FCM already showed a notification+data tray item).
 */
export const displaySystemNotification = async (
  notification: AppNotification
): Promise<void> => {
  try {
    await ensureAndroidNotificationChannel();
    const data = toStringData(notification.data);

    await notifee.displayNotification({
      id: notification.id,
      title: notification.title || 'TutorLink',
      body: notification.body || 'You have a new notification',
      data,
      android: {
        channelId: NOTIFICATION_CHANNEL_ID,
        importance: AndroidImportance.HIGH,
        sound: 'default',
        pressAction: { id: 'default' },
        smallIcon: SMALL_ICON,
        visibility: AndroidVisibility.PUBLIC,
      },
    });
  } catch (error) {
    console.warn(LOG, 'displaySystemNotification failed', error);
  }
};

export const parseRemoteToAppNotification = (
  remote: {
    messageId?: string;
    notification?: { title?: string | null; body?: string | null } | null;
    data?: PushNotificationData | null;
    sentTime?: number;
  },
  source: AppNotification['source'] = 'push',
  recipientUserId?: string | null
): AppNotification => {
  const data = (remote.data || {}) as Record<string, string>;
  const id =
    data.notificationId ||
    data.id ||
    remote.messageId ||
    `push-${Date.now()}`;
  const resolvedRecipient =
    data.recipientUserId || data.userId || recipientUserId || undefined;

  if (resolvedRecipient && !data.recipientUserId) {
    data.recipientUserId = String(resolvedRecipient);
  }

  return {
    id: String(id),
    title: String(remote.notification?.title || data.title || 'TutorLink'),
    body: String(
      remote.notification?.body ||
        data.body ||
        data.message ||
        'You have a new notification'
    ),
    type: String(data.type || data.notificationType || 'general'),
    createdAt:
      data.createdAt || new Date(remote.sentTime || Date.now()).toISOString(),
    read: false,
    recipientUserId: resolvedRecipient ? String(resolvedRecipient) : undefined,
    data: Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, v == null ? '' : String(v)])
    ),
    source,
  };
};

/** Persist to Notification Center; optionally show Android system tray (Notifee). */
export const presentNotification = async (
  notification: AppNotification,
  options?: { showSystemTray?: boolean }
): Promise<AppNotification> => {
  const saved = await upsertNotification(notification);
  if (options?.showSystemTray) {
    await displaySystemNotification(saved);
  }
  return saved;
};

export const requestPushPermission = async (): Promise<boolean> => {
  try {
    // Never prompt while Activity is backgrounded / mid-navigation — that
    // races Alert + navigation.reset and can SIGSEGV Hermes AsyncCallback.
    if (AppState.currentState !== 'active') {
      console.log(LOG, 'skip permission — app not active:', AppState.currentState);
      return false;
    }

    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const already = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (!already) {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log(LOG, 'POST_NOTIFICATIONS denied');
          return false;
        }
      }
    }

    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    console.log(LOG, 'permission', authStatus, enabled);
    return enabled;
  } catch (error) {
    console.warn(LOG, 'requestPermission failed', error);
    return false;
  }
};

export const getFcmToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'ios') {
      await messaging().registerDeviceForRemoteMessages();
    }
    const token = await messaging().getToken();
    return token || null;
  } catch (error) {
    console.warn(LOG, 'getToken failed', error);
    return null;
  }
};

export const registerDeviceForPush = async (): Promise<string | null> => {
  if (registerInFlight) return registerInFlight;

  registerInFlight = (async () => {
    const allowed = await requestPushPermission();
    if (!allowed) return null;

    const token = await getFcmToken();
    if (!token) return null;

    const session = await getAuthSession();
    const role = session?.role;

    try {
      await registerDeviceTokenAPI({
        token,
        platform: Platform.OS === 'ios' ? 'ios' : 'android',
        role:
          role === 'tutor' || role === 'parent' || role === 'student'
            ? role
            : undefined,
      });
      await storeToken(token);
      console.log(LOG, 'device token registered', token.slice(0, 12) + '…');
      return token;
    } catch (error) {
      await storeToken(token);
      console.warn(
        LOG,
        'registerDeviceTokenAPI failed (token kept locally)',
        error
      );
      return token;
    }
  })();

  try {
    return await registerInFlight;
  } finally {
    registerInFlight = null;
  }
};

/**
 * Call after login/signup/session restore — waits for navigation/alerts to
 * settle so POST_NOTIFICATIONS is not requested during a screen reset.
 */
export const scheduleRegisterDeviceForPush = (delayMs = 1200): void => {
  if (registerTimer) {
    clearTimeout(registerTimer);
    registerTimer = null;
  }

  InteractionManager.runAfterInteractions(() => {
    registerTimer = setTimeout(() => {
      registerTimer = null;
      void registerDeviceForPush().catch(error =>
        console.warn(LOG, 'scheduled register failed', error)
      );
    }, delayMs);
  });
};

export const unregisterDeviceForPush = async (): Promise<void> => {
  const token = await getStoredToken();
  if (!token) return;

  try {
    await unregisterDeviceTokenAPI({ token });
  } catch (error) {
    console.warn(LOG, 'unregisterDeviceTokenAPI failed', error);
  }

  try {
    await messaging().deleteToken();
  } catch {
    // ignore
  }
  await clearStoredToken();
};

const navigateWhenReady = (
  data?: PushNotificationData | null,
  attempt = 0
) => {
  if (!data) return;
  if (!navigationRef.isReady()) {
    if (attempt < 20) {
      setTimeout(() => navigateWhenReady(data, attempt + 1), 250);
    }
    return;
  }
  handleNotificationNavigation(data);
};

export const handleNotificationNavigation = (
  data?: PushNotificationData | null
) => {
  if (!data) return;
  if (!navigationRef.isReady()) {
    navigateWhenReady(data);
    return;
  }

  const type = String(data.type || data.notificationType || '').toLowerCase();
  const screen = String(data.screen || '');
  const chatId = data.chatId || data.conversationId;
  const bookingId = data.bookingId || data.relatedId;

  try {
    if (
      screen === 'ChatScreen' ||
      ((type === 'chat' ||
        type === 'message' ||
        type === 'new_message') &&
        chatId)
    ) {
      navigationRef.navigate('HomeNavigator' as never, {
        screen: 'ChatScreen',
        params: {
          chatId,
          peerName: data.peerName,
          peerAvatar: data.peerAvatar,
          bookingId: data.bookingId,
          participantId: data.participantId,
        },
      } as never);
      return;
    }

    // Doc: booking_accepted → Bookings; booking_request → Request;
    // booking_rejected → BookingPendingScreen (or Bookings).
    if (
      type === 'booking_accepted' ||
      (type.includes('accept') && type.includes('booking'))
    ) {
      navigationRef.navigate('MyTabs' as never, {
        screen: 'Bookings',
      } as never);
      return;
    }

    if (
      type === 'booking_request' ||
      screen === 'Request' ||
      screen === 'TutorRequests'
    ) {
      navigationRef.navigate('MyTabs' as never, {
        screen: 'Request',
      } as never);
      return;
    }

    if (
      type === 'booking_rejected' ||
      screen === 'BookingPendingScreen'
    ) {
      if (bookingId) {
        navigationRef.navigate('HomeNavigator' as never, {
          screen: 'BookingPendingScreen',
          params: { bookingId },
        } as never);
      } else {
        navigationRef.navigate('MyTabs' as never, {
          screen: 'Bookings',
        } as never);
      }
      return;
    }

    if (screen === 'StudentNotificationInboxScreen' || type === 'general') {
      navigationRef.navigate('HomeNavigator' as never, {
        screen: 'StudentNotificationInboxScreen',
      } as never);
      return;
    }

    if (screen === 'BookingPendingScreen' && bookingId) {
      navigationRef.navigate('HomeNavigator' as never, {
        screen: 'BookingPendingScreen',
        params: { bookingId },
      } as never);
      return;
    }

    if (screen === 'BookingReviewScreen' && bookingId) {
      navigationRef.navigate('HomeNavigator' as never, {
        screen: 'BookingReviewScreen',
        params: { bookingId },
      } as never);
      return;
    }

    const summaryId = data.summaryId;
    // Backend contract uses ai_summary*; also accept common aliases.
    const isTutorSummaryNotif =
      type === 'ai_summary_review' ||
      type === 'ai_summary_failed' ||
      screen === 'TutorSummaryReviewScreen';
    const isStudentSummaryNotif =
      type === 'ai_summary' ||
      type === 'summary_ready' ||
      screen === 'StudentSummaryDetailScreen' ||
      screen === 'StudentSummariesScreen';

    if (isTutorSummaryNotif) {
      navigationRef.navigate('HomeNavigator' as never, {
        screen: 'TutorSummaryReviewScreen',
        params: {
          summaryId,
          sessionId: data.sessionId,
        },
      } as never);
      return;
    }

    if (isStudentSummaryNotif) {
      if (summaryId) {
        navigationRef.navigate('HomeNavigator' as never, {
          screen: 'StudentSummaryDetailScreen',
          params: { summaryId },
        } as never);
      } else {
        navigationRef.navigate('HomeNavigator' as never, {
          screen: 'StudentSummariesScreen',
        } as never);
      }
      return;
    }

    if (screen) {
      if (
        [
          'Messages',
          'Bookings',
          'Home',
          'Profile',
          'Search',
          'Request',
          'Schedule',
        ].includes(screen)
      ) {
        navigationRef.navigate('MyTabs' as never, { screen } as never);
        return;
      }
      navigationRef.navigate('HomeNavigator' as never, {
        screen,
        params: bookingId ? { bookingId, id: bookingId } : undefined,
      } as never);
      return;
    }

    switch (type) {
      case 'chat':
      case 'message':
      case 'new_message':
        navigationRef.navigate('MyTabs' as never, {
          screen: 'Messages',
        } as never);
        break;
      case 'booking':
      case 'session':
      case 'reminder':
        navigationRef.navigate('MyTabs' as never, {
          screen: 'Bookings',
        } as never);
        break;
      case 'payment':
        navigationRef.navigate('HomeNavigator' as never, {
          screen: 'WalletScreen',
        } as never);
        break;
      case 'schedule':
        navigationRef.navigate('MyTabs' as never, {
          screen: 'Schedule',
        } as never);
        break;
      case 'verification':
        navigationRef.navigate('MyTabs' as never, {
          screen: 'Request',
        } as never);
        break;
      case 'certificate':
        navigationRef.navigate('HomeNavigator' as never, {
          screen: 'StudentCertificatesScreen',
        } as never);
        break;
      default:
        navigationRef.navigate('HomeNavigator' as never, {
          screen: 'StudentNotificationInboxScreen',
        } as never);
        break;
    }
  } catch (error) {
    console.warn(LOG, 'navigation from notification failed', error);
  }
};

const ingestRemoteMessage = async (
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  options?: { showSystemTray?: boolean }
) => {
  const session = await getAuthSession();
  const recipientUserId = getUserId(session?.user as any);
  const appNotification = parseRemoteToAppNotification(
    remoteMessage,
    'push',
    recipientUserId
  );
  await presentNotification(appNotification, options);
  return appNotification;
};

/** True when FCM included a visible `notification` block (OS will tray it in bg/quit). */
const hasFcmNotificationPayload = (
  remoteMessage: FirebaseMessagingTypes.RemoteMessage
): boolean => {
  const n = remoteMessage.notification;
  return Boolean(n && (n.title || n.body));
};

/** Local QA: inbox + real system tray notification. */
export const sendTestSystemNotification = async () => {
  const now = new Date().toISOString();
  const session = await getAuthSession();
  const recipientUserId = getUserId(session?.user as any) || undefined;
  const samples = [
    {
      title: 'New booking request',
      body: 'A tutor is available for your preferred time slot.',
      type: 'booking',
      data: { type: 'booking', screen: 'Bookings', relatedId: 'demo-booking' },
    },
    {
      title: 'New chat message',
      body: 'You have a new message waiting in TutorLink.',
      type: 'chat',
      data: { type: 'chat', screen: 'Messages' },
    },
    {
      title: 'Payment update',
      body: 'Your wallet balance was updated successfully.',
      type: 'payment',
      data: { type: 'payment', screen: 'WalletScreen' },
    },
  ];
  const sample = samples[Math.floor(Date.now() / 1000) % samples.length];

  return presentNotification(
    {
      id: `test-${Date.now()}`,
      title: sample.title,
      body: sample.body,
      type: sample.type,
      createdAt: now,
      read: false,
      recipientUserId: recipientUserId ? String(recipientUserId) : undefined,
      data: {
        ...sample.data,
        createdAt: now,
        recipientUserId: recipientUserId ? String(recipientUserId) : '',
      },
      source: 'test',
    },
    { showSystemTray: true }
  );
};

let listenersReady = false;

const handleNotifeePress = (data?: Record<string, string> | null) => {
  if (!data) return;
  void upsertNotification({
    ...parseRemoteToAppNotification(
      { data, notification: { title: data.title, body: data.body } },
      'push'
    ),
    read: true,
  });
  handleNotificationNavigation(data as PushNotificationData);
};

export const initPushListeners = () => {
  if (listenersReady) return () => undefined;
  listenersReady = true;

  void ensureAndroidNotificationChannel();

  // Foreground FCM → inbox + Notifee system tray (FCM does not auto-display when open)
  const unsubOnMessage = messaging().onMessage(async remoteMessage => {
    console.log(LOG, 'foreground message', remoteMessage.messageId);
    await ingestRemoteMessage(remoteMessage, { showSystemTray: true });
  });

  const unsubOpened = messaging().onNotificationOpenedApp(remoteMessage => {
    console.log(LOG, 'opened from background (FCM)', remoteMessage.messageId);
    const parsed = parseRemoteToAppNotification(remoteMessage, 'push');
    void upsertNotification({ ...parsed, read: true });
    handleNotificationNavigation(remoteMessage.data as PushNotificationData);
  });

  const unsubTokenRefresh = messaging().onTokenRefresh(async token => {
    console.log(LOG, 'token refresh');
    await storeToken(token);
    const session = await getAuthSession();
    if (!session?.token) return;
    try {
      await registerDeviceTokenAPI({
        token,
        platform: Platform.OS === 'ios' ? 'ios' : 'android',
        role:
          session.role === 'tutor' ||
          session.role === 'student' ||
          session.role === 'parent'
            ? session.role
            : undefined,
      });
    } catch (error) {
      console.warn(LOG, 'token refresh register failed', error);
    }
  });

  // Notifee press while app is foreground / backgrounded-but-alive
  const unsubNotifeeFg = notifee.onForegroundEvent(({ type, detail }) => {
    if (type !== EventType.PRESS) return;
    console.log(LOG, 'opened from Notifee (foreground event)');
    handleNotifeePress(detail.notification?.data as Record<string, string>);
  });

  void messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (!remoteMessage) return;
      console.log(LOG, 'opened from quit (FCM)', remoteMessage.messageId);
      const parsed = parseRemoteToAppNotification(remoteMessage, 'push');
      void upsertNotification({ ...parsed, read: true });
      setTimeout(() => {
        handleNotificationNavigation(
          remoteMessage.data as PushNotificationData
        );
      }, 700);
    });

  // Cold start from a Notifee-displayed notification (foreground / data-only path)
  void notifee.getInitialNotification().then(initial => {
    if (!initial?.notification?.data) return;
    console.log(LOG, 'opened from quit (Notifee)');
    setTimeout(() => {
      handleNotifeePress(
        initial.notification?.data as Record<string, string>
      );
    }, 700);
  });

  return () => {
    unsubOnMessage();
    unsubOpened();
    unsubTokenRefresh();
    unsubNotifeeFg();
    listenersReady = false;
  };
};

/**
 * Must be registered in index.js before AppRegistry.
 * Background FCM: if payload has `notification`, OS shows the tray — only inbox here.
 * Data-only: show one Notifee system notification (no FCM duplicate).
 */
export const registerBackgroundMessageHandler = () => {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log(LOG, 'background message', remoteMessage.messageId);
    try {
      const osWillDisplay = hasFcmNotificationPayload(remoteMessage);
      await ingestRemoteMessage(remoteMessage, {
        // Avoid FCM tray + Notifee tray for the same message.
        showSystemTray: !osWillDisplay,
      });
    } catch (error) {
      console.warn(LOG, 'background ingest failed', error);
    }
  });
};

/**
 * Notifee background press — register once from index.js (before AppRegistry).
 */
export const registerNotifeeBackgroundEvents = () => {
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    if (type !== EventType.PRESS) return;
    console.log(LOG, 'Notifee background press');
    const data = detail.notification?.data as Record<string, string> | undefined;
    if (!data) return;
    // Navigation runs when JS UI is up; persist read state here.
    try {
      const parsed = parseRemoteToAppNotification(
        { data, notification: { title: data.title, body: data.body } },
        'push'
      );
      await upsertNotification({ ...parsed, read: true });
    } catch (error) {
      console.warn(LOG, 'Notifee background press ingest failed', error);
    }
  });
};
