import {
  acceptRescheduleAPI,
  cancelBookingAPI,
  cancelRescheduleAPI,
  completeBookingAPI,
  confirmBookingAPI,
  createBookingAPI,
  getBookingByIdAPI,
  getBookingsAPI,
  getBookingsWithTutorAPI,
  proposeRescheduleAPI,
  rejectRescheduleAPI,
} from '../../api/bookings.api';
import { rateSessionAPI } from '../../api/profile.api';
import {
  Booking,
  BookingMutationResult,
  BookingTab,
  ConfirmBookingPayload,
  CreateBookingPayload,
  ProposeReschedulePayload,
  RescheduleMutationResult,
} from '../../types/api.types';
import { upsertNotification } from '../notifications/notificationInboxStore';
import {
  getBookingStudentName,
  getBookingTutorName,
  getStudentUserId,
  getTutorUserId,
} from '../../utils/api/bookingHelpers';
import { parseBookingMutationResponse } from '../../utils/bookings/bookingResponse';
import {
  extractBookingsPayload,
  logBookingTabSummary,
  normalizeBookingFromApi,
} from '../../utils/bookings/normalizeBooking';
import { API_BASE_URL } from '../../config/api';

type NotifyAudience = 'student' | 'tutor';

const notifyBookingParty = (
  booking: Booking,
  audience: NotifyAudience,
  title: string,
  body: string,
  extraData?: Record<string, string>
) => {
  const recipientUserId =
    audience === 'student'
      ? getStudentUserId(booking)
      : getTutorUserId(booking);

  const statusKey = String(
    extraData?.outcome || extraData?.status || booking.status || 'update'
  );

  void upsertNotification({
    id: `booking-${audience}-${statusKey}-${booking._id}`,
    title,
    body,
    type:
      statusKey === 'accepted' || statusKey.includes('accept')
        ? 'booking_accepted'
        : statusKey === 'rejected' || statusKey.includes('reject')
          ? 'booking_rejected'
          : statusKey === 'pending'
            ? 'booking_request'
            : 'booking',
    createdAt: new Date().toISOString(),
    read: false,
    recipientUserId: recipientUserId || undefined,
    data: {
      type:
        statusKey === 'accepted' || statusKey.includes('accept')
          ? 'booking_accepted'
          : statusKey === 'rejected' || statusKey.includes('reject')
            ? 'booking_rejected'
            : statusKey === 'pending'
              ? 'booking_request'
              : 'booking',
      bookingId: booking._id,
      status: booking.status,
      screen:
        extraData?.screen ||
        (audience === 'student'
          ? statusKey === 'accepted' || statusKey.includes('accept')
            ? 'Bookings'
            : 'BookingPendingScreen'
          : 'Request'),
      recipientUserId: recipientUserId || '',
      ...extraData,
    },
    source: 'local',
  });
};

const toMutationResult = (
  responseData: {
    data?: Booking | { booking?: Booking };
    booking?: Booking;
    message?: string;
    sessionAmount?: number;
    escrowRefunded?: boolean;
  },
  fallbackMessage: string
): BookingMutationResult => parseBookingMutationResponse(responseData, fallbackMessage);

export const fetchBookings = async (
  date: string | undefined,
  tab: BookingTab
): Promise<Booking[]> => {
  const queryDate = date && date !== 'all' ? date : undefined;
  const path = queryDate
    ? `/api/bookings?date=${queryDate}&tab=${tab}`
    : `/api/bookings?tab=${tab}`;
  const fullUrl = `${API_BASE_URL}${path}`;

  console.log('[BookingAPI] REQUEST', {
    method: 'GET',
    path,
    fullUrl,
    date: queryDate ?? '(none)',
    tab,
  });

  try {
    const response = await getBookingsAPI(queryDate, tab);
    const list = extractBookingsPayload(
      response.data,
      `GET ${path}`
    );

    logBookingTabSummary(`RESPONSE ${path}`, list);

    const active = list.filter(
      b => String(b.status).toLowerCase() === 'accepted'
    );
    const pending = list.filter(
      b => String(b.status).toLowerCase() === 'pending'
    );
    console.log('[BookingAPI] tab split for student', {
      path,
      requestedTab: tab,
      total: list.length,
      acceptedCount: active.length,
      pendingCount: pending.length,
      acceptedTutors: active.map(b =>
        typeof b.tutor === 'object' && b.tutor
          ? (b.tutor as { name?: string }).name
          : b.tutor
      ),
      pendingTutors: pending.map(b =>
        typeof b.tutor === 'object' && b.tutor
          ? (b.tutor as { name?: string }).name
          : b.tutor
      ),
    });

    return list;
  } catch (error) {
    const err = error as {
      response?: { status?: number; data?: unknown };
      message?: string;
    };
    console.log('[BookingAPI] REQUEST FAILED', {
      path,
      fullUrl,
      status: err?.response?.status,
      message: err?.message,
      data: err?.response?.data,
    });
    throw error;
  }
};

