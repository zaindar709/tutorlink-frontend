import { Booking, BookingStatus } from '../../types/api.types';
import { PANEL_DEMO_SESSION_MINUTES } from '../../config/features';

/** Normalize API/Mongo date (YYYY-MM-DD or ISODate) → YYYY-MM-DD for queries. */
export const normalizeBookingDateParam = (
  date: string | Date | null | undefined
): string => {
  if (!date) return '';
  if (date instanceof Date && !Number.isNaN(date.getTime())) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const raw = String(date).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  // ISODate / ISO string — use the calendar day from the UTC components when
  // the time is midnight UTC (common Mongo date-only storage), otherwise local.
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return raw.slice(0, 10);
  }

  const isUtcMidnight =
    parsed.getUTCHours() === 0 &&
    parsed.getUTCMinutes() === 0 &&
    parsed.getUTCSeconds() === 0;

  if (isUtcMidnight || /T00:00:00(\.0+)?Z$/i.test(raw)) {
    const y = parsed.getUTCFullYear();
    const m = String(parsed.getUTCMonth() + 1).padStart(2, '0');
    const d = String(parsed.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, '0');
  const d = String(parsed.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/** Parse "2:00 PM" / "14:00" into hours+minutes. */
export const parseTimeToMinutes = (time: string): number | null => {
  const raw = String(time || '').trim();
  if (!raw) return null;

  const twelve = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (twelve) {
    let hours = Number(twelve[1]);
    const minutes = Number(twelve[2]);
    const mer = twelve[3].toUpperCase();
    if (mer === 'PM' && hours !== 12) hours += 12;
    if (mer === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  const twentyFour = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (twentyFour) {
    return Number(twentyFour[1]) * 60 + Number(twentyFour[2]);
  }

  return null;
};

/** Calendar date YYYY-MM-DD (or ISO) + time → Date in local timezone. */
export const getBookingDateTime = (
  date: string,
  time: string
): Date | null => {
  const day = normalizeBookingDateParam(date);
  const mins = parseTimeToMinutes(time);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || mins == null) return null;

  const [y, m, d] = day.split('-').map(Number);
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  return new Date(y, m - 1, d, hours, minutes, 0, 0);
};

export const getSessionDurationHours = (
  startTime: string,
  endTime: string
): number => {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  if (start == null || end == null || end <= start) return 1;
  return Math.max(1, Math.round(((end - start) / 60) * 100) / 100);
};

export const getSessionAmount = (booking: Booking): number => {
  const rate = Number(booking.hourlyRateAtBooking) || 0;
  const hours = getSessionDurationHours(booking.startTime, booking.endTime);
  return Math.max(1, Math.round(rate * hours));
};

/**
 * Effective session end for join/complete/tab logic.
 * Panel demo shortens the window to N minutes after startTime.
 */
export const getEffectiveSessionEnd = (
  booking: Pick<Booking, 'date' | 'startTime' | 'endTime'>
): Date | null => {
  if (
    PANEL_DEMO_SESSION_MINUTES != null &&
    Number.isFinite(PANEL_DEMO_SESSION_MINUTES) &&
    PANEL_DEMO_SESSION_MINUTES > 0
  ) {
    const start = getBookingDateTime(booking.date, booking.startTime);
    if (start) {
      return new Date(
        start.getTime() + PANEL_DEMO_SESSION_MINUTES * 60 * 1000
      );
    }
  }
  return getBookingDateTime(booking.date, booking.endTime);
};

export const hasSessionEnded = (
  booking: Pick<Booking, 'date' | 'endTime'> & {
    startTime?: string;
  },
  now = new Date()
): boolean => {
  const end =
    booking.startTime != null
      ? getEffectiveSessionEnd({
          date: booking.date,
          startTime: booking.startTime,
          endTime: booking.endTime,
        })
      : getBookingDateTime(booking.date, booking.endTime);
  if (!end) return false;
  return now.getTime() >= end.getTime();
};

/** True if the session start is already in the past (cannot book / confirm meaningfully). */
export const hasSessionStarted = (
  booking: Pick<Booking, 'date' | 'startTime'>,
  now = new Date()
): boolean => {
  const start = getBookingDateTime(booking.date, booking.startTime);
  if (!start) return false;
  return now.getTime() >= start.getTime();
};

export const isSlotEnded = (
  date: string,
  endTime: string,
  now = new Date()
): boolean => hasSessionEnded({ date, endTime }, now);

export const isSlotStarted = (
  date: string,
  startTime: string,
  now = new Date()
): boolean => hasSessionStarted({ date, startTime }, now);

/** Keep only slots whose start is still in the future for the given date. */
export const filterFutureSlots = <
  T extends { startTime: string; endTime: string; available?: boolean }
>(
  slots: T[],
  date: string,
  now = new Date()
): T[] =>
  slots.filter(slot => {
    if (slot.available === false) return false;
    return !isSlotStarted(date, slot.startTime, now);
  });

export const pickFirstFutureSlot = <
  T extends { startTime: string; endTime: string; available?: boolean }
>(
  slots: T[],
  date: string,
  now = new Date()
): T | null => filterFutureSlots(slots, date, now)[0] ?? null;

export const isAcceptedActive = (
  booking: Booking,
  now = new Date()
): boolean => {
  const status = String(booking.status || '').toLowerCase();
  return (
    (status === 'accepted' || status === 'confirmed') &&
    !hasSessionEnded(booking, now)
  );
};

/**
 * Mirrors backend `filterByTab` in bookingRoutes:
 * - pending: status === pending
 * - active: status === accepted && session end still in the future
 * - past: completed/cancelled/missed, OR accepted but session already ended
 */
export const matchesBookingTab = (
  booking: Pick<Booking, 'status' | 'date' | 'endTime'> & {
    kind?: string;
  },
  tab: 'active' | 'pending' | 'past',
  now = new Date()
): boolean => {
  const status = String(booking.status || '').toLowerCase().trim();
  const kind = String(booking.kind || '').toLowerCase().trim();

  // Package parent rows only belong on Pending while awaiting tutor accept.
  // After confirm, Active/Past use generated weekday session bookings.
  if (kind === 'package') {
    return tab === 'pending' && status === 'pending';
  }

  if (tab === 'pending') return status === 'pending';
  if (tab === 'active') {
    return (
      (status === 'accepted' || status === 'confirmed') &&
      !hasSessionEnded(booking, now)
    );
  }
  if (
    status === 'completed' ||
    status === 'cancelled' ||
    status === 'canceled' ||
    status === 'missed'
  ) {
    return true;
  }
  return status === 'accepted' && hasSessionEnded(booking, now);
};

/**
 * Joinable when the booking is accepted and the session window has not ended.
 * Opens the in-app TutorLink WebRTC classroom (booking._id = sessionId).
 * Optional external meetingLink remains available as a secondary link.
 */
export const canJoinMeeting = (booking: Booking, now = new Date()): boolean => {
  const status = String(booking.status || '').toLowerCase();
  return (
    (status === 'accepted' || status === 'confirmed') &&
    !hasSessionEnded(booking, now)
  );
};

export const canCompleteSession = (
  booking: Booking,
  now = new Date()
): boolean =>
  booking.status === 'accepted' && hasSessionEnded(booking, now);

export const canCancel = (booking: Booking): boolean =>
  booking.status === 'pending' || booking.status === 'accepted';

export const canRate = (booking: Booking): boolean =>
  booking.status === 'completed' && !booking.studentRating && !booking.ratedAt;

export const canMessage = (booking: Booking): boolean =>
  booking.status === 'pending' ||
  booking.status === 'accepted' ||
  booking.status === 'completed';

export const isValidHttpsMeetingLink = (link: string): boolean => {
  const trimmed = link.trim();
  if (!trimmed) return true;
  if (trimmed.length > 500) return false;
  try {
    const url = new URL(trimmed);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
};

export type BookingDisplayStatus =
  | 'Pending'
  | 'Active'
  | 'Accepted'
  | 'Completed'
  | 'Cancelled'
  | 'Missed';

export const getBookingDisplayLabel = (
  booking: Booking,
  now = new Date()
): BookingDisplayStatus => {
  switch (booking.status) {
    case 'pending':
      return 'Pending';
    case 'accepted':
      return hasSessionEnded(booking, now) ? 'Accepted' : 'Active';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    case 'missed':
      return 'Missed';
    default:
      return 'Pending';
  }
};

export const getBookingStatusColor = (status: BookingStatus): string => {
  switch (status) {
    case 'pending':
      return '#F59E0B';
    case 'accepted':
      return '#10B981';
    case 'completed':
      return '#3B82F6';
    case 'cancelled':
      return '#EF4444';
    case 'missed':
      return '#6B7280';
    default:
      return '#6B7280';
  }
};

export const listCacheKey = (date: string, tab: string) => `${date}|${tab}`;
