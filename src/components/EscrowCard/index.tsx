import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import useUi from '../../hooks/ui/useUi';
import { GLASS } from '../../theme/glass';

export default function EscrowCard({ amount, description }: any) {
  const { colors, resp } = useUi();
  const styles = createStyles({ colors, resp });

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons
            name="shield-lock-outline"
            size={20}
            color="#D97706"
          />
        </View>
        <View style={styles.textCol}>
          <Text style={styles.lockedText}>Locked in Escrow</Text>
          <Text style={styles.amount}>
            Rs. {Number(amount || 0).toLocaleString()}
          </Text>
        </View>
      </View>

      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const createStyles = ({ colors, resp }: any) =>
  StyleSheet.create({
    card: {
      marginTop: resp.dy(14),
      backgroundColor: '#FFFFFF',
      borderRadius: GLASS.radius.xl,
      padding: resp.dx(16),
      borderWidth: 1,
      borderColor: 'rgba(245, 158, 11, 0.25)',
      ...GLASS.shadow.soft,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: '#FEF3C7',
      alignItems: 'center',
      justifyContent: 'center',
    },
    textCol: {
      flex: 1,
    },
    lockedText: {
      color: GLASS.textSecondary,
      fontSize: resp.df(12),
      fontWeight: '600',
      marginBottom: 4,
    },
    amount: {
      color: GLASS.textPrimary,
      fontSize: resp.df(22),
      fontWeight: '800',
    },
    description: {
      color: GLASS.textMuted,
      fontSize: resp.df(12),
      lineHeight: resp.dy(18),
      marginTop: resp.dy(12),
    },
  });
