import { NativeModules, Platform } from 'react-native';

/**
 * Resolve the machine that serves Metro so we can reach admin-dashboard on :5174.
 * - Emulator often needs 10.0.2.2
 * - Physical device needs the PC LAN IP (from Metro scriptURL)
 */
const getDevHostCandidates = (): string[] => {
  const hosts: string[] = [];

  try {
    const scriptURL = String(
      (NativeModules as { SourceCode?: { scriptURL?: string } })?.SourceCode
        ?.scriptURL || ''
    );
    const match = scriptURL.match(/https?:\/\/([^/:]+)(?::\d+)?/);
    const fromMetro = match?.[1]?.trim();
    if (fromMetro) {
      hosts.push(fromMetro);
      // Emulator sometimes reports 10.0.2.2 already; also try localhost aliases.
      if (fromMetro === '10.0.2.2' || fromMetro === 'localhost' || fromMetro === '127.0.0.1') {
        hosts.push('10.0.2.2', 'localhost', '127.0.0.1');
      }
    }
  } catch {
    // ignore
  }

  if (Platform.OS === 'android') {
    // Prefer localhost first — works with `adb reverse tcp:5174 tcp:5174` (USB).
    hosts.unshift('127.0.0.1', 'localhost', '10.0.2.2');
  } else {
    hosts.push('localhost', '127.0.0.1');
  }

  // De-dupe preserve order
  return [...new Set(hosts.filter(Boolean))];
};

export const getAdminLiveRatingUrls = (): string[] => {
  if (!__DEV__) {
    return ['https://tutor-link-62ed9.web.app/api/live-ratings'];
  }
  return getDevHostCandidates().map(host => `http://${host}:5174/api/live-ratings`);
};

export type LiveTutorRatingPayload = {
  id: string;
  bookingId: string;
  tutorId: string;
  tutorName: string;
  studentId?: string;
  studentName?: string;
  subject?: string;
  rating: number;
  liked: boolean;
  review?: string;
  ratedAt: string;
};

const postOnce = async (
  url: string,
  entry: LiveTutorRatingPayload
): Promise<boolean> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3500);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(entry),
      signal: controller.signal,
    });
    if (__DEV__) {
      console.log('[ratings] POST', url, res.status);
    }
    return res.ok;
  } finally {
    clearTimeout(timer);
  }
};

/**
 * Push rating to admin Vite server (localhost:5174).
 * Tries Metro host + emulator aliases until one succeeds.
 */
export const publishLiveRatingToAdmin = async (
  entry: LiveTutorRatingPayload
): Promise<boolean> => {
  const urls = getAdminLiveRatingUrls();
  if (__DEV__) {
    console.log('[ratings] sync targets', urls);
  }

  for (const url of urls) {
    try {
      const ok = await postOnce(url, entry);
      if (ok) {
        if (__DEV__) {
          console.log('[ratings] synced to admin via', url);
        }
        return true;
      }
    } catch (err) {
      if (__DEV__) {
        console.warn('[ratings] failed', url, err);
      }
    }
  }

  if (__DEV__) {
    console.warn(
      '[ratings] Could not reach admin dashboard. Run: cd admin-dashboard && npm run dev (port 5174). For a physical phone, PC + phone must be on same Wi‑Fi.'
    );
  }
  return false;
};
