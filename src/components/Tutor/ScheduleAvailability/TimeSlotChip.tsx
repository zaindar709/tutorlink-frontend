import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-paper';
import useUi from '../../../hooks/ui/useUi';

type TimeSlotChipProps = {
  time: string;
  onRemove?: () => void;
  isBooked?: boolean;
};

const TimeSlotChip: React.FC<TimeSlotChipProps> = ({ time, onRemove, isBooked = true }) => {
  const { colors, resp } = useUi();
  const activeColor = isBooked ? colors.PRIMARY_COLOR : colors.SECONDARY_COLOR;

  return (
    <View
      style={[
        styles.wrapper,
        {
        //   backgroundColor: isBooked ? `${String(activeColor)}20` : colors.WHITE_COLOR,
          borderColor: isBooked ? colors.PRIMARY_COLOR : colors.LIGHT_GRAY,
        },
      ]}
    >
      <View style={styles.labelRow}>
        <View style={[styles.badge, { backgroundColor: activeColor }]}> 
          <Icon source="clock-outline" size={resp.df(14)} color={colors.WHITE_COLOR as string} />
        </View>
        <Text
          style={[
            styles.timeText,
            { color: isBooked ? String(colors.PRIMARY_COLOR) : String(colors.BLACK_COLOR) },
          ]}
        >
          {time}
        </Text>
      </View>

      {onRemove && (
        <TouchableOpacity onPress={onRemove} style={styles.removeButton} activeOpacity={0.7}>
          <Icon source="trash-can-outline" size={resp.df(18)} color={String(colors.RED)} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default TimeSlotChip;

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 18,
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FCE6E7',
  },
});