export const fetchBookingById = async (id: string): Promise<Booking | null> => {
  // Prefer list endpoints — GET /api/bookings/:id often 404s on this backend.
  try {
    const response = await getBookingByIdAPI(id);
    const one = normalizeBookingFromApi(
      response.data?.data ?? response.data,
      `GET /api/bookings/${id}`
    );
    return one;
  } catch (error) {
    const status = (error as { response?: { status?: number } })?.response
      ?.status;
    if (status === 404) {
      console.log('[BookingAPI] GET /api/bookings/:id → 404 (use list)', {
        id,
      });
    }
    return null;
  }
};

export const fetchBookingsWithTutor = async (
  tutorId: string,
  studentId?: string
) => {
  const path = `/api/bookings/with-tutor/${tutorId}`;
  console.log('[BookingAPI] REQUEST', {
    method: 'GET',
    path,
    studentId: studentId || '(self)',
  });
  try {
    const response = await getBookingsWithTutorAPI(tutorId, studentId);
    const data =
      response.data.data ?? {
        tutorId,
        hasPending: false,
        hasActive: false,
        canRequest: true,
        pendingBooking: null,
        activeBooking: null,
        openBookings: [],
      };

    const activeBooking = data.activeBooking
      ? normalizeBookingFromApi(data.activeBooking, `${path}.activeBooking`)
      : null;
    const pendingBooking = data.pendingBooking
      ? normalizeBookingFromApi(data.pendingBooking, `${path}.pendingBooking`)
      : null;
    const pendingPackage = data.pendingPackage
      ? normalizeBookingFromApi(data.pendingPackage, `${path}.pendingPackage`)
      : null;
    const activePackage = data.activePackage
      ? normalizeBookingFromApi(data.activePackage, `${path}.activePackage`)
      : null;
    const nextSession = data.nextSession
      ? normalizeBookingFromApi(data.nextSession, `${path}.nextSession`)
      : null;
    const openBookings = Array.isArray(data.openBookings)
      ? data.openBookings
          .map((b, i) =>
            normalizeBookingFromApi(b, `${path}.openBookings[${i}]`)
          )
          .filter((b): b is Booking => Boolean(b))
      : [];
    const packageSessions = Array.isArray(data.packageSessions)
      ? data.packageSessions
          .map((b, i) =>
            normalizeBookingFromApi(b, `${path}.packageSessions[${i}]`)
          )
          .filter((b): b is Booking => Boolean(b))
      : [];

    const hasPending = Boolean(
      data.hasPending || data.hasPendingPackage || pendingPackage || pendingBooking
    );
    const hasActive = Boolean(
      data.hasActive || data.hasActivePackage || activePackage || activeBooking
    );

    console.log('[BookingAPI] with-tutor result', {
      tutorId,
      hasActive,
      hasPending,
      hasPendingPackage: data.hasPendingPackage,
      hasActivePackage: data.hasActivePackage,
      activeId: activeBooking?._id,
      pendingId: pendingBooking?._id || pendingPackage?._id,
      openCount: openBookings.length,
      upcomingSessionCount: data.upcomingSessionCount,
    });

    return {
      ...data,
      hasPending,
      hasActive,
      canRequest:
        data.canRequest === undefined ? !hasPending && !hasActive : data.canRequest,
      activeBooking,
      pendingBooking: pendingBooking || pendingPackage,
      pendingPackage,
      activePackage,
      nextSession,
      openBookings,
      packageSessions,
    };
  } catch (error) {
    console.log('[BookingAPI] with-tutor FAILED', {
      tutorId,
      error: (error as { message?: string })?.message,
      status: (error as { response?: { status?: number } })?.response?.status,
    });
    throw error;
  }
};

