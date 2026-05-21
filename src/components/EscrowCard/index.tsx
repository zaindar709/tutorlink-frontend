// components/EscrowCard.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from 'react-native-paper';

import useUi from '../../hooks/ui/useUi';
import { LinearGradient } from 'react-native-linear-gradient';

export default function EscrowCard({ amount, description }: any) {
  const { colors, resp } = useUi();
  const styles = createStyles({ colors, resp });

  return (
    <LinearGradient
      colors={['#F6D365', '#FBB034', '#FCE38A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.row}>
        <Icon source="shield-lock-outline" size={18} color="#fff" />

        <Text style={styles.lockedText}>Locked in Escrow</Text>

        <Icon source="information-outline" size={16} color="#fff" />
      </View>

      <Text style={styles.amount}>Rs. {amount.toLocaleString()}</Text>

      <Text style={styles.description}>• {description}</Text>
    </LinearGradient>
  );
}

const createStyles = ({ colors, resp }: any) =>
  StyleSheet.create({
    card: {
      marginTop: resp.dy(16),
      backgroundColor: '#FF8A00',
      borderRadius: resp.dx(22),
      padding: resp.dx(18),
      height: resp.dy(180),
    },

    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    lockedText: {
      color: colors.WHITE_COLOR,
      fontSize: resp.df(13),
      fontWeight: '600',
      marginHorizontal: resp.dx(6),
    },

    amount: {
      color: colors.WHITE_COLOR,
      fontSize: resp.df(32),
      fontWeight: '700',
      marginTop: resp.dy(14),
    },

    description: {
      color: '#FFF3E0',
      fontSize: resp.df(13),
      lineHeight: resp.dy(20),
      marginTop: resp.dy(16),
    },
  });
