import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-paper';
import useUi from '../../../hooks/ui/useUi';
import TimeSlotChip from './TimeSlotChip';
import { GLASS } from '../../../theme/glass';

type Slot = {
  id: string;
  time: string;
};

type DayAvailabilityCardProps = {
  day: string;
  status: string;
  slots: Slot[];
  onAddSlot: () => void;
  onRemoveSlot: (slotId: string) => void;
};

const DayAvailabilityCard: React.FC<DayAvailabilityCardProps> = ({
  day,
  status,
  slots,
  onAddSlot,
  onRemoveSlot,
}) => {
  const { colors, resp } = useUi();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: GLASS.cardBg, borderColor: GLASS.cardBorder },
      ]}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.dayTitle, { color: colors.BLACK_COLOR }]}>{day}</Text>
          <Text style={[styles.dayStatus, { color: colors.SPACES_COLOR }]}>{status}</Text>
        </View>

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.PRIMARY_COLOR }]}
          onPress={onAddSlot}
          activeOpacity={0.8}
        >
          <Icon source="plus" size={resp.df(18)} color={colors.WHITE_COLOR as string} />
        </TouchableOpacity>
      </View>

      <View style={styles.slotArea}>
        {slots.length ? (
          slots.map((slot) => (
            <TimeSlotChip key={slot.id} time={slot.time} onRemove={() => onRemoveSlot(slot.id)} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.SECONDARY_COLOR }]}>
              No availability set
            </Text>
            <Text style={[styles.emptyHint, { color: colors.GRAY_COLOR }]}>
              Tap + to add time slots
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default DayAvailabilityCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#7548F5',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 18,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  dayStatus: {
    fontSize: 14,
    marginTop: 4,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotArea: {
    gap: 8,
  },
  emptyState: {
    paddingVertical: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: GLASS.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: GLASS.cardBgStrong,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyHint: {
    fontSize: 13,
    marginTop: 6,
  },
});
