import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { GLASS } from '../../theme/glass';

type Props = {
  label: string;
  color?: string;
  style?: ViewStyle;
};

const GlassBadge = ({ label, color = GLASS.primary, style }: Props) => (
  <View style={[styles.badge, { backgroundColor: color + '1F', borderColor: color + '44' }, style]}>
    <Text style={[styles.text, { color }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: GLASS.radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
  },
});

export default GlassBadge;
