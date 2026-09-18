import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  ViewStyle,
  TextStyle,
  Pressable,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Icon } from 'react-native-paper';

import { AUTH_GLASS } from './authGlassTheme';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
  icon?: string;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Large primary gradient CTA with press scale — loading/disabled logic unchanged.
 */
const GlassPrimaryButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}: Props) => {
  const scale = useSharedValue(1);
  const isDisabled = disabled || loading;

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: isDisabled ? 0.55 : 1,
  }));

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
        colors={[...AUTH_GLASS.buttonGradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            {icon ? (
              <Icon source={icon} size={20} color="#fff" />
            ) : null}
            <Text
              style={[styles.text, icon ? styles.textWithIcon : null, textStyle]}
              numberOfLines={1}
            >
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
    height: 56,
    alignSelf: 'stretch',
    borderRadius: 18,
    overflow: 'hidden',
    flexGrow: 0,
    flexShrink: 0,
    shadowColor: '#7548F5',
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    marginVertical: 6,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  textWithIcon: {
    marginLeft: 8,
  },
});

export default GlassPrimaryButton;
