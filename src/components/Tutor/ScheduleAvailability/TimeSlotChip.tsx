import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { GLASS } from '../../../theme/glass';

type TimeSlotChipProps = {
  time: string;
  onRemove?: () => void;
};

const TimeSlotChip: React.FC<TimeSlotChipProps> = ({ time, onRemove }) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.labelRow}>
        <View style={styles.badge}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={14}
            color={GLASS.primary}
          />
        </View>
        <Text style={styles.timeText}>{time}</Text>
      </View>

      {onRemove ? (
        <TouchableOpacity
          onPress={onRemove}
          style={styles.removeButton}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={16}
            color="#DC2626"
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default TimeSlotChip;

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: GLASS.radius.md,
    marginBottom: 8,
    backgroundColor: GLASS.primarySoft,
    borderColor: GLASS.cardBorder,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  badge: {
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '700',
    color: GLASS.primaryDeep,
  },
  removeButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(254, 226, 226, 0.9)',
  },
});
