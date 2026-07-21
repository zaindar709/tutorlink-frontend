import { Platform } from 'react-native';
import { API_BASE_URL } from '../../config/api';
import {
  getFirebaseIdToken,
  getCurrentFirebaseUser,
} from '../../services/auth/firebaseAuthService';
import { getToken, saveToken } from '../../services/storage';
import { store } from '../../store/store';

const LOG = '[TutorUpload]';

/** Must match android/app/google-services.json → project_id */
export const FRONTEND_FIREBASE_PROJECT_ID = 'tutor-link-62ed9';

export const maskToken = (token?: string | null) => {
  if (!token) return 'MISSING';
  if (token.length < 16) return `${token.length} chars`;
  return `${token.slice(0, 10)}...${token.slice(-8)} (${token.length} chars)`;
};

/** Decode Firebase JWT payload (no verify) to inspect project claims. */
export const decodeFirebaseTokenClaims = (
  token?: string | null
): {
  projectId?: string;
  userId?: string;
  email?: string;
  iss?: string;
  aud?: string;
  exp?: number;
} | null => {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    // atob is available in RN Hermes / JSC
    const json = JSON.parse(globalThis.atob(padded));
    const iss: string = json.iss || '';
    const projectFromIss = iss.includes('/')
      ? iss.split('/').pop()
      : undefined;
    return {
      projectId: json.aud || projectFromIss,
      userId: json.user_id || json.sub,
      email: json.email,
      iss: json.iss,
      aud: json.aud,
      exp: json.exp,
    };
  } catch (error) {
    console.warn(LOG, 'failed to decode token claims', error);
    return null;
  }
};

export const getFirebaseMismatchMessage = (status?: number) => {
  if (status !== 401) return null;
  return (
    `Authentication failed (401).\n\n` +
    `Frontend Firebase project: ${FRONTEND_FIREBASE_PROJECT_ID}\n\n` +
    `Backend is verifying tokens with a DIFFERENT Firebase account/project. ` +
    `Update backend Render env (FIREBASE_PROJECT_ID / CLIENT_EMAIL / PRIVATE_KEY) ` +
    `to the service account from "${FRONTEND_FIREBASE_PROJECT_ID}", then redeploy.`
  );
};

export const resolveUploadAuthToken = async (): Promise<string | null> => {
  const firebaseUser = getCurrentFirebaseUser();
  console.log(LOG, 'auth state', {
    hasFirebaseUser: !!firebaseUser,
    uid: firebaseUser?.uid ?? null,
    email: firebaseUser?.email ?? null,
    reduxToken: maskToken(store.getState().auth.token),
    expectedProject: FRONTEND_FIREBASE_PROJECT_ID,
  });

  if (firebaseUser) {
    try {
      const fresh = await getFirebaseIdToken(true, firebaseUser);
      await saveToken(fresh);
      const claims = decodeFirebaseTokenClaims(fresh);
      console.log(LOG, 'fresh Firebase token', {
        masked: maskToken(fresh),
        claims,
        projectMatch: claims?.projectId === FRONTEND_FIREBASE_PROJECT_ID,
      });
      return fresh;
    } catch (error) {
      console.warn(LOG, 'getFirebaseIdToken failed', error);
    }
  }

  const stored = await getToken();
  console.log(LOG, 'stored token fallback', {
    masked: maskToken(stored),
    claims: decodeFirebaseTokenClaims(stored),
  });
  if (stored) return stored;

  const reduxToken = store.getState().auth.token;
  console.log(LOG, 'redux token fallback', {
    masked: maskToken(reduxToken),
    claims: decodeFirebaseTokenClaims(reduxToken),
  });
  return reduxToken;
};

export const isFormDataLike = (data: unknown): data is FormData => {
  if (!data) return false;
  if (typeof FormData !== 'undefined' && data instanceof FormData) return true;
  return (
    typeof data === 'object' &&
    (data as { constructor?: { name?: string } }).constructor?.name ===
      'FormData'
  );
};

export const postMultipart = async <T>(
  path: string,
  formData: FormData,
  token: string | null
): Promise<T> => {
  const url = `${API_BASE_URL}${path}`;
  const claims = decodeFirebaseTokenClaims(token);

  console.log(LOG, 'POST multipart', {
    url,
    platform: Platform.OS,
    hasAuthHeader: !!token,
    token: maskToken(token),
    tokenProjectId: claims?.projectId,
    expectedProjectId: FRONTEND_FIREBASE_PROJECT_ID,
  });

  if (
    claims?.projectId &&
    claims.projectId !== FRONTEND_FIREBASE_PROJECT_ID
  ) {
    console.error(
      LOG,
      'Token project does not match google-services.json — unexpected'
    );
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      Accept: 'application/json',
      // Do NOT set Content-Type — RN sets multipart boundary automatically.
    },
    body: formData,
  });

  const rawText = await response.text();
  let json: any = null;
  try {
    json = rawText ? JSON.parse(rawText) : null;
  } catch {
    console.warn(LOG, 'response is not JSON', rawText?.slice(0, 300));
  }

  console.log(LOG, 'multipart response', {
    status: response.status,
    ok: response.ok,
    body: json ?? rawText?.slice(0, 300),
  });

  if (!response.ok) {
    if (response.status === 401) {
      console.error(LOG, '401 UNAUTHORIZED on document upload', {
        tokenProjectId: claims?.projectId,
        expectedProjectId: FRONTEND_FIREBASE_PROJECT_ID,
      });
    }

    const backendMessage = json?.message || json?.error;
    const mismatchMessage =
      response.status === 401 && !backendMessage
        ? getFirebaseMismatchMessage(response.status)
        : null;
    const message =
      backendMessage ||
      mismatchMessage ||
      `Upload failed with status ${response.status}`;
    const error: any = new Error(message);
    error.response = {
      status: response.status,
      data: json ?? { message },
    };
    error.isAxiosError = false;
    error.code = response.status === 401 ? 'FIREBASE_PROJECT_MISMATCH' : undefined;
    throw error;
  }

  return json as T;
};
