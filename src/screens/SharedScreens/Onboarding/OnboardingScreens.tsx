import React, { useMemo } from 'react';
import { View, Text, Animated, TouchableOpacity } from 'react-native';
import useUi from '../../../hooks/ui/useUi';
import { createStyles } from './Onboarding.styles';
import { useOnboarding } from '../../../hooks/useOnboarding';
import OnboardingItem from '../../../components/OnboardingItem/OnboardingItem';
import { getOnboardingData } from '../../../constants/Onboarding.data';
import { useNavigation } from '@react-navigation/native';
import {
  AuthGlassBackground,
  GlassPrimaryButton,
  AUTH_GLASS,
} from '../../../components/AuthGlass';

export default function OnboardingScreens({
  onComplete,
}: {
  onComplete?: () => void;
}) {
  const { colors, resp } = useUi();
  const styles = useMemo(() => createStyles(colors, resp), [colors, resp]);
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
    <AuthGlassBackground scroll={false} contentStyle={styles.container}>
      <TouchableOpacity style={styles.skipBtn} onPress={handleComplete}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.listWrap}>
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
          {onboardingData.map((_item: any, i: number) => {
            const isActive = i === currentIndex;
            return (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: isActive
                      ? (AUTH_GLASS.primary as string)
                      : 'rgba(117, 72, 245, 0.22)',
                    width: isActive ? resp.dx(18) : resp.dx(8),
                  },
                ]}
              />
            );
          })}
        </View>

        <GlassPrimaryButton
          title={
            currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'
          }
          onPress={() => {
            if (currentIndex === onboardingData.length - 1) {
              handleComplete();
            } else {
              handleNext();
            }
          }}
        />
      </View>
    </AuthGlassBackground>
  );
}
