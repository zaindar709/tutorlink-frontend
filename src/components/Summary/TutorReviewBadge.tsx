import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { GLASS } from '../../theme/glass';

type Props = { tutorName?: string };

const TutorReviewBadge: React.FC<Props> = ({ tutorName }) => (
  <View style={styles.row}>
    <MaterialCommunityIcons
      name="check-decagram"
      size={16}
      color={GLASS.success}
    />
    <Text style={styles.text}>
      Reviewed by {tutorName || 'Tutor'}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  text: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default TutorReviewBadge;
