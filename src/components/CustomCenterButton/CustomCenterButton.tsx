import React from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useNavigationState } from '@react-navigation/native';
import { GLASS } from '../../theme/glass';
import Images from '../../assets/images';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  onPress?: (e: any) => void;
  accessibilityState?: { selected?: boolean };
};

/** Elevated Home — label primary when Home tab is active (default). */
export const CustomCenterButton = ({
  onPress,
  accessibilityState,
}: Props) => {
  const isHomeRoute = useNavigationState(state => {
    if (!state) return true;
    const route = state.routes?.[state.index];
    return route?.name === 'Home';
  });
  const focused = accessibilityState?.selected ?? isHomeRoute;

  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.wrap}>
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.94, { damping: 16, stiffness: 320 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 14, stiffness: 280 });
        }}
        style={[styles.container, animStyle]}
      >
        <LinearGradient
          colors={[...GLASS.buttonGradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          <Image
            source={Images.HomeIcon}
            style={styles.icon}
            resizeMode="contain"
          />
        </LinearGradient>
      </AnimatedPressable>
      <Text
        style={[styles.label, focused ? styles.labelActive : styles.labelIdle]}
        numberOfLines={1}
      >
        Home
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    top: -18,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    ...GLASS.shadow.glow,
  },
  icon: {
    width: 26,
    height: 26,
    tintColor: '#FFFFFF',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  labelActive: {
    color: GLASS.primary,
  },
  labelIdle: {
    color: '#9CA3AF',
  },
});
