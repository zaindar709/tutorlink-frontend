import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import useUi from '../../../../hooks/ui/useUi';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const stats = [
  {
    id: '1',
    title: 'In\nEscrow',
    amount: 'Rs. 8,200',
    subtitle: 'From ongoing\nsessions',
    icon: 'clock-outline',
    bg: '#FFF7ED',
    border: '#fcbd76',
    iconBg: '#FB923C',
    iconColor: '#FFFFFF',
    titleColor: '#B45309',
    amountColor: '#92400E',
    subtitleColor: '#D97706',
  },
  {
    id: '2',
    title: 'This\nMonth',
    amount: 'Rs.\n45,300',
    subtitle: 'Total earnings',
    icon: 'trending-up',
    bg: '#ECFDF5',
    border: '#54ffaf',
    iconBg: '#10B981',
    iconColor: '#FFFFFF',
    titleColor: '#047857',
    amountColor: '#065F46',
    subtitleColor: '#10B981',
  },
];

const chartData = [
  { label: 'Week 1', value: 8000 },
  { label: 'Week 2', value: 12500 },
  { label: 'Week 3', value: 15500 },
  { label: 'Week 4', value: 24500 },
];
const transactions = [
  {
    id: '1',
    title: 'Session Completed',
    name: 'Ahmed Raza',
    amount: '+Rs. 2,000',
    date: 'Today, 3:00 PM',
    status: 'Completed',
    icon: 'trending-up',
    iconBg: '#ECFDF5',
    iconColor: '#16A34A',
    amountColor: '#16A34A',
    statusBg: '#DCFCE7',
    statusColor: '#15803D',
    borderColor: '#BBF7D0',
  },

  {
    id: '2',
    title: 'Withdrawn to JazzCash',
    name: '',
    amount: '-Rs. 15,000',
    date: 'Yesterday',
    status: 'Processing',
    icon: 'download',
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
    amountColor: '#2563EB',
    statusBg: '#DBEAFE',
    statusColor: '#2563EB',
    borderColor: '#BFDBFE',
  },
];

