import { useEffect, useState } from 'react';
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
import {
  getTutorOnboardingStatus,
  submitTutorOnboardingStep1,
} from '../../services/tutor/tutorOnboardingService';
import { getTutorResetRoute } from '../../utils/tutor/tutorNavigation';
import { getApiErrorMessage } from '../../utils/api/errorHandler';
import { warmupApi } from '../../services/api/apiWarmup';
import { formatAuthTimingForAlert } from '../../utils/debug/speedLog';

type Mode = 'login' | 'signup';

/** Log only — Alert before navigation.reset races FCM permission and crashes Hermes. */
const logAuthTiming = (title: string, body: string) => {
  const timing = formatAuthTimingForAlert();
  console.log('[Auth]', title, body, timing || '');
};

export const useAuthForm = (
  mode: Mode,
  role: AuthRole,
  options?: {
    subjects?: string[];
    selectedClass?: string;
    tutorSubject?: string;
    tutorGrades?: string[];
  }
) => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();

  useEffect(() => {
    // Wake Render while the user is typing credentials.
    void warmupApi();
  }, []);

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

  const navigateAfterAuth = async (
    sessionRole: AuthRole,
    isSignup: boolean,
    activeOptions?: {
      tutorSubject?: string;
      tutorGrades?: string[];
    }
  ) => {
    if (isSignup && sessionRole === 'student') {
      navigation.replace('StudentSubjectSelection');
      return;
    }

    if (isSignup && sessionRole === 'tutor') {
      // Already inside AuthNavigator — navigate directly (not via nested AuthNavigator).
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'DocumentUploadScreen',
            params: {
              tutorSubject: activeOptions?.tutorSubject,
              tutorGrades: activeOptions?.tutorGrades,
            },
          },
        ],
      });

      // Step-1 can finish in background; document upload retries if needed.
      submitTutorOnboardingStep1({
        subject: activeOptions?.tutorSubject || 'General',
        grades: activeOptions?.tutorGrades || [],
      }).catch(step1Error => {
        console.warn(
          '[TutorUpload] signup step-1 deferred to document upload',
          step1Error
        );
      });
      return;
    }

    if (sessionRole === 'tutor') {
      try {
        const onboardingStatus = await getTutorOnboardingStatus();
        navigation.reset(getTutorResetRoute(onboardingStatus));
      } catch (error) {
        console.warn('[Auth] tutor onboarding status failed after login', error);
        // Never open dashboard for incomplete / unverified tutors
        navigation.reset(getTutorResetRoute({
          onboardingStatus: 'pending',
          isVerified: false,
        }));
      }
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

  const submit = async (overrideOptions?: {
    subjects?: string[];
    selectedClass?: string;
    tutorSubject?: string;
    tutorGrades?: string[];
  }) => {
    if (!validateForm()) return;

    const activeOptions = { ...options, ...overrideOptions };

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
              subjects: activeOptions?.subjects,
              selectedClass: activeOptions?.selectedClass,
            });

      dispatch(
        setUser({
          user: session.user,
          token: session.token,
          role: session.role,
        })
      );

      logAuthTiming(
        mode === 'login' ? 'Login OK' : 'Signup OK',
        mode === 'login'
          ? 'Signed in successfully.'
          : 'Account created successfully.'
      );

      // Navigate first; push permission is scheduled after interactions settle.
      await navigateAfterAuth(session.role, mode === 'signup', activeOptions);
    } catch (error) {
      const message = getApiErrorMessage(error);
      const isExistingAccount =
        message.toLowerCase().includes('already') ||
        message.toLowerCase().includes('exists') ||
        message.toLowerCase().includes('registered');
      const isMissingProfile =
        message.toLowerCase().includes('not found') ||
        (error as { response?: { status?: number } })?.response?.status === 404;

      const loginScreen =
        role === 'tutor'
          ? 'TutorLoginScreen'
          : role === 'parent'
            ? 'ParentLinkRedeemScreen'
            : 'StudentLoginScreen';

      const alertBody = isMissingProfile
        ? `${message}\n\nFirebase account exists but server profile was missing. Try again — app will create it.`
        : isExistingAccount
          ? message ||
            'This email is already registered. Please log in instead.'
          : message;

      const timing = formatAuthTimingForAlert();
      Alert.alert(
        isExistingAccount
          ? 'Account already exists'
          : isMissingProfile
            ? 'Profile not found'
            : 'Authentication failed',
        timing ? `${alertBody}\n\n${timing}` : alertBody,
        isExistingAccount
          ? [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Go to Login',
                onPress: () => navigation.replace(loginScreen, { role }),
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
