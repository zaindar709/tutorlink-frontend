import {View, Text, StyleSheet} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import CustomButton from '../../../CustomButton';

const BalanceCard = ({colors, resp, balance = 0}: any) => {
  return (
    <View style={styles(colors, resp).balanceCard}>
      <View style={styles(colors, resp).balanceTopRow}>
        <View>
          <Text style={styles(colors, resp).balanceLabel}>
            Available Balance
          </Text>

          <Text style={styles(colors, resp).balanceAmount}>
            Rs. {balance.toLocaleString()}
          </Text>

          <Text style={styles(colors, resp).balanceGrowth}>
            +Rs. 3,500 this week
          </Text>
        </View>

        <View style={styles(colors, resp).graphIconBox}>
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
        style={styles(colors, resp).withdrawBtn}
      />
    </View>
  );
};

export default BalanceCard;

const styles = (colors: any, resp: any) =>
  StyleSheet.create({
    balanceCard: {
      backgroundColor: colors.PRIMARY_COLOR,
      borderRadius: resp.dx(20),
      padding: resp.dy(18),
      marginTop: resp.dy(10),
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