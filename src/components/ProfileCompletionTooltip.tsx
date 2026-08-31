import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { GLASS } from '../theme/glass';

export type ProfileCompletionTooltipProps = {
  visible: boolean;
  role?: 'student' | 'tutor' | 'parent' | null;
  targetLayout?: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  onDismiss?: () => void;
};

const tooltipWidth = 160;
const tooltipHeight = 48;

const ProfileCompletionTooltip = ({
  visible,
  role,
  targetLayout,
  onDismiss,
}: ProfileCompletionTooltipProps) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;
  const scale = useRef(new Animated.Value(0.96)).current;
  const [isMounted, setIsMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -6,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -5,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.96,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setIsMounted(false);
        }
      });
    }
  }, [visible, opacity, scale, translateY]);

  if (!isMounted || !targetLayout) return null;

  const profileCenterX = targetLayout.x + targetLayout.width / 2;
  const profileTabY = targetLayout.y;
  const bubbleTop = Math.max(12, profileTabY - tooltipHeight - 14);
  const left = Math.max(
    10,
    Math.min(screenWidth - tooltipWidth - 10, profileCenterX - tooltipWidth / 2)
  );

  const effectiveRole = role === 'tutor' ? 'tutor' : 'student';
  const message =
    effectiveRole === 'tutor'
      ? 'Complete your profile first'
      : 'Complete your profile first';

  const verticalPointerOffset = Math.max(8, targetLayout.width / 2 - 2);
  // Shift the arrow slightly to the right inside the tooltip. Clamp so it stays within bounds.
  const arrowShift = 64; // pixels to move arrow right
  const arrowLeft = Math.max(
    8,
    Math.min(tooltipWidth - 12, verticalPointerOffset + arrowShift)
  );

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        {
          top: bubbleTop,
          left,
          width: tooltipWidth,
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        onPress={onDismiss}
        style={styles.bubble}
      >
        <LinearGradient
          colors={[...GLASS.buttonGradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBubble}
        >
          <Text style={styles.subtitle}>{message}</Text>
        </LinearGradient>
      </Pressable>
      <View style={[styles.arrowWrap, { marginLeft: arrowLeft }]}>
        <View style={styles.arrow} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    width: tooltipWidth,
    zIndex: 11,
    elevation: 11,
  },
  bubble: {
    width: tooltipWidth,
    minHeight: tooltipHeight,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  gradientBubble: {
    width: tooltipWidth,
    minHeight: tooltipHeight,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.96)',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
    textAlign: 'center',
    lineHeight: 13,
  },
  arrowWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 14,
    marginTop: -3,
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: GLASS.primary,
   
  },
});

export default ProfileCompletionTooltip;
