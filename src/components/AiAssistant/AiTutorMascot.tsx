import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Icon } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { GLASS } from '../../theme/glass';

type PointTarget = 'card' | 'search';

type Props = {
  visible: boolean;
  message: string;
  pointTo?: PointTarget;
  onAutoDismiss: () => void;
  durationMs?: number;
};

const PRIMARY = GLASS.primary;
const PRIMARY_DARK = GLASS.primaryDeep;
const { width: SCREEN_W } = Dimensions.get('window');

export default function AiTutorMascot({
  visible,
  message,
  pointTo = 'card',
  onAutoDismiss,
  durationMs = 4500,
}: Props) {
  const floatY = useSharedValue(0);
  const fingerY = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (!visible) {
      floatY.value = 0;
      fingerY.value = 0;
      pulse.value = 1;
      return;
    }

    floatY.value = withRepeat(
      withSequence(
        withTiming(-7, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
        withTiming(7, { duration: 1200, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    fingerY.value = withDelay(
      250,
      withRepeat(
        withSequence(
          withTiming(8, { duration: 520 }),
          withTiming(0, { duration: 520 })
        ),
        -1,
        true
      )
    );

    pulse.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 900 }),
        withTiming(1, { duration: 900 })
      ),
      -1,
      true
    );

    const timer = setTimeout(() => onAutoDismiss(), durationMs);
    return () => {
      clearTimeout(timer);
      floatY.value = 0;
      fingerY.value = 0;
      pulse.value = 1;
    };
  }, [visible, floatY, fingerY, pulse, onAutoDismiss, durationMs]);

  const robotStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }, { scale: pulse.value }],
  }));

  const fingerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: fingerY.value }],
  }));

  if (!visible) return null;

  return (
    <View
      style={[
        styles.wrap,
        pointTo === 'search' ? styles.wrapSearch : styles.wrapCard,
      ]}
      pointerEvents="none"
    >
      <Animated.View
        entering={FadeIn.duration(320)}
        exiting={FadeOut.duration(260)}
        style={styles.cluster}
      >
        <View style={styles.bubble}>
          <LinearGradient
            colors={[PRIMARY, PRIMARY_DARK]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bubbleAccent}
          />
          <Text style={styles.bubbleText}>{message}</Text>
          <View style={styles.bubbleTail} />
        </View>

        <Animated.View style={[styles.robot, robotStyle]}>
          <Icon source="robot-happy-outline" size={42} color={PRIMARY} />
          <Animated.View style={fingerStyle}>
            <Icon
              source="hand-pointing-down"
              size={22}
              color={PRIMARY_DARK}
            />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    zIndex: 40,
    maxWidth: Math.min(220, SCREEN_W * 0.56),
  },
  wrapCard: {
    right: 4,
    top: -8,
  },
  wrapSearch: {
    right: 10,
    top: -56,
  },
  cluster: {
    alignItems: 'center',
  },
  bubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: GLASS.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingLeft: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: GLASS.cardBorder,
    shadowColor: GLASS.primary,
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    overflow: 'hidden',
  },
  bubbleAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  bubbleText: {
    color: GLASS.textPrimary,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
  bubbleTail: {
    position: 'absolute',
    alignSelf: 'center',
    left: '45%',
    bottom: -6,
    width: 10,
    height: 10,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: GLASS.cardBorder,
    transform: [{ rotate: '45deg' }],
  },
  robot: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});
