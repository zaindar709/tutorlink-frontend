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
import { loginWithEmail, registerWithEmail, AuthRole } from '../../services/auth/authService';

type Mode = 'login' | 'signup';

export const useAuthForm = (mode: Mode, role: Exclude<AuthRole, 'parent'>) => {
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
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoadingState] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));

    let error = '';
    if (field === 'fullName') error = validateFullName(value);
    if (field === 'email') error = validateEmail(value);
    if (field === 'password') error = validatePassword(value);
    if (field === 'confirmPassword')
      error = validateConfirmPassword(form.password, value);

    setErrors((prev: any) => ({ ...prev, [field]: error }));
  };

  const validateForm = () => {
    const newErrors: any = {};

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
            });

      dispatch(
        setUser({
          user: session.user,
          token: session.token,
          role: session.role,
        })
      );

      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'MyTabs',
            params: {
              role: session.role,
              screen: 'Home',
            },
          },
        ],
      });
    } catch (error: any) {
      console.log('AUTH ERROR:', error?.response?.data || error?.message);
      Alert.alert(
        'Authentication failed',
        error?.response?.data?.message ||
          error?.message ||
          'Unable to complete the request. Please try again.'
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