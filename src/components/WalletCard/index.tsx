import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import useUi from '../../hooks/ui/useUi';
import { GLASS } from '../../theme/glass';

export default function WalletCard({ balance, onDeposit }: any) {
  const { colors, resp } = useUi();
  const styles = createStyles({ colors, resp });

  return (
    <LinearGradient
      colors={[...GLASS.buttonGradient]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.topRow}>
        <View style={styles.balanceBlock}>
          <Text style={styles.label}>Available Balance</Text>
          <Text style={styles.balance}>
            Rs. {Number(balance || 0).toLocaleString()}
          </Text>
          <Text style={styles.hint}>Ready to book sessions</Text>
        </View>

        <View style={styles.iconContainer}>
          <Icon source="wallet-outline" size={26} color="#fff" />
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.88}
        style={styles.depositBtn}
        onPress={onDeposit}
      >
        <Icon source="plus-circle-outline" size={20} color={GLASS.primary} />
        <Text style={styles.depositText}>Deposit Money</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const createStyles = ({ colors, resp }: any) =>
  StyleSheet.create({
    card: {
      width: '100%',
      borderRadius: GLASS.radius.xxl,
      padding: resp.dx(20),
      overflow: 'hidden',
      ...GLASS.shadow.medium,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    balanceBlock: {
      flex: 1,
      paddingRight: 12,
    },
    label: {
      color: 'rgba(255,255,255,0.85)',
      fontSize: resp.df(13),
      fontWeight: '600',
      marginBottom: resp.dy(6),
    },
    balance: {
      color: colors.WHITE_COLOR,
      fontSize: resp.df(30),
      fontWeight: '800',
      letterSpacing: 0.2,
    },
    hint: {
      color: 'rgba(255,255,255,0.7)',
      fontSize: resp.df(12),
      marginTop: resp.dy(4),
    },
    iconContainer: {
      height: resp.dy(48),
      width: resp.dy(48),
      borderRadius: resp.dx(16),
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.18)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.25)',
    },
    depositBtn: {
      marginTop: resp.dy(20),
      backgroundColor: '#FFFFFF',
      height: resp.dy(48),
      borderRadius: resp.dx(14),
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    depositText: {
      color: GLASS.primary,
      fontSize: resp.df(15),
      fontWeight: '700',
    },
  });
