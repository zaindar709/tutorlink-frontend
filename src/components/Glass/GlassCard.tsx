import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { GLASS } from '../../theme/glass';

type Props = {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
  strong?: boolean;
};

const GlassCard = ({ children, style, strong }: Props) => (
  <View style={[styles.card, strong && styles.strong, style]}>{children}</View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: GLASS.cardBg,
    borderRadius: GLASS.radius.xl,
    borderWidth: 1,
    borderColor: GLASS.cardBorder,
    padding: GLASS.space.lg,
    ...GLASS.shadow.soft,
  },
  strong: {
    backgroundColor: GLASS.cardBgStrong,
    borderColor: GLASS.cardBorderStrong,
  },
});

export default GlassCard;
