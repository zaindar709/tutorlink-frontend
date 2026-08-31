import {
  confirmPasswordReset,
  getAuth,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
} from '@react-native-firebase/auth';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { withTimeout } from '../../utils/async/withTimeout';

const auth = getAuth();
const LOG = '[PasswordReset]';
const CONTEXT_KEY = '@TutorLink:passwordResetContext';
const PENDING_LINK_KEY = '@TutorLink:pendingPasswordResetLink';
const FIREBASE_TIMEOUT_MS = 20_000;

/** Firebase Hosting default domains (no Dynamic Links). */
export const FIREBASE_AUTH_HOSTING_DOMAIN = 'tutor-link-62ed9.firebaseapp.com';
export const FIREBASE_AUTH_WEB_APP_DOMAIN = 'tutor-link-62ed9.web.app';

/**
 * Custom Hosting handler that deep-links into the app New Password screen.
 * Also set this same URL as the Password reset "Customize action URL" in
 * Firebase Console → Authentication → Templates.
 */
export const PASSWORD_RESET_CONTINUE_URL = `https://${FIREBASE_AUTH_WEB_APP_DOMAIN}/auth/action`;

/** Android applicationId / package from android/app/build.gradle */
export const ANDROID_PACKAGE_NAME = 'com.tutorlink';

/** Custom scheme used by Hosting handler → app (AndroidManifest intent-filter). */
export const PASSWORD_RESET_APP_SCHEME = 'tutorlink://reset-password';

export type PasswordResetRole = 'student' | 'tutor' | 'parent';

export type PasswordResetContext = {
  email: string;
  role: PasswordResetRole;
  sentAt: string;
};

