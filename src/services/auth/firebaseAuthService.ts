import {
  createUserWithEmailAndPassword,
  deleteUser,
  FirebaseAuthTypes,
  getAuth,
  getIdToken,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from '@react-native-firebase/auth';

const auth = getAuth();

export const firebaseSignUp = async (
  email: string,
  password: string
): Promise<FirebaseAuthTypes.User> => {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  return credential.user;
};

export const firebaseSignIn = async (
  email: string,
  password: string
): Promise<FirebaseAuthTypes.User> => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
};

export const firebaseSignOut = async () => {
  // signOut throws when there is no current user — safe to ignore.
  if (!auth.currentUser) {
    return;
  }

  try {
    await signOut(auth);
  } catch (error: any) {
    const message = String(error?.message || '').toLowerCase();
    const code = String(error?.code || '');
    if (
      code === 'auth/no-current-user' ||
      message.includes('no user currently signed in')
    ) {
      return;
    }
    throw error;
  }
};

export const getCurrentFirebaseUser = () => {
  return auth.currentUser;
};

/** Wait for Firebase Auth persistence to restore after app cold start. */
export const waitForFirebaseAuth = (
  timeoutMs = 2500
): Promise<FirebaseAuthTypes.User | null> => {
  return new Promise(resolve => {
    if (auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }

    let settled = false;
    const finish = (user: FirebaseAuthTypes.User | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      unsubscribe();
      resolve(user);
    };

    const timer = setTimeout(() => finish(auth.currentUser), timeoutMs);
    const unsubscribe = onAuthStateChanged(auth, user => {
      finish(user);
    });
  });
};

export const getFirebaseIdToken = async (
  forceRefresh = false,
  user?: FirebaseAuthTypes.User | null
) => {
  const currentUser = user ?? auth.currentUser;
  if (!currentUser) {
    throw new Error('Firebase user is not authenticated');
  }
  return await getIdToken(currentUser, forceRefresh);
};

export const deleteFirebaseUser = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No user to delete');
  }

  try {
    await deleteUser(user);
  } catch (error: any) {
    console.error('Error deleting Firebase user:', error);
    throw error;
  }
};
