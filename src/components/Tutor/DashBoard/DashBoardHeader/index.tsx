import React, { useMemo } from 'react';
import { StyleSheet, Text, View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import useUi from '../../../../hooks/ui/useUi';

export default function Header() {
   const { colors, resp } = useUi();

  const styles = useMemo(
    () => createStyles(colors, resp),
    [colors, resp],
  );
  return (
      <View style={styles.container}>
        <View style={styles.profileSection}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <View style={styles.nameContainer}>
            <Text style={styles.nameText}>Prof. Ali</Text>
            <MaterialCommunityIcons
              name="check-decagram"
              size={18}
              color="#12c560"
              style={{ marginLeft: 6 }}
            />
          </View>
          <Text style={styles.subTitleText}>Verified Professional Tutor</Text>
        </View>
        <View style={styles.balanceCard}>
          <MaterialCommunityIcons
            name="wallet"
            size={22}
            color="#FFA500"
            style={{ marginRight: 10 }}
          />
          <View style={styles.balanceInfo}>
            <Text style={styles.balanceLabel}>Balance</Text>
            <Text style={styles.balanceAmount}>Rs. 15,000</Text>
          </View>

        </View>

      </View>
  );
}

const createStyles = (colors:any, resp:any) =>StyleSheet.create({
  container: {
    height: resp.df(230),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: colors.PRIMARY_COLOR,
    borderBottomLeftRadius: resp.dx(30),
    borderBottomRightRadius: resp.dx(30)
  },
  profileSection: {
    flex: 1,
    marginRight: 12,
  },
  welcomeText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 18,
    fontWeight: '500',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  nameText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
  },
  subTitleText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    fontWeight: '500',
  },
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    minWidth: 135,
  },
  balanceInfo: {
    justifyContent: 'center',
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});