type FirebaseLikeError = {
  code?: string;
  message?: string;
};

export const isFirebaseError = (error: unknown): error is FirebaseLikeError =>
  typeof error === 'object' &&
  error !== null &&
  ('code' in error || 'message' in error);

export const getFirebaseErrorMessage = (error: unknown): string | null => {
  if (!isFirebaseError(error)) {
    return null;
  }

  const { code, message } = error;

  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please log in instead.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Incorrect email or password. Please try again.';
    case 'auth/user-not-found':
      return 'No account found for this email. Please sign up first.';
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 8 characters with uppercase, lowercase, number, and special character.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Check your internet connection.';
    case 'auth/unknown':
      return 'Sign-in failed due to a network glitch. Please try again.';
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is not enabled. Contact support.';
    case 'auth/no-current-user':
      return null;
    default:
      break;
  }

  const lowerMessage = message?.toLowerCase() ?? '';

  if (
    lowerMessage.includes('unexpected end of stream') ||
    lowerMessage.includes('end of stream') ||
    lowerMessage.includes('connection reset') ||
    lowerMessage.includes('timed out')
  ) {
    return 'Connection interrupted. Please try again in a moment.';
  }

  if (
    lowerMessage.includes('supplied auth credential') ||
    lowerMessage.includes('invalid-credential')
  ) {
    return 'This email may already be registered. Try Login with your existing password, or use Forgot Password.';
  }

  if (lowerMessage.includes('no user currently signed in')) {
    return null;
  }

  return message || null;
};
