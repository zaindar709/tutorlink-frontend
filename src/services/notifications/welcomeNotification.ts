import { InteractionManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserId } from '../../utils/api/userId';
import type { ApiUser } from '../../types/api.types';
import {
  ensureAndroidNotificationChannel,
  presentNotification,
  requestPushPermission,
} from './pushNotificationService';

const LOG = '[Welcome]';
const INSTALL_KEY = '@TutorLink:welcomeInstallSent';
const signupKey = (userId: string) =>
  `@TutorLink:welcomeSignupSent_${userId}`;

type WelcomeKind = 'install' | 'signup';

const firstName = (name?: string | null) => {
  const raw = String(name || '').trim();
  if (!raw) return '';
  return raw.split(/\s+/)[0] || '';
};

const claimOnce = async (key: string): Promise<boolean> => {
  try {
    const existing = await AsyncStorage.getItem(key);
    if (existing === 'true' || existing === '1') return false;
    await AsyncStorage.setItem(key, 'true');
    return true;
  } catch {
    return false;
  }
};

const copyFor = (
  kind: WelcomeKind,
  options?: { name?: string | null; role?: string | null }
) => {
  if (kind === 'install') {
    return {
      title: 'Welcome to TutorLink',
      body: 'Thanks for installing. Create an account to find tutors and start learning.',
    };
  }

  const name = firstName(options?.name);
  const role = String(options?.role || '').toLowerCase();
  const greeting = name ? `Hi ${name}!` : 'Hi!';

  if (role === 'tutor') {
    return {
      title: 'Welcome to TutorLink',
      body: `${greeting} Your tutor account is ready. Finish your profile so students can find you.`,
    };
  }

  return {
    title: 'Welcome to TutorLink',
    body: `${greeting} Your account is ready. Complete your profile to get started.`,
  };
};

const sendWelcome = async (
  kind: WelcomeKind,
  options?: {
    name?: string | null;
    role?: string | null;
    userId?: string | null;
  }
): Promise<void> => {
  try {
    await ensureAndroidNotificationChannel();
    await requestPushPermission();

    const now = new Date().toISOString();
    const copy = copyFor(kind, options);
    const userId = options?.userId ? String(options.userId) : '';

    await presentNotification(
      {
        id: `${kind}-welcome-${userId || 'device'}`,
        title: copy.title,
        body: copy.body,
        type: 'welcome',
        createdAt: now,
        read: false,
        recipientUserId: userId || undefined,
        data: {
          type: 'welcome',
          kind,
          screen: 'Home',
          createdAt: now,
          recipientUserId: userId,
        },
        source: 'local',
      },
      { showSystemTray: true }
    );
    console.log(LOG, 'sent', kind, userId || 'device');
  } catch (error) {
    console.warn(LOG, 'send failed', kind, error);
  }
};

const schedule = (task: () => Promise<void>, delayMs: number) => {
  InteractionManager.runAfterInteractions(() => {
    setTimeout(() => {
      void task();
    }, delayMs);
  });
};

/** Once per device, after the first-run intro. */
export const scheduleFirstInstallWelcome = (delayMs = 1600): void => {
  schedule(async () => {
    const claimed = await claimOnce(INSTALL_KEY);
    if (!claimed) return;
    await sendWelcome('install');
  }, delayMs);
};

/** Once per new account after email or Google signup. */
export const scheduleSignupWelcome = (
  user?: ApiUser | null,
  role?: string | null,
  delayMs = 2400
): void => {
  const userId = getUserId(user) || String(user?.userId || '').trim() || null;
  if (!userId) return;

  schedule(async () => {
    const claimed = await claimOnce(signupKey(userId));
    if (!claimed) return;
    await sendWelcome('signup', {
      name: String(user?.name || user?.fullName || ''),
      role,
      userId,
    });
  }, delayMs);
};
