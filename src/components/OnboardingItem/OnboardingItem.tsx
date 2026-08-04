import React from 'react';
import { View, Text, Animated, Image, Dimensions } from 'react-native';

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

  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [0.92, 1, 0.92],
    extrapolate: 'clamp',
  });
  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.35, 1, 0.35],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.slide}>
      <Animated.View
        style={[styles.imageWrapper, { opacity, transform: [{ scale }] }]}
      >
        <Image source={item.image} style={styles.image} resizeMode="cover" />
      </Animated.View>
      <Animated.View style={{ opacity }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </Animated.View>
    </View>
  );
};

export default OnboardingItem;
