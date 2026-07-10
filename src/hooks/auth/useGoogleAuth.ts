import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import { setUser, setLoading } from '../../store/auth/authSlice';
import { loginWithGoogle, AuthRole } from '../../services/auth/authService';
import { getTutorOnboardingStatus } from '../../services/tutor/tutorOnboardingService';
import { getTutorResetRoute } from '../../utils/tutor/tutorNavigation';
import { signInWithGoogle } from '../../services/googleSignin';
import { getApiErrorMessage } from '../../utils/api/errorHandler';

export const useGoogleAuth = (role: AuthRole) => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const [loading, setLoadingState] = useState(false);

  const signIn = async () => {
    setLoadingState(true);
    dispatch(setLoading(true));

    try {
      const { firebaseUid, name, email } = await signInWithGoogle();
      const session = await loginWithGoogle(name, email, firebaseUid, role);

      dispatch(
        setUser({
          user: session.user,
          token: session.token,
          role: session.role,
        })
      );

      if (session.role === 'parent') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'ParentLinkRedeemScreen' }],
        });
        return;
      }

      if (session.role === 'tutor') {
        try {
          const onboardingStatus = await getTutorOnboardingStatus();
          navigation.reset(getTutorResetRoute(onboardingStatus));
        } catch (error) {
          console.warn('[Auth] tutor onboarding status failed after Google login', error);
          navigation.reset(
            getTutorResetRoute({
              onboardingStatus: 'pending',
              isVerified: false,
            })
          );
        }
        return;
      }

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
    } catch (error) {
      Alert.alert('Google sign-in failed', getApiErrorMessage(error));
    } finally {
      setLoadingState(false);
      dispatch(setLoading(false));
    }
  };

  return { signIn, loading };
};
