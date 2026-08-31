import React, { ReactNode, useRef } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
  ViewStyle,
  StyleProp,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GLASS } from '../../theme/glass';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
};

/** Soft lavender gradient shell for main-app screens. */
const GlassScreen = ({
  children,
  scroll = true,
  contentStyle,
  edges = ['top', 'bottom'],
}: Props) => {
  const scrollRef = useRef<ScrollView | null>(null);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={[...GLASS.screenGradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safe} edges={edges}>
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
              contentInsetAdjustmentBehavior="automatic"
            >
              <Animated.View entering={FadeInDown.duration(360)}>
                {children}
              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
        ) : (
          <Animated.View
            entering={FadeInDown.duration(360)}
            style={[styles.flex, contentStyle]}
          >
            {children}
          </Animated.View>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: GLASS.screenGradient[0] },
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: GLASS.space.lg,
    paddingBottom: GLASS.space.xxxl,
  },
});

export default GlassScreen;
