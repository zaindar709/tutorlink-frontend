import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Icon } from 'react-native-paper';
import useUi from '../../../../../../hooks/ui/useUi';
import CustomButton from '../../../../../../components/CustomButton';
import DayAvailabilityCard from '../../../../../../components/Tutor/ScheduleAvailability/DayAvailabilityCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../../../../../components/Tutor/CustomHeader';
import { useNavigation } from '@react-navigation/native';

const defaultAvailability = [
  {
    id: 'monday',
    day: 'Monday',
    status: 'Flexible hours',
    slots: [
      { id: 'monday-1', time: '09:00 - 12:00' },
      { id: 'monday-2', time: '14:00 - 18:00' },
    ],
  },
  {
    id: 'tuesday',
    day: 'Tuesday',
    status: 'Flexible hours',
    slots: [
      { id: 'tuesday-1', time: '09:00 - 12:00' },
      { id: 'tuesday-2', time: '14:00 - 18:00' },
    ],
  },
  {
    id: 'friday',
    day: 'Friday',
    status: 'Available',
    slots: [{ id: 'friday-1', time: '09:00 - 12:00' }],
  },
  {
    id: 'saturday',
    day: 'Saturday',
    status: 'Open booking',
    slots: [{ id: 'saturday-1', time: '10:00 - 16:00' }],
  },
  {
    id: 'sunday',
    day: 'Sunday',
    status: 'No availability',
    slots: [],
  },
];

const ScheduleAvailabilityScreen = () => {
  const { colors, resp } = useUi();
  const [availability, setAvailability] = useState(defaultAvailability);
  const navigation = useNavigation<any>();

  const handleAddSlot = (dayId: string) => {
    setAvailability(current =>
      current.map(day => {
        if (day.id !== dayId) return day;

        const slotCount = day.slots.length;
        const nextSlot = {
          id: `${dayId}-${slotCount + 1}`,
          time: slotCount === 0 ? '09:00 - 12:00' : '16:00 - 20:00',
        };

        return {
          ...day,
          slots: [...day.slots, nextSlot],
          status: 'Flexible hours',
        };
      }),
    );
  };

  const handleRemoveSlot = (dayId: string, slotId: string) => {
    setAvailability(current =>
      current.map(day => {
        if (day.id !== dayId) return day;

        const updatedSlots = day.slots.filter(slot => slot.id !== slotId);
        return {
          ...day,
          slots: updatedSlots,
          status: updatedSlots.length ? 'Flexible hours' : 'No availability',
        };
      }),
    );
  };

  const saveSchedule = () => {
    Alert.alert(
      'Schedule saved',
      'Your availability settings have been updated.',
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <CustomHeader navigation={navigation} title="Schedule Availability" />
          <View
            style={[
              // styles.heroCard,
              {
                backgroundColor: colors.WHITE_COLOR,
                paddingHorizontal: 20,
                paddingTop: 15,
                paddingBottom: 40,
              },
            ]}
          >
            <View
              style={[
                styles.heroBadge,
                { backgroundColor: `${String(colors.WHITE_COLOR)}20` },
              ]}
             >
              <Icon
                source="calendar-check"
                size={resp.df(16)}
                color={String(colors.PRIMARY_COLOR)}
              />
              <Text
                style={[styles.heroBadgeText, { color: colors.PRIMARY_COLOR }]}
              >
                Flexible schedule
              </Text>
            </View>
            <Text style={[styles.heroTitle, { color: colors.BLACK_COLOR }]}>
              Schedule Availability
            </Text>
            <Text style={[styles.heroSubtitle, { color: colors.SPACES_COLOR }]}>
              Students will only see available booking slots when they book.
              Update your weekly teaching hours anytime.
            </Text>

            <View style={styles.sectionHeader}>
              <Text
                style={[styles.sectionTitle, { color: colors.BLACK_COLOR }]}
              >
                Set your teaching hours
              </Text>
              <Text
                style={[styles.sectionSubtitle, { color: '#aeaeae' }]}
              >
                Manage each day with easy add/remove actions.
              </Text>
            </View>

            {availability.map(day => (
              <DayAvailabilityCard
                key={day.id}
                day={day.day}
                status={day.status}
                slots={day.slots}
                onAddSlot={() => handleAddSlot(day.id)}
                onRemoveSlot={slotId => handleRemoveSlot(day.id, slotId)}
              />
            ))}

            <View style={styles.footer}>
              <CustomButton
                title="Save Schedule"
                onPress={saveSchedule}
                style={styles.saveButton}
              />
              <Text
                style={[styles.helpText, { color: colors.SECONDARY_COLOR }]}
              >
                Your profile will show the latest availability to students
                immediately.
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ScheduleAvailabilityScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  heroCard: {
    borderRadius: 28,
    padding: 22,
    marginBottom: 22,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 8,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 0,
    borderRadius: 16,
    marginBottom: 14,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    marginTop: 40,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 19,
  },
  footer: {
    marginTop: 20,
    gap: 12,
  },
  saveButton: {
    borderRadius: 22,
  },
  helpText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});
