import { Booking } from '../../types/api.types';
import {
  getBookingDateTime,
  matchesBookingTab,
  normalizeBookingDateParam,
} from './bookingStatus';
import { getBookingTutorName } from '../api/bookingHelpers';

const TAG = '[ActiveDebug]';

/** Temporary diagnostics for Active-tab missing accepted bookings (e.g. Ammar). */
export const logActiveBookingTrace = (
  label: string,
  booking: Booking | null | undefined,
  extra?: Record<string, unknown>
) => {
  if (!booking) {
    console.log(TAG, label, { booking: null, ...extra });
    return;
  }

  const normalizedDate = normalizeBookingDateParam(booking.date);
  const sessionEnd = getBookingDateTime(booking.date, booking.endTime);
  const now = new Date();
  const tutorName = getBookingTutorName(booking);

  console.log(TAG, label, {
    bookingId: booking._id,
    tutorName,
    status: booking.status,
    bookingDateRaw: booking.date,
    normalizedDate,
    startTime: booking.startTime,
    endTime: booking.endTime,
    nowIso: now.toISOString(),
    nowLocal: now.toString(),
    sessionEndIso: sessionEnd?.toISOString() ?? null,
    sessionEndLocal: sessionEnd?.toString() ?? null,
    sessionEndMs: sessionEnd?.getTime() ?? null,
    nowMs: now.getTime(),
    matchesActive: matchesBookingTab(booking, 'active', now),
    matchesPending: matchesBookingTab(booking, 'pending', now),
    isNextSession: booking.isNextSession,
    ...extra,
  });
};

export const logActiveApiCall = (payload: {
  date: string;
  tab: string;
  url?: string;
  count?: number;
  ids?: string[];
  tutorNames?: string[];
  raw?: unknown;
}) => {
  console.log(TAG, 'API', {
    activeApiUrl:
      payload.url ||
      `/api/bookings?date=${payload.date}&tab=${payload.tab}`,
    date: payload.date,
    tab: payload.tab,
    resultCount: payload.count,
    ids: payload.ids,
    tutorNames: payload.tutorNames,
  });
};

export const logActiveFinalList = (bookings: Booking[]) => {
  console.log(
    TAG,
    'final Active-tab filtered array',
    bookings.map(b => ({
      bookingId: b._id,
      tutorName: getBookingTutorName(b),
      status: b.status,
      date: normalizeBookingDateParam(b.date),
      startTime: b.startTime,
      endTime: b.endTime,
      isNextSession: b.isNextSession,
    }))
  );
};
