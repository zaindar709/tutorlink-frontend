import { FIREBASE_API_KEY, PARENT_TOKEN_KEY } from '../config/env';

export type ParentSession = {
  idToken: string;
  refreshToken: string;
  localId: string;
  email: string;
  expiresAt: number;
};

export const readParentSession = (): ParentSession | null => {
  try {
    const raw = localStorage.getItem(PARENT_TOKEN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ParentSession;
    if (!parsed?.idToken || !parsed?.refreshToken) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const saveParentSession = (session: ParentSession) => {
  localStorage.setItem(PARENT_TOKEN_KEY, JSON.stringify(session));
};

export const clearParentSession = () => {
  localStorage.removeItem(PARENT_TOKEN_KEY);
};

let refreshPromise: Promise<string | null> | null = null;

const refreshIdToken = async (session: ParentSession): Promise<string | null> => {
  const response = await fetch(
    `https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(
        session.refreshToken
      )}`,
    }
  );
  const json = (await response.json()) as {
    id_token?: string;
    refresh_token?: string;
    expires_in?: string;
    user_id?: string;
    error?: { message?: string };
  };
  if (!response.ok || !json.id_token) {
    clearParentSession();
    return null;
  }
  const next: ParentSession = {
    idToken: json.id_token,
    refreshToken: json.refresh_token || session.refreshToken,
    localId: json.user_id || session.localId,
    email: session.email,
    expiresAt: Date.now() + Number(json.expires_in || 3600) * 1000,
  };
  saveParentSession(next);
  return next.idToken;
};

export const getValidIdToken = async (forceRefresh = false): Promise<string | null> => {
  const session = readParentSession();
  if (!session) return null;

  const stillValid = session.expiresAt - Date.now() > 120_000;
  if (!forceRefresh && stillValid) return session.idToken;

  if (!refreshPromise) {
    refreshPromise = refreshIdToken(session).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};
