import React, { useMemo } from 'react';
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useUi from '../../../hooks/ui/useUi';
import { createStyles } from './Onboarding.styles';
import { useOnboarding } from '../../../hooks/useOnboarding';
import OnboardingItem from '../../../components/OnboardingItem/OnboardingItem';
import { getOnboardingData } from '../../../constants/Onboarding.data';
import CustomButton from '../../../components/CustomButton';
import GradientSurface from '../../../components/GradientSurface';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function OnboardingScreens({
  onComplete,
}: {
  onComplete?: () => void;
}) {
  const { colors, resp } = useUi();
  const styles = createStyles(colors, resp);
  const onboardingData = useMemo(() => getOnboardingData(colors), [colors]);
  const navigation = useNavigation();
  const {
    scrollX,
    flatListRef,
    currentIndex,
    handleNext,
    onViewableItemsChanged,
  } = useOnboarding(onboardingData.length, onComplete);
  const handleComplete = () => {
    onComplete?.();
    (navigation as any).replace('RoleSelectionScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.skipBtn} onPress={handleComplete}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
      <View style={styles.itemContainer}>
        <Animated.FlatList
          ref={flatListRef}
          data={onboardingData}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true },
          )}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => (
            <OnboardingItem
              item={item}
              index={index}
              scrollX={scrollX}
              styles={styles}
            />
          )}
        />
      </View>
      <View style={styles.footer}>
        <View style={styles.pagination}>
          {onboardingData.map((item: any, i: number) => {
            const isActive = i === currentIndex;
            return isActive ? (
              <GradientSurface
                key={i}
                variant="primaryButton"
                style={[
                  styles.dot,
                  {
                    width: resp.dx(16),
                    height: resp.dy(8),
                  },
                ]}
              />
            ) : (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: colors.GRAY_COLOR,
                    width: resp.dx(8),
                    height: resp.dy(8),
                  },
                ]}
              />
            );
          })}
        </View>
        <CustomButton
          title={
            currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'
          }
          textColor={colors.WHITE_COLOR}
          textStyle={styles.buttonText}
          onPress={() => {
            if (currentIndex === onboardingData.length - 1) {
              handleComplete();
            } else {
              handleNext();
            }
          }}
        />
      </View>
    </SafeAreaView>
  );
}
