import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
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
  const { resp } = useUi();
  const hasSlots = slots.length > 0;
  const initial = day.charAt(0);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.left}>
          <View
            style={[
              styles.dayBadge,
              {
                backgroundColor: hasSlots
                  ? GLASS.primarySoft
                  : 'rgba(148,163,184,0.15)',
              },
            ]}
          >
            <Text
              style={[
                styles.dayBadgeText,
                { color: hasSlots ? GLASS.primary : GLASS.textMuted },
              ]}
            >
              {initial}
            </Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.dayTitle}>{day}</Text>
            <Text
              style={[
                styles.dayStatus,
                { color: hasSlots ? GLASS.primary : GLASS.textMuted },
              ]}
            >
              {status}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={onAddSlot}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="plus" size={resp.df(18)} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.slotArea}>
        {hasSlots ? (
          slots.map(slot => (
            <TimeSlotChip
              key={slot.id}
              time={slot.time}
              onRemove={() => onRemoveSlot(slot.id)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="calendar-blank-outline"
              size={20}
              color={GLASS.textMuted}
            />
            <Text style={styles.emptyText}>No availability set</Text>
            <Text style={styles.emptyHint}>Tap + to add time slots</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default DayAvailabilityCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: GLASS.radius.xl,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: GLASS.cardBorder,
    backgroundColor: GLASS.cardBgStrong,
    ...GLASS.shadow.soft,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
    marginRight: 10,
  },
  dayBadge: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBadgeText: {
    fontSize: 16,
    fontWeight: '800',
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: GLASS.textPrimary,
  },
  dayStatus: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: GLASS.primary,
    ...GLASS.shadow.soft,
  },
  slotArea: {
    gap: 0,
  },
  emptyState: {
    paddingVertical: 16,
    borderRadius: GLASS.radius.lg,
    borderWidth: 1,
    borderColor: GLASS.cardBorder,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(117, 72, 245, 0.03)',
    gap: 4,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '700',
    color: GLASS.textSecondary,
    marginTop: 4,
  },
  emptyHint: {
    fontSize: 12,
    color: GLASS.textMuted,
  },
});
