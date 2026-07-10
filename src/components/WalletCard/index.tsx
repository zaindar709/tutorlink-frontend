// components/WalletCard.js

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { Icon, IconButton } from 'react-native-paper';
import useUi from '../../hooks/ui/useUi';
import GradientSurface from '../GradientSurface';

export default function WalletCard({ balance, onDeposit }: any) {
  const { colors, resp } = useUi();
  const styles = createStyles({ colors, resp });

  return (
    <GradientSurface variant="primaryCard" style={styles.card}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.label}>Total Balance</Text>

          <Text style={styles.balance}>Rs. {balance.toLocaleString()}</Text>
        </View>

        <View style={styles.iconContainer}>
          <Icon source="wallet-outline" size={24} color="#fff" />
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.depositBtn}
        onPress={onDeposit}
      >
        <Icon source="wallet-outline" size={24} color={colors.PRIMARY_COLOR as string} />

        <Text style={styles.depositText}>Deposit Money</Text>
      </TouchableOpacity>
    </GradientSurface>
  );
}

const createStyles = ({ colors, resp }: any) =>
  StyleSheet.create({
    card: {
      width: '100%',
      height: resp.dy(200),
      borderRadius: resp.dx(22),
      padding: resp.dx(18),
      overflow: 'hidden',
    },

    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },

    label: {
      color: '#DCE6FF',
      fontSize: resp.df(13),
      marginBottom: resp.dy(6),
    },

    balance: {
      color: colors.WHITE_COLOR,
      fontSize: resp.df(34),
      fontWeight: '700',
    },

    iconContainer: {
      height: resp.dy(48),
      width: resp.dy(48),
      borderRadius: resp.dx(14),
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.18)',
    },

    depositBtn: {
      marginTop: resp.dy(24),
      backgroundColor: colors.WHITE_COLOR,
      height: resp.dy(52),
      borderRadius: resp.dx(14),

      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },

    depositText: {
      color: colors.PRIMARY_COLOR,
      fontSize: resp.df(15),
      fontWeight: '700',
      marginLeft: resp.dx(8),
    },
  });