export const createBooking = async (
  payload: CreateBookingPayload
): Promise<Booking> => {
  const tutorId = String(payload.tutorId || payload.tutor || '').trim();
  if (!tutorId) {
    throw new Error('Tutor user id is required to create a booking.');
  }

  console.log('[Booking] create payload', {
    tutor: tutorId,
    subject: payload.subject,
    date: payload.date,
    startTime: payload.startTime,
    endTime: payload.endTime,
    mode: payload.mode || 'monthly_weekdays',
    durationDays: payload.durationDays ?? 30,
  });
  const response = await createBookingAPI({
    ...payload,
    tutor: tutorId,
    tutorId,
    mode: payload.mode || 'monthly_weekdays',
    durationDays: payload.durationDays ?? 30,
  });
  if (!response.data.data) {
    throw new Error(response.data.message || 'Failed to create booking');
  }
  const booking =
    normalizeBookingFromApi(response.data.data, 'POST /api/bookings') ||
    response.data.data;
  // Ensure monthly package markers survive even if API omits kind briefly.
  if (!booking.mode) booking.mode = payload.mode || 'monthly_weekdays';
  if (booking.durationDays == null) {
    booking.durationDays = payload.durationDays ?? 30;
  }
  if (!booking.kind && booking.mode === 'monthly_weekdays') {
    booking.kind = 'package';
  }
  if (!booking.packageId) booking.packageId = booking._id;

  const tutorName = getBookingTutorName(booking);

  const isMonthly = (payload.mode || 'monthly_weekdays') === 'monthly_weekdays';
  notifyBookingParty(
    booking,
    'student',
    isMonthly ? 'Monthly tuition request sent' : 'Booking request sent',
    isMonthly
      ? `Waiting for ${tutorName} to accept Mon–Fri classes (${payload.startTime}–${payload.endTime}).`
      : `Waiting for ${tutorName} to respond to your ${booking.subject} request.`,
    {
      status: 'pending',
      kind: isMonthly ? 'package' : 'session',
      packageId: booking.packageId || booking._id,
    }
  );
  notifyBookingParty(
    booking,
    'tutor',
    isMonthly ? 'New monthly tuition request' : 'New booking request',
    isMonthly
      ? `${getBookingStudentName(booking)} requested Mon–Fri ${booking.subject} · ${booking.startTime}–${booking.endTime} (~${payload.durationDays ?? 30} days).`
      : `${getBookingStudentName(booking)} requested ${booking.subject} · ${booking.startTime}–${booking.endTime}.`,
    {
      status: 'pending',
      kind: isMonthly ? 'package' : 'session',
      packageId: booking.packageId || booking._id,
    }
  );

  return booking;
};

export const notifyStudentBookingAccepted = (
  booking: Booking,
  sessionAmount?: number,
  extras?: { sessionCount?: number; isPackage?: boolean }
) => {
  const tutorName = getBookingTutorName(booking);
  const isPackage =
    extras?.isPackage ||
    booking.kind === 'package' ||
    booking.mode === 'monthly_weekdays';
  const count = extras?.sessionCount;

  notifyBookingParty(
    booking,
    'student',
    isPackage ? 'Monthly tuition accepted' : 'Booking accepted',
    isPackage
      ? sessionAmount
        ? `${tutorName} accepted your Mon–Fri ${booking.subject} package${
            count ? ` (${count} classes)` : ''
          }. Escrow held (1 session): PKR ${sessionAmount.toLocaleString()}.`
        : `${tutorName} accepted your Mon–Fri ${booking.subject} package${
            count ? ` (${count} classes)` : ''
          }.`
      : sessionAmount
        ? `${tutorName} accepted your ${booking.subject} session. Escrow held: PKR ${sessionAmount.toLocaleString()}.`
        : `Your booking request has been accepted by ${tutorName}.`,
    {
      status: 'accepted',
      screen: 'Bookings',
      type: 'booking_accepted',
      kind: isPackage ? 'package' : 'session',
      packageId: booking.packageId || booking._id,
    }
  );
};

export const notifyStudentBookingRejected = (booking: Booking) => {
  const tutorName = getBookingTutorName(booking);
  notifyBookingParty(
    booking,
    'student',
    'Booking rejected',
    `Your booking request has been rejected by ${tutorName}. You can book another slot.`,
    {
      status: 'cancelled',
      screen: 'Bookings',
      outcome: 'rejected',
    }
  );
};

