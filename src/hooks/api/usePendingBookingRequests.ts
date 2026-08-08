import { useCallback, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { fetchBookingsThunk } from '../../store/booking/bookingSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { ApiUser, Booking } from '../../types/api.types';
import { formatDateParam, getUserId } from '../../utils/api/userId';
import { listCacheKey } from '../../utils/bookings/bookingStatus';
import { syncServerNotifications } from '../../services/notifications/notificationSyncService';

const PENDING_LOOKAHEAD_DAYS = 14;
const CACHE_TTL_MS = 30_000;
const CONCURRENCY = 4;
const POLL_MS = 45_000;

const upcomingDateParams = (from = new Date(), days = PENDING_LOOKAHEAD_DAYS) =>
  Array.from({ length: days }, (_, index) => {
    const date = new Date(from);
    date.setDate(from.getDate() + index);
    return formatDateParam(date);
  });

const runPool = async (
  dates: string[],
  worker: (date: string) => Promise<void>
) => {
  let cursor = 0;
  const runners = Array.from(
    { length: Math.min(CONCURRENCY, dates.length) },
    async () => {
      while (cursor < dates.length) {
        const index = cursor;
        cursor += 1;
        await worker(dates[index]);
      }
    }
  );
  await Promise.all(runners);
};

/**
 * Tutor Requests tab: load pending bookings across upcoming days.
 * Soft polling only — heavy fan-out is cached + concurrency-limited.
 */
export const usePendingBookingRequests = () => {
  const dispatch = useAppDispatch();
  const byId = useAppSelector(state => state.booking.byId);
  const lists = useAppSelector(state => state.booking.lists);
  const mutating = useAppSelector(state => state.booking.mutating);
  const authUser = useAppSelector(state => state.auth.user as ApiUser | null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastOkAtRef = useRef(0);
  const inFlightRef = useRef<Promise<void> | null>(null);
  const focusedRef = useRef(false);

  const dateParams = useMemo(() => upcomingDateParams(), []);

  const refresh = useCallback(
    async (opts?: { pull?: boolean; force?: boolean }) => {
      const pull = Boolean(opts?.pull);
      const force = Boolean(opts?.force) || pull;
      const fresh = Date.now() - lastOkAtRef.current < CACHE_TTL_MS;
      if (!force && fresh) return;
      if (inFlightRef.current) {
        await inFlightRef.current;
        return;
      }

      if (pull) setRefreshing(true);
      else if (!lastOkAtRef.current) setLoading(true);
      setError(null);

      const run = (async () => {
        try {
          await runPool(dateParams, async date => {
            try {
              await dispatch(
                fetchBookingsThunk({ date, tab: 'pending' })
              ).unwrap();
            } catch {
              // ignore single-day failures
            }
          });
          lastOkAtRef.current = Date.now();
          void syncServerNotifications(getUserId(authUser));
        } catch (err) {
          setError(
            typeof err === 'string' ? err : 'Could not load booking requests.'
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      })();

      inFlightRef.current = run.finally(() => {
        inFlightRef.current = null;
      });
      await inFlightRef.current;
    },
    [authUser, dateParams, dispatch]
  );

  useFocusEffect(
    useCallback(() => {
      focusedRef.current = true;
      void refresh({ force: false });
      const timer = setInterval(() => {
        if (focusedRef.current) void refresh({ force: true });
      }, POLL_MS);
      return () => {
        focusedRef.current = false;
        clearInterval(timer);
      };
    }, [refresh])
  );

  const bookings = useMemo(() => {
    const map = new Map<string, Booking>();
    dateParams.forEach(date => {
      const meta = lists[listCacheKey(date, 'pending')];
      meta?.ids?.forEach(id => {
        const booking = byId[id];
        if (booking && booking.status === 'pending') {
          map.set(booking._id, booking);
        }
      });
    });
    Object.values(byId).forEach(booking => {
      if (booking?.status === 'pending') {
        map.set(booking._id, booking);
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      const dateCmp = String(a.date).localeCompare(String(b.date));
      if (dateCmp !== 0) return dateCmp;
      return String(a.startTime).localeCompare(String(b.startTime));
    });
  }, [byId, dateParams, lists]);

  return {
    bookings,
    loading: loading && bookings.length === 0,
    refreshing,
    actionLoading: mutating,
    error,
    refresh: () => refresh({ pull: true, force: true }),
  };
};
