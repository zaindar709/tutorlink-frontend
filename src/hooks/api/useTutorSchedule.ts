import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { fetchTutorDaySchedule } from '../../services/schedule/scheduleService';
import {
  TutorDaySchedule,
  TutorScheduleFreeItem,
  TutorScheduleItem,
} from '../../types/api.types';
import { getBookingErrorMessage } from '../../utils/bookings/bookingErrors';
import { formatDateParam } from '../../utils/api/userId';

const emptySummary = {
  sessionsCount: 0,
  totalMinutes: 0,
  displayTotalHours: '0 min',
  freeSlotsCount: 0,
};

export const useTutorSchedule = (initialDate: Date = new Date()) => {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [schedule, setSchedule] = useState<TutorDaySchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dateParam = formatDateParam(selectedDate);

  const load = useCallback(
    async (opts?: { soft?: boolean }) => {
      if (opts?.soft) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      try {
        const data = await fetchTutorDaySchedule(dateParam);
        setSchedule(data);
      } catch (err) {
        setError(getBookingErrorMessage(err));
        setSchedule(null);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [dateParam]
  );

  useEffect(() => {
    void load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      void load({ soft: true });
    }, [load])
  );

  const items: TutorScheduleItem[] = schedule?.items ?? [];
  const freeSlots: TutorScheduleFreeItem[] = items.filter(
    (item): item is TutorScheduleFreeItem => item.kind === 'free'
  );

  return {
    selectedDate,
    setSelectedDate,
    dateParam,
    schedule,
    items,
    freeSlots,
    summary: schedule?.summary ?? emptySummary,
    isWeekend: Boolean(schedule?.isWeekend),
    lectureSlotMinutes: schedule?.lectureSlotMinutes ?? 90,
    loading: loading && !schedule,
    refreshing,
    error,
    refresh: () => load({ soft: true }),
    reload: () => load(),
  };
};
