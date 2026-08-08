import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  cancelBookingThunk,
  completeBookingThunk,
  confirmBookingThunk,
  createBookingThunk,
  fetchBookingsThunk,
  rateBookingThunk,
} from '../../store/booking/bookingSlice';
import {
  selectBookingError,
  selectBookingListMeta,
  selectBookingMutating,
  selectBookingsFor,
  selectNextSession,
} from '../../store/booking/bookingSelectors';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  BookingTab,
  ConfirmBookingPayload,
  CreateBookingPayload,
} from '../../types/api.types';
import { formatDateParam } from '../../utils/api/userId';
import { invalidateStudentTutorRelationsCache } from './useStudentTutorRelations';

export const useBookings = (initialTab: BookingTab = 'active') => {
  const dispatch = useAppDispatch();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tab, setTab] = useState<BookingTab>(initialTab);

  const dateParam = formatDateParam(selectedDate);
  const bookingsSelector = useMemo(
    () => selectBookingsFor(dateParam, tab),
    [dateParam, tab]
  );
  const nextSessionSelector = useMemo(
    () => selectNextSession(dateParam),
    [dateParam]
  );
  const listMetaSelector = useMemo(
    () => selectBookingListMeta(dateParam, tab),
    [dateParam, tab]
  );

  const bookings = useAppSelector(bookingsSelector);
  const nextSession = useAppSelector(nextSessionSelector);
  const listMeta = useAppSelector(listMetaSelector);
  const mutating = useAppSelector(selectBookingMutating);
  const lastError = useAppSelector(selectBookingError);
  const lastSessionAmount = useAppSelector(
    state => state.booking.lastSessionAmount
  );

  const loading =
    !listMeta || listMeta.status === 'loading' || listMeta.status === 'idle';
  const error = listMeta?.error || lastError;

  const loadBookings = useCallback(async () => {
    await dispatch(fetchBookingsThunk({ date: dateParam, tab }));
  }, [dateParam, dispatch, tab]);

  // Focus covers tab mount. No interval polling — was flooding the API.
  useFocusEffect(
    useCallback(() => {
      void loadBookings();
    }, [loadBookings])
  );
  const handleCreateBooking = async (payload: CreateBookingPayload) => {
    try {
      const booking = await dispatch(createBookingThunk(payload)).unwrap();
      invalidateStudentTutorRelationsCache();
      await loadBookings();
      return booking;
    } catch {
      return null;
    }
  };

  const handleConfirmBooking = async (
    id: string,
    payload?: ConfirmBookingPayload
  ) => {
    try {
      const result = await dispatch(
        confirmBookingThunk({ id, payload })
      ).unwrap();
      invalidateStudentTutorRelationsCache();
      await loadBookings();
      return result;
    } catch {
      return null;
    }
  };

  const handleCancelBooking = async (
    id: string,
    actorRole?: 'student' | 'tutor' | 'parent'
  ) => {
    try {
      const result = await dispatch(
        cancelBookingThunk({ id, actorRole })
      ).unwrap();
      invalidateStudentTutorRelationsCache();
      await loadBookings();
      return result;
    } catch {
      return null;
    }
  };

  const handleCompleteBooking = async (id: string) => {
    try {
      const result = await dispatch(completeBookingThunk(id)).unwrap();
      invalidateStudentTutorRelationsCache();
      await loadBookings();
      return result;
    } catch {
      return null;
    }
  };

  const handleRateBooking = async (
    bookingId: string,
    rating: number,
    review?: string
  ) => {
    try {
      await dispatch(
        rateBookingThunk({ bookingId, rating, review })
      ).unwrap();
      return true;
    } catch {
      return false;
    }
  };

  return {
    bookings,
    tab,
    setTab,
    selectedDate,
    setSelectedDate,
    dateParam,
    loading: Boolean(loading && bookings.length === 0),
    refreshing: listMeta?.status === 'loading',
    actionLoading: mutating,
    error,
    nextSession,
    lastSessionAmount,
    refresh: loadBookings,
    createBooking: handleCreateBooking,
    confirmBooking: handleConfirmBooking,
    cancelBooking: handleCancelBooking,
    completeBooking: handleCompleteBooking,
    rateBooking: handleRateBooking,
  };
};
