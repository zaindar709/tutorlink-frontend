import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import useUi from '../../../../../../hooks/ui/useUi';
import CustomButton from '../../../../../../components/CustomButton';
import CustomInput from '../../../../../../components/CustomInput/CustomInput';
import EarningHeader from '../../../../../../components/EarningHeader';

const PAYMENT_METHODS = [
  {
    id: 'jazzcash',
    name: 'JazzCash',
    number: '0300-1234567',
    icon: 'credit-card-outline',
    bgColor: '#FCE7F3',
  },
  {
    id: 'easypaisa',
    name: 'Easypaisa',
    number: '0321-9876543',
    icon: 'cellphone',
    bgColor: '#ECFDF5',
  },
  {
    id: 'bank',
    name: 'Bank Account',
    number: 'MCB ••••4532',
    icon: 'bank-outline',
    bgColor: '#EFF6FF',
  },
];

const AMOUNT_OPTIONS = ['5000', '10000', '15000', '20000'];

const WithdrawMoneyScreen = () => {
  const { colors, resp } = useUi();
  const navigation = useNavigation<any>();
  const [selectedMethod, setSelectedMethod] = useState('jazzcash');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const numericAmount = Number(amount.replace(/[^0-9]/g, ''));
  const isValidAmount = numericAmount >= 1000;
  const canConfirm = selectedMethod && isValidAmount;

  const handleSelectMethod = (id: string) => {
    setSelectedMethod(id);
  };

  const handleAmountChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setAmount(cleaned);
    if (error && Number(cleaned) >= 1000) {
      setError('');
    }
  };

  const handleQuickAmount = (value: string) => {
    setAmount(value);
    if (error) setError('');
  };

  const handleConfirmWithdrawal = () => {
    if (!isValidAmount) {
      setError('Please enter a valid amount of at least Rs. 1,000');
      return;
    }

    // TODO: wire actual withdraw action here.
    setError('');
  };

  return (
    <SafeAreaView style={[styles.container]}>
      <EarningHeader navigation={navigation} title="Withdraw Earnings" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.balanceCard,
              {
                backgroundColor: colors.WHITE_COLOR,
                shadowColor: colors.BLACK_COLOR,
              },
            ]}
          >
            <View style={styles.balanceText}>
              <Text
                style={[styles.balanceLabel, { color: colors.SECONDARY_COLOR }]}
              >
                Available Balance
              </Text>
              <Text
                style={[styles.balanceAmount, { color: colors.BLACK_COLOR }]}
              >
                Rs. 24,500
              </Text>
            </View>
            <View style={[styles.balanceIcon, { backgroundColor: '#EEF2FF' }]}>
              <MaterialCommunityIcons
                name="wallet"
                size={resp.df(24)}
                color={String(colors.PRIMARY_COLOR)}
              />
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.BLACK_COLOR }]}>
            Select Payment Method
          </Text>
          {PAYMENT_METHODS.map(method => {
            const isSelected = selectedMethod === method.id;
            return (
              <TouchableOpacity
                key={method.id}
                activeOpacity={0.8}
                style={[
                  styles.methodCard,
                  {
                    backgroundColor: isSelected
                      ? '#F8F3FF'
                      : colors.WHITE_COLOR,
                    borderColor: isSelected
                      ? colors.PRIMARY_COLOR
                      : colors.GRAY_COLOR,
                  },
                ]}
                onPress={() => handleSelectMethod(method.id)}
              >
                <View
                  style={[
                    styles.methodIconWrapper,
                    { backgroundColor: method.bgColor },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={method.icon}
                    size={resp.df(22)}
                    color={String(colors.PRIMARY_COLOR)}
                  />
                </View>

                <View style={styles.methodInfo}>
                  <Text
                    style={[styles.methodName, { color: colors.BLACK_COLOR }]}
                  >
                    {method.name}
                  </Text>
                  <Text
                    style={[
                      styles.methodNumber,
                      { color: colors.SECONDARY_COLOR },
                    ]}
                  >
                    {method.number}
                  </Text>
                </View>

                {isSelected && (
                  <MaterialCommunityIcons
                    name="checkbox-marked-circle-outline"
                    size={24}
                    color="#2563EB"
                  />
                )}
              </TouchableOpacity>
            );
          })}

          <Text style={[styles.sectionTitle, { color: colors.BLACK_COLOR }]}>
            Enter Amount
          </Text>
          <CustomInput
            label="Withdrawal Amount"
            value={amount}
            onChangeText={handleAmountChange}
            placeholder="0"
            keyboardType="numeric"
            error={error}
          />

          <View style={styles.amountOptionsRow}>
            {AMOUNT_OPTIONS.map(value => {
              const isActive = amount === value;
              return (
                <TouchableOpacity
                  key={value}
                  activeOpacity={0.8}
                  style={[
                    styles.amountOption,
                    {
                      borderColor: isActive
                        ? colors.PRIMARY_COLOR
                        : colors.GRAY_COLOR,
                      backgroundColor: isActive
                        ? '#F5EEFF'
                        : colors.WHITE_COLOR,
                    },
                  ]}
                  onPress={() => handleQuickAmount(value)}
                >
                  <Text
                    style={[
                      styles.amountOptionText,
                      {
                        color: isActive
                          ? colors.PRIMARY_COLOR
                          : colors.SECONDARY_COLOR,
                      },
                    ]}
                  >
                    Rs. {Number(value) / 1000}k
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View
            style={[
              styles.infoBox,
              { backgroundColor: '#F8FAFF', borderColor: colors.GRAY_COLOR },
            ]}
          >
            <Text style={[styles.infoTitle, { color: colors.BLACK_COLOR }]}>
              Withdrawal Information
            </Text>
            <Text style={[styles.infoText, { color: colors.SECONDARY_COLOR }]}>
              Minimum withdrawal: Rs. 1,000
            </Text>
            <Text style={[styles.infoText, { color: colors.SECONDARY_COLOR }]}>
              Processing time: 24-48 hours
            </Text>
            <Text style={[styles.infoText, { color: colors.SECONDARY_COLOR }]}>
              Platform fee: 10% of withdrawal amount
            </Text>
          </View>

          <CustomButton
            title="Confirm Withdrawal"
            onPress={handleConfirmWithdrawal}
            disabled={!canConfirm}
            style={styles.confirmButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default WithdrawMoneyScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 18,
  },
  balanceCard: {
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 6,
  },
  balanceIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceText: {
    marginLeft: 16,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  methodCard: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodInfo: {
    flex: 1,
    marginLeft: 14,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  methodNumber: {
    fontSize: 13,
    lineHeight: 20,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 999,
  },
  amountOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  amountOption: {
    minWidth: 80,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  amountOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 6,
  },
  confirmButton: {
    marginTop: 10,
    width: '100%',
  },
});
