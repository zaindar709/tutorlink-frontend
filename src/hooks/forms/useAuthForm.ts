import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import { setUser, setLoading } from '../../store/auth/authSlice';
import {
  validateConfirmPassword,
  validateEmail,
  validateFullName,
  validatePassword,
} from '../../utils/validations/authValidation';
import {
  loginWithEmail,
  registerWithEmail,
  AuthRole,
} from '../../services/auth/authService';
import { getApiErrorMessage } from '../../utils/api/errorHandler';

type Mode = 'login' | 'signup';

export const useAuthForm = (
  mode: Mode,
  role: AuthRole,
  options?: {
    subjects?: string[];
    selectedClass?: string;
  }
) => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    expertise: '',
    phone: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoadingState] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));

    let error = '';
    if (field === 'fullName') error = validateFullName(value);
    if (field === 'email') error = validateEmail(value);
    if (field === 'password') error = validatePassword(value);
    if (field === 'confirmPassword')
      error = validateConfirmPassword(form.password, value);

    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (mode === 'signup') {
      newErrors.fullName = validateFullName(form.fullName);
      newErrors.confirmPassword = validateConfirmPassword(
        form.password,
        form.confirmPassword
      );
    }

    newErrors.email = validateEmail(form.email);
    newErrors.password = validatePassword(form.password);

    setErrors(newErrors);
    return Object.values(newErrors).every(value => !value);
  };

  const navigateAfterAuth = (sessionRole: AuthRole, isSignup: boolean) => {
    if (isSignup && sessionRole === 'student') {
      navigation.replace('StudentSubjectSelection');
      return;
    }

    if (isSignup && sessionRole === 'tutor') {
      navigation.reset({
        index: 1,
        routes: [
          { name: 'TutorSignUpScreen', params: { role: 'tutor' } },
          { name: 'DocumentUploadScreen' },
        ],
      });
      return;
    }

    if (sessionRole === 'parent') {
      navigation.reset({
        index: 0,
        routes: [{ name: 'ParentLinkRedeemScreen' }],
      });
      return;
    }

    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'MyTabs',
          params: {
            role: sessionRole,
            screen: 'Home',
          },
        },
      ],
    });
  };

  const submit = async () => {
    if (!validateForm()) return;

    setLoadingState(true);
    dispatch(setLoading(true));

    try {
      const session =
        mode === 'login'
          ? await loginWithEmail({
              email: form.email,
              password: form.password,
              role,
            })
          : await registerWithEmail({
              email: form.email,
              password: form.password,
              fullName: form.fullName,
              role,
              phone: form.phone || undefined,
              expertise: form.expertise || undefined,
              subjects: options?.subjects,
              selectedClass: options?.selectedClass,
            });

      dispatch(
        setUser({
          user: session.user,
          token: session.token,
          role: session.role,
        })
      );

      navigateAfterAuth(session.role, mode === 'signup');
    } catch (error) {
      const message = getApiErrorMessage(error);
      const isExistingAccount =
        message.toLowerCase().includes('already') ||
        message.toLowerCase().includes('exists');

      Alert.alert(
        isExistingAccount ? 'Account already exists' : 'Authentication failed',
        isExistingAccount
          ? 'This email is already registered. Please log in instead.'
          : message,
        isExistingAccount
          ? [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Go to Login',
                onPress: () =>
                  navigation.replace('StudentLoginScreen', { role }),
              },
            ]
          : undefined
      );
    } finally {
      setLoadingState(false);
      dispatch(setLoading(false));
    }
  };

  return {
    form,
    errors,
    loading,
    handleChange,
    submit,
  };
};
