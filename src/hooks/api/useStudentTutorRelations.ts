import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { fetchBookingsThunk } from '../../store/booking/bookingSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { Booking, BookingTab } from '../../types/api.types';
import { formatDateParam } from '../../utils/api/userId';
import {
  resolveTutorBookingRelation,
  TutorBookingRelation,
} from '../../utils/bookings/tutorBookingRelation';
import type { AppDispatch } from '../../store/store';

/** Keep this small — Render cold starts make large fan-outs feel frozen. */
const LOOKAHEAD_DAYS = 21;
const LOOKBACK_DAYS = 7;
const CACHE_TTL_MS = 45_000;
const CONCURRENCY = 4;

type CacheState = {
  inFlight: Promise<void> | null;
  lastOkAt: number;
};

const cache: CacheState = {
  inFlight: null,
  lastOkAt: 0,
};

const dateWindow = (from = new Date()) =>
  Array.from({ length: LOOKAHEAD_DAYS + LOOKBACK_DAYS }, (_, index) => {
    const date = new Date(from);
    date.setDate(from.getDate() - LOOKBACK_DAYS + index);
    return formatDateParam(date);
  });

const runPool = async <T,>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>
) => {
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      await worker(items[index]);
    }
  });
  await Promise.all(runners);
};

/**
 * Shared loader so Home + Search + Booking details don't each fan-out 40+ calls.
 */
export const ensureStudentTutorRelations = async (
  dispatch: AppDispatch,
  options?: { force?: boolean }
): Promise<void> => {
  const force = Boolean(options?.force);
  const fresh = Date.now() - cache.lastOkAt < CACHE_TTL_MS;
  if (!force && fresh) return;
  if (cache.inFlight) return cache.inFlight;

  const dates = dateWindow();
  const jobs: Array<{ date: string; tab: BookingTab }> = dates.flatMap(date => [
    { date, tab: 'pending' as const },
    { date, tab: 'active' as const },
  ]);

  cache.inFlight = (async () => {
    await runPool(jobs, CONCURRENCY, async job => {
      try {
        await dispatch(
          fetchBookingsThunk({ date: job.date, tab: job.tab })
        ).unwrap();
      } catch {
        // Soft-fail individual days so one timeout doesn't block CTA updates.
      }
    });
    cache.lastOkAt = Date.now();
  })().finally(() => {
    cache.inFlight = null;
  });

  return cache.inFlight;
};

export const invalidateStudentTutorRelationsCache = () => {
  cache.lastOkAt = 0;
};

/**
 * Tracks the student's pending + active bookings so tutor cards can show
 * Request Sent / Already in Your Bookings without hammering the API.
 */
export const useStudentTutorRelations = () => {
  const dispatch = useAppDispatch();
  const byId = useAppSelector(state => state.booking.byId);
  const role = useAppSelector(state => state.auth.role);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(
    async (force = false) => {
      if (role !== 'student' && role !== 'parent') return;
      setLoading(true);
      try {
        await ensureStudentTutorRelations(dispatch, { force });
      } finally {
        setLoading(false);
      }
    },
    [dispatch, role]
  );

  useFocusEffect(
    useCallback(() => {
      void refresh(false);
    }, [refresh])
  );

  const relevantBookings = useMemo(() => {
    const map = new Map<string, Booking>();
    // Prefer Redux source of truth — newly created bookings appear instantly.
    Object.values(byId).forEach(booking => {
      if (!booking) return;
      if (booking.status === 'pending' || booking.status === 'accepted') {
        map.set(booking._id, booking);
      }
    });
    return Array.from(map.values());
  }, [byId]);

  const getRelation = useCallback(
    (
      tutorKeys: Array<string | null | undefined>,
      searchFlags?: import('../../types/api.types').TutorBookingRelationFlags | null
    ): TutorBookingRelation =>
      resolveTutorBookingRelation(tutorKeys, relevantBookings, searchFlags),
    [relevantBookings]
  );

  return {
    bookings: relevantBookings,
    loading,
    refresh: () => refresh(true),
    getRelation,
  };
};
