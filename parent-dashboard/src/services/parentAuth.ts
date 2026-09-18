import { loginParentApi, registerParentApi, type AuthUser } from '../api/parent.api';
import { ParentApiError, getApiErrorMessage } from '../api/client';
import {
  firebaseSignIn,
  firebaseSignUp,
  firebaseUpdatePassword,
} from './firebaseParentAuth';
import { clearParentSession, getValidIdToken, readParentSession } from './sessionStore';

const extractUser = (payload: unknown): AuthUser | null => {
  if (!payload || typeof payload !== 'object') return null;
  const root = payload as Record<string, unknown>;
  if (root.user && typeof root.user === 'object') {
    return root.user as AuthUser;
  }
  if (root.email || root._id || root.id || root.role) {
    return root as AuthUser;
  }
  return null;
};

const assertParentRole = (user: AuthUser | null) => {
  const role = String(user?.role || '').toLowerCase();
  if (role && role !== 'parent') {
    clearParentSession();
    throw new Error(
      `This email is registered as a ${role}. Use the ${role} app, or sign up with a different email for a parent account.`
    );
  }
};

export const signInParent = async (email: string, password: string) => {
  const session = await firebaseSignIn(email.trim().toLowerCase(), password);
  const payload = await loginParentApi(
    session.idToken,
    session.email,
    session.localId
  );
  const user = extractUser(payload);
  assertParentRole(user);
  return { session, user };
};

export const registerParent = async (opts: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}) => {
  const email = opts.email.trim().toLowerCase();
  const session = await firebaseSignUp(email, opts.password);
  try {
    const payload = await registerParentApi(session.idToken, {
      name: opts.name.trim(),
      email,
      firebaseUid: session.localId,
      phoneNumber: opts.phone?.trim() || undefined,
    });
    const user = extractUser(payload);
    assertParentRole(user);
    return { session, user };
  } catch (error) {
    const already =
      error instanceof ParentApiError &&
      (error.status === 409 || /already|exist/i.test(error.message));
    if (!already) throw error;
    const payload = await loginParentApi(
      session.idToken,
      email,
      session.localId
    );
    const user = extractUser(payload);
    assertParentRole(user);
    return { session, user };
  }
};

export const signOutParent = () => {
  clearParentSession();
};

export const changeParentPassword = async (newPassword: string) => {
  const token = await getValidIdToken();
  if (!token) throw new Error('Please sign in again.');
  await firebaseUpdatePassword(token, newPassword);
};

export const hasParentSession = () => Boolean(readParentSession());

export { getApiErrorMessage };
