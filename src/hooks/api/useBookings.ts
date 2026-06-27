import { useCallback, useEffect, useState } from 'react';
import {
  cancelBooking,
  completeBooking,
  confirmBooking,
  createBooking,
  fetchBookings,
} from '../../services/bookings/bookingsService';
import {
  Booking,
  BookingTab,
  ConfirmBookingPayload,
  CreateBookingPayload,
} from '../../types/api.types';
import { formatDateParam } from '../../utils/api/userId';
import { getApiErrorMessage } from '../../utils/api/errorHandler';

export const useBookings = (initialTab: BookingTab = 'active') => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tab, setTab] = useState<BookingTab>(initialTab);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dateParam = formatDateParam(selectedDate);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await fetchBookings(dateParam, tab);
      setBookings(results);
    } catch (err) {
      setError(getApiErrorMessage(err));
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [dateParam, tab]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleCreateBooking = async (payload: CreateBookingPayload) => {
    setActionLoading(true);
    try {
      await createBooking(payload);
      await loadBookings();
      return true;
    } catch (err) {
      setError(getApiErrorMessage(err));
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmBooking = async (
    id: string,
    payload?: ConfirmBookingPayload
  ) => {
    setActionLoading(true);
    try {
      await confirmBooking(id, payload);
      await loadBookings();
      return true;
    } catch (err) {
      setError(getApiErrorMessage(err));
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelBooking = async (id: string) => {
    setActionLoading(true);
    try {
      await cancelBooking(id);
      await loadBookings();
      return true;
    } catch (err) {
      setError(getApiErrorMessage(err));
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteBooking = async (id: string) => {
    setActionLoading(true);
    try {
      await completeBooking(id);
      await loadBookings();
      return true;
    } catch (err) {
      setError(getApiErrorMessage(err));
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const nextSession = bookings.find(booking => booking.isNextSession) ?? bookings[0];

  return {
    bookings,
    tab,
    setTab,
    selectedDate,
    setSelectedDate,
    loading,
    actionLoading,
    error,
    nextSession,
    refresh: loadBookings,
    createBooking: handleCreateBooking,
    confirmBooking: handleConfirmBooking,
    cancelBooking: handleCancelBooking,
    completeBooking: handleCompleteBooking,
  };
};
