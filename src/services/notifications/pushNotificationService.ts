import { Platform, PermissionsAndroid, Alert } from 'react-native';
import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  registerDeviceTokenAPI,
  unregisterDeviceTokenAPI,
} from '../../api/notifications.api';
import { navigationRef } from '../../navigation/navigationRef';
import { getAuthSession } from '../storage';

const LOG = '[Push]';
const TOKEN_KEY = '@TutorLink:fcmDeviceToken';

export type PushNotificationData = Record<string, string | undefined>;

const getStoredToken = async () => AsyncStorage.getItem(TOKEN_KEY);

const storeToken = async (token: string) =>
  AsyncStorage.setItem(TOKEN_KEY, token);

const clearStoredToken = async () => AsyncStorage.removeItem(TOKEN_KEY);

export const requestPushPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (result !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log(LOG, 'POST_NOTIFICATIONS denied');
        return false;
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
    // iOS needs registration before token
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
      role: role === 'tutor' || role === 'parent' || role === 'student' ? role : undefined,
    });
    await storeToken(token);
    console.log(LOG, 'device token registered', token.slice(0, 12) + '…');
    return token;
  } catch (error) {
    // Backend may not have endpoint yet — still keep local token for retries
    await storeToken(token);
    console.warn(LOG, 'registerDeviceTokenAPI failed (token kept locally)', error);
    return token;
  }
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

export const handleNotificationNavigation = (
  data?: PushNotificationData | null
) => {
  if (!data || !navigationRef.isReady()) return;

  const type = String(data.type || data.notificationType || '').toLowerCase();
  const screen = String(data.screen || '');
  const chatId = data.chatId || data.conversationId;

  try {
    if (screen === 'ChatScreen' || ((type === 'chat' || type === 'message') && chatId)) {
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

    if (screen) {
      // Prefer nested MyTabs / HomeNavigator screens when provided
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
      } as never);
      return;
    }

    switch (type) {
      case 'chat':
      case 'message':
        navigationRef.navigate('MyTabs' as never, {
          screen: 'Messages',
        } as never);
        break;
      case 'booking':
      case 'session':
        navigationRef.navigate('MyTabs' as never, {
          screen: 'Bookings',
        } as never);
        break;
      case 'verification':
      case 'request':
        navigationRef.navigate('MyTabs' as never, {
          screen: 'Request',
        } as never);
        break;
      case 'schedule':
        navigationRef.navigate('MyTabs' as never, {
          screen: 'Schedule',
        } as never);
        break;
      case 'certificate':
        navigationRef.navigate('HomeNavigator' as never, {
          screen: 'StudentCertificatesScreen',
        } as never);
        break;
      default:
        break;
    }
  } catch (error) {
    console.warn(LOG, 'navigation from notification failed', error);
  }
};

export const showForegroundAlert = (
  remoteMessage: FirebaseMessagingTypes.RemoteMessage
) => {
  const title =
    remoteMessage.notification?.title ||
    remoteMessage.data?.title ||
    'TutorLink';
  const body =
    remoteMessage.notification?.body ||
    remoteMessage.data?.body ||
    'You have a new notification';

  Alert.alert(String(title), String(body), [
    { text: 'Dismiss', style: 'cancel' },
    {
      text: 'Open',
      onPress: () =>
        handleNotificationNavigation(
          remoteMessage.data as PushNotificationData
        ),
    },
  ]);
};

/**
 * Call once after app mounts (when user may be logged in).
 * Safe to call multiple times — listeners are idempotent via module flag.
 */
let listenersReady = false;

export const initPushListeners = () => {
  if (listenersReady) return () => undefined;
  listenersReady = true;

  const unsubOnMessage = messaging().onMessage(async remoteMessage => {
    console.log(LOG, 'foreground message', remoteMessage.messageId);
    showForegroundAlert(remoteMessage);
  });

  const unsubOpened = messaging().onNotificationOpenedApp(remoteMessage => {
    console.log(LOG, 'opened from background', remoteMessage.messageId);
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

  // App opened from quit state by tapping notification
  void messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (!remoteMessage) return;
      console.log(LOG, 'opened from quit', remoteMessage.messageId);
      setTimeout(() => {
        handleNotificationNavigation(
          remoteMessage.data as PushNotificationData
        );
      }, 600);
    });

  return () => {
    unsubOnMessage();
    unsubOpened();
    unsubTokenRefresh();
    listenersReady = false;
  };
};

/** Must be registered at JS entry (index.js) — outside React tree. */
export const registerBackgroundMessageHandler = () => {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log(LOG, 'background message', remoteMessage.messageId);
  });
};
