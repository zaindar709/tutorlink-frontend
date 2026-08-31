import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { GLASS } from '../../theme/glass';

export const SummaryEmptyState = ({
  title = 'No learning summaries yet',
  subtitle = 'After your tutor publishes a class summary, it will appear here.',
}: {
  title?: string;
  subtitle?: string;
}) => (
  <View style={styles.box}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.sub}>{subtitle}</Text>
  </View>
);

export const SummaryErrorState = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) => (
  <View style={styles.box}>
    <Text style={styles.title}>Could not load summaries</Text>
    <Text style={styles.sub}>{message}</Text>
    {onRetry ? (
      <TouchableOpacity onPress={onRetry} style={styles.retry}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

export const SummaryLoadingState = () => (
  <View style={[styles.box, { alignItems: 'center' }]}>
    <ActivityIndicator color={GLASS.primary} />
  </View>
);

const styles = StyleSheet.create({
  box: {
    borderRadius: GLASS.radius.xl,
    borderWidth: 1,
    borderColor: GLASS.cardBorder,
    borderStyle: 'dashed',
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  title: { color: GLASS.textPrimary, fontWeight: '800', fontSize: 15 },
  sub: { color: GLASS.textSecondary, marginTop: 6, lineHeight: 19, fontSize: 13 },
  retry: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: GLASS.primarySoft,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  retryText: { color: GLASS.primaryDeep, fontWeight: '800' },
});
