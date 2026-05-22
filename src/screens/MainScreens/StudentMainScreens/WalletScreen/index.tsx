import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useUi from '../../../../hooks/ui/useUi';

import WalletCard from '../../../../components/WalletCard';
import EscrowCard from '../../../../components/EscrowCard';
import TransactionCard from '../../../../components/TransactionCard/TransactionCard';

export default function WalletScreen() {
  const { colors, resp } = useUi();
  const styles = createStyles({ colors, resp });

  const walletData = { balance: 5000 };

  const escrowData = {
    amount: 1500,
    description: 'Funds are held securely until session completion',
  };

  const transactions = [
    {
      id: 1,
      type: 'deposit',
      title: 'Deposit via JazzCash',
      amount: '+Rs. 3,000',
      time: 'Today • 2:30 PM',
      method: 'JazzCash',
    },
    {
      id: 2,
      type: 'payment',
      title: 'Payment to Dr. Sarah Ahmed',
      amount: '-Rs. 1,500',
      time: 'Today • 11:00 AM',
      method: 'JazzCash',
    },
    {
      id: 2,
      type: 'payment',
      title: 'Payment to Dr. Sarah Ahmed',
      amount: '-Rs. 1,500',
      time: 'Today • 11:00 AM',
      method: 'JazzCash',
    },
    {
      id: 2,
      type: 'payment',
      title: 'Payment to Dr. Sarah Ahmed',
      amount: '-Rs. 1,500',
      time: 'Today • 11:00 AM',
      method: 'JazzCash',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Text style={styles.heading}>Wallet</Text>

        <WalletCard
          balance={walletData.balance}
          onDeposit={() => {}}
        />

        <EscrowCard
          amount={escrowData.amount}
          description={escrowData.description}
        />
      </View>

      {/* 🔥 Bottom Sheet Section */}
      <View style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.transactionHeader}>
          <Text style={styles.transactionTitle}>
            Recent Transactions
          </Text>

          <TouchableOpacity>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={transactions}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TransactionCard item={item} />
          )}
        />
      </View>
    </View>
  );
}
const createStyles = ({ colors, resp }: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#243867',
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

      // 3D sheet shadow
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
  });