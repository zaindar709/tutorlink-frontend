import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GLASS, glassTypography } from '../../../theme/glass';

type Props = {
  title: string;
  children: React.ReactNode;
};

/** Grouped profile menu — no opaque white card; soft lavender outline only. */
export default function ProfileMenuSection({ title, children }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>{title}</Text>
      <View style={styles.panel}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: GLASS.space.xl,
  },
  heading: {
    ...glassTypography.caption,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: GLASS.textMuted,
    marginBottom: GLASS.space.sm,
    marginLeft: 2,
  },
  panel: {
    backgroundColor: 'rgba(117, 72, 245, 0.05)',
    borderRadius: GLASS.radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(117, 72, 245, 0.14)',
    overflow: 'hidden',
  },
});
