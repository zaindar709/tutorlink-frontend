import React, { useEffect } from 'react';
import { View, Animated, StyleSheet, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Images from '../../../assets/images';
import useUi from '../../../hooks/ui/useUi';
import { useSplash } from '../../../hooks/useSplash';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch } from 'react-redux';
import { restoreAuthSession } from '../../../services/auth/authService';
import { getTutorOnboardingStatus } from '../../../services/tutor/tutorOnboardingService';
import {
  getTutorOnboardingCache,
  mergeOnboardingStatus,
  saveTutorOnboardingCache,
  clearTutorOnboardingCache,
} from '../../../services/tutor/tutorOnboardingCache';
import {
  getTutorResetRoute,
  isTutorApproved,
} from '../../../utils/tutor/tutorNavigation';
import { setUser } from '../../../store/auth/authSlice';
import { GLASS } from '../../../theme/glass';

export default function SplashScreen() {
  type RootStackParamList = {
    SplashScreen: undefined;
    AuthNavigator: { screen: string } | undefined;
    MyTabs: { role: 'student' | 'tutor' | 'parent'; screen: string } | undefined;
  };
  const { colors, resp } = useUi();
  const styles = createStyles(colors, resp);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch();
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

    const navigateAfterSplash = async () => {
      const session = await restoreAuthSession();
      if (!isMounted) return;

      if (session) {
        dispatch(
          setUser({
            user: session.user,
            token: session.token,
            role: session.role,
          })
        );

        if (session.role === 'tutor') {
          try {
            const cached = await getTutorOnboardingCache();
            const remote = await getTutorOnboardingStatus();
            const onboardingStatus = mergeOnboardingStatus(remote, cached);
            await saveTutorOnboardingCache(onboardingStatus);
            if (!isMounted) return;

            if (!isTutorApproved(onboardingStatus)) {
              navigation.reset(getTutorResetRoute(onboardingStatus));
              return;
            }

            await clearTutorOnboardingCache();
          } catch {
            if (!isMounted) return;
            const cached = await getTutorOnboardingCache();
            navigation.reset(
              getTutorResetRoute(
                mergeOnboardingStatus(null, cached) ?? {
                  onboardingStatus: 'under_review',
                  isVerified: false,
                }
              )
            );
            return;
          }
        }

        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'MyTabs',
              params: { role: session.role, screen: 'Home' },
            },
          ],
        });
        return;
      }

      navigation.reset({
        index: 0,
        routes: [{ name: 'AuthNavigator' }],
      });
    };

    const timer = setTimeout(navigateAfterSplash, 2200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [dispatch, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      {/* Dark purple — white logo needs contrast */}
      <LinearGradient
        colors={[...GLASS.buttonGradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Animated.Image
        source={Images.Logo}
        resizeMode="contain"
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

      <View style={styles.dotsContainer}>
        {loadingDots.map((dot, index) => (
          <Animated.View
            key={index}
            style={[styles.dot, { transform: [{ translateY: dot }] }]}
          />
        ))}
      </View>
    </View>
  );
}

export const createStyles = (_colors: any, resp: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: GLASS.primaryDark,
    },
    logo: {
      width: resp.dx(280),
      height: resp.dy(280),
      marginBottom: resp.dy(-70),
    },
    title: {
      fontSize: resp.df(34),
      fontWeight: 'bold',
      color: '#FFFFFF',
      textAlign: 'center',
      marginBottom: resp.dy(8),
    },
    slogan: {
      fontSize: resp.df(16),
      color: 'rgba(255,255,255,0.9)',
      fontWeight: '500',
      textAlign: 'center',
      paddingHorizontal: 24,
    },
    dotsContainer: {
      flexDirection: 'row',
      marginTop: resp.dy(50),
      gap: 8,
    },
    dot: {
      width: resp.dx(8),
      height: resp.dy(8),
      backgroundColor: '#FFFFFF',
      borderRadius: 4,
    },
  });
