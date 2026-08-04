import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import CustomButton from '../../../CustomButton';

const BalanceCard = ({ colors, resp, balance = 0 }: any) => {
  const s = styles(colors, resp);

  return (
    <LinearGradient
      colors={[
        colors.PRIMARY_COLOR as string,
        '#5B2FD6',
        '#4C1D95',
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={s.balanceCard}
    >
      <View style={s.balanceTopRow}>
        <View>
          <Text style={s.balanceLabel}>Available Balance</Text>

          <Text style={s.balanceAmount}>
            Rs. {balance.toLocaleString()}
          </Text>

          <Text style={s.balanceGrowth}>+Rs. 3,500 this week</Text>
        </View>

        <View style={s.graphIconBox}>
          <MaterialCommunityIcons
            name="trending-up"
            size={22}
            color="#FACC15"
          />
        </View>
      </View>

      <CustomButton
        title="Withdraw Funds"
        textColor={colors.PRIMARY_COLOR}
        textStyle={{
          fontWeight: '500',
          fontSize: 16,
        }}
        onPress={() => {}}
        style={s.withdrawBtn}
      />
    </LinearGradient>
  );
};

export default BalanceCard;

const styles = (colors: any, resp: any) =>
  StyleSheet.create({
    balanceCard: {
      borderRadius: resp.dx(24),
      padding: resp.dy(18),
      marginTop: resp.dy(10),
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.28)',
      shadowColor: '#7548F5',
      shadowOpacity: 0.2,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
    },

    balanceTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },

    balanceLabel: {
      fontSize: resp.df(12),
      color: '#E5E7EB',
      fontWeight: '500',
      marginBottom: resp.dy(6),
    },

    balanceAmount: {
      fontSize: resp.df(32),
      color: '#fff',
      fontWeight: '700',
    },

    balanceGrowth: {
      fontSize: resp.df(12),
      color: '#D1D5DB',
      marginTop: resp.dy(4),
    },

    graphIconBox: {
      width: resp.dx(42),
      height: resp.dy(42),
      borderRadius: resp.dx(14),
      backgroundColor: 'rgba(255,255,255,0.12)',
      justifyContent: 'center',
      alignItems: 'center',
    },

    withdrawBtn: {
      height: resp.df(48),
      backgroundColor: '#fff',
      marginTop: resp.dy(18),
    },
  });
