import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import useUi from '../../hooks/ui/useUi';

type Props = {
  name?: string;
  compact?: boolean;
};

const Dot = ({ delay }: { delay: number }) => {
  const { colors } = useUi();
  const y = useSharedValue(0);

  useEffect(() => {
    y.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-4, { duration: 280 }),
          withTiming(0, { duration: 280 })
        ),
        -1,
        false
      )
    );
  }, [delay, y]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.dot,
        { backgroundColor: colors.PRIMARY_COLOR as string },
        style,
      ]}
    />
  );
};

const TypingIndicator = ({ name = 'Tutor', compact = false }: Props) => {
  const { colors, resp } = useUi();

  if (compact) {
    return (
      <View style={styles.compactRow}>
        <Dot delay={0} />
        <Dot delay={120} />
        <Dot delay={240} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.CHAT_BUBBLE_IN as string,
          borderColor: colors.CHAT_BUBBLE_IN_BORDER as string,
        },
      ]}
    >
      <View style={styles.compactRow}>
        <Dot delay={0} />
        <Dot delay={120} />
        <Dot delay={240} />
      </View>
      <Text
        style={[
          styles.label,
          { color: colors.TEXT_SECONDARY as string, fontSize: resp.df(12) },
        ]}
      >
        {name} is typing…
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    marginVertical: 4,
    marginLeft: 12,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontWeight: '500',
  },
});

export default TypingIndicator;
