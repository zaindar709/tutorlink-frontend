import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { GLASS, glassTypography } from '../../../theme/glass';

const ActionCards = () => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
          <Icon name="calendar-month-outline" size={24} color="#D97706" />
        </View>
        <Text style={styles.text}>Schedule Interview</Text>
      </View>

      <View style={styles.card}>
        <View style={[styles.iconBox, { backgroundColor: '#DBEAFE' }]}>
          <Icon name="video-outline" size={24} color="#2563EB" />
        </View>
        <Text style={styles.text}>Video Call</Text>
      </View>
    </View>
  );
};

export default ActionCards;

const styles = StyleSheet.create({
  container: {
    width: '92%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 22,
  },
  card: {
    width: '48%',
    backgroundColor: GLASS.cardBg,
    borderRadius: GLASS.radius.xl,
    paddingVertical: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GLASS.cardBorder,
    ...GLASS.shadow.soft,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 12,
    ...glassTypography.body,
    fontWeight: '600',
    color: GLASS.textPrimary,
  },
});
