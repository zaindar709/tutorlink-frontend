import React, { useEffect } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import Images from '../../../assets/images';
import useUi from '../../../hooks/ui/useUi';
import { useSplash } from '../../../hooks/useSplash';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch } from 'react-redux';
import { restoreAuthSession } from '../../../services/auth/authService';
import { getTutorOnboardingStatus } from '../../../services/tutor/tutorOnboardingService';
import {
  getTutorResetRoute,
  isTutorApproved,
} from '../../../utils/tutor/tutorNavigation';
import { setUser } from '../../../store/auth/authSlice';

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
            const onboardingStatus = await getTutorOnboardingStatus();
            if (!isMounted) return;

            if (!isTutorApproved(onboardingStatus)) {
              navigation.reset(getTutorResetRoute(onboardingStatus));
              return;
            }
          } catch {
            // Fall through to tutor dashboard if status check fails.
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
export const createStyles = (colors: any, resp: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.PRIMARY_COLOR,
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
