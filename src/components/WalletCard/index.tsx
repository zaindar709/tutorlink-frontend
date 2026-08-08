import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import useUi from '../../hooks/ui/useUi';
import { GLASS } from '../../theme/glass';

type WalletCardProps = {
  balance: number;
  onDeposit: () => void;
  depositLabel?: string;
  mockBadge?: boolean;
};

export default function WalletCard({
  balance,
  onDeposit,
  depositLabel = 'Deposit Money',
  mockBadge = false,
}: WalletCardProps) {
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
          <View style={styles.labelRow}>
            <Text style={styles.label}>Available Balance</Text>
            {mockBadge ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>MOCK</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.balance}>
            Rs. {Number(balance || 0).toLocaleString()}
          </Text>
          <Text style={styles.hint}>
            {mockBadge
              ? 'Demo funds — ready for booking escrow'
              : 'Ready to book sessions'}
          </Text>
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
        <Text style={styles.depositText}>{depositLabel}</Text>
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
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: resp.dy(6),
    },
    label: {
      color: 'rgba(255,255,255,0.85)',
      fontSize: resp.df(13),
      fontWeight: '600',
    },
    badge: {
      backgroundColor: 'rgba(255,255,255,0.22)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.35)',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 999,
    },
    badgeText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.6,
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
