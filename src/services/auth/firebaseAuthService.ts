import auth from '@react-native-firebase/auth';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';

export const firebaseSignUp = async (
  email: string,
  password: string
): Promise<FirebaseAuthTypes.User> => {
  const credential = await auth().createUserWithEmailAndPassword(email, password);
  return credential.user;
};

export const firebaseSignIn = async (
  email: string,
  password: string
): Promise<FirebaseAuthTypes.User> => {
  const credential = await auth().signInWithEmailAndPassword(email, password);
  return credential.user;
};

export const firebaseSignOut = async () => {
  await auth().signOut();
};

export const getCurrentFirebaseUser = () => {
  return auth().currentUser;
};

export const getFirebaseIdToken = async (forceRefresh = false) => {
  const user = auth().currentUser;
  if (!user) {
    throw new Error('Firebase user is not authenticated');
  }
  return await user.getIdToken(forceRefresh);
};

export const deleteFirebaseUser = async () => {
  const user = auth().currentUser;
  if (!user) {
    throw new Error('No user to delete');
  }
  // Use the modern API - deleteUser() from the user object
  try {
    await user.delete();
  } catch (error: any) {
    console.error('Error deleting Firebase user:', error);
    throw error;
  }
};
