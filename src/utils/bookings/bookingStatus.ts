import { Booking, BookingStatus } from '../../types/api.types';

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

  const twentyFour = raw.match(/^(\d{1,2}):(\d{2})$/);
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
  const day = String(date || '').slice(0, 10);
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

export const hasSessionEnded = (
  booking: Pick<Booking, 'date' | 'endTime'>,
  now = new Date()
): boolean => {
  const end = getBookingDateTime(booking.date, booking.endTime);
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
): boolean =>
  booking.status === 'accepted' && !hasSessionEnded(booking, now);

export const canJoinMeeting = (booking: Booking): boolean =>
  booking.status === 'accepted' &&
  Boolean(booking.meetingLink && booking.meetingLink.trim());

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
