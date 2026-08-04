import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { GLASS, glassTypography } from '../../../theme/glass';

type Props = {
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
};

export default function ProfileSectionCard({ title, children, style }: Props) {
  return (
    <View style={[styles.card, style]}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: GLASS.cardBg,
    borderRadius: GLASS.radius.lg,
    borderWidth: 1,
    borderColor: GLASS.cardBorder,
    padding: GLASS.space.lg,
    marginBottom: GLASS.space.md,
    ...GLASS.shadow.soft,
  },
  title: {
    ...glassTypography.h3,
    fontSize: 15,
    marginBottom: GLASS.space.md,
  },
});
