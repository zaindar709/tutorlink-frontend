import { useCallback, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  cancelBookingThunk,
  completeBookingThunk,
  confirmBookingThunk,
  createBookingThunk,
  clearBookingError,
  fetchBookingByIdThunk,
  fetchBookingsThunk,
  rateBookingThunk,
  upsertBookingLocal,
} from '../../store/booking/bookingSlice';
import {
  selectBookingError,
  selectBookingMutating,
} from '../../store/booking/bookingSelectors';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { store } from '../../store/store';
import {
  Booking,
  BookingTab,
  ConfirmBookingPayload,
  CreateBookingPayload,
  ApiUser,
} from '../../types/api.types';
import { formatDateParam, getUserId } from '../../utils/api/userId';
import { getTutorUserId } from '../../utils/api/bookingHelpers';
import {
  getBookingDateTime,
  listCacheKey,
  matchesBookingTab,
  normalizeBookingDateParam,
} from '../../utils/bookings/bookingStatus';
import { logBookingTabSummary } from '../../utils/bookings/normalizeBooking';
import { collapseActiveMonthlySessions } from '../../utils/bookings/packageHelpers';
import { invalidateStudentTutorRelationsCache } from './useStudentTutorRelations';
import { getNotificationInbox } from '../../services/notifications/notificationInboxStore';
import { scheduleLocalSessionReminders } from '../../services/notifications/sessionReminderService';
import { fetchBookingsWithTutor } from '../../services/bookings/bookingsService';
import { fetchDashboard } from '../../services/home/homeService';
import { listWatchedStudentPendingBookings } from '../../services/bookings/studentBookingWatchStore';

const LOOKAHEAD_DAYS = 21;
const LOOKBACK_DAYS = 7;
const FETCH_CONCURRENCY = 2;
const CACHE_FRESH_MS = 30_000;

const buildDateWindow = (anchor = new Date()): string[] => {
  const start = new Date(anchor);
  start.setHours(12, 0, 0, 0);
  return Array.from({ length: LOOKAHEAD_DAYS + LOOKBACK_DAYS }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() - LOOKBACK_DAYS + index);
    return formatDateParam(date);
  });
};

const runPool = async <T,>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>
) => {
  let cursor = 0;
  const runners = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (cursor < items.length) {
        const index = cursor;
        cursor += 1;
        await worker(items[index]);
      }
    }
  );
  await Promise.all(runners);
};

const bookingDay = (booking: Booking): string =>
  normalizeBookingDateParam(booking.date);

/**
 * Student/tutor bookings tabs.
 * Active is hydrated like Pending: fan-out + tab-wide fetch + forced status
 * refresh for stale pending rows + with-tutor / notification fallbacks.
 */
