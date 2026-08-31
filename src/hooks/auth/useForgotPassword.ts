import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { validateEmail } from '../../utils/validations/authValidation';
import {
  mapPasswordResetError,
  PasswordResetRole,
  savePasswordResetContext,
  sendPasswordResetLink,
} from '../../services/auth/passwordResetService';

const LOG = '[ForgotPassword]';

export const useForgotPassword = (role: PasswordResetRole = 'student') => {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChangeEmail = useCallback((text: string) => {
    setEmail(text);
    setError('');
  }, []);

  const sendResetLink = useCallback(async () => {
    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      return;
    }

    const trimmed = email.trim().toLowerCase();
    setLoading(true);
    setError('');
    console.log(LOG, 'Email-link request started', { email: trimmed, role });

    try {
      await savePasswordResetContext({ email: trimmed, role });
      await sendPasswordResetLink(trimmed);
      console.log(LOG, 'Firebase request succeeded');

      // Only after Firebase confirms the send succeeded.
      Alert.alert(
        'Success',
        'Login link sent. Please check your email inbox and spam/junk folder.'
      );

      navigation.navigate('ResetEmailSentScreen', {
        email: trimmed,
        role,
      });
    } catch (err) {
      const code = String((err as { code?: string })?.code || 'unknown');
      const message = String((err as { message?: string })?.message || '');
      const friendly = mapPasswordResetError(err);

      console.log(LOG, 'Firebase request failed');
      console.log(LOG, 'Firebase error code', code);
      console.log(LOG, 'Firebase error message', message);

      Alert.alert(
        'Could not send link',
        `${friendly}\n\nError code: ${code}`
      );
      setError(friendly);
    } finally {
      setLoading(false);
    }
  }, [email, navigation, role]);

  return {
    email,
    error,
    loading,
    onChangeEmail,
    sendResetLink,
    canSubmit: Boolean(email.trim()) && !loading,
  };
};
