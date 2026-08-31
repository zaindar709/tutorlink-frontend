import { Booking } from '../../types/api.types';
import { getWorkDatesForDuration } from '../schedule/scheduleHelpers';
import { getBookingDateTime } from './bookingStatus';

/** Pending or accepted monthly Mon–Fri package parent row. */
export const isPackageBooking = (booking?: Booking | null): boolean => {
  if (!booking) return false;
  if (String(booking.kind || '').toLowerCase() === 'package') return true;
  return (
    String(booking.mode || '').toLowerCase() === 'monthly_weekdays' &&
    !booking.parentBookingId &&
    booking.status === 'pending'
  );
};

/** One weekday class that belongs to a monthly package. */
export const isPackageSession = (booking?: Booking | null): boolean => {
  if (!booking) return false;
  if (String(booking.kind || '').toLowerCase() === 'session') return true;
  return Boolean(booking.packageId || booking.parentBookingId);
};

export const isMonthlyWeekdaysBooking = (booking?: Booking | null): boolean => {
  if (!booking) return false;
  return (
    String(booking.mode || '').toLowerCase() === 'monthly_weekdays' ||
    isPackageBooking(booking) ||
    isPackageSession(booking)
  );
};

/** Id to cancel the whole month (package parent), else session id. */
export const getPackageCancelId = (booking: Booking): string =>
  String(booking.packageId || booking._id);

export const estimateWeekdaySessionCount = (
  startDate: string,
  durationDays = 30
): number => {
  if (!startDate) return 0;
  const base = new Date(`${startDate}T12:00:00`);
  if (Number.isNaN(base.getTime())) return 0;
  return getWorkDatesForDuration(base, durationDays).length;
};

export const getBookingDurationDays = (booking?: Booking | null): number =>
  Math.max(1, Number(booking?.durationDays) || 30);

const tutorKeyOf = (booking: Booking): string => {
  const t = booking.tutor as { _id?: string; id?: string } | string | undefined;
  if (t && typeof t === 'object') {
    return String(t._id || t.id || '');
  }
  return String(t || (booking as { tutorId?: string }).tutorId || '');
};

/**
 * Active tab should not list every Mon–Fri session of a monthly package.
 * Keep only the earliest upcoming session per package (or per tutor+subject+time).
 */
export const collapseActiveMonthlySessions = (
  bookings: Booking[]
): Booking[] => {
  const standalone: Booking[] = [];
  const groups = new Map<string, Booking[]>();

  for (const booking of bookings) {
    const packageKey = String(
      booking.packageId || booking.parentBookingId || ''
    ).trim();

    let groupKey = '';
    if (packageKey) {
      groupKey = `pkg:${packageKey}`;
    } else if (isMonthlyWeekdaysBooking(booking)) {
      groupKey = `monthly:${tutorKeyOf(booking)}:${String(
        booking.subject || ''
      ).toLowerCase()}:${String(booking.startTime || '')}`;
    }

    if (groupKey) {
      const list = groups.get(groupKey) || [];
      list.push(booking);
      groups.set(groupKey, list);
      continue;
    }

    standalone.push(booking);
  }

  const nextOnly: Booking[] = [];
  for (const group of groups.values()) {
    const sorted = [...group].sort((a, b) => {
      const aT = getBookingDateTime(a.date, a.startTime)?.getTime() ?? Infinity;
      const bT = getBookingDateTime(b.date, b.startTime)?.getTime() ?? Infinity;
      if (aT !== bT) return aT - bT;
      return String(a._id).localeCompare(String(b._id));
    });
    if (sorted[0]) nextOnly.push(sorted[0]);
  }

  return [...standalone, ...nextOnly].sort((a, b) => {
    const aT = getBookingDateTime(a.date, a.startTime)?.getTime() ?? Infinity;
    const bT = getBookingDateTime(b.date, b.startTime)?.getTime() ?? Infinity;
    return aT - bT;
  });
};
