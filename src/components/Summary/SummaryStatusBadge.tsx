import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GLASS } from '../../theme/glass';
import { SummaryStatus } from '../../types/summary.types';

const META: Record<
  SummaryStatus,
  { label: string; bg: string; fg: string }
> = {
  not_started: { label: 'Not started', bg: '#F1F5F9', fg: '#64748B' },
  processing: { label: 'Processing', bg: '#FEF3C7', fg: '#B45309' },
  generated: { label: 'Ready for review', bg: GLASS.primarySoft, fg: GLASS.primaryDeep },
  under_review: { label: 'Under review', bg: '#DBEAFE', fg: '#1D4ED8' },
  published: { label: 'Published', bg: '#DCFCE7', fg: '#15803D' },
  failed: { label: 'Failed', bg: '#FEE2E2', fg: '#B91C1C' },
};

type Props = { status: SummaryStatus; compact?: boolean };

const SummaryStatusBadge: React.FC<Props> = ({ status, compact }) => {
  const tone = META[status] || META.not_started;
  return (
    <View style={[styles.badge, { backgroundColor: tone.bg }, compact && styles.compact]}>
      <Text style={[styles.text, { color: tone.fg }]}>{tone.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  compact: { paddingHorizontal: 8, paddingVertical: 3 },
  text: { fontSize: 11, fontWeight: '800' },
});

export default SummaryStatusBadge;
