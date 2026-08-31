import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { IconButton } from 'react-native-paper';
import { GlassScreen } from '../../../../components/Glass';
import { GLASS } from '../../../../theme/glass';
import useUi from '../../../../hooks/ui/useUi';
import { useWallet } from '../../../../hooks/api/useWallet';
import { WalletTransaction } from '../../../../types/api.types';
import { navigateHomeStack } from '../../../../navigation/navigationRef';

const formatRs = (value?: number | null) =>
  `Rs. ${Math.max(0, Number(value) || 0).toLocaleString()}`;

const formatTxnDate = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const today = new Date();
  const sameDay =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
  if (sameDay) {
    return `Today, ${d.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    })}`;
  }
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const isCredit = (txn: WalletTransaction) => {
  const title = String(txn.title || '').toLowerCase();
  if (title.includes('withdraw') || title.includes('payout')) return false;
  if (Number(txn.amount) < 0) return false;
  return true;
};

export default function TutorEarningsScreen() {
  const { resp } = useUi();
  const navigation = useNavigation<any>();
  const styles = useMemo(() => createStyles(resp), [resp]);
  const { balance, transactions, loading, error, refresh } = useWallet();

  useFocusEffect(
    React.useCallback(() => {
      void refresh();
    }, [refresh])
  );

  const available = Number(balance?.totalBalance) || 0;
  const escrow = Number(balance?.escrowBalance) || 0;
  const recent = transactions.slice(0, 6);

  return (
    <GlassScreen scroll={false} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Earnings</Text>
          <Text style={styles.headerSub}>Balance, escrow & withdrawals</Text>
        </View>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading && !!balance}
            onRefresh={() => void refresh()}
            tintColor={GLASS.primary}
          />
        }
      >
        {loading && !balance ? (
          <ActivityIndicator
            color={GLASS.primary}
            style={{ marginTop: 40 }}
          />
        ) : (
          <>
            <LinearGradient
              colors={[...GLASS.buttonGradient]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.heroOrb} />
              <View style={styles.heroTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.balanceLabel}>Available balance</Text>
                  <Text style={styles.balanceAmount}>
                    {balance?.displayTotalBalance || formatRs(available)}
                  </Text>
                  <Text style={styles.escrowLine}>
                    Escrow held ·{' '}
                    {balance?.displayEscrowBalance || formatRs(escrow)}
                  </Text>
                </View>
                <View style={styles.walletIcon}>
                  <MaterialCommunityIcons
                    name="wallet-outline"
                    size={24}
                    color="#FDE68A"
                  />
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.88}
                style={styles.withdrawBtn}
                onPress={() => navigateHomeStack('WithdrawMoneyScreen')}
              >
                <MaterialCommunityIcons
                  name="cash-fast"
                  size={18}
                  color={GLASS.primary}
                />
                <Text style={styles.withdrawText}>Withdraw</Text>
              </TouchableOpacity>
            </LinearGradient>

            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={() => void refresh()}>
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <View style={styles.statsRow}>
              <View style={[styles.statCard, styles.statEscrow]}>
                <View style={[styles.statIcon, { backgroundColor: '#FFF7ED' }]}>
                  <MaterialCommunityIcons
                    name="shield-check-outline"
                    size={18}
                    color={GLASS.warning}
                  />
                </View>
                <Text style={styles.statLabel}>In escrow</Text>
                <Text style={styles.statValue} numberOfLines={1}>
                  {formatRs(escrow)}
                </Text>
                <Text style={styles.statHint}>Ongoing sessions</Text>
              </View>

              <View style={[styles.statCard, styles.statAvailable]}>
                <View style={[styles.statIcon, { backgroundColor: '#ECFDF3' }]}>
                  <MaterialCommunityIcons
                    name="trending-up"
                    size={18}
                    color={GLASS.success}
                  />
                </View>
                <Text style={styles.statLabel}>Ready to withdraw</Text>
                <Text style={styles.statValue} numberOfLines={1}>
                  {formatRs(available)}
                </Text>
                <Text style={styles.statHint}>Released after class</Text>
              </View>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.actionChip}
                activeOpacity={0.85}
                onPress={() => navigateHomeStack('EarningAnalyticsScreen')}
              >
                <MaterialCommunityIcons
                  name="chart-line"
                  size={18}
                  color={GLASS.primary}
                />
                <Text style={styles.actionChipText}>Analytics</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionChip}
                activeOpacity={0.85}
                onPress={() => navigateHomeStack('TransactionHistoryScreen')}
              >
                <MaterialCommunityIcons
                  name="history"
                  size={18}
                  color={GLASS.primary}
                />
                <Text style={styles.actionChipText}>History</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent transactions</Text>
              <TouchableOpacity
                onPress={() => navigateHomeStack('TransactionHistoryScreen')}
              >
                <Text style={styles.viewAll}>View all</Text>
              </TouchableOpacity>
            </View>

            {recent.length === 0 ? (
              <View style={styles.emptyCard}>
                <MaterialCommunityIcons
                  name="receipt-text-outline"
                  size={28}
                  color={GLASS.textMuted}
                />
                <Text style={styles.emptyTitle}>No transactions yet</Text>
                <Text style={styles.emptySub}>
                  Completed sessions and withdrawals will show up here.
                </Text>
              </View>
            ) : (
              recent.map(txn => {
                const credit = isCredit(txn);
                const amount = Math.abs(Number(txn.amount) || 0);
                return (
                  <View key={txn._id || txn.transactionId} style={styles.txnRow}>
                    <View
                      style={[
                        styles.txnIcon,
                        {
                          backgroundColor: credit ? '#ECFDF3' : '#EEF2FF',
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={credit ? 'trending-up' : 'cash-minus'}
                        size={18}
                        color={credit ? GLASS.success : GLASS.primary}
                      />
                    </View>
                    <View style={styles.txnBody}>
                      <Text style={styles.txnTitle} numberOfLines={1}>
                        {txn.title || (credit ? 'Session payout' : 'Withdrawal')}
                      </Text>
                      <Text style={styles.txnMeta} numberOfLines={1}>
                        {txn.recipientName ||
                          txn.phoneNumber ||
                          formatTxnDate(txn.createdAt)}
                      </Text>
                    </View>
                    <View style={styles.txnRight}>
                      <Text
                        style={[
                          styles.txnAmount,
                          { color: credit ? GLASS.success : GLASS.primaryDeep },
                        ]}
                      >
                        {credit ? '+' : '-'}
                        {formatRs(amount)}
                      </Text>
                      <Text style={styles.txnDate}>
                        {formatTxnDate(txn.createdAt)}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </>
        )}
      </ScrollView>
    </GlassScreen>
  );
}

const createStyles = (resp: {
  dx: (n: number) => number;
  dy: (n: number) => number;
}) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      // Match GlassScreen bg — no nested white header strip
      backgroundColor: 'transparent',
      paddingHorizontal: resp.dx(4),
      paddingBottom: resp.dy(4),
    },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: {
      color: GLASS.textPrimary,
      fontSize: 17,
      fontWeight: '800',
    },
    headerSub: {
      color: GLASS.textSecondary,
      fontSize: 12,
      fontWeight: '600',
      marginTop: 2,
    },
    content: {
      paddingHorizontal: resp.dx(20),
      paddingBottom: resp.dy(40),
      paddingTop: resp.dy(8),
    },
    heroCard: {
      borderRadius: GLASS.radius.xxl,
      padding: resp.dy(18),
      overflow: 'hidden',
      ...GLASS.shadow.medium,
    },
    heroOrb: {
      position: 'absolute',
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: 'rgba(255,255,255,0.1)',
      top: -40,
      right: -20,
    },
    heroTop: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    balanceLabel: {
      color: 'rgba(255,255,255,0.78)',
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 6,
    },
    balanceAmount: {
      color: '#fff',
      fontSize: 34,
      fontWeight: '800',
    },
    escrowLine: {
      color: '#BBF7D0',
      fontSize: 13,
      fontWeight: '600',
      marginTop: 6,
    },
    walletIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: 'rgba(255,255,255,0.14)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.18)',
    },
    withdrawBtn: {
      marginTop: 18,
      height: 48,
      borderRadius: 14,
      backgroundColor: 'rgba(255,255,255,0.94)',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    withdrawText: {
      color: GLASS.primary,
      fontSize: 15,
      fontWeight: '800',
    },
    errorBanner: {
      marginTop: 14,
      borderRadius: GLASS.radius.lg,
      borderWidth: 1,
      borderColor: 'rgba(239,68,68,0.25)',
      backgroundColor: 'rgba(254,226,226,0.55)',
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    errorText: {
      flex: 1,
      color: GLASS.error,
      fontSize: 13,
      fontWeight: '600',
    },
    retryText: { color: GLASS.primary, fontWeight: '800', fontSize: 13 },
    statsRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 16,
    },
    statCard: {
      flex: 1,
      borderRadius: GLASS.radius.lg,
      padding: 14,
      borderWidth: 1,
    },
    statEscrow: {
      backgroundColor: 'rgba(255,247,237,0.7)',
      borderColor: 'rgba(251,146,60,0.28)',
    },
    statAvailable: {
      backgroundColor: 'rgba(236,253,245,0.7)',
      borderColor: 'rgba(34,197,94,0.25)',
    },
    statIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    statLabel: {
      color: GLASS.textSecondary,
      fontSize: 12,
      fontWeight: '700',
    },
    statValue: {
      color: GLASS.textPrimary,
      fontSize: 18,
      fontWeight: '800',
      marginTop: 6,
    },
    statHint: {
      color: GLASS.textMuted,
      fontSize: 11,
      fontWeight: '600',
      marginTop: 6,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 14,
    },
    actionChip: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      height: 44,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      backgroundColor: 'rgba(237,233,254,0.45)',
    },
    actionChipText: {
      color: GLASS.primary,
      fontWeight: '800',
      fontSize: 13,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 22,
      marginBottom: 12,
    },
    sectionTitle: {
      color: GLASS.textPrimary,
      fontSize: 17,
      fontWeight: '800',
    },
    viewAll: {
      color: GLASS.primary,
      fontSize: 13,
      fontWeight: '700',
    },
    emptyCard: {
      alignItems: 'center',
      paddingVertical: 28,
      paddingHorizontal: 16,
      borderRadius: GLASS.radius.xl,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      backgroundColor: 'rgba(237,233,254,0.28)',
    },
    emptyTitle: {
      marginTop: 10,
      color: GLASS.textPrimary,
      fontWeight: '800',
      fontSize: 15,
    },
    emptySub: {
      marginTop: 6,
      color: GLASS.textMuted,
      fontSize: 13,
      textAlign: 'center',
      lineHeight: 18,
    },
    txnRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(117,72,245,0.08)',
      gap: 12,
    },
    txnIcon: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    txnBody: { flex: 1, minWidth: 0 },
    txnTitle: {
      color: GLASS.textPrimary,
      fontSize: 14,
      fontWeight: '700',
    },
    txnMeta: {
      color: GLASS.textSecondary,
      fontSize: 12,
      marginTop: 3,
    },
    txnRight: { alignItems: 'flex-end' },
    txnAmount: { fontSize: 14, fontWeight: '800' },
    txnDate: {
      color: GLASS.textMuted,
      fontSize: 11,
      marginTop: 4,
      fontWeight: '600',
    },
  });
