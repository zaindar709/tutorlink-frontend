import { FIREBASE_API_KEY } from '../config/env';
import {
  saveParentSession,
  type ParentSession,
} from './sessionStore';

type FirebaseAuthResponse = {
  idToken: string;
  email: string;
  localId: string;
  refreshToken: string;
  expiresIn?: string;
};

type FirebaseErrorResponse = {
  error?: { message?: string };
};

const mapFirebaseError = (message?: string) => {
  const code = String(message || 'Authentication failed').replace(/_/g, ' ');
  if (code.includes('EMAIL EXISTS')) {
    return 'This email is already registered. Sign in instead.';
  }
  if (code.includes('EMAIL NOT FOUND') || code.includes('INVALID LOGIN')) {
    return 'Email or password is incorrect.';
  }
  if (code.includes('INVALID PASSWORD')) {
    return 'Email or password is incorrect.';
  }
  if (code.includes('WEAK PASSWORD')) {
    return 'Password should be at least 6 characters.';
  }
  if (code.includes('TOO MANY ATTEMPTS')) {
    return 'Too many attempts. Try again later.';
  }
  return code;
};

const firebasePost = async (
  path: string,
  body: Record<string, unknown>
): Promise<FirebaseAuthResponse> => {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/${path}?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );
  const json = (await response.json()) as
    | FirebaseAuthResponse
    | FirebaseErrorResponse;
  if (!response.ok) {
    throw new Error(mapFirebaseError((json as FirebaseErrorResponse).error?.message));
  }
  return json as FirebaseAuthResponse;
};

const toSession = (raw: FirebaseAuthResponse): ParentSession => ({
  idToken: raw.idToken,
  refreshToken: raw.refreshToken,
  localId: raw.localId,
  email: raw.email,
  expiresAt: Date.now() + Number(raw.expiresIn || 3600) * 1000,
});

export const firebaseSignIn = async (email: string, password: string) => {
  const raw = await firebasePost('accounts:signInWithPassword', {
    email,
    password,
    returnSecureToken: true,
  });
  const session = toSession(raw);
  saveParentSession(session);
  return session;
};

export const firebaseSignUp = async (email: string, password: string) => {
  const raw = await firebasePost('accounts:signUp', {
    email,
    password,
    returnSecureToken: true,
  });
  const session = toSession(raw);
  saveParentSession(session);
  return session;
};

export const firebaseUpdatePassword = async (
  idToken: string,
  password: string
) => {
  const raw = await firebasePost('accounts:update', {
    idToken,
    password,
    returnSecureToken: true,
  });
  const session = toSession(raw);
  saveParentSession(session);
  return session;
};
