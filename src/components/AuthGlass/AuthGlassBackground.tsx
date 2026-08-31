import React, { ReactNode, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Keyboard,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { AUTH_GLASS } from './authGlassTheme';

type Props = {
  children: ReactNode;
  contentStyle?: object;
  scroll?: boolean;
};

/** Soft lavender light-glass shell for onboarding + auth. */
const AuthGlassBackground = ({
  children,
  contentStyle,
  scroll = true,
}: Props) => {
  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
      if (Platform.OS === 'android') {
      // Do not force scrolling on keyboard show/hide. Forcing scrolls here
      // caused the auth form to jump up/down unpredictably on many devices.
      // Let the KeyboardAvoidingView + ScrollView handle focused input visibility.
      return undefined;
    }

    return undefined;
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={[...AUTH_GLASS.gradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {scroll ? (
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
          >
            <ScrollView
              ref={scrollRef}
              contentContainerStyle={[styles.scroll, contentStyle]}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
              bounces
              contentInsetAdjustmentBehavior="automatic"
            >
              <Animated.View entering={FadeInDown.duration(420)}>
                {children}
              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
        ) : (
          <Animated.View
            entering={FadeInDown.duration(420)}
            style={[styles.flex, contentStyle]}
          >
            {children}
          </Animated.View>
        )}
      </SafeAreaView>
    </View>
  );
};

export const AuthGlassFadeBlock = ({
  children,
  delay = 80,
}: {
  children: ReactNode;
  delay?: number;
}) => (
  <Animated.View entering={FadeInUp.delay(delay).duration(380)}>
    {children}
  </Animated.View>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AUTH_GLASS.gradient[0],
  },
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 36,
  },
});

export default AuthGlassBackground;
