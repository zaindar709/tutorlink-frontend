import React, { useEffect, useRef } from 'react';
import { Text, Animated, StyleSheet } from 'react-native';
import Images from '../../../assets/images';
import useUi from '../../../hooks/ui/useUi';
import { useSplash } from '../../../hooks/useSplash';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch } from 'react-redux';
import {
  clearAllAuth,
  restoreAuthSessionFast,
} from '../../../services/auth/bootstrapAuth';
import { getTutorOnboardingStatus } from '../../../services/tutor/tutorOnboardingService';
import {
  getTutorResetRoute,
  isTutorApproved,
} from '../../../utils/tutor/tutorNavigation';
import { logout, setUser } from '../../../store/auth/authSlice';
import GradientSurface from '../../../components/GradientSurface';
import { AxiosError } from 'axios';

const LOG = '[Splash]';
const MIN_SPLASH_MS = 1800;
const MAX_BOOTSTRAP_MS = 14000;

type RootStackParamList = {
  SplashScreen: undefined;
  AuthNavigator: { screen: string } | undefined;
  MyTabs: { role: 'student' | 'tutor' | 'parent'; screen: string } | undefined;
};

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

const withTimeout = async <T>(
  promise: Promise<T>,
  ms: number,
  label: string
): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`${label} timed out after ${ms}ms`)),
          ms
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
};

export default function SplashScreen() {
  const { colors, resp } = useUi();
  const styles = createStyles(colors, resp);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch();
  const didNavigate = useRef(false);
  const {
    logoScale,
    logoOpacity,
    titleTranslateX,
    titleOpacity,
    sloganTranslateY,
    sloganOpacity,
    loadingDots,
    titleScale,
  } = useSplash();

  useEffect(() => {
    let isMounted = true;

    const goAuth = () => {
      if (!isMounted || didNavigate.current) return;
      didNavigate.current = true;
      console.log(LOG, 'navigate → AuthNavigator');
      dispatch(logout());
      navigation.reset({
        index: 0,
        routes: [{ name: 'AuthNavigator' }],
      });
    };

    const goTabs = (role: 'student' | 'tutor' | 'parent') => {
      if (!isMounted || didNavigate.current) return;
      didNavigate.current = true;
      console.log(LOG, 'navigate → MyTabs', role);
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'MyTabs',
            params: { role, screen: 'Home' },
          },
        ],
      });
    };

    const goTutorOnboarding = (routeState: ReturnType<typeof getTutorResetRoute>) => {
      if (!isMounted || didNavigate.current) return;
      didNavigate.current = true;
      console.log(LOG, 'navigate → tutor onboarding route');
      navigation.reset(routeState as any);
    };

    const bootstrap = async () => {
      console.log(LOG, 'bootstrap start');
      const startedAt = Date.now();

      try {
        const session = await withTimeout(
          restoreAuthSessionFast(),
          MAX_BOOTSTRAP_MS,
          'restoreAuthSessionFast'
        );

        // Keep splash visible at least MIN_SPLASH_MS
        const elapsed = Date.now() - startedAt;
        if (elapsed < MIN_SPLASH_MS) {
          await delay(MIN_SPLASH_MS - elapsed);
        }

        if (!isMounted) return;

        if (!session) {
          goAuth();
          return;
        }

        dispatch(
          setUser({
            user: session.user,
            token: session.token,
            role: session.role,
          })
        );

        if (session.role === 'tutor') {
          try {
            const onboardingStatus = await withTimeout(
              getTutorOnboardingStatus(),
              10000,
              'getTutorOnboardingStatus'
            );
            if (!isMounted) return;

            if (!isTutorApproved(onboardingStatus)) {
              goTutorOnboarding(getTutorResetRoute(onboardingStatus));
              return;
            }

            goTabs('tutor');
            return;
          } catch (error) {
            const status =
              error instanceof AxiosError ? error.response?.status : undefined;
            console.warn(LOG, 'tutor onboarding status failed', {
              status,
              message: error instanceof Error ? error.message : error,
            });

            // 401 / auth failure → clear stale session, never open dashboard
            if (status === 401 || status === 403) {
              await clearAllAuth();
              goAuth();
              return;
            }

            // Network/timeout: incomplete tutors stay in onboarding, not dashboard
            goTutorOnboarding(
              getTutorResetRoute({
                onboardingStatus: 'pending',
                isVerified: false,
              })
            );
            return;
          }
        }

        goTabs(session.role);
      } catch (error) {
        console.warn(LOG, 'bootstrap failed', error);
        await clearAllAuth();
        goAuth();
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, [dispatch, navigation]);

  return (
    <GradientSurface variant="primaryHeader" style={styles.container}>
      <Animated.Image
        source={Images.Logo}
        style={[
          styles.logo,
          { transform: [{ scale: logoScale }], opacity: logoOpacity },
        ]}
      />

      <Animated.Text
        style={[
          styles.title,
          {
            transform: [{ translateX: titleTranslateX }, { scale: titleScale }],
            opacity: titleOpacity,
          },
        ]}
      >
        TutorLink
      </Animated.Text>

      <Animated.Text
        style={[
          styles.slogan,
          {
            transform: [{ translateY: sloganTranslateY }],
            opacity: sloganOpacity,
          },
        ]}
      >
        Learn with ease, connect with expertise
      </Animated.Text>
      <Animated.View style={styles.dotsContainer}>
        {loadingDots.map((dot, index) => (
          <Animated.View
            key={index}
            style={[styles.dot, { transform: [{ translateY: dot }] }]}
          />
        ))}
      </Animated.View>
    </GradientSurface>
  );
}

export const createStyles = (colors: any, resp: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logo: {
      width: resp.dx(300),
      height: resp.dy(300),
      marginBottom: resp.dy(-80),
    },
    textContainer: {
      alignItems: 'center',
    },
    title: {
      fontSize: resp.df(34),
      fontWeight: 'bold',
      color: colors.WHITE_COLOR,
      textAlign: 'center',
      marginBottom: resp.dy(8),
    },
    slogan: {
      fontSize: resp.df(16),
      color: colors.WHITE_COLOR,
      fontWeight: '500',
      textAlign: 'center',
    },
    dotsContainer: {
      flexDirection: 'row',
      marginTop: resp.dy(50),
      gap: 8,
    },
    dot: {
      width: resp.dx(8),
      height: resp.dy(8),
      backgroundColor: colors.WHITE_COLOR,
      borderRadius: 4,
    },
  });
