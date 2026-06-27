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
import useUi from '../../../../hooks/ui/useUi';
import WalletCard from '../../../../components/WalletCard';
import EscrowCard from '../../../../components/EscrowCard';
import TransactionCard from '../../../../components/TransactionCard/TransactionCard';
import CustomInput from '../../../../components/CustomInput/CustomInput';
import CustomButton from '../../../../components/CustomButton';
import { useWallet } from '../../../../hooks/api/useWallet';
import { formatTransactionForCard } from '../../../../utils/api/bookingHelpers';

export default function WalletScreen() {
  const { colors, resp } = useUi();
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
      Alert.alert('Invalid phone number', 'Phone number must be exactly 11 digits.');
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
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.WHITE_COLOR} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Text style={styles.heading}>Wallet</Text>

        <WalletCard
          balance={balance?.totalBalance ?? 0}
          onDeposit={() => setDepositVisible(true)}
        />

        <EscrowCard
          amount={balance?.escrowBalance ?? 0}
          description="Funds are held securely until session completion"
        />
      </View>

      <View style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.transactionHeader}>
          <Text style={styles.transactionTitle}>Recent Transactions</Text>

          <TouchableOpacity onPress={refresh}>
            <Text style={styles.viewAll}>Refresh</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={transactionItems}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No transactions yet.</Text>
          }
          renderItem={({ item }) => <TransactionCard item={item} />}
        />
      </View>

      <Modal visible={depositVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Deposit Money</Text>

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
                    {method}
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
    </View>
  );
}

const createStyles = ({ colors, resp }: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#243867',
    },
    centered: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    topSection: {
      paddingHorizontal: resp.dx(16),
      paddingTop: resp.dy(10),
    },
    heading: {
      color: colors.white,
      fontSize: resp.df(24),
      fontWeight: '700',
      marginBottom: resp.dy(16),
    },
    sheet: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      marginTop: resp.dy(20),
      borderTopLeftRadius: resp.dx(28),
      borderTopRightRadius: resp.dx(28),
      paddingHorizontal: resp.dx(16),
      paddingTop: resp.dy(10),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -6 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 10,
    },
    handle: {
      width: resp.dx(40),
      height: resp.dy(4),
      backgroundColor: '#CBD5E1',
      borderRadius: resp.dx(20),
      alignSelf: 'center',
      marginBottom: resp.dy(10),
    },
    transactionHeader: {
      marginBottom: resp.dy(12),
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    transactionTitle: {
      color: '#0F172A',
      fontSize: resp.df(16),
      fontWeight: '700',
    },
    viewAll: {
      color: '#4D6FFF',
      fontSize: resp.df(13),
      fontWeight: '600',
    },
    listContent: {
      paddingBottom: resp.dy(20),
    },
    emptyText: {
      textAlign: 'center',
      color: '#94A3B8',
      marginTop: resp.dy(20),
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'flex-end',
    },
    modalCard: {
      backgroundColor: '#fff',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
      gap: 12,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 8,
    },
    methodRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 8,
    },
    methodChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: '#F1F5F9',
    },
    methodChipActive: {
      backgroundColor: '#DBEAFE',
    },
    methodText: {
      textTransform: 'capitalize',
      color: '#64748B',
      fontWeight: '600',
    },
    methodTextActive: {
      color: '#1D4ED8',
    },
    cancelBtn: {
      alignItems: 'center',
      paddingVertical: 10,
    },
    cancelText: {
      color: '#64748B',
      fontWeight: '600',
    },
  });
