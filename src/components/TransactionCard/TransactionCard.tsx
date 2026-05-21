// components/TransactionCard.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { Icon } from 'react-native-paper';
import useUi from '../../hooks/ui/useUi';

export default function TransactionCard({ item }: any) {
  const { colors, resp } = useUi();
  const styles = createStyles({ colors, resp });

  const isDeposit = item.type === 'deposit';

  return (
    <View style={styles.card}>
      {/* Left Icon */}
      <View
        style={[
          styles.iconWrapper,
          {
            backgroundColor: isDeposit ? '#EAFBF1' : '#FFF0F0',
          },
        ]}
      >
        <Icon
          source={isDeposit ? 'arrow-bottom-left' : 'arrow-top-right'}
          size={18}
          color={isDeposit ? '#22C55E' : '#EF4444'}
        />
      </View>
      <View style={styles.center}>
        <Text style={styles.title}>{item.title}</Text>

        <View style={styles.bottomRow}>
          <Text style={styles.time}>{item.time}</Text>

          <Text style={styles.dot}>•</Text>

          <Text style={styles.method}>{item.method}</Text>
        </View>
      </View>
      <Text
        style={[
          styles.amount,
          {
            color: isDeposit ? '#16A34A' : '#EF4444',
          },
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
      width: '95%',
      alignSelf: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: resp.dx(18),
      padding: resp.dx(14),
      marginBottom: resp.dy(12),
      flexDirection: 'row',
      alignItems: 'flex-start',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 6,
      borderWidth: 1,
      borderColor: '#F1F5F9',
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
    },

    title: {
      color: '#0F172A',
      fontSize: resp.df(15),
      fontWeight: '700',
      lineHeight: resp.dy(22),
    },

    bottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: resp.dy(8),
    },

    time: {
      color: '#64748B',
      fontSize: resp.df(12),
    },

    dot: {
      marginHorizontal: resp.dx(6),
      color: '#94A3B8',
    },

    method: {
      color: '#64748B',
      fontSize: resp.df(12),
    },

    amount: {
      fontSize: resp.df(15),
      fontWeight: '700',
    },
  });