const TransactionCard = ({ item, colors, resp }: any) => {
  return (
    <View style={styles(colors, resp).transactionCard}>
      <View style={{ flexDirection: 'row' }}>
        <View
          style={[
            styles(colors, resp).transactionIcon,
            {
              backgroundColor: item.iconBg,
              borderWidth: 1,
              borderColor: item.borderColor,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={item.icon}
            size={18}
            color={item.iconColor}
          />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles(colors, resp).transactionTitle}>
            {item.title}
          </Text>

          {!!item.name && (
            <Text style={styles(colors, resp).transactionName}>
              {item.name}
            </Text>
          )}
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text
            style={[
              styles(colors, resp).transactionAmount,
              { color: item.amountColor },
            ]}
          >
            {item.amount}
          </Text>

          <Text style={styles(colors, resp).transactionDate}>{item.date}</Text>
        </View>
      </View>

      <View
        style={[
          styles(colors, resp).statusBadge,
          {
            backgroundColor: item.statusBg,
            borderColor: item.statusColor + '30',
          },
        ]}
      >
        <MaterialCommunityIcons
          name={
            item.status === 'Completed'
              ? 'check-circle-outline'
              : 'progress-clock'
          }
          size={14}
          color={item.statusColor}
        />

        <Text
          style={[styles(colors, resp).statusText, { color: item.statusColor }]}
        >
          {item.status}
        </Text>
      </View>
    </View>
  );
};

const HeaderCard = ({ colors, resp }: any) => {
  const navigation = useNavigation<any>();
  return (
    <LinearGradient
      colors={['#6366F1', '#8B5CF6', '#A855F7']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles(colors, resp).headerCard}
    >
      {/* Existing Content */}

      <View style={styles(colors, resp).topRow}>
        <View>
          <Text style={styles(colors, resp).balanceLabel}>
            Available Balance
          </Text>

          <Text style={styles(colors, resp).balanceAmount}>Rs. 24,500</Text>

          <Text style={styles(colors, resp).growthText}>
            ↗ +18.2% this month
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles(colors, resp).iconButton}
        >
          <MaterialCommunityIcons name="wallet" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles(colors, resp).bottomRow}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('HomeNavigator', {
              screen: 'WithdrawMoneyScreen',
            })
          }
          activeOpacity={0.8}
          style={styles(colors, resp).withdrawBtn}
        >
          <MaterialCommunityIcons name="phone" size={16} color="#444343" />

          <Text style={styles(colors, resp).withdrawText}>
            Withdraw to JazzCash
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles(colors, resp).eyeBtn}
        >
          <MaterialCommunityIcons name="eye-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const StatCard = ({ item, colors, resp }: any) => {
  return (
    <View
      style={[
        styles(colors, resp).statCard,
        {
          backgroundColor: item.bg,
          borderColor: item.border,
        },
      ]}
    >
      <View
        style={[
          styles(colors, resp).statIcon,
          {
            backgroundColor: item.iconBg,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={item.icon}
          size={18}
          color={item.iconColor}
        />
      </View>

      <Text
        style={[styles(colors, resp).statTitle, { color: item.titleColor }]}
      >
        {item.title}
      </Text>

      <Text
        style={[styles(colors, resp).statAmount, { color: item.amountColor }]}
      >
        {item.amount}
      </Text>

      <Text
        style={[
          styles(colors, resp).statSubtitle,
          { color: item.subtitleColor },
        ]}
      >
        {item.subtitle}
      </Text>
    </View>
  );
};

const EarningsChart = ({ colors, resp }: any) => {
  const maxValue = Math.max(...chartData.map(i => i.value));
  const navigation = useNavigation<any>();

  return (
    <View style={styles(colors, resp).chartContainer}>
      <View style={styles(colors, resp).chartHeader}>
        <Text style={styles(colors, resp).chartTitle}>Earnings Growth</Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('HomeNavigator', {
              screen: 'EarningAnalyticsScreen',
            })
          }
          activeOpacity={0.7}
        >
          <Text style={styles(colors, resp).analyticsText}>
            View Analytics ↗
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles(colors, resp).chartArea}>
        {/* Y Axis */}
        <View style={styles(colors, resp).yAxis}>
          <Text style={styles(colors, resp).axisLabel}>26k</Text>
          <Text style={styles(colors, resp).axisLabel}>19.5k</Text>
          <Text style={styles(colors, resp).axisLabel}>13k</Text>
          <Text style={styles(colors, resp).axisLabel}>6.5k</Text>
          <Text style={styles(colors, resp).axisLabel}>0k</Text>
        </View>

        {/* Graph */}
        <View style={styles(colors, resp).graphWrapper}>
          {/* Grid */}
          {[1, 2, 3, 4].map(item => (
            <View key={item} style={styles(colors, resp).horizontalLine} />
          ))}

          {/* Graph Line */}
          <View style={styles(colors, resp).lineContainer}>
            {chartData.map((item, index) => {
              const height = (item.value / maxValue) * 140;

              return (
                <View
                  key={item.label}
                  style={styles(colors, resp).pointWrapper}
                >
                  <View
                    style={[
                      styles(colors, resp).lineBar,
                      {
                        height,
                      },
                    ]}
                  />

                  <View style={styles(colors, resp).dot} />

                  <Text style={styles(colors, resp).weekLabel}>
                    {item.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
};

export default function TutorEarningsScreen() {
  const { colors, resp } = useUi();
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles(colors, resp).container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles(colors, resp).content}
      >
        <View style={styles(colors, resp).headerText}>
          <Text style={{ color: '#030303', fontSize: 24, fontWeight: 600 }}>
            Earnings
          </Text>
          <Text style={{ color: '#818181' }}>
            Track your Incomes and withdrawals
          </Text>
        </View>
        <HeaderCard colors={colors} resp={resp} />

        <View style={styles(colors, resp).statsRow}>
          {stats.map(item => (
            <StatCard key={item.id} item={item} colors={colors} resp={resp} />
          ))}
        </View>

        <EarningsChart colors={colors} resp={resp} />
        <View style={{ marginTop: 24 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                color: '#111827',
                fontSize: 18,
                fontWeight: '600',
              }}
            >
              Recent Transactions
            </Text>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate('HomeNavigator', {
                  screen: 'TransactionHistoryScreen',
                })
              }
            >
              <Text
                style={{
                  color: '#2563EB',
                  fontSize: 14,
                  fontWeight: '500',
                }}
              >
                View All
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={transactions}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TransactionCard item={item} colors={colors} resp={resp} />
            )}
            ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (colors: any, resp: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.WHITE_COLOR,
    },

    content: {
      padding: resp.dx(16),
      paddingBottom: resp.dy(30),
    },
    headerText: {
      marginBottom: resp.dy(20),
      paddingHorizontal: resp.dx(4),
    },
    // HEADER CARD

    headerCard: {
      borderRadius: resp.dx(24),
      padding: resp.dy(18),
      backgroundColor: '#7C4DFF',

      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },

    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },

    balanceLabel: {
      color: '#E5E7EB',
      fontSize: resp.dx(12),
      fontWeight: '500',
      marginBottom: resp.dy(8),
    },

    balanceAmount: {
      color: '#fff',
      fontSize: resp.dx(38),
      fontWeight: '800',
    },

    growthText: {
      color: '#BBF7D0',
      fontSize: resp.dx(13),
      fontWeight: '600',
      marginTop: resp.dy(6),
    },

    iconButton: {
      width: resp.dx(42),
      height: resp.dy(42),
      borderRadius: resp.dx(14),
      backgroundColor: 'rgba(255,255,255,0.14)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.15)',
    },

    bottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: resp.dy(22),
    },

    withdrawBtn: {
      flex: 1,
      height: resp.dy(48),
      backgroundColor: '#fff',
      borderRadius: resp.dx(14),
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },

    withdrawText: {
      color: '#111827',
      fontSize: resp.dx(14),
      fontWeight: '700',
      marginLeft: resp.dx(8),
    },

    eyeBtn: {
      width: resp.dx(48),
      height: resp.dy(48),
      borderRadius: resp.dx(14),
      backgroundColor: 'rgba(255,255,255,0.12)',
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: resp.dx(12),
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.12)',
    },

    // STATS

    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: resp.dy(18),
    },

    statCard: {
      width: '48%',
      borderRadius: resp.dx(18),
      padding: resp.dy(16),
      borderWidth: 1,
      borderColor: 'rgba(99,102,241,0.10)',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.1,
      shadowRadius: 14,
      elevation: 8,
    },
    statIcon: {
      width: resp.dx(36),
      height: resp.dy(36),
      borderRadius: resp.dx(12),
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: resp.dy(14),
    },
    statTitle: {
      fontSize: resp.dx(18),
      fontWeight: '700',
      lineHeight: resp.dy(24),
    },
    statAmount: {
      fontSize: resp.dx(20),
      fontWeight: '800',
      marginTop: resp.dy(18),
      lineHeight: resp.dy(28),
    },
    statSubtitle: {
      fontSize: resp.dx(12),
      fontWeight: '600',
      marginTop: resp.dy(14),
      lineHeight: resp.dy(18),
    },
    // CHART
    chartContainer: {
      marginTop: resp.dy(20),
      backgroundColor: '#FFFFFF',
      borderRadius: resp.dx(20),
      padding: resp.dy(16),
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 12,
      },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 10,
      borderWidth: 1,
      borderColor: 'rgba(99,102,241,0.08)',
    },

    chartHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: resp.dy(24),
    },

    chartTitle: {
      color: '#111827',
    },

    analyticsText: {
      color: '#6366F1',
    },

    chartArea: {
      flexDirection: 'row',
      height: resp.dy(180),
    },

    yAxis: {
      justifyContent: 'space-between',
      marginRight: resp.dx(10),
    },

    axisLabel: {
      color: '#94A3B8',
      fontSize: resp.dx(11),
    },

    graphWrapper: {
      flex: 1,
      position: 'relative',
    },

    horizontalLine: {
      borderTopWidth: 1,
      borderColor: 'rgba(34, 34, 34, 0.05)05)',
      flex: 1,
    },

    lineContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      top: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      paddingHorizontal: resp.dx(6),
    },

    pointWrapper: {
      alignItems: 'center',
      justifyContent: 'flex-end',
      flex: 1,
    },

    lineBar: {
      width: 3,
      backgroundColor: '#3B82F6',
      borderRadius: 10,
    },

    dot: {
      width: resp.dx(10),
      height: resp.dx(10),
      borderRadius: resp.dx(5),
      backgroundColor: '#2563EB',
      marginTop: -2,
      marginBottom: resp.dy(10),
    },

    weekLabel: {
      color: '#94A3B8',
      fontSize: resp.dx(11),
      marginTop: resp.dy(4),
    },
    transactionCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 18,
      padding: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: '#E5E7EB',

      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 8,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      elevation: 2,
    },

    transactionIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
    },

    transactionTitle: {
      color: '#111827',
      fontSize: 15,
      fontWeight: '700',
    },

    transactionName: {
      color: '#6B7280',
      fontSize: 12,
      marginTop: 4,
    },

    transactionAmount: {
      fontSize: 15,
      fontWeight: '800',
    },

    transactionDate: {
      color: '#9CA3AF',
      fontSize: 11,
      marginTop: 6,
    },

    statusBadge: {
      alignSelf: 'flex-start',
      marginTop: 12,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 5,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
    },

    statusText: {
      fontSize: 12,
      fontWeight: '700',
      marginLeft: 5,
    },
  });
