import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import useUi from '../../../../hooks/ui/useUi';
import { GlassScreen } from '../../../../components/Glass';
import { GLASS } from '../../../../theme/glass';
import { ProfileSubHeader } from '../../../../components/Profile';
import WalletCard from '../../../../components/WalletCard';
import EscrowCard from '../../../../components/EscrowCard';
import TransactionCard from '../../../../components/TransactionCard/TransactionCard';
import CustomInput from '../../../../components/CustomInput/CustomInput';
import CustomButton from '../../../../components/CustomButton';
import { useWallet } from '../../../../hooks/api/useWallet';
import { formatTransactionForCard } from '../../../../utils/api/bookingHelpers';

export default function WalletScreen() {
  const { colors, resp } = useUi();
  const navigation = useNavigation<any>();
  const styles = createStyles({ colors, resp });
  const { balance, transactions, loading, depositing, error, deposit, refresh } =
    useWallet();
  const [depositVisible, setDepositVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'jazzcash' | 'easypaisa'>(
    'jazzcash'
  );

  const transactionItems = useMemo(
    () => transactions.map(item => formatTransactionForCard(item)),
    [transactions]
  );

  const handleDeposit = async () => {
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert('Invalid amount', 'Please enter an amount greater than 0.');
      return;
    }

    if (!/^\d{11}$/.test(phoneNumber)) {
      Alert.alert(
        'Invalid phone number',
        'Phone number must be exactly 11 digits.'
      );
      return;
    }

    const success = await deposit({
      amount: parsedAmount,
      paymentMethod,
      phoneNumber,
    });

    if (success) {
      setDepositVisible(false);
      setAmount('');
      setPhoneNumber('');
      Alert.alert('Success', 'Deposit completed successfully.');
    } else if (error) {
      Alert.alert('Deposit failed', error);
    }
  };

  if (loading && !balance) {
    return (
      <GlassScreen
        scroll={false}
        contentStyle={[styles.container, styles.centered]}
      >
        <ActivityIndicator size="large" color={GLASS.primary} />
      </GlassScreen>
    );
  }

  return (
    <GlassScreen scroll={false} contentStyle={styles.container}>
      <ProfileSubHeader navigation={navigation} title="Wallet" />

      <View style={styles.topSection}>
        <Text style={styles.subtitle}>
          Manage deposits, escrow holds, and recent activity
        </Text>

        <WalletCard
          balance={balance?.totalBalance ?? 0}
          onDeposit={() => setDepositVisible(true)}
        />

        <EscrowCard
          amount={balance?.escrowBalance ?? 0}
          description="Funds stay locked safely until your session is completed."
        />
      </View>

      <View style={styles.sheet}>
        <View style={styles.transactionHeader}>
          <View>
            <Text style={styles.transactionTitle}>Recent Transactions</Text>
            <Text style={styles.transactionHint}>
              {transactionItems.length} recorded
            </Text>
          </View>

          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={refresh}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons
              name="refresh"
              size={16}
              color={GLASS.primary}
            />
            <Text style={styles.viewAll}>Refresh</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={transactionItems}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIcon}>
                <MaterialCommunityIcons
                  name="receipt-text-outline"
                  size={28}
                  color={GLASS.primary}
                />
              </View>
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySub}>
                Deposits and session payments will show up here.
              </Text>
            </View>
          }
          renderItem={({ item }) => <TransactionCard item={item} />}
        />
      </View>

      <Modal visible={depositVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.sheetHandle} />
            <Text style={styles.modalTitle}>Deposit Money</Text>
            <Text style={styles.modalSub}>
              Add funds using JazzCash or Easypaisa
            </Text>

            <CustomInput
              label="Amount (PKR)"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="1000"
            />

            <CustomInput
              label="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              placeholder="03001234567"
            />

            <View style={styles.methodRow}>
              {(['jazzcash', 'easypaisa'] as const).map(method => (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.methodChip,
                    paymentMethod === method && styles.methodChipActive,
                  ]}
                  onPress={() => setPaymentMethod(method)}
                >
                  <Text
                    style={[
                      styles.methodText,
                      paymentMethod === method && styles.methodTextActive,
                    ]}
                  >
                    {method === 'jazzcash' ? 'JazzCash' : 'Easypaisa'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <CustomButton
              title={depositing ? 'Processing...' : 'Deposit'}
              onPress={handleDeposit}
              disabled={depositing}
            />

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setDepositVisible(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </GlassScreen>
  );
}

const createStyles = ({ colors, resp }: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    centered: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    topSection: {
      paddingHorizontal: resp.dx(16),
      paddingTop: resp.dy(4),
    },
    subtitle: {
      color: GLASS.textSecondary,
      fontSize: resp.df(13),
      marginBottom: resp.dy(14),
      lineHeight: 18,
    },
    sheet: {
      flex: 1,
      marginTop: resp.dy(18),
      marginHorizontal: resp.dx(16),
      marginBottom: resp.dy(12),
      backgroundColor: '#FFFFFF',
      borderRadius: GLASS.radius.xxl,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      paddingHorizontal: resp.dx(14),
      paddingTop: resp.dy(14),
      ...GLASS.shadow.soft,
    },
    transactionHeader: {
      marginBottom: resp.dy(12),
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    transactionTitle: {
      color: GLASS.textPrimary,
      fontSize: resp.df(16),
      fontWeight: '800',
    },
    transactionHint: {
      color: GLASS.textMuted,
      fontSize: resp.df(11),
      marginTop: 2,
    },
    refreshBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: GLASS.primarySoft,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
    },
    viewAll: {
      color: GLASS.primary,
      fontSize: resp.df(12),
      fontWeight: '700',
    },
    listContent: {
      paddingBottom: resp.dy(20),
      flexGrow: 1,
    },
    emptyWrap: {
      alignItems: 'center',
      paddingVertical: resp.dy(36),
      paddingHorizontal: 20,
    },
    emptyIcon: {
      width: 56,
      height: 56,
      borderRadius: 18,
      backgroundColor: GLASS.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    emptyText: {
      textAlign: 'center',
      color: GLASS.textPrimary,
      fontWeight: '700',
      fontSize: resp.df(15),
    },
    emptySub: {
      textAlign: 'center',
      color: GLASS.textMuted,
      fontSize: resp.df(12),
      marginTop: 6,
      lineHeight: 18,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(15,23,42,0.45)',
      justifyContent: 'flex-end',
    },
    modalCard: {
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: GLASS.radius.xxl,
      borderTopRightRadius: GLASS.radius.xxl,
      padding: 20,
      gap: 12,
    },
    sheetHandle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: GLASS.inputBorder,
      marginBottom: 4,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: GLASS.textPrimary,
    },
    modalSub: {
      color: GLASS.textSecondary,
      fontSize: 13,
      marginBottom: 4,
    },
    methodRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 8,
    },
    methodChip: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: GLASS.radius.md,
      backgroundColor: GLASS.primarySoft,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      alignItems: 'center',
    },
    methodChipActive: {
      backgroundColor: GLASS.primary,
      borderColor: GLASS.primary,
    },
    methodText: {
      color: GLASS.textSecondary,
      fontWeight: '700',
    },
    methodTextActive: {
      color: '#FFFFFF',
    },
    cancelBtn: {
      alignItems: 'center',
      paddingVertical: 10,
    },
    cancelText: {
      color: GLASS.textSecondary,
      fontWeight: '600',
    },
  });
