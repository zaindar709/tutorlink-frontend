import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import useUi from '../../../../hooks/ui/useUi';
import { ApiUser } from '../../../../types/api.types';

const getDisplayName = (user: ApiUser | null | undefined) => {
  const raw = String(user?.name || user?.fullName || '').trim();
  return raw || 'Tutor';
};

export default function Header() {
  const { colors, resp } = useUi();
  const user = useSelector((state: any) => state.auth.user as ApiUser | null);
  const displayName = getDisplayName(user);

  const styles = useMemo(() => createStyles(colors, resp), [colors, resp]);

  return (
    <LinearGradient
      colors={[
        colors.PRIMARY_COLOR as string,
        '#5B2FD6',
        '#4C1D95',
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.profileSection}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <View style={styles.nameContainer}>
          <Text style={styles.nameText} numberOfLines={1}>
            {displayName}
          </Text>
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
    </LinearGradient>
  );
}

const createStyles = (colors: any, resp: any) =>
  StyleSheet.create({
    container: {
      height: resp.df(230),
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 24,
      borderBottomLeftRadius: resp.dx(30),
      borderBottomRightRadius: resp.dx(30),
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
      flexShrink: 1,
    },
    subTitleText: {
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: 13,
      fontWeight: '500',
    },
    balanceCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.18)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.35)',
      borderRadius: 20,
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
