// components/InterviewInfoCard.tsx

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { GLASS } from '../../../theme/glass';

const points = [
  'Teaching methodology discussion',
  'Subject expertise assessment',
  'Platform guidelines overview',
];

const InterviewInfoCard = () => {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.videoIconBox}>
          <Icon name="video-outline" size={24} color="#fff" />
        </View>

        <View style={{flex: 1, marginLeft: 14}}>
          <Text style={styles.heading}>Final Step: Interview</Text>

          <Text style={styles.description}>
            To ensure platform quality, after scanning your documents,
            you'll have a 60-minute short interview with our academic
            team.
          </Text>
        </View>
      </View>

      <View style={styles.expectationBox}>
        <View style={styles.expectHeader}>
          <Icon name="calendar-month-outline" size={18} color="#2563EB" />

          <Text style={styles.expectTitle}>What to Expect</Text>
        </View>

        {points.map((item, index) => (
          <Text key={index} style={styles.point}>
            • {item}
          </Text>
        ))}
      </View>
    </View>
  );
};

export default InterviewInfoCard;

const styles = StyleSheet.create({
  card: {
    width: '92%',
    alignSelf: 'center',
    backgroundColor: GLASS.cardBg,
    borderRadius: 18,
    marginTop: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: GLASS.cardBorder,
    elevation: 3,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  videoIconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },

  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  description: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 22,
    color: '#4B5563',
  },

  expectationBox: {
    marginTop: 20,
    backgroundColor: GLASS.cardBgStrong,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: GLASS.cardBorder,
  },

  expectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  expectTitle: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },

  point: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 8,
    lineHeight: 20,
  },
});
