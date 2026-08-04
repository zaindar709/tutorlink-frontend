import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
  TextStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Icon } from 'react-native-paper';
import { GLASS, glassTypography } from '../../theme/glass';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
  icon?: string;
  variant?: 'primary' | 'ghost';
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const GlassButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  variant = 'primary',
}: Props) => {
  const scale = useSharedValue(1);
  const isDisabled = disabled || loading;
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: isDisabled ? 0.55 : 1,
  }));

  if (variant === 'ghost') {
    return (
      <AnimatedPressable
        onPress={onPress}
        disabled={isDisabled}
        onPressIn={() => {
          scale.value = withSpring(0.97, { damping: 16, stiffness: 320 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 14, stiffness: 280 });
        }}
        style={[styles.ghost, animStyle, style]}
      >
        {loading ? (
          <ActivityIndicator color={GLASS.primary} />
        ) : (
          <Text style={[styles.ghostText, textStyle]}>{title}</Text>
        )}
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={isDisabled}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 16, stiffness: 320 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14, stiffness: 280 });
      }}
      style={[styles.wrap, animStyle, style]}
    >
      <LinearGradient
        colors={[...GLASS.buttonGradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            {icon ? <Icon source={icon} size={18} color="#fff" /> : null}
            <Text style={[glassTypography.button, textStyle, icon ? { marginLeft: 8 } : null]}>
              {title}
            </Text>
          </>
        )}
      </LinearGradient>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    alignSelf: 'center',
    borderRadius: GLASS.radius.lg,
    ...GLASS.shadow.glow,
  },
  gradient: {
    height: 54,
    borderRadius: GLASS.radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: GLASS.space.xl,
  },
  ghost: {
    height: 52,
    borderRadius: GLASS.radius.lg,
    borderWidth: 1,
    borderColor: GLASS.cardBorderStrong,
    backgroundColor: GLASS.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: {
    ...glassTypography.button,
    color: GLASS.primary,
  },
});

export default GlassButton;
