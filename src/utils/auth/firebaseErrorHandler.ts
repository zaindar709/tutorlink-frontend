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
  const codeSuffix = code ? ` [${code}]` : '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please log in instead.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return `Incorrect email or password. If this email was used before, try Forgot Password or a new email.${codeSuffix}`;
    case 'auth/user-not-found':
      return `No account found for this email. Please sign up first.${codeSuffix}`;
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
    lowerMessage.includes('invalid-credential') ||
    lowerMessage.includes('invalid_login_credentials') ||
    lowerMessage.includes('invalid login credentials')
  ) {
    return `Incorrect email or password. If you registered earlier, use Forgot Password or sign up with a new email.${codeSuffix}`;
  }

  if (lowerMessage.includes('no user currently signed in')) {
    return null;
  }

  return message ? `${message}${codeSuffix}` : null;
};
