import { API_BASE_URL } from '../api/admin.api';
import {
  assertAllowedAdminCredentials,
} from '../config/adminCredentials';
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

const firebaseAuthUrl = () =>
  `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;

const parseFirebaseError = (json: FirebaseErrorResponse) =>
  (json.error?.message || 'Authentication failed').replace(/_/g, ' ');

export const verifyAdminRole = async (
  idToken: string,
  firebaseUid: string,
  email: string
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ email, firebaseUid }),
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      json?.message ||
        'Backend rejected login. Use the seeded admin account (role: admin).'
    );
  }

  const role =
    json?.data?.user?.role ?? json?.user?.role ?? json?.data?.role ?? '';

  if (role !== 'admin') {
    throw new Error('Access denied. This account does not have admin role.');
  }
};

export const signInAdminWithPassword = async (
  email: string,
  password: string
): Promise<FirebaseSignInResponse> => {
  assertAllowedAdminCredentials(email, password);

  const response = await fetch(firebaseAuthUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email.trim(),
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

  await verifyAdminRole(session.idToken, session.localId, email.trim());

  return session;
};
