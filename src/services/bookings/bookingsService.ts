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
): BookingMutationResult => {
  const parsed = parseBookingMutationResponse(responseData, fallbackMessage);
  return {
    booking: parsed.booking,
    sessionAmount: parsed.sessionAmount,
    escrowRefunded: parsed.escrowRefunded,
    message: parsed.message,
  };
};

export const fetchBookings = async (
  date: string,
  tab: BookingTab
): Promise<Booking[]> => {
  const response = await getBookingsAPI(date, tab);
  return response.data.data ?? [];
};

export const fetchBookingById = async (id: string): Promise<Booking | null> => {
  try {
    const response = await getBookingByIdAPI(id);
    return response.data.data ?? null;
  } catch {
    return null;
  }
};

export const fetchBookingsWithTutor = async (
  tutorId: string,
  studentId?: string
) => {
  const response = await getBookingsWithTutorAPI(tutorId, studentId);
  return (
    response.data.data ?? {
      tutorId,
      hasPending: false,
      hasActive: false,
      canRequest: true,
      pendingBooking: null,
      activeBooking: null,
      openBookings: [],
    }
  );
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
  });
  const response = await createBookingAPI({
    ...payload,
    tutor: tutorId,
    tutorId,
  });
  if (!response.data.data) {
    throw new Error(response.data.message || 'Failed to create booking');
  }
  const booking = response.data.data;
  const tutorName = getBookingTutorName(booking);

  notifyBookingParty(
    booking,
    'student',
    'Booking request sent',
    `Waiting for ${tutorName} to respond to your ${booking.subject} request.`,
    { status: 'pending' }
  );
  notifyBookingParty(
    booking,
    'tutor',
    'New booking request',
    `${getBookingStudentName(booking)} requested ${booking.subject} · ${booking.startTime}–${booking.endTime}.`,
    { status: 'pending' }
  );

  return booking;
};

export const notifyStudentBookingAccepted = (booking: Booking, sessionAmount?: number) => {
  const tutorName = getBookingTutorName(booking);
  notifyBookingParty(
    booking,
    'student',
    'Booking accepted',
    sessionAmount
      ? `${tutorName} accepted your ${booking.subject} session. Escrow held: PKR ${sessionAmount.toLocaleString()}.`
      : `Your booking request has been accepted by ${tutorName}.`,
    {
      status: 'accepted',
      screen: 'Bookings',
      type: 'booking_accepted',
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

  notifyStudentBookingAccepted(result.booking, result.sessionAmount);
  notifyBookingParty(
    result.booking,
    'tutor',
    'Booking confirmed',
    `You accepted ${studentName}'s ${result.booking.subject} request.`,
    { status: 'accepted' }
  );

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