export const useBookings = (initialTab: BookingTab = 'active') => {
  const dispatch = useAppDispatch();
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    return d;
  });
  const [tab, setTabState] = useState<BookingTab>(initialTab);
  const [initialLoading, setInitialLoading] = useState(true);
  const [pullRefreshing, setPullRefreshing] = useState(false);

  const dateParam = formatDateParam(selectedDate);
  const dateWindow = useMemo(() => buildDateWindow(new Date()), [tab]);

  const byId = useAppSelector(state => state.booking.byId);
  const lists = useAppSelector(state => state.booking.lists);
  const mutating = useAppSelector(selectBookingMutating);
  const lastError = useAppSelector(selectBookingError);
  const lastSessionAmount = useAppSelector(
    state => state.booking.lastSessionAmount
  );
  const authUser = useAppSelector(state => state.auth.user as ApiUser | null);

  const lastFetchAtRef = useRef<Record<string, number>>({});
  const inFlightRef = useRef(false);

  const hydrateFromNotifications = useCallback(async () => {
    try {
      const inbox = await getNotificationInbox(getUserId(authUser));
      const ids = new Set<string>();
      inbox.forEach(item => {
        const id =
          item.data?.bookingId ||
          item.data?.relatedId ||
          item.data?.booking_id;
        if (id) ids.add(String(id));
      });
      await runPool(Array.from(ids).slice(0, 12), 3, async id => {
        try {
          await dispatch(
            fetchBookingByIdThunk({ id, force: true })
          ).unwrap();
        } catch {
          // ignore
        }
      });
    } catch {
      // optional
    }
  }, [authUser, dispatch]);

  const hydrateFromWithTutor = useCallback(async () => {
    const snapshot = Object.values(store.getState().booking.byId);
    const tutorIds = new Set<string>();
    snapshot.forEach(b => {
      const tid = getTutorUserId(b);
      if (tid) tutorIds.add(String(tid));
    });

    // Chat peers are often tutors the student already booked (e.g. Ammar).
    const conversations = store.getState().chat?.conversations || [];
    conversations.forEach(c => {
      const peer = c?.participant;
      if (peer?.role === 'tutor' && peer.id) {
        tutorIds.add(String(peer.id));
      }
    });

    console.log('[BookingAPI] with-tutor hydrate tutorIds', {
      count: tutorIds.size,
      ids: Array.from(tutorIds),
    });

    if (tutorIds.size === 0) return;

    const studentId = getUserId(authUser) || undefined;
    await runPool(Array.from(tutorIds).slice(0, 12), 2, async tutorId => {
      try {
        const rel = await fetchBookingsWithTutor(tutorId, studentId);
        const found: Booking[] = [];
        if (rel.activeBooking) found.push(rel.activeBooking);
        if (rel.pendingBooking) found.push(rel.pendingBooking);
        if (Array.isArray(rel.openBookings)) found.push(...rel.openBookings);
        found.forEach(booking => {
          if (booking?._id) {
            dispatch(upsertBookingLocal(booking));
            logBookingTabSummary('with-tutor hydrate', [booking]);
          }
        });
      } catch {
        // ignore
      }
    });
  }, [authUser, dispatch]);

  const hydrateFromDashboard = useCallback(async () => {
    try {
      const dashboard = await fetchDashboard();
      const lessons = dashboard?.todaySchedule?.currentLessons || [];
      console.log('[BookingAPI] dashboard lessons', {
        count: lessons.length,
        lessons: lessons.map(l => ({
          id: l._id,
          status: l.status,
          date: l.date,
          isNextSession: l.isNextSession,
          tutor: l.tutor?.name,
        })),
      });
      lessons.slice(0, 12).forEach(lesson => {
        if (!lesson?._id) return;
        const status = String(lesson.status || 'accepted').toLowerCase();
        const normalizedStatus =
          status === 'pending'
            ? 'pending'
            : status === 'completed' ||
                status === 'cancelled' ||
                status === 'missed'
              ? status
              : 'accepted';
        dispatch(
          upsertBookingLocal({
            _id: lesson._id,
            subject: lesson.subject,
            date: normalizeBookingDateParam(lesson.date),
            startTime: lesson.startTime,
            endTime: lesson.endTime,
            status: normalizedStatus as Booking['status'],
            tutor: lesson.tutor || '',
            student: lesson.student || '',
            meetingLink: lesson.meetingLink,
            isNextSession: lesson.isNextSession,
          })
        );
      });
    } catch {
      // dashboard optional
    }
  }, [dispatch]);

  const fetchDayTab = useCallback(
    async (date: string, dayTab: BookingTab, retries = 1) => {
      for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
          const result = await dispatch(
            fetchBookingsThunk({ date, tab: dayTab })
          ).unwrap();
          lastFetchAtRef.current[`${date}|${dayTab}`] = Date.now();
          return result.bookings;
        } catch (err) {
          console.log('[BookingAPI] day fetch failed', {
            date,
            tab: dayTab,
            attempt,
            err,
          });
          if (attempt === retries) return [];
        }
      }
      return [];
    },
    [dispatch]
  );

  const loadBookings = useCallback(
    async (opts?: { force?: boolean; pull?: boolean }) => {
      const force = Boolean(opts?.force);
      const pull = Boolean(opts?.pull);
      if (inFlightRef.current && !pull) return;
      inFlightRef.current = true;
      if (pull) setPullRefreshing(true);

      try {
        const now = Date.now();
        if (force || pull) {
          lastFetchAtRef.current = {};
        }

        const todayKey = formatDateParam(new Date());
        console.log('[BookingAPI] ========== loadBookings ==========', {
          tab,
          todayKey,
          selectedDate: dateParam,
          force,
          pull,
          dateWindowSize: dateWindow.length,
        });

        // STEP 1: Try date-less once (correct path if backend allows).
        let dateLessCount = 0;
        try {
          const wide = await dispatch(
            fetchBookingsThunk({ date: 'all', tab })
          ).unwrap();
          dateLessCount = wide.bookings.length;
          lastFetchAtRef.current[`all|${tab}`] = Date.now();
          console.log('[BookingAPI] date-less OK', {
            tab,
            count: dateLessCount,
          });
        } catch (err) {
          console.log('[BookingAPI] date-less not supported → date fan-out', {
            tab,
            err,
          });
        }

        // STEP 2: Fan-out over the date window (backend requires date=YYYY-MM-DD).
        const datesToFetch = dateWindow.filter(date => {
          if (force || pull || dateLessCount === 0) return true;
          const key = `${date}|${tab}`;
          const last = lastFetchAtRef.current[key] || 0;
          return now - last >= CACHE_FRESH_MS;
        });

        console.log('[BookingAPI] fan-out dates', {
          tab,
          count: datesToFetch.length,
          sample: datesToFetch.slice(0, 5),
        });

        await runPool(datesToFetch, FETCH_CONCURRENCY, async date => {
          await fetchDayTab(date, tab, 1);
          if (tab === 'active') {
            await fetchDayTab(date, 'pending', 0);
            if (date <= todayKey) {
              await fetchDayTab(date, 'past', 0);
            }
          } else if (tab === 'pending') {
            await fetchDayTab(date, 'active', 0);
          } else if (tab === 'past') {
            await fetchDayTab(date, 'active', 0);
          }
        });

        dispatch(clearBookingError());

        if (tab === 'active') {
          await hydrateFromDashboard();

          try {
            const watched = await listWatchedStudentPendingBookings();
            await runPool(watched.slice(0, 10), 2, async id => {
              try {
                await dispatch(
                  fetchBookingByIdThunk({ id, force: true })
                ).unwrap();
              } catch {
                // ignore
              }
            });
          } catch {
            // optional
          }

          await hydrateFromNotifications();
          await hydrateFromWithTutor();

          const known = Object.values(store.getState().booking.byId);
          const sessionDates = Array.from(
            new Set(
              known
                .filter(b => {
                  const s = String(b.status || '').toLowerCase();
                  return (
                    s === 'accepted' ||
                    s === 'confirmed' ||
                    s === 'pending'
                  );
                })
                .map(b => bookingDay(b))
                .filter(Boolean)
            )
          );

          await runPool(sessionDates, FETCH_CONCURRENCY, async date => {
            await fetchDayTab(date, 'active', 1);
          });

          const activeRows = Object.values(
            store.getState().booking.byId
          ).filter(b => matchesBookingTab(b, 'active'));
          logBookingTabSummary('FINAL Active (student)', activeRows);
          await scheduleLocalSessionReminders(
            activeRows,
            getUserId(authUser)
          );
        }
      } finally {
        inFlightRef.current = false;
        setInitialLoading(false);
        setPullRefreshing(false);
      }
    },
    [
      authUser,
      dateParam,
      dateWindow,
      dispatch,
      fetchDayTab,
      hydrateFromDashboard,
      hydrateFromNotifications,
      hydrateFromWithTutor,
      tab,
    ]
  );

  useFocusEffect(
    useCallback(() => {
      void loadBookings({ force: false });
    }, [loadBookings])
  );

  const bookings = useMemo(() => {
    const map = new Map<string, Booking>();

    const listKeys = [
      listCacheKey('all', tab),
      ...dateWindow.map(date => listCacheKey(date, tab)),
    ];
    listKeys.forEach(key => {
      const meta = lists[key];
      meta?.ids?.forEach(id => {
        const booking = byId[id];
        if (!booking || !matchesBookingTab(booking, tab)) return;
        map.set(booking._id, booking);
      });
    });

    // Merge byId with the same backend tab rules (accepted+future → Active)
    Object.values(byId).forEach(booking => {
      if (!booking || !matchesBookingTab(booking, tab)) return;
      map.set(booking._id, booking);
    });

    const sorted = Array.from(map.values()).sort((a, b) => {
      const aT = getBookingDateTime(a.date, a.startTime)?.getTime();
      const bT = getBookingDateTime(b.date, b.startTime)?.getTime();
      if (aT != null && bT != null && aT !== bT) return aT - bT;
      const dateCmp = bookingDay(a).localeCompare(bookingDay(b));
      if (dateCmp !== 0) return dateCmp;
      return String(a.startTime).localeCompare(String(b.startTime));
    });

    // Active: one card per monthly package (next upcoming class only).
    if (tab === 'active') {
      return collapseActiveMonthlySessions(sorted);
    }

    return sorted;
  }, [byId, dateWindow, lists, tab]);
  const bookingsOnSelectedDate = useMemo(() => {
    return bookings.filter(b => bookingDay(b) === dateParam);
  }, [bookings, dateParam]);

  const nextSession = useMemo(() => {
    if (tab !== 'active') return null;
    const flagged = bookings.find(b => b.isNextSession);
    if (flagged) return flagged;
    // Earliest upcoming accepted session (monthly Mon–Fri packages).
    return (
      [...bookings].sort((a, b) => {
        const aT =
          getBookingDateTime(a.date, a.startTime)?.getTime() ?? Infinity;
        const bT =
          getBookingDateTime(b.date, b.startTime)?.getTime() ?? Infinity;
        return aT - bT;
      })[0] ?? null
    );
  }, [bookings, tab]);

  const datesWithBookings = useMemo(() => {
    const set = new Set<string>();
    bookings.forEach(b => {
      const day = bookingDay(b);
      if (day) set.add(day);
    });
    return set;
  }, [bookings]);

  const isIgnorableListError = (msg?: string | null) => {
    if (!msg) return true;
    return (
      /date query parameter is required/i.test(msg) ||
      /not found/i.test(msg) ||
      /404/i.test(msg)
    );
  };

  const listError = (() => {
    const candidates = [
      lists[listCacheKey('all', tab)]?.error,
      ...dateWindow.map(date => lists[listCacheKey(date, tab)]?.error),
      lastError,
    ];
    return candidates.find(msg => msg && !isIgnorableListError(msg)) || null;
  })();

  const setTab = useCallback((next: BookingTab) => {
    setTabState(next);
    setInitialLoading(true);
  }, []);

  const handleCreateBooking = async (payload: CreateBookingPayload) => {
    try {
      const booking = await dispatch(createBookingThunk(payload)).unwrap();
      invalidateStudentTutorRelationsCache();
      await loadBookings({ force: true });
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
      await loadBookings({ force: true });
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
      await loadBookings({ force: true });
      return result;
    } catch {
      return null;
    }
  };

  const handleCompleteBooking = async (id: string) => {
    try {
      const result = await dispatch(completeBookingThunk(id)).unwrap();
      invalidateStudentTutorRelationsCache();
      await loadBookings({ force: true });
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
    bookingsOnSelectedDate,
    datesWithBookings,
    tab,
    setTab,
    selectedDate,
    setSelectedDate,
    dateParam,
    loading: initialLoading && bookings.length === 0,
    refreshing: pullRefreshing,
    actionLoading: mutating,
    error: listError,
    nextSession,
    lastSessionAmount,
    refresh: () => loadBookings({ force: true, pull: true }),
    createBooking: handleCreateBooking,
    confirmBooking: handleConfirmBooking,
    cancelBooking: handleCancelBooking,
    completeBooking: handleCompleteBooking,
    rateBooking: handleRateBooking,
  };
};
