import { API_BASE_URL } from '../api/admin.api';
import { FIREBASE_API_KEY } from '../config/firebase';

type FirebaseSignInResponse = {
  idToken: string;
  email: string;
  localId: string;
  refreshToken: string;
};

type FirebaseErrorResponse = {
  error?: {
    message?: string;
  };
};

const firebaseAuthUrl = (action: 'signInWithPassword' | 'signUp') =>
  `https://identitytoolkit.googleapis.com/v1/accounts:${action}?key=${FIREBASE_API_KEY}`;

const parseFirebaseError = (json: FirebaseErrorResponse) =>
  (json.error?.message || 'Authentication failed').replace(/_/g, ' ');

export const signInAdminWithPassword = async (
  email: string,
  password: string
): Promise<FirebaseSignInResponse> => {
  const response = await fetch(firebaseAuthUrl('signInWithPassword'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      returnSecureToken: true,
    }),
  });

  const json = (await response.json()) as
    | FirebaseSignInResponse
    | FirebaseErrorResponse;

  if (!response.ok) {
    throw new Error(parseFirebaseError(json as FirebaseErrorResponse));
  }

  return json as FirebaseSignInResponse;
};

export type AdminSetupResult = FirebaseSignInResponse & {
  backendRegistered: boolean;
  backendMessage: string;
};

/**
 * One-time setup: creates Firebase user + registers admin profile on backend.
 * If backend rejects role "admin", update MongoDB manually (message included).
 */
export const registerAdminAccount = async (
  email: string,
  password: string,
  name: string
): Promise<AdminSetupResult> => {
  const response = await fetch(firebaseAuthUrl('signUp'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      returnSecureToken: true,
    }),
  });

  const json = (await response.json()) as
    | FirebaseSignInResponse
    | FirebaseErrorResponse;

  if (!response.ok) {
    throw new Error(parseFirebaseError(json as FirebaseErrorResponse));
  }

  const session = json as FirebaseSignInResponse;

  let backendRegistered = false;
  let backendMessage =
    'Firebase account created. Ask your backend dev to set role: admin in the database for this email, then sign in.';

  try {
    const registerRes = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.idToken}`,
      },
      body: JSON.stringify({
        firebaseUid: session.localId,
        name,
        email,
        role: 'admin',
      }),
    });

    const registerJson = await registerRes.json().catch(() => ({}));

    if (registerRes.ok) {
      backendRegistered = true;
      backendMessage =
        'Admin account created. You can now sign in and approve tutors.';
    } else if (registerRes.status === 400) {
      const loginRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.idToken}`,
        },
        body: JSON.stringify({
          email,
          firebaseUid: session.localId,
        }),
      });

      if (loginRes.ok) {
        backendMessage =
          'Firebase account exists. If sign-in shows Forbidden, set role: admin in MongoDB for this email.';
      } else {
        backendMessage =
          registerJson?.message ||
          'Firebase OK — backend profile may need role: admin set manually in MongoDB.';
      }
    } else {
      backendMessage =
        registerJson?.message ||
        `Backend register failed (${registerRes.status}). Set role: admin in MongoDB for ${email}.`;
    }
  } catch {
    backendMessage =
      'Firebase account created but backend is unreachable. Set role: admin in MongoDB, then sign in.';
  }

  return {
    ...session,
    backendRegistered,
    backendMessage,
  };
};
