import {
  firebaseSignIn,
  firebaseSignUp,
  firebaseSignOut,
  getFirebaseIdToken,
  getCurrentFirebaseUser,
  deleteFirebaseUser,
} from './firebaseAuthService';
import {
  getProfileAPI,
  loginAPI,
  signupAPI,
  LoginPayload,
  SignupPayload,
} from '../../api/auth.api';
import {
  AuthSession,
  clearAuthSession,
  getAuthSession,
  saveAuthSession,
} from '../storage';

export type AuthRole = 'student' | 'tutor' | 'parent';

export interface AuthCredentials {
  email: string;
  password: string;
  role: AuthRole;
}

export interface AuthSignupData extends AuthCredentials {
  fullName: string;
  phone?: string;
  expertise?: string;
  subjects?: string[];
  selectedClass?: string;
}

export const loginWithEmail = async (
  credentials: AuthCredentials
): Promise<AuthSession> => {
  const firebaseUser = await firebaseSignIn(credentials.email, credentials.password);
  const idToken = await getFirebaseIdToken();

  const response = await loginAPI({
    email: credentials.email,
    firebaseUid: firebaseUser.uid,
    idToken,
    role: credentials.role,
  });

  const { user, token } = response.data;
  const sessionToken = token ?? idToken;

  const session: AuthSession = {
    token: sessionToken,
    role: credentials.role,
    user: { ...user, uid: firebaseUser.uid } as any,
  };

  await saveAuthSession(session);
  return session;
};

export const registerWithEmail = async (
  payload: AuthSignupData
): Promise<AuthSession> => {
  try {
    // Try Firebase signup first
    const firebaseUser = await firebaseSignUp(payload.email, payload.password);
    const idToken = await getFirebaseIdToken();

    try {
      const response = await signupAPI({
        firebaseUid: firebaseUser.uid,
        idToken,
        email: payload.email,
        name: payload.fullName,
        fullName: payload.fullName,
        role: payload.role,
        phoneNumber: payload.phone,
        expertise: payload.expertise,
        subjects: payload.subjects,
        selectedClass: payload.selectedClass,
      });

      const { user, token } = response.data;
      const sessionToken = token ?? idToken;

      const session: AuthSession = {
        token: sessionToken,
        role: payload.role,
        user: { ...user, uid: firebaseUser.uid } as any,
      };

      await saveAuthSession(session);
      return session;
    } catch (error) {
      try {
        await deleteFirebaseUser();
      } catch (deleteError) {
        console.error('Failed to delete Firebase user after signup error:', deleteError);
      }
      throw error;
    }
  } catch (firebaseError: any) {
    // If Firebase signup fails, fall back to direct backend signup
    // This allows signup without Firebase configuration
    console.log('Firebase signup failed, trying direct backend registration', firebaseError?.message);
    
    try {
      const response = await signupAPI({
        firebaseUid: `local_${Date.now()}`, // Generate a local UID for direct signup
        email: payload.email,
        name: payload.fullName,
        fullName: payload.fullName,
        role: payload.role,
        password: payload.password,
        phoneNumber: payload.phone,
        expertise: payload.expertise,
        subjects: payload.subjects,
        selectedClass: payload.selectedClass,
      });

      const { user, token } = response.data;

      const session: AuthSession = {
        token,
        role: payload.role,
        user: user as any,
      };

      await saveAuthSession(session);
      return session;
    } catch (backendError: any) {
      console.error('Backend signup error:', backendError?.response?.data || backendError?.message);
      throw backendError;
    }
  }
};

export const logoutUser = async () => {
  await firebaseSignOut();
  await clearAuthSession();
};

export const restoreAuthSession = async (): Promise<AuthSession | null> => {
  const session = await getAuthSession();
  if (!session) {
    return null;
  }

  const firebaseUser = getCurrentFirebaseUser();
  if (!firebaseUser) {
    await clearAuthSession();
    return null;
  }

  try {
    await getFirebaseIdToken(true);
    const userId = session.user.id || session.user._id;
    if (!userId) {
      await clearAuthSession();
      return null;
    }

    const profileResponse = await getProfileAPI(userId);
    const persistedUser = profileResponse.data?.user || session.user;

    const restoredSession: AuthSession = {
      ...session,
      user: { ...session.user, ...persistedUser },
    };

    await saveAuthSession(restoredSession);
    return restoredSession;
  } catch {
    await clearAuthSession();
    return null;
  }
};
