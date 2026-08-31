import { Booking, BookingStatus } from '../../types/api.types';
import { normalizeBookingDateParam } from './bookingStatus';

const TAG = '[BookingAPI]';

/** Map backend status aliases → canonical BookingStatus. */
export const normalizeBookingStatus = (
  status: unknown
): BookingStatus | string => {
  const raw = String(status || '')
    .toLowerCase()
    .trim();
  if (!raw) return '';
  if (raw === 'confirmed' || raw === 'approved' || raw === 'accept') {
    return 'accepted';
  }
  if (raw === 'canceled') return 'cancelled';
  if (raw === 'reject' || raw === 'declined') return 'cancelled';
  return raw;
};

/**
 * Normalize one booking from any API shape so Redux + tab filters always
 * have `_id`, YYYY-MM-DD `date`, and canonical `status`.
 */
export const normalizeBookingFromApi = (
  raw: unknown,
  source = 'unknown'
): Booking | null => {
  if (!raw || typeof raw !== 'object') {
    console.log(TAG, 'skip non-object booking', { source, raw });
    return null;
  }

  const b = raw as Record<string, unknown>;
  const id = String(b._id || b.id || '').trim();
  if (!id || id === 'undefined' || id === 'null') {
    console.log(TAG, 'skip booking without id', { source, keys: Object.keys(b) });
    return null;
  }

  const status = normalizeBookingStatus(b.status) as BookingStatus;
  const date = normalizeBookingDateParam(
    (b.date as string | Date | undefined) ?? ''
  );

  const normalized: Booking = {
    ...(b as unknown as Booking),
    _id: id,
    subject: String(b.subject || ''),
    date: date || String(b.date || ''),
    startTime: String(b.startTime || ''),
    endTime: String(b.endTime || ''),
    status: status || ('' as BookingStatus),
    student: (b.student as Booking['student']) ?? '',
    tutor: (b.tutor as Booking['tutor']) ?? '',
    hourlyRateAtBooking:
      b.hourlyRateAtBooking != null
        ? Number(b.hourlyRateAtBooking)
        : undefined,
    meetingLink: b.meetingLink != null ? String(b.meetingLink) : undefined,
    mode: b.mode != null ? String(b.mode) : undefined,
    kind: b.kind != null ? String(b.kind) : undefined,
    packageId:
      b.packageId != null
        ? String(b.packageId)
        : b.parentBookingId != null
          ? String(b.parentBookingId)
          : undefined,
    parentBookingId:
      b.parentBookingId != null ? String(b.parentBookingId) : undefined,
    durationDays:
      b.durationDays != null && !Number.isNaN(Number(b.durationDays))
        ? Number(b.durationDays)
        : undefined,
    sessionIndex:
      b.sessionIndex != null && !Number.isNaN(Number(b.sessionIndex))
        ? Number(b.sessionIndex)
        : undefined,
    isNextSession: Boolean(b.isNextSession),
  };

  if (!source.startsWith('redux.')) {
    console.log(TAG, 'normalized', {
      source,
      bookingId: normalized._id,
      status: normalized.status,
      kind: normalized.kind,
      mode: normalized.mode,
      packageId: normalized.packageId,
      durationDays: normalized.durationDays,
      dateRaw: b.date,
      dateNorm: normalized.date,
      startTime: normalized.startTime,
      endTime: normalized.endTime,
      isNextSession: normalized.isNextSession,
      tutor:
        typeof normalized.tutor === 'object' && normalized.tutor
          ? (normalized.tutor as { name?: string; _id?: string }).name ||
            (normalized.tutor as { _id?: string })._id
          : normalized.tutor,
    });
  }

  return normalized;
};

export const normalizeBookingList = (
  rawList: unknown,
  source: string
): Booking[] => {
  if (!Array.isArray(rawList)) {
    console.log(TAG, 'list not array', { source, type: typeof rawList });
    return [];
  }
  return rawList
    .map((item, index) =>
      normalizeBookingFromApi(item, `${source}[${index}]`)
    )
    .filter((b): b is Booking => Boolean(b));
};

/** Extract booking array from common API envelope shapes. */
export const extractBookingsPayload = (
  payload: unknown,
  source: string
): Booking[] => {
  console.log(TAG, 'raw envelope', {
    source,
    payloadType: typeof payload,
    keys:
      payload && typeof payload === 'object'
        ? Object.keys(payload as object)
        : [],
    preview: JSON.stringify(payload)?.slice(0, 800),
  });

  if (!payload || typeof payload !== 'object') return [];
  const p = payload as Record<string, unknown>;

  if (Array.isArray(p.data)) {
    return normalizeBookingList(p.data, `${source}.data`);
  }
  if (p.data && typeof p.data === 'object') {
    const nested = p.data as Record<string, unknown>;
    if (Array.isArray(nested.bookings)) {
      return normalizeBookingList(nested.bookings, `${source}.data.bookings`);
    }
    if (Array.isArray(nested.data)) {
      return normalizeBookingList(nested.data, `${source}.data.data`);
    }
  }
  if (Array.isArray(p.bookings)) {
    return normalizeBookingList(p.bookings, `${source}.bookings`);
  }
  if (Array.isArray(p.results)) {
    return normalizeBookingList(p.results, `${source}.results`);
  }
  // Single booking wrapped as data
  if (p.data && typeof p.data === 'object' && !Array.isArray(p.data)) {
    const one = normalizeBookingFromApi(p.data, `${source}.data(single)`);
    return one ? [one] : [];
  }

  console.log(TAG, 'could not extract bookings', { source });
  return [];
};

export const logBookingTabSummary = (
  label: string,
  bookings: Booking[]
) => {
  const rows = bookings.map(b => ({
    id: b._id,
    status: b.status,
    date: b.date,
    start: b.startTime,
    end: b.endTime,
    isNextSession: b.isNextSession,
    tutor:
      typeof b.tutor === 'object' && b.tutor
        ? (b.tutor as { name?: string }).name
        : b.tutor,
  }));
  console.log(TAG, label, { count: rows.length, rows });
};
