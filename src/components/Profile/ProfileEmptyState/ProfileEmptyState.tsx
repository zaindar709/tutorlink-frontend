import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import useUi from '../../../hooks/ui/useUi';

type Props = {
  icon?: string;
  title: string;
  message: string;
};

export default function ProfileEmptyState({
  icon = 'inbox-outline',
  title,
  message,
}: Props) {
  const { colors, resp } = useUi();

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: colors.LIGHT_PRIMARY, width: resp.dx(72), height: resp.dx(72), borderRadius: resp.dx(36) },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={resp.df(32)}
          color={colors.PRIMARY_COLOR}
        />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  iconCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
});