export const savePasswordResetContext = async (
  context: Omit<PasswordResetContext, 'sentAt'>
): Promise<void> => {
  const payload: PasswordResetContext = {
    ...context,
    sentAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(CONTEXT_KEY, JSON.stringify(payload));
};

export const loadPasswordResetContext =
  async (): Promise<PasswordResetContext | null> => {
    try {
      const raw = await AsyncStorage.getItem(CONTEXT_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as PasswordResetContext;
    } catch {
      return null;
    }
  };

export const clearPasswordResetContext = async (): Promise<void> => {
  await AsyncStorage.removeItem(CONTEXT_KEY);
};

export type PendingPasswordReset = {
  oobCode: string;
  mode: string;
  email?: string;
  role?: PasswordResetRole;
  savedAt: string;
};

/** Persist reset params so Splash / cold start can open NewPasswordScreen. */
export const savePendingPasswordReset = async (
  pending: Omit<PendingPasswordReset, 'savedAt'>
): Promise<void> => {
  const payload: PendingPasswordReset = {
    ...pending,
    savedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(PENDING_LINK_KEY, JSON.stringify(payload));
};

export const loadPendingPasswordReset =
  async (): Promise<PendingPasswordReset | null> => {
    try {
      const raw = await AsyncStorage.getItem(PENDING_LINK_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as PendingPasswordReset;
    } catch {
      return null;
    }
  };

export const clearPendingPasswordReset = async (): Promise<void> => {
  await AsyncStorage.removeItem(PENDING_LINK_KEY);
};

export const mapPasswordResetError = (error: unknown): string => {
  const code = String((error as { code?: string })?.code || '');
  const message = String((error as { message?: string })?.message || '');

  switch (code) {
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/user-not-found':
      return 'No Firebase account found for this email.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    case 'auth/expired-action-code':
      return 'This reset link has expired. Request a new one.';
    case 'auth/invalid-action-code':
      return 'This reset link is invalid or already used. Request a new one.';
    case 'auth/weak-password':
      return 'Password is too weak. Use a stronger password.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Contact support.';
    case 'auth/unauthorized-continue-uri':
      return 'Continue URL domain is not authorized in Firebase Console.';
    case 'auth/invalid-continue-uri':
      return 'Continue URL is invalid. Check ActionCodeSettings.url.';
    case 'auth/missing-android-pkg-name':
      return 'Android package name is missing from ActionCodeSettings.';
    case 'auth/invalid-hosting-link-domain':
      return 'Hosting linkDomain is invalid. Default firebaseapp.com/web.app domains cannot be set as linkDomain — omit linkDomain or use a custom Hosting domain.';
    default:
      if (message) return message;
      return 'Could not reset password. Please try again.';
  }
};

/**
 * Current Firebase Hosting–based ActionCodeSettings.
 * Do NOT set linkDomain to *.firebaseapp.com / *.web.app — Firebase rejects
 * those with auth/invalid-hosting-link-domain. linkDomain is only for a
 * custom Hosting domain. Omit it so Firebase uses the project default.
 * Do NOT set deprecated dynamicLinkDomain.
 */
export const buildPasswordResetActionCodeSettings =
  (): FirebaseAuthTypes.ActionCodeSettings => ({
    url: PASSWORD_RESET_CONTINUE_URL,
    handleCodeInApp: true,
    android: {
      packageName: ANDROID_PACKAGE_NAME,
      installApp: true,
      minimumVersion: '1',
    },
  });

/**
 * Send Firebase password-reset email link (Forgot Password flow).
 * Uses Firebase Hosting domain + handleCodeInApp (not Dynamic Links).
 */
export const sendPasswordResetLink = async (email: string): Promise<void> => {
  const trimmed = email.trim().toLowerCase();
  const actionCodeSettings = buildPasswordResetActionCodeSettings();

  // TEMP DEBUG — remove after App Links / reset-URL investigation
  console.log(LOG, 'TEMP sendPasswordResetEmail diagnostics', {
    email: trimmed,
    'ActionCodeSettings.url': actionCodeSettings.url,
    handleCodeInApp: actionCodeSettings.handleCodeInApp,
    linkDomain: actionCodeSettings.linkDomain ?? null,
    'android.packageName': actionCodeSettings.android?.packageName ?? null,
    hasDynamicLinkDomain: Boolean(
      (actionCodeSettings as { dynamicLinkDomain?: string }).dynamicLinkDomain
    ),
    PASSWORD_RESET_CONTINUE_URL,
  });

  try {
    await withTimeout(
      sendPasswordResetEmail(auth, trimmed, actionCodeSettings),
      FIREBASE_TIMEOUT_MS,
      'Password reset email'
    );
    console.log(LOG, 'Firebase request succeeded');
  } catch (error) {
    const code = String((error as { code?: string })?.code || 'unknown');
    const message = String((error as { message?: string })?.message || '');
    console.log(LOG, 'Firebase request failed');
    console.log(LOG, 'Firebase error code', code);
    console.log(LOG, 'Firebase error message', message);
    throw error;
  }
};

/** Validate oobCode from the email link; returns the account email. */
export const verifyPasswordResetOobCode = async (
  oobCode: string
): Promise<string> => {
  const email = await withTimeout(
    verifyPasswordResetCode(auth, oobCode),
    FIREBASE_TIMEOUT_MS,
    'Verify reset code'
  );
  return String(email || '');
};

/** Apply new password after the email link was opened (oobCode). */
export const confirmPasswordResetWithCode = async (
  oobCode: string,
  newPassword: string
): Promise<void> => {
  await withTimeout(
    confirmPasswordReset(auth, oobCode, newPassword),
    FIREBASE_TIMEOUT_MS,
    'Confirm password reset'
  );
  await clearPasswordResetContext();
  await clearPendingPasswordReset();
};

const safeDecode = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const extractParamsFromUrl = (
  url: string
): { mode: string; oobCode: string } | null => {
  try {
    const normalized = url.includes('://') ? url : `https://dummy${url}`;
    const parsed = new URL(normalized);
    const mode =
      parsed.searchParams.get('mode') ||
      parsed.searchParams.get('MODE') ||
      '';
    const oobCode =
      parsed.searchParams.get('oobCode') ||
      parsed.searchParams.get('oobcode') ||
      '';
    if (oobCode) {
      return { mode: mode || 'resetPassword', oobCode };
    }

    // Firebase /__/auth/links wraps the real action URL in ?link=
    const nested =
      parsed.searchParams.get('link') ||
      parsed.searchParams.get('continueUrl') ||
      parsed.searchParams.get('deep_link_id');
    if (nested) {
      // searchParams.get already decodes once; decode again if still encoded.
      const nestedUrl = nested.includes('%') ? safeDecode(nested) : nested;
      return extractParamsFromUrl(nestedUrl);
    }
  } catch {
    // fall through to regex
  }

  const codeMatch = String(url).match(/[?&]oobCode=([^&]+)/i);
  if (!codeMatch?.[1]) return null;
  const modeMatch = String(url).match(/[?&]mode=([^&]+)/i);
  return {
    mode: modeMatch?.[1] || 'resetPassword',
    oobCode: safeDecode(codeMatch[1]),
  };
};

/** Extract Firebase Auth action params from a deep/universal link URL. */
export const parsePasswordResetLink = (
  url: string | null | undefined
): { mode: string; oobCode: string } | null => {
  if (!url) return null;
  return extractParamsFromUrl(url);
};

export const isPasswordResetLink = (url: string | null | undefined): boolean => {
  if (!url) return false;
  const lower = url.toLowerCase();
  const looksLikeAuthLink =
    lower.includes('oobcode=') ||
    lower.includes('/__/auth/action') ||
    lower.includes('/__/auth/links') ||
    lower.includes('/auth/action') ||
    lower.startsWith('tutorlink://reset-password') ||
    lower.includes('mode=resetpassword');

  if (!looksLikeAuthLink) return false;

  const parsed = parsePasswordResetLink(url);
  if (!parsed?.oobCode) return false;
  const mode = parsed.mode.toLowerCase().replace(/_/g, '');
  // Firebase uses mode=resetPassword; also accept bare oobCode auth links.
  return !mode || mode === 'resetpassword' || mode.includes('reset');
};