export const confirmBooking = async (
  id: string,
  payload?: ConfirmBookingPayload
): Promise<BookingMutationResult> => {
  const response = await confirmBookingAPI(id, payload);
  const result = toMutationResult(response.data, 'Failed to confirm booking');
  const tutorName = getBookingTutorName(result.booking);
  const studentName = getBookingStudentName(result.booking);
  const sessionCount = result.sessionCount || result.sessions?.length || 0;
  const isPackage =
    result.kind === 'package' ||
    Boolean(result.sessions?.length) ||
    result.booking.mode === 'monthly_weekdays';

  notifyStudentBookingAccepted(result.booking, result.sessionAmount, {
    sessionCount,
    isPackage,
  });
  notifyBookingParty(
    result.booking,
    'tutor',
    isPackage ? 'Monthly package confirmed' : 'Booking confirmed',
    isPackage
      ? `You accepted ${studentName}'s Mon–Fri ${result.booking.subject} package${
          sessionCount ? ` (${sessionCount} classes)` : ''
        }.`
      : `You accepted ${studentName}'s ${result.booking.subject} request.`,
    {
      status: 'accepted',
      kind: isPackage ? 'package' : 'session',
      packageId: result.packageId || result.booking.packageId || id,
      ...(sessionCount ? { sessionCount: String(sessionCount) } : {}),
    }
  );

  // Keep lint quiet if tutorName unused in package branch — still useful for logs.
  console.log('[Booking] confirm ok', {
    id,
    kind: result.kind,
    packageId: result.packageId,
    sessionCount,
    sessionAmount: result.sessionAmount,
    tutorName,
  });

  return result;
};

export const cancelBooking = async (
  id: string,
  options?: { actorRole?: 'student' | 'tutor' | 'parent'; previousStatus?: string }
): Promise<BookingMutationResult> => {
  const response = await cancelBookingAPI(id);
  const result = toMutationResult(response.data, 'Failed to cancel booking');
  const tutorName = getBookingTutorName(result.booking);
  const studentName = getBookingStudentName(result.booking);
  const wasPending = options?.previousStatus === 'pending';
  const actor = options?.actorRole;

  if (wasPending && actor === 'tutor') {
    notifyBookingParty(
      result.booking,
      'student',
      'Booking rejected',
      `${tutorName} declined your ${result.booking.subject} request. You can book another slot.`,
      { status: 'cancelled', outcome: 'rejected' }
    );
    notifyBookingParty(
      result.booking,
      'tutor',
      'Request declined',
      `You declined ${studentName}'s ${result.booking.subject} request.`,
      { status: 'cancelled', outcome: 'rejected' }
    );
  } else if (wasPending && (actor === 'student' || actor === 'parent')) {
    notifyBookingParty(
      result.booking,
      'student',
      'Booking cancelled',
      `You cancelled your pending ${result.booking.subject} request.`,
      { status: 'cancelled' }
    );
    notifyBookingParty(
      result.booking,
      'tutor',
      'Request withdrawn',
      `${studentName} cancelled their pending ${result.booking.subject} request.`,
      { status: 'cancelled' }
    );
  } else {
    notifyBookingParty(
      result.booking,
      'student',
      'Booking cancelled',
      result.escrowRefunded
        ? `Your ${result.booking.subject} session was cancelled. Escrow refunded${
            result.sessionAmount
              ? `: PKR ${result.sessionAmount.toLocaleString()}`
              : ''
          }.`
        : `Your ${result.booking.subject} booking was cancelled.`,
      { status: 'cancelled' }
    );
    notifyBookingParty(
      result.booking,
      'tutor',
      'Booking cancelled',
      `${studentName}'s ${result.booking.subject} session was cancelled.`,
      { status: 'cancelled' }
    );
  }

  return result;
};

export const completeBooking = async (
  id: string
): Promise<BookingMutationResult> => {
  const response = await completeBookingAPI(id);
  const result = toMutationResult(response.data, 'Failed to complete booking');
  const tutorName = getBookingTutorName(result.booking);

  notifyBookingParty(
    result.booking,
    'student',
    'Session completed',
    `Your session with ${tutorName} is complete. You can rate it now.`,
    { status: 'completed', screen: 'BookingReviewScreen' }
  );
  notifyBookingParty(
    result.booking,
    'tutor',
    'Session completed',
    result.sessionAmount
      ? `Escrow released: PKR ${result.sessionAmount.toLocaleString()}.`
      : 'Session marked complete.',
    { status: 'completed' }
  );

  return result;
};

