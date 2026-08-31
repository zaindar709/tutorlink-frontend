import { AxiosError } from 'axios';
import { Booking, BookingMutationResult } from '../../types/api.types';
import { MOCK_WALLET_DEPOSITS } from '../../config/features';
import { normalizeBookingFromApi, normalizeBookingList } from './normalizeBooking';

type MutationPayload = {
  success?: boolean;
  message?: string;
  data?:
    | Booking
    | {
        booking?: Booking;
        sessionAmount?: number;
        escrowRefunded?: boolean;
        kind?: string;
        packageId?: string;
        status?: string;
        sessionCount?: number;
        escrowBookingId?: string;
        sessions?: Booking[];
        _id?: string;
      };
  booking?: Booking;
  sessionAmount?: number;
  escrowRefunded?: boolean;
  sessionCount?: number;
  packageId?: string;
  kind?: string;
  escrowBookingId?: string;
  idempotent?: boolean;
};

/** Normalize PATCH confirm/cancel/complete responses from varying backend shapes. */
export const parseBookingMutationResponse = (
  payload: MutationPayload | undefined,
  fallbackMessage: string
): BookingMutationResult => {
  if (!payload) {
    throw new Error(fallbackMessage);
  }

  let sessionAmount = payload.sessionAmount;
  let escrowRefunded = payload.escrowRefunded;
  let sessions: Booking[] | undefined;
  let sessionCount = payload.sessionCount;
  let packageId = payload.packageId;
  let kind = payload.kind;
  let escrowBookingId = payload.escrowBookingId;
  let booking: Booking | undefined;

  if (payload.data && typeof payload.data === 'object') {
    const inner = payload.data as {
      _id?: string;
      booking?: Booking;
      sessionAmount?: number;
      escrowRefunded?: boolean;
      kind?: string;
      packageId?: string;
      status?: string;
      sessionCount?: number;
      escrowBookingId?: string;
      sessions?: unknown;
      subject?: string;
      date?: string;
      startTime?: string;
      endTime?: string;
      student?: Booking['student'];
      tutor?: Booking['tutor'];
      mode?: string;
      durationDays?: number;
    };

    sessionAmount = inner.sessionAmount ?? sessionAmount;
    escrowRefunded = inner.escrowRefunded ?? escrowRefunded;
    kind = inner.kind ?? kind;
    packageId = inner.packageId ?? packageId;
    sessionCount = inner.sessionCount ?? sessionCount;
    escrowBookingId = inner.escrowBookingId ?? escrowBookingId;

    // Monthly package confirm: { kind, packageId, sessions: [...] }
    if (Array.isArray(inner.sessions)) {
      sessions = normalizeBookingList(inner.sessions, 'confirm.sessions');
      sessionCount = sessionCount ?? sessions.length;
      packageId =
        packageId ||
        sessions[0]?.packageId ||
        (inner._id ? String(inner._id) : undefined);

      booking =
        sessions.find(s => s._id === escrowBookingId) ||
        sessions.find(s => s.isNextSession) ||
        sessions[0];

      // Keep a package-shaped booking when sessions are empty (edge) or for Redux parent.
      if (!booking && (inner._id || packageId)) {
        booking = normalizeBookingFromApi(
          {
            ...inner,
            _id: String(inner._id || packageId),
            packageId: packageId || String(inner._id || ''),
            kind: 'package',
            status: inner.status || 'accepted',
          },
          'confirm.package'
        ) || undefined;
      }
    } else if (inner._id) {
      booking = normalizeBookingFromApi(inner, 'confirm.data') || undefined;
    } else if (inner.booking) {
      booking =
        normalizeBookingFromApi(inner.booking, 'confirm.data.booking') ||
        undefined;
    }
  }

  if (!booking && payload.booking) {
    booking =
      normalizeBookingFromApi(payload.booking, 'confirm.booking') || undefined;
  }

  if (!booking) {
    throw new Error(payload.message || fallbackMessage);
  }

  return {
    booking,
    sessionAmount,
    escrowRefunded,
    message: payload.message,
    kind: kind || booking.kind,
    packageId: packageId || booking.packageId || booking._id,
    sessionCount,
    escrowBookingId,
    sessions,
    idempotent: payload.idempotent,
  };
};

