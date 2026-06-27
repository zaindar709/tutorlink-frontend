import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// TODO: Replace this with your Firebase web OAuth client ID.
// Create an OAuth 2.0 Web application credential in the Firebase console or Google Cloud Console.
const GOOGLE_WEB_CLIENT_ID = "750381394371-13rsdid2uq46j9j1g0h5j0cas5rsb7ro.apps.googleusercontent.com";

export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    offlineAccess: false,
  });
};

export const signInWithGoogle = async () => {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  await GoogleSignin.signIn();
  const { idToken } = await GoogleSignin.getTokens();

  if (!idToken) {
    throw new Error('Google sign-in did not return an idToken.');
  }

  const googleCredential = auth.GoogleAuthProvider.credential(idToken);
  const userCredential = await auth().signInWithCredential(googleCredential);
  const user = userCredential.user;

  return {
    firebaseUid: user.uid,
    name: user.displayName ?? '',
    email: user.email ?? '',
    idToken,
  };
};
