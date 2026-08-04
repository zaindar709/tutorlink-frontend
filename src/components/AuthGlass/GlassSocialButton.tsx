import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { Icon } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { AUTH_GLASS } from './authGlassTheme';

type Props = {
  title: string;
  onPress: () => void;
  icon?: string;
  style?: ViewStyle;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const GlassSocialButton = ({ title, onPress, icon, style }: Props) => {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 16, stiffness: 320 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14, stiffness: 280 });
      }}
      style={[styles.btn, animStyle, style]}
    >
      {icon ? (
        <Icon source={icon} size={20} color={AUTH_GLASS.primary as string} />
      ) : null}
      <Text style={styles.text}>{title}</Text>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  btn: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AUTH_GLASS.cardBorder,
    backgroundColor: AUTH_GLASS.cardBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 10,
  },
  text: {
    color: AUTH_GLASS.title,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default GlassSocialButton;