const WALLET_HINT =
  'Ask the student to open Wallet → Add Mock Funds (FYP demo), then try Accept again. Escrow holds from their wallet balance.';

const DEV_WALLET_HINT =
  'Student wallet has no balance for escrow.\n\n1) Student: Profile → Wallet → Add Mock Funds (e.g. PKR 5,000).\n2) Then try Accept again — escrow will lock those mock funds.\n\nIf deposit API fails, check /api/wallet/deposit on the backend.';

/** User-facing confirm failure — surfaces wallet/escrow hints when server throws 500. */
export const getConfirmBookingErrorMessage = (error: unknown): string => {
  if (typeof error === 'string' && error.trim()) {
    const lower = error.toLowerCase();
    if (
      lower.includes('assigned tutor') ||
      lower.includes('only the assigned')
    ) {
      return (
        'Only the assigned tutor can accept this booking.\n\n' +
        'This pending request was likely created with the wrong tutor id. ' +
        'Reject it, then ask the student to send a new booking (after updating the app).'
      );
    }
    if (
      lower.includes('already ended') ||
      lower.includes('session expired') ||
      lower.includes('cannot confirm a session')
    ) {
      return (
        'Backend is blocking accept because of the preferred class time.\n\n' +
        'Ask your backend developer: pending bookings must be confirmable regardless of start/end time. ' +
        'The “session already ended” check should only apply to COMPLETE, not ACCEPT/CONFIRM.\n\n' +
        `Server: ${error}`
      );
    }
    if (
      lower.includes('insufficient') ||
      lower.includes('wallet') ||
      lower.includes('balance') ||
      lower.includes('escrow')
    ) {
      return `${error}\n\n${MOCK_WALLET_DEPOSITS ? DEV_WALLET_HINT : WALLET_HINT}`;
    }
    return error;
  }

  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const data = error.response?.data as
      | { message?: string; code?: string; error?: string }
      | undefined;
    const serverMsg = String(
      data?.message || data?.error || ''
    ).trim();
    const code = data?.code;
    const combined = `${code || ''} ${serverMsg}`.toLowerCase();

    if (
      code === 'INSUFFICIENT_BALANCE' ||
      combined.includes('insufficient') ||
      combined.includes('wallet') ||
      combined.includes('balance') ||
      combined.includes('escrow')
    ) {
      const hint = MOCK_WALLET_DEPOSITS ? DEV_WALLET_HINT : WALLET_HINT;
      return serverMsg ? `${serverMsg}\n\n${hint}` : `Student wallet balance is too low.\n\n${hint}`;
    }

    if (
      code === 'FORBIDDEN' ||
      combined.includes('assigned tutor') ||
      combined.includes('only the assigned')
    ) {
      return (
        'Only the assigned tutor can accept this booking.\n\n' +
        'Usually the booking was saved with the wrong tutor id (profile id instead of user id). ' +
        'Reject this request and ask the student to book again from Search (reload the app first).'
      );
    }

    if (
      code === 'SESSION_EXPIRED' ||
      combined.includes('already ended') ||
      combined.includes('session that has been already ended') ||
      combined.includes('cannot confirm a session') ||
      combined.includes('session expired')
    ) {
      return (
        'Backend is blocking accept because of the preferred class time.\n\n' +
        'Fix needed on API: allow PATCH /api/bookings/:id/confirm for pending bookings even if start/end is in the past. ' +
        'Only block COMPLETE when the session has not ended yet (or has already been completed).\n\n' +
        (serverMsg ? `Server: ${serverMsg}` : '')
      );
    }

    if (status === 500) {
      if (serverMsg) {
        return `Server error while confirming booking.\n\n${serverMsg}\n\nIf this mentions payment or wallet, ${WALLET_HINT.charAt(0).toLowerCase()}${WALLET_HINT.slice(1)}`;
      }
      return `Server error (500) while confirming booking. This often means the student wallet is missing or has insufficient funds for escrow.\n\n${MOCK_WALLET_DEPOSITS ? DEV_WALLET_HINT : WALLET_HINT}`;
    }

    if (serverMsg) return serverMsg;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Could not confirm booking. Please try again.';
};
