import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import { Booking, BookingTab } from '../../types/api.types';
import { listCacheKey } from '../../utils/bookings/bookingStatus';

export const selectBookingState = (state: RootState) => state.booking;

export const selectBookingById = (id: string) => (state: RootState) =>
  state.booking.byId[id];

export const selectBookingListMeta = (date: string, tab: BookingTab) =>
  (state: RootState) =>
    state.booking.lists[listCacheKey(date, tab)];

export const selectBookingsFor = (date: string, tab: BookingTab) =>
  createSelector(
    [(state: RootState) => state.booking],
    booking => {
      const meta = booking.lists[listCacheKey(date, tab)];
      if (!meta) return [] as Booking[];
      return meta.ids
        .map(id => booking.byId[id])
        .filter((b): b is Booking => Boolean(b));
    }
  );

export const selectNextSession = (date: string) =>
  createSelector(selectBookingsFor(date, 'active'), bookings => {
    return bookings.find(b => b.isNextSession) ?? bookings[0] ?? null;
  });

export const selectPendingCount = (date: string) =>
  createSelector(
    selectBookingsFor(date, 'pending'),
    bookings => bookings.length
  );

export const selectBookingMutating = (state: RootState) =>
  state.booking.mutating;

export const selectBookingActionLoading = (id: string) => (state: RootState) =>
  Boolean(state.booking.actionLoadingById[id]);

export const selectBookingError = (state: RootState) => state.booking.lastError;

export const selectLastSessionAmount = (state: RootState) =>
  state.booking.lastSessionAmount;
