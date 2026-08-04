import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

import { AUTH_GLASS } from './authGlassTheme';

type Props = {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
  contentStyle?: ViewStyle;
};

/** Soft visible glass card — not opaque white, no heavy elevation. */
const GlassCard = ({ children, style, contentStyle }: Props) => {
  return (
    <View style={[styles.wrap, style]}>
      <View style={[styles.inner, contentStyle]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: AUTH_GLASS.cardBorder,
    backgroundColor: AUTH_GLASS.cardBg,
    overflow: 'hidden',
  },
  inner: {
    padding: 16,
  },
});

export default GlassCard;
