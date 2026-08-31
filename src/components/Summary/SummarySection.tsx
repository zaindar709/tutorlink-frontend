import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GLASS } from '../../theme/glass';

type Props = {
  title: string;
  children: React.ReactNode;
};

const SummarySection: React.FC<Props> = ({ title, children }) => (
  <View style={styles.wrap}>
    <Text style={styles.title}>{title}</Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  wrap: { marginBottom: 18 },
  title: {
    color: GLASS.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },
});

export default SummarySection;
