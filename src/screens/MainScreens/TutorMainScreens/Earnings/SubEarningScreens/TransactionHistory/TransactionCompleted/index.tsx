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
import { GlassScreen } from '../../../../../../../components/Glass';
import { GLASS } from '../../../../../../../theme/glass';
import { useNavigation } from '@react-navigation/native';

const TransactionCompleted = () => {
  const { colors, resp, appStyles } = useUi();
  const navigation = useNavigation<any>();

  const handleDownload = () => {
    // placeholder: implement actual download/export logic
    console.log('Download tapped');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Transaction TXN0000000001 - +Rs. 2,000 (Session Completed)',
        title: 'Transaction Details',
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <GlassScreen scroll={false}>
      <EarningHeader
        navigation={navigation}
        title="Transaction Details"
        subtitle="TXN0000000001"
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View
          style={[
            styles.topCard,
            {
              backgroundColor: '#f5fcf9',
              borderColor: '#A7F3D0',
            },
          ]}
        >
          {/* Top Row */}
          <View style={styles.topHeader}>
            <View style={styles.checkCircle}>
              <MaterialCommunityIcons
                name="checkbox-marked-circle-outline"
                size={22}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.completedBadge}>
              <Text style={styles.badgeText}>Completed</Text>
            </View>
          </View>

          {/* Amount */}
          <Text style={styles.amountText}>+Rs. 2,000</Text>

          {/* Description */}
          <Text style={styles.smallText}>Session Completed</Text>
        </View>
        <View
          style={[styles.infoCard, { borderColor: colors.PRIMARY_GRAY_COLOR }]}
        >
          <Text style={[styles.cardTitle, { color: colors.SECONDARY_COLOR }]}>
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
                Jun 6, 2026 • 3:00 PM
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
                Earning
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
                Student Payment
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="account"
              size={resp.df(18)}
              color={colors.PRIMARY_COLOR}
            />
            <View style={styles.infoBody}>
              <Text
                style={[styles.infoLabel, { color: colors.SECONDARY_COLOR }]}
              >
                Student Name
              </Text>
              <Text style={[styles.infoValue, { color: colors.BLACK_COLOR }]}>
                Ahmed Raza
              </Text>
            </View>
          </View>
        </View>

        <View style={{ gap: resp.dy(12) }}>
          {/* Session Details */}
          <View
            style={[
              styles.smallCard,
              {
                borderColor: colors.PRIMARY_GRAY_COLOR,
                width: '100%',
              },
            ]}
          >
            <Text style={[styles.cardTitle, { color: colors.SECONDARY_COLOR }]}>
              Session Details
            </Text>

            <View style={styles.kvRow}>
              <Text style={[styles.kKey, { color: colors.SECONDARY_COLOR }]}>
                Subject
              </Text>
              <Text style={[styles.kVal, { color: colors.BLACK_COLOR }]}>
                Mathematics
              </Text>
            </View>

            <View style={styles.kvRow}>
              <Text style={[styles.kKey, { color: colors.SECONDARY_COLOR }]}>
                Level
              </Text>
              <Text style={[styles.kVal, { color: colors.BLACK_COLOR }]}>
                O Level
              </Text>
            </View>

            <View style={styles.kvRow}>
              <Text style={[styles.kKey, { color: colors.SECONDARY_COLOR }]}>
                Duration
              </Text>
              <Text style={[styles.kVal, { color: colors.BLACK_COLOR }]}>
                2 hours
              </Text>
            </View>
          </View>

          {/* Amount Breakdown */}
          <View
            style={[
              styles.smallCard,
              {
                borderColor: colors.PRIMARY_GRAY_COLOR,
                width: '100%',
              },
            ]}
          >
            <Text style={[styles.cardTitle, { color: colors.SECONDARY_COLOR }]}>
              Amount Breakdown
            </Text>

            <View style={styles.kvRow}>
              <Text style={[styles.kKey, { color: colors.SECONDARY_COLOR }]}>
                Session Amount
              </Text>
              <Text style={[styles.kVal, { color: colors.BLACK_COLOR }]}>
                Rs. 2,000
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.leftButton, { borderColor: colors.GRAY_COLOR }]}
            onPress={handleDownload}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="download"
              size={resp.df(18)}
              color={colors.SECONDARY_COLOR}
            />
            <Text
              style={[styles.leftButtonText, { color: colors.SECONDARY_COLOR }]}
            >
              Download
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.rightButton,
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
              style={[styles.rightButtonText, { color: colors.WHITE_COLOR }]}
            >
              Share
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.txnId, { color: colors.SECONDARY_COLOR }]}>
          Transaction ID{'\n'}TXN0000000001
        </Text>
      </ScrollView>
    </GlassScreen>
  );
};

export default TransactionCompleted;

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 32,
    gap: 18,
  },
  topCard: {
    borderWidth: 1,
    borderRadius: GLASS.radius.lg,
    padding: 18,
    backgroundColor: GLASS.cardBg,
    borderColor: GLASS.cardBorder,
    ...GLASS.shadow.soft,
  },

  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  checkCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#2fc776',
    justifyContent: 'center',
    alignItems: 'center',
  },

  completedBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },

  badgeText: {
    color: '#29a757',
    fontSize: 13,
    fontWeight: '700',
  },

  amountText: {
    color: '#047857',
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 6,
  },

  smallText: {
    color: '#4B5563',
    fontSize: 14,
  },

  infoCard: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: GLASS.radius.lg,
    padding: 14,
    backgroundColor: GLASS.cardBg,
    borderColor: GLASS.cardBorder,
    ...GLASS.shadow.soft,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  infoBody: {
    marginLeft: 6,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  infoValue: {
    fontSize: 14,
    marginTop: 4,
  },
  gridRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  smallCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: GLASS.radius.lg,
    padding: 12,
    backgroundColor: GLASS.cardBg,
    borderColor: GLASS.cardBorder,
    ...GLASS.shadow.soft,
  },
  kvRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  kKey: {
    fontSize: 12,
    fontWeight: '700',
  },
  kVal: {
    fontSize: 14,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
    alignItems: 'center',
  },
  leftButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  leftButtonText: {
    fontWeight: '700',
  },
  rightButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  rightButtonText: {
    fontWeight: '700',
  },
  txnId: {
    textAlign: 'center',
    marginTop: 18,
    fontSize: 12,
  },
});
