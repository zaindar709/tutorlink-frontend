import { Linking, Platform, Alert } from 'react-native';

/**
 * Parent auth + dashboard live on the web app (not in React Native).
 *
 * Dev defaults:
 * - Android emulator → host machine via 10.0.2.2
 * - iOS simulator → localhost
 * Physical device: set PARENT_DASHBOARD_DEV_URL to your PC LAN IP, e.g.
 *   http://192.168.1.12:5175
 *
 * Production: replace PARENT_DASHBOARD_PROD_URL when the parent web app is hosted.
 */
const PARENT_DASHBOARD_DEV_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:5175'
    : 'http://localhost:5175';

const PARENT_DASHBOARD_PROD_URL = 'https://tutor-link-62ed9.web.app';

export const PARENT_DASHBOARD_URL = __DEV__
  ? PARENT_DASHBOARD_DEV_URL
  : PARENT_DASHBOARD_PROD_URL;

/** Open the web Parent Dashboard in the system browser. */
export const openParentDashboard = async (opts?: {
  silent?: boolean;
}): Promise<boolean> => {
  const url = PARENT_DASHBOARD_URL;
  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      if (!opts?.silent) {
        Alert.alert(
          'Cannot open Parent Dashboard',
          `Unable to open:\n${url}\n\nMake sure the parent web app is running.`
        );
      }
      return false;
    }
    await Linking.openURL(url);
    return true;
  } catch {
    if (!opts?.silent) {
      Alert.alert(
        'Cannot open Parent Dashboard',
        `Failed to open:\n${url}\n\nStart parent-dashboard (port 5175) or check the URL.`
      );
    }
    return false;
  }
};

/** Deep link so parent web can show this student's name after entering the code. */
export const buildParentLinkShareUrl = (opts: {
  code: string;
  studentName: string;
}): string => {
  const url = new URL(PARENT_DASHBOARD_URL);
  // Keep packed codes intact (e.g. TL7K2M~Afifa) — do not uppercase the name part
  url.searchParams.set('code', opts.code.trim());
  url.searchParams.set('student', opts.studentName.trim());
  return url.toString();
};

export const parentDashboardShareHint = (opts?: {
  code?: string;
  studentName?: string;
}) => {
  const link =
    opts?.code && opts?.studentName
      ? buildParentLinkShareUrl({
          code: opts.code,
          studentName: opts.studentName,
        })
      : PARENT_DASHBOARD_URL;
  return [
    'Open the TutorLink Parent Dashboard on the web:',
    link,
    '',
    'Enter this code on the parent site to link your child (progress starts at 0%).',
  ].join('\n');
};