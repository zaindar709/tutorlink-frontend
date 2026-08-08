import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { fetchBookingsThunk } from '../../store/booking/bookingSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { Booking, BookingTab } from '../../types/api.types';
import { formatDateParam } from '../../utils/api/userId';
import { listCacheKey } from '../../utils/bookings/bookingStatus';

const DEFAULT_LOOKAHEAD_DAYS = 21;
const DEFAULT_LOOKBACK_DAYS = 7;

const dateRangeParams = (
  tab: BookingTab,
  anchor = new Date(),
  lookAhead = DEFAULT_LOOKAHEAD_DAYS,
  lookBack = DEFAULT_LOOKBACK_DAYS
) => {
  const startOffset = tab === 'past' ? lookBack * 2 : lookBack;
  const length =
    tab === 'past' ? lookBack + lookAhead : lookAhead + lookBack;

  return Array.from({ length }, (_, index) => {
    const date = new Date(anchor);
    date.setDate(anchor.getDate() - startOffset + index);
    return formatDateParam(date);
  });
};

const statusForTab = (tab: BookingTab, status: Booking['status']) => {
  if (tab === 'pending') return status === 'pending';
  if (tab === 'past') {
    return status === 'completed' || status === 'cancelled' || status === 'missed';
  }
  return status === 'accepted';
};

/**
 * Student/tutor bookings tab — fan-out GET /api/bookings across a date window
 * because the API requires date+tab and bookings are often on future days.
 */
export const useBookingsRange = (
  tab: BookingTab,
  options?: { selectedDate?: Date; filterBySelectedDate?: boolean }
) => {
  const dispatch = useAppDispatch();
  const byId = useAppSelector(state => state.booking.byId);
  const lists = useAppSelector(state => state.booking.lists);
  const mutating = useAppSelector(state => state.booking.mutating);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedDate = options?.selectedDate;
  const filterBySelectedDate = options?.filterBySelectedDate ?? false;

  const dateParams = useMemo(
    () => dateRangeParams(tab, selectedDate ?? new Date()),
    [tab, selectedDate]
  );

  const refresh = useCallback(
    async (isPull = false) => {
      if (isPull) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        await Promise.all(
          dateParams.map(date =>
            dispatch(fetchBookingsThunk({ date, tab })).unwrap()
          )
        );
      } catch (err) {
        setError(
          typeof err === 'string' ? err : 'Could not load bookings.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [dateParams, dispatch]
  );

  useEffect(() => {
    void refresh(false);
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      void refresh(false);
    }, [refresh])
  );

  const bookings = useMemo(() => {
    const map = new Map<string, Booking>();
    const selectedKey = selectedDate ? formatDateParam(selectedDate) : null;

    dateParams.forEach(date => {
      const meta = lists[listCacheKey(date, tab)];
      meta?.ids?.forEach(id => {
        const booking = byId[id];
        if (!booking || !statusForTab(tab, booking.status)) return;
        if (filterBySelectedDate && selectedKey) {
          const bookingDay = String(booking.date).slice(0, 10);
          if (bookingDay !== selectedKey) return;
        }
        map.set(booking._id, booking);
      });
    });

    Object.values(byId).forEach(booking => {
      if (!booking || !statusForTab(tab, booking.status)) return;
      if (filterBySelectedDate && selectedKey) {
        const bookingDay = String(booking.date).slice(0, 10);
        if (bookingDay !== selectedKey) return;
      }
      map.set(booking._id, booking);
    });

    return Array.from(map.values()).sort((a, b) => {
      const dateCmp = String(a.date).localeCompare(String(b.date));
      if (dateCmp !== 0) return dateCmp;
      return String(a.startTime).localeCompare(String(b.startTime));
    });
  }, [byId, dateParams, filterBySelectedDate, lists, selectedDate, tab]);

  const nextSession = useMemo(() => {
    if (tab !== 'active') return null;
    return bookings.find(b => b.isNextSession) ?? bookings[0] ?? null;
  }, [bookings, tab]);

  return {
    bookings,
    nextSession,
    loading: loading && bookings.length === 0,
    refreshing,
    actionLoading: mutating,
    error,
    refresh: () => refresh(true),
  };
};
