import { useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { fetchBookingByIdThunk } from '../../store/booking/bookingSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { ApiUser } from '../../types/api.types';
import { getUserId } from '../../utils/api/userId';
import {
  notifyStudentBookingAccepted,
  notifyStudentBookingRejected,
} from '../../services/bookings/bookingsService';
import {
  listWatchedStudentPendingBookings,
  unwatchStudentPendingBooking,
  watchStudentPendingBooking,
} from '../../services/bookings/studentBookingWatchStore';
import { syncServerNotifications } from '../../services/notifications/notificationSyncService';

const POLL_MS = 8_000;

/**
 * Student/parent: poll watched pending bookings and write local inbox items
 * when the tutor accepts or rejects (backend FCM may be missing in demos).
 */
export const useStudentBookingOutcomeWatch = (enabled = true) => {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector(state => state.auth.user as ApiUser | null);
  const role = useAppSelector(state => state.auth.role);
  const inFlightRef = useRef(false);
  const focusedRef = useRef(false);

  const tick = useCallback(async () => {
    if (!enabled) return;
    if (role !== 'student' && role !== 'parent') return;
    if (inFlightRef.current) return;

    inFlightRef.current = true;
    try {
      const ids = await listWatchedStudentPendingBookings();
      if (ids.length === 0) {
        void syncServerNotifications(getUserId(authUser));
        return;
      }

      for (const id of ids) {
        try {
          const booking = await dispatch(
            fetchBookingByIdThunk({ id, force: true })
          ).unwrap();
          if (!booking) continue;

          if (booking.status === 'pending') {
            await watchStudentPendingBooking(booking._id);
            continue;
          }

          if (booking.status === 'accepted') {
            notifyStudentBookingAccepted(booking);
            await unwatchStudentPendingBooking(booking._id);
          } else if (booking.status === 'cancelled') {
            notifyStudentBookingRejected(booking);
            await unwatchStudentPendingBooking(booking._id);
          } else {
            await unwatchStudentPendingBooking(booking._id);
          }
        } catch {
          // keep watching — transient network errors
        }
      }

      void syncServerNotifications(getUserId(authUser));
    } finally {
      inFlightRef.current = false;
    }
  }, [authUser, dispatch, enabled, role]);

  useFocusEffect(
    useCallback(() => {
      if (!enabled) return undefined;
      if (role !== 'student' && role !== 'parent') return undefined;

      focusedRef.current = true;
      void tick();
      const timer = setInterval(() => {
        if (focusedRef.current) void tick();
      }, POLL_MS);

      return () => {
        focusedRef.current = false;
        clearInterval(timer);
      };
    }, [enabled, role, tick])
  );

  return { refresh: tick };
};
