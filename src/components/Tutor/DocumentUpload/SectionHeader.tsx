import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useColors from '../../../hooks/ui/useColors';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle }) => {
  const colors = useColors();
  return (
    <View style={styles.headerContainer}>
      <Icon name="lock" size={28} color={colors.PRIMARY_COLOR} style={styles.lockIcon} />
      <Text style={[styles.title, { color: colors.PRIMARY_COLOR }]}>{title}</Text>
      {subtitle && <Text style={[styles.subtitle, { color: colors.GRAY31 }]}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    marginBottom: 18,
    marginTop: 8,
  },
  lockIcon: {
    marginBottom: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 2,
  },
});

export default SectionHeader;
