import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from 'react-native-paper';
import useUi from '../../hooks/ui/useUi';
import { GLASS } from '../../theme/glass';

export default function TransactionCard({ item }: any) {
  const { colors, resp } = useUi();
  const styles = createStyles({ colors, resp });
  const isDeposit = item.type === 'deposit';

  return (
    <View style={styles.card}>
      <View
        style={[
          styles.iconWrapper,
          { backgroundColor: isDeposit ? '#DCFCE7' : '#FEE2E2' },
        ]}
      >
        <Icon
          source={isDeposit ? 'arrow-bottom-left' : 'arrow-top-right'}
          size={18}
          color={isDeposit ? '#16A34A' : '#EF4444'}
        />
      </View>

      <View style={styles.center}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.bottomRow}>
          <Text style={styles.time}>{item.time}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.method} numberOfLines={1}>
            {item.method}
          </Text>
        </View>
      </View>

      <Text
        style={[
          styles.amount,
          { color: isDeposit ? '#16A34A' : '#EF4444' },
        ]}
      >
        {item.amount}
      </Text>
    </View>
  );
}

const createStyles = ({ colors, resp }: any) =>
  StyleSheet.create({
    card: {
      width: '100%',
      alignSelf: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: GLASS.radius.lg,
      padding: resp.dx(14),
      marginBottom: resp.dy(10),
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      ...GLASS.shadow.soft,
    },
    iconWrapper: {
      width: resp.dx(42),
      height: resp.dx(42),
      borderRadius: resp.dx(14),
      justifyContent: 'center',
      alignItems: 'center',
    },
    center: {
      flex: 1,
      marginLeft: resp.dx(12),
      marginRight: resp.dx(8),
    },
    title: {
      color: GLASS.textPrimary,
      fontSize: resp.df(14),
      fontWeight: '700',
    },
    bottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: resp.dy(6),
    },
    time: {
      color: GLASS.textSecondary,
      fontSize: resp.df(12),
    },
    dot: {
      marginHorizontal: resp.dx(6),
      color: GLASS.textMuted,
    },
    method: {
      flexShrink: 1,
      color: GLASS.textSecondary,
      fontSize: resp.df(12),
      textTransform: 'capitalize',
    },
    amount: {
      fontSize: resp.df(14),
      fontWeight: '800',
    },
  });
