import React from 'react';
import { View, Text, Animated, Image, Dimensions } from 'react-native';
import { createStyles } from '../../screens/SharedScreens/Onboarding/Onboarding.styles';
import useUi from '../../ui/useUi';

const { width } = Dimensions.get('window');

interface OnboardingItemProps {
  item: any;
  index: number;
  scrollX: Animated.Value;
  styles: any;
}
const OnboardingItem = ({
  item,
  index,
  scrollX,
  styles,
}: OnboardingItemProps) => {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
  const { colors, resp } = useUi();
  styles = createStyles(colors, resp);

  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [0.8, 1, 0.8],
    extrapolate: 'clamp',
  });
  const translateY = scrollX.interpolate({
    inputRange,
    outputRange: [100, 0, 100],
    extrapolate: 'clamp',
  });
  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [0, 1, 0],
    extrapolate: 'clamp',
  });
  return (
    <View style={[styles.itemContainer, { width }]}>
      <Animated.View style={[styles.imageWrapper, { transform: [{ scale }] }]}>
        <View style={[styles.glow, { backgroundColor: item.color }]} />
         <Image source={item.image} style={styles.image} />
      </Animated.View>
      <Animated.View style={{ transform: [{ translateY }], opacity }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </Animated.View>
    </View>
  );
};

export default OnboardingItem;
