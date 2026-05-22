import { useNavigation } from '@react-navigation/native';
import { useState, useRef } from 'react';
import { Animated, FlatList } from 'react-native';

export const useOnboarding = (
  dataLength: number,
  onComplete?: () => void
) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigation = useNavigation();

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    const index = viewableItems?.[0]?.index;

    if (typeof index === 'number') {
      setCurrentIndex(index);
    }
  }).current;

  const handleNext = () => {
    if (currentIndex < dataLength - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      onComplete?.();
    }
  };

  const scrollTo = (index: number) => {
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
    });
  };

  return {
    scrollX,
    flatListRef,
    currentIndex,
    handleNext,
    onViewableItemsChanged,
    scrollTo,
  };
};