export const rateBooking = async (
  bookingId: string,
  data: { rating: number; review?: string }
) => {
  const response = await rateSessionAPI(bookingId, data);
  return response.data.data;
};

const toRescheduleResult = (
  responseData: {
    data?: Booking | { booking?: Booking };
    booking?: Booking;
    message?: string;
    rescheduleProposal?: RescheduleMutationResult['rescheduleProposal'];
    escrowUnchanged?: boolean;
  },
  fallbackMessage: string
): RescheduleMutationResult => {
  const parsed = parseBookingMutationResponse(responseData, fallbackMessage);
  return {
    booking: {
      ...parsed.booking,
      rescheduleProposal:
        responseData.rescheduleProposal ??
        parsed.booking.rescheduleProposal ??
        null,
    },
    message: parsed.message,
    rescheduleProposal: responseData.rescheduleProposal ?? null,
    escrowUnchanged: responseData.escrowUnchanged,
  };
};

export const proposeReschedule = async (
  id: string,
  payload: ProposeReschedulePayload
): Promise<RescheduleMutationResult> => {
  const response = await proposeRescheduleAPI(id, payload);
  const result = toRescheduleResult(
    response.data,
    'Failed to propose reschedule'
  );
  const studentName = getBookingStudentName(result.booking);
  const proposal = result.rescheduleProposal;

  notifyBookingParty(
    result.booking,
    'student',
    'Reschedule proposed',
    proposal
      ? `${getBookingTutorName(result.booking)} suggested ${proposal.date} · ${proposal.startTime}–${proposal.endTime} for ${result.booking.subject}.`
      : `${getBookingTutorName(result.booking)} proposed a new time for ${result.booking.subject}.`,
    {
      status: result.booking.status,
      screen: 'BookingPendingScreen',
      outcome: 'reschedule_pending',
    }
  );
  notifyBookingParty(
    result.booking,
    'tutor',
    'Reschedule sent',
    `Waiting for ${studentName} to respond to your new time.`,
    { status: result.booking.status, outcome: 'reschedule_pending' }
  );

  return result;
};

export const acceptReschedule = async (
  id: string
): Promise<RescheduleMutationResult> => {
  const response = await acceptRescheduleAPI(id);
  const result = toRescheduleResult(
    response.data,
    'Failed to accept reschedule'
  );

  notifyBookingParty(
    result.booking,
    'tutor',
    'Reschedule accepted',
    `${getBookingStudentName(result.booking)} accepted the new time for ${result.booking.subject}.`,
    {
      status: result.booking.status,
      screen: 'Schedule',
      outcome: 'reschedule_accepted',
    }
  );
  notifyBookingParty(
    result.booking,
    'student',
    'Session moved',
    `Your ${result.booking.subject} session is now ${result.booking.date} · ${result.booking.startTime}–${result.booking.endTime}.`,
    { status: result.booking.status, outcome: 'reschedule_accepted' }
  );

  return result;
};

export const rejectReschedule = async (
  id: string
): Promise<RescheduleMutationResult> => {
  const response = await rejectRescheduleAPI(id);
  const result = toRescheduleResult(
    response.data,
    'Failed to reject reschedule'
  );

  notifyBookingParty(
    result.booking,
    'tutor',
    'Reschedule declined',
    `${getBookingStudentName(result.booking)} kept the original time for ${result.booking.subject}.`,
    {
      status: result.booking.status,
      screen: 'Schedule',
      outcome: 'reschedule_rejected',
    }
  );

  return result;
};

export const cancelReschedule = async (
  id: string
): Promise<RescheduleMutationResult> => {
  const response = await cancelRescheduleAPI(id);
  const result = toRescheduleResult(
    response.data,
    'Failed to cancel reschedule proposal'
  );

  notifyBookingParty(
    result.booking,
    'student',
    'Reschedule withdrawn',
    `${getBookingTutorName(result.booking)} cancelled the proposed time change.`,
    {
      status: result.booking.status,
      screen: 'BookingPendingScreen',
      outcome: 'reschedule_cancelled',
    }
  );

  return result;
};
