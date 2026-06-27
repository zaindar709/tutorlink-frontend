import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import useUi from '../../../../../../../hooks/ui/useUi';
import EarningHeader from '../../../../../../../components/EarningHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const TransactionProcessing = () => {
  const { colors, resp, appStyles } = useUi();
  const navigation = useNavigation<any>();

  const handleDownload = () => {
    console.log('Download tapped');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: 'Transaction Details',
        message: 'Transaction TXN0000000002 - Rs. 15,000 Withdrawn to JazzCash',
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SafeAreaView style={[styles.container]}>
      <EarningHeader
        navigation={navigation}
        title="Transaction Details"
        subtitle="TXN0000000001"
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View
          style={[styles.topCard, { borderColor: colors.PRIMARY_GRAY_COLOR }]}
        >
          <View style={styles.headerRow}>
            <View style={[styles.iconCircle, { backgroundColor: '#76b3e6' }]}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={resp.df(26)}
                color={colors.WHITE_COLOR}
              />
            </View>
            <View style={styles.titleGroup}>
              <Text style={[styles.amountText, { color: '#1B3D8D' }]}>
                - Rs. 15,000
              </Text>
              <Text
                style={[styles.subtitleText, { color: colors.SECONDARY_COLOR }]}
              >
                Withdrawn to JazzCash
              </Text>
            </View>
            <View style={styles.statusBadge}>
              <Text
                style={[styles.statusText, { color: colors.PRIMARY_COLOR }]}
              >
                Processing
              </Text>
            </View>
          </View>
        </View>

        <View
          style={[styles.infoCard, { borderColor: colors.PRIMARY_GRAY_COLOR }]}
        >
          <Text
            style={[styles.sectionTitle, { color: colors.SECONDARY_COLOR }]}
          >
            Transaction Information
          </Text>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="calendar"
              size={resp.df(18)}
              color={colors.PRIMARY_COLOR}
            />
            <View style={styles.infoBody}>
              <Text
                style={[styles.infoLabel, { color: colors.SECONDARY_COLOR }]}
              >
                Date & Time
              </Text>
              <Text style={[styles.infoValue, { color: colors.BLACK_COLOR }]}>
                Jun 5, 2026 • 10:30 AM
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="file-document"
              size={resp.df(18)}
              color={colors.PRIMARY_COLOR}
            />
            <View style={styles.infoBody}>
              <Text
                style={[styles.infoLabel, { color: colors.SECONDARY_COLOR }]}
              >
                Transaction Type
              </Text>
              <Text style={[styles.infoValue, { color: colors.BLACK_COLOR }]}>
                Withdrawal
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="currency-usd"
              size={resp.df(18)}
              color={colors.PRIMARY_COLOR}
            />
            <View style={styles.infoBody}>
              <Text
                style={[styles.infoLabel, { color: colors.SECONDARY_COLOR }]}
              >
                Payment Method
              </Text>
              <Text style={[styles.infoValue, { color: colors.BLACK_COLOR }]}>
                JazzCash
              </Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.breakdownCard,
            { borderColor: colors.PRIMARY_GRAY_COLOR },
          ]}
        >
          <Text
            style={[styles.sectionTitle, { color: colors.SECONDARY_COLOR }]}
          >
            Amount Breakdown
          </Text>
          <View style={styles.amountRow}>
            <Text
              style={[styles.amountLabel, { color: colors.SECONDARY_COLOR }]}
            >
              Withdrawal Amount
            </Text>
            <Text style={[styles.amountValue, { color: colors.BLACK_COLOR }]}>
              Rs. 15,000
            </Text>
          </View>
          <View style={styles.amountRow}>
            <Text
              style={[styles.amountLabel, { color: colors.SECONDARY_COLOR }]}
            >
              Platform Fee (10%)
            </Text>
            <Text style={[styles.feeValue]}>- Rs. 1,500</Text>
          </View>
          <View style={[styles.amountRow, styles.netAmountRow]}>
            <Text style={[styles.netLabel, { color: colors.SECONDARY_COLOR }]}>
              Net Amount
            </Text>
            <Text
              style={[
                styles.netValue,
                { color: colors.Green_Color || '#15803D' },
              ]}
            >
              Rs. 13,500
            </Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.GRAY_COLOR }]}
            onPress={handleDownload}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="download"
              size={resp.df(18)}
              color={colors.SECONDARY_COLOR}
            />
            <Text
              style={[
                styles.secondaryButtonText,
                { color: colors.SECONDARY_COLOR },
              ]}
            >
              Download
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: colors.PRIMARY_COLOR },
            ]}
            onPress={handleShare}
            activeOpacity={0.9}
          >
            <MaterialCommunityIcons
              name="share-variant"
              size={resp.df(18)}
              color={colors.WHITE_COLOR}
            />
            <Text
              style={[styles.primaryButtonText, { color: colors.WHITE_COLOR }]}
            >
              Share
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.txnIdText, { color: colors.SECONDARY_COLOR }]}>
          Transaction ID:TXN0000000002
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TransactionProcessing;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 32,
    gap: 18,
  },
  topCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    backgroundColor: '#F8FBFF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleGroup: {
    flex: 1,
  },
  amountText: {
    fontSize: 24,
    fontWeight: '800',
  },
  subtitleText: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    backgroundColor: '#FFFFFF',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  infoCard: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 14,
  },
  infoBody: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  infoValue: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '700',
  },
  breakdownCard: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    backgroundColor: '#FFFFFF',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  amountValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  feeValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EB5757',
  },
  netAmountRow: {
    marginTop: 8,
  },
  netLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  netValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  txnIdText: {
    marginTop: 18,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
  },
});
