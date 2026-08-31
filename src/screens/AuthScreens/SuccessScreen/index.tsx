import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Animated,
  Easing,
  KeyboardAvoidingView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import useUi from '../../../hooks/ui/useUi';
import { AuthGlassBackground } from '../../../components/AuthGlass';
import { createStyles } from './styles';

const INITIAL_COUNTDOWN = 3;

const SuccessScreen = () => {
  const { colors, resp } = useUi();
  const styles = useMemo(() => createStyles(colors, resp), [colors, resp]);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { role = 'student' } = route.params || {};

  const [counter, setCounter] = useState(INITIAL_COUNTDOWN);
  const scaleAnim = new Animated.Value(0);
  const opacityAnim = new Animated.Value(0);
  const titleOpacityAnim = new Animated.Value(0);
  const subtitleOpacityAnim = new Animated.Value(0);
  const progressAnim = new Animated.Value(INITIAL_COUNTDOWN);

  // Animate checkmark with spring effect
  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim, opacityAnim]);

  // Animate title and subtitle
  useEffect(() => {
    Animated.sequence([
      Animated.delay(400),
      Animated.timing(titleOpacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(subtitleOpacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [titleOpacityAnim, subtitleOpacityAnim]);

  // Animate progress based on counter
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: counter,
      duration: 500,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [counter, progressAnim]);

  // Counter countdown
  useEffect(() => {
    if (counter === 0) {
      const loginScreen =
        role === 'tutor' ? 'TutorLoginScreen' : 'StudentLoginScreen';
      navigation.replace(loginScreen, { role });
      return;
    }

    const timer = setTimeout(() => {
      setCounter(counter - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [counter, navigation, role]);

  const scaleStyle = {
    transform: [
      {
        scale: scaleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.3, 1],
        }),
      },
    ],
    opacity: opacityAnim,
  };

  const titleStyle = {
    opacity: titleOpacityAnim,
    transform: [
      {
        translateY: titleOpacityAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  };

  const subtitleStyle = {
    opacity: subtitleOpacityAnim,
    transform: [
      {
        translateY: subtitleOpacityAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  };

  // Calculate progress ring rotation
  const progressRotation = progressAnim.interpolate({
    inputRange: [0, INITIAL_COUNTDOWN],
    outputRange: ['360deg', '0deg'],
  });

  return (
    <AuthGlassBackground contentStyle={styles.screen}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <View style={styles.container}>
        {/* Timer Ring with Checkmark */}
        <Animated.View style={[styles.timerContainer, scaleStyle]}>
          {/* Progress Ring Background */}
          <View style={styles.progressRingBg} />

          {/* Animated Progress Ring */}
          <Animated.View
            style={[
              styles.progressRing,
              {
                transform: [{ rotate: progressRotation }],
              },
            ]}
          >
            <View style={styles.progressSegment} />
          </Animated.View>

          {/* Green Checkmark Circle */}
          <View style={styles.checkmarkCircle}>
            <Text style={styles.checkmarkIcon}>✓</Text>
          </View>

          {/* Countdown Badge */}
          <View style={styles.countdownBadge}>
            <Text style={styles.countdownText}>{counter}</Text>
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.Text style={[styles.titleText, titleStyle]}>
          Password Reset Successful!
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text style={[styles.subtitleText, subtitleStyle]}>
          Your security is our priority. You will be redirected to the login screen in{' '}
          <Text style={styles.boldText}>{counter} seconds</Text>...
        </Animated.Text>
        </View>
      </KeyboardAvoidingView>
    </AuthGlassBackground>
  );
};

export default SuccessScreen;