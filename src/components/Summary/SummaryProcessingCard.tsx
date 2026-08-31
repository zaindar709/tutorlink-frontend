import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { GLASS } from '../../theme/glass';
import { SummaryStatus } from '../../types/summary.types';
import { statusCopy } from '../../services/summaries/summariesService';
import SummaryStatusBadge from './SummaryStatusBadge';

type Props = {
  status: SummaryStatus;
  onRetry?: () => void;
  onContinue?: () => void;
  continueLabel?: string;
};

const SummaryProcessingCard: React.FC<Props> = ({
  status,
  onRetry,
  onContinue,
  continueLabel = 'Go to Dashboard',
}) => {
  const pulse = useSharedValue(0.55);

  useEffect(() => {
    if (status === 'processing' || status === 'not_started') {
      pulse.value = withRepeat(
        withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      pulse.value = withTiming(1, { duration: 200 });
    }
  }, [status, pulse]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
    transform: [{ scale: 0.92 + pulse.value * 0.08 }],
  }));

  return (
    <View style={styles.card}>
      <Animated.View style={[styles.iconWrap, glowStyle]}>
        <MaterialCommunityIcons
          name="star-four-points"
          size={28}
          color={GLASS.accent}
        />
      </Animated.View>
      <Text style={styles.title}>Preparing Your Learning Summary</Text>
      <SummaryStatusBadge status={status} />
      <Text style={styles.body}>{statusCopy(status)}</Text>
      <Text style={styles.hint}>
        Your tutor will review it before it is shared with you.
      </Text>

      {status === 'failed' && onRetry ? (
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
          <Text style={styles.retryText}>Fix & Retry</Text>
        </TouchableOpacity>
      ) : null}

      {onContinue ? (
        <TouchableOpacity style={styles.continueBtn} onPress={onContinue}>
          <Text style={styles.continueText}>{continueLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: GLASS.cardBgStrong,
    borderRadius: GLASS.radius.xxl,
    borderWidth: 1,
    borderColor: GLASS.cardBorder,
    padding: 22,
    alignItems: 'center',
    ...GLASS.shadow.soft,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(253, 230, 138, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    color: GLASS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  body: {
    marginTop: 12,
    color: GLASS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  hint: {
    marginTop: 8,
    color: GLASS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: GLASS.primarySoft,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
  },
  retryText: { color: GLASS.primaryDeep, fontWeight: '800' },
  continueBtn: {
    marginTop: 14,
    backgroundColor: GLASS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  continueText: { color: '#fff', fontWeight: '800' },
});

export default SummaryProcessingCard;
