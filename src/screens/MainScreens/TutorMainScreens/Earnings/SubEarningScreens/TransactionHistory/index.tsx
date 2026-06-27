import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import useUi from '../../../../../../hooks/ui/useUi';
import EarningHeader from '../../../../../../components/EarningHeader';
import CustomInput from '../../../../../../components/CustomInput/CustomInput';

const transactions = [
  {
    id: '1',
    title: 'Session Completed',
    type: 'earning',
    name: 'Ahmed Raza',
    amount: '+Rs. 2,000',
    date: 'Jun 6, 2026 - 3:00 PM',
    status: 'Completed',
    icon: 'trending-up',
    statusColor: '#16A34A',
  },
  {
    id: '2',
    title: 'Withdrawn to JazzCash',
    type: 'withdrawal',
    name: '',
    amount: '-Rs. 15,000',
    date: 'Jun 5, 2026 - 10:30 AM',
    status: 'Processing',
    icon: 'download',
    statusColor: '#2563EB',
  },
  {
    id: '2',
    title: 'Withdrawn to JazzCash',
    name: '',
    amount: '-Rs. 15,000',
    date: 'Jun 5, 2026 - 10:30 AM',
    status: 'Processing',
    icon: 'download',
    statusColor: '#2563EB',
  },
];

const TransactionHistoryScreen = () => {
  const { colors, resp } = useUi();
  const navigation = useNavigation<any>();
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  return (
    <SafeAreaView style={[styles.container]}>
      <EarningHeader
        navigation={navigation}
        title="Transaction History"
        subtitle="All your earnings and withdrawals"
        rightIcon="filter-variant"
        onRightPress={() => setShowFilters(prev => !prev)}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <CustomInput placeholder="Search transactions..." />

        {showFilters && (
          <View style={styles.filterTabs}>
            {['All', 'Earnings', 'Withdrawals'].map(tab => {
              const isActive = activeFilter === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  activeOpacity={0.8}
                  onPress={() => setActiveFilter(tab)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isActive
                        ? colors.PRIMARY_COLOR
                        : colors.WHITE_COLOR,
                      borderColor: isActive
                        ? colors.PRIMARY_COLOR
                        : colors.GRAY_COLOR,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: isActive
                        ? colors.WHITE_COLOR
                        : colors.SECONDARY_COLOR,
                      fontWeight: '700',
                    }}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={styles.summaryRow}>
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: '#ECFDF5', borderColor: '#C6F6D5' },
            ]}
          >
            <Text
              style={[styles.summaryTitle, { color: colors.SECONDARY_COLOR }]}
            >
              Total Earnings
            </Text>
            <Text style={[styles.summaryAmount, { color: colors.BLACK_COLOR }]}>
              Rs. 12,000
            </Text>
          </View>

          <View
            style={[
              styles.summaryCard,
              { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' },
            ]}
          >
            <Text
              style={[styles.summaryTitle, { color: colors.SECONDARY_COLOR }]}
            >
              Total Withdrawals
            </Text>
            <Text style={[styles.summaryAmount, { color: colors.BLACK_COLOR }]}>
              Rs. 25,000
            </Text>
          </View>
        </View>

        <Text style={[styles.resultsText, { color: colors.SECONDARY_COLOR }]}>
          8 transactions found
        </Text>

        {transactions.map(item => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('HomeNavigator', {
                screen:
                  item.type === 'earning'
                    ? 'TransactionCompleted'
                    : 'TransactionProcessing',
              })
            }
            style={[styles.transactionCard, { borderColor: colors.GRAY_COLOR }]}
          >
            <View style={styles.transactionRow}>
              <View
                style={[
                  styles.iconWrapper,
                  {
                    backgroundColor:
                      item.icon === 'trending-up' ? '#ECFDF5' : '#EFF6FF',
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  size={resp.df(20)}
                  color={item.icon === 'trending-up' ? '#16A34A' : '#2563EB'}
                />
              </View>

              <View style={styles.transactionBody}>
                <Text
                  style={[
                    styles.transactionTitle,
                    { color: colors.BLACK_COLOR },
                  ]}
                >
                  {item.title}
                </Text>
                {item.name ? (
                  <Text
                    style={[
                      styles.transactionName,
                      { color: colors.SECONDARY_COLOR },
                    ]}
                  >
                    {item.name}
                  </Text>
                ) : null}
                <Text
                  style={[
                    styles.transactionDate,
                    { color: colors.SECONDARY_COLOR },
                  ]}
                >
                  {item.date}
                </Text>
              </View>

              <View style={styles.transactionMeta}>
                <Text
                  style={[
                    styles.transactionAmount,
                    {
                      color:
                        item.status === 'Completed' ? '#16A34A' : '#2563EB',
                    },
                  ]}
                >
                  {item.amount}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      borderColor:
                        item.status === 'Completed' ? '#DCFCE7' : '#DBEAFE',
                      backgroundColor:
                        item.status === 'Completed' ? '#DCFCE7' : '#DBEAFE',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          item.status === 'Completed' ? '#15803D' : '#2563EB',
                      },
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TransactionHistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  summaryCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
  },
  resultsText: {
    marginTop: 10,
    fontSize: 13,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  transactionCard: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionBody: {
    flex: 1,
    marginLeft: 12,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  transactionName: {
    fontSize: 13,
    marginTop: 4,
  },
  transactionDate: {
    fontSize: 12,
    marginTop: 6,
  },
  transactionMeta: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
  statusBadge: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
