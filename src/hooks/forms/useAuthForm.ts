import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import { setUser, setLoading } from '../../store/auth/authSlice';
import {
  validateConfirmPassword,
  validateEmail,
  validateFullName,
  validateLoginPassword,
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
import { openParentDashboard } from '../../config/parentDashboard';
import { clearAuthSession } from '../../services/storage';
import { logout } from '../../store/auth/authSlice';

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
    if (field === 'password') {
      error =
        mode === 'login' ? validateLoginPassword(value) : validatePassword(value);
    }
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
    newErrors.password =
      mode === 'login'
        ? validateLoginPassword(form.password)
        : validatePassword(form.password);

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
      // Parent auth/dashboard is web-only.
      await clearAuthSession();
      dispatch(logout());
      void openParentDashboard();
      navigation.reset({
        index: 0,
        routes: [{ name: 'RoleSelectionScreen' }],
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
    // Ignore RN press events accidentally passed via onPress={submit}
    const safeOptions =
      overrideOptions &&
      typeof overrideOptions === 'object' &&
      !('nativeEvent' in overrideOptions)
        ? overrideOptions
        : undefined;

    if (!validateForm()) return;
    if (loading) return;

    const activeOptions = { ...options, ...safeOptions };

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

      // Prefer requested role for navigation when backend omits it,
      // but never override a conflicting backend role (asserted in authService).
      const sessionRole = (session.role || role) as AuthRole;

      dispatch(
        setUser({
          user: session.user,
          token: session.token,
          role: sessionRole,
        })
      );

      logAuthTiming(
        mode === 'login' ? 'Login OK' : 'Signup OK',
        mode === 'login'
          ? 'Signed in successfully.'
          : 'Account created successfully.'
      );

      // Navigate first; push permission is scheduled after interactions settle.
      await navigateAfterAuth(sessionRole, mode === 'signup', activeOptions);
    } catch (error) {
      const message = getApiErrorMessage(error);
      const lower = message.toLowerCase();
      const isRoleConflict = lower.includes('registered as a');
      const isExistingAccount =
        !isRoleConflict &&
        (lower.includes('already') ||
          lower.includes('exists') ||
          lower.includes('registered with a different'));
      const isMissingProfile =
        lower.includes('not found') ||
        (error as { response?: { status?: number } })?.response?.status === 404;

      const loginScreen =
        role === 'tutor' ? 'TutorLoginScreen' : 'StudentLoginScreen';

      const studentLogin = 'StudentLoginScreen';

      const alertTitle = isRoleConflict
        ? 'Wrong role for this email'
        : isExistingAccount
          ? 'Account already exists'
          : isMissingProfile
            ? 'Profile not found'
            : 'Authentication failed';

      const alertBody = isMissingProfile
        ? `${message}\n\nFirebase account exists but server profile was missing. Try again — app will create it.`
        : message;

      const timing = formatAuthTimingForAlert();
      Alert.alert(
        alertTitle,
        timing ? `${alertBody}\n\n${timing}` : alertBody,
        isRoleConflict
          ? [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Student Login',
                onPress: () =>
                  navigation.replace(studentLogin, { role: 'student' }),
              },
            ]
          : isExistingAccount
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
