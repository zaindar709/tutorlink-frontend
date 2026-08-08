import { getApiErrorCode, getApiErrorMessage } from '../api/errorHandler';
import { AxiosError } from 'axios';
import { ApiErrorResponse } from '../../types/api.types';

const BOOKING_ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: 'Please check your booking details and try again.',
  PAST_DATE: 'You cannot book a date in the past.',
  INVALID_TIME_RANGE:
    'End time must be after start time (use formats like 2:00 PM).',
  SELF_BOOKING: 'You cannot book yourself.',
  TUTOR_UNAVAILABLE:
    'This tutor cannot be booked yet. They need an hourly rate, availability on, and admin verification (approved).',
  SLOT_CONFLICT: 'That time slot is already booked. Please choose another.',
  DUPLICATE_BOOKING:
    'You already have a pending or active booking with this tutor.',
  PENDING_EXISTS:
    'You already sent a request to this tutor. Wait for their response.',
  ACTIVE_BOOKING_EXISTS:
    'You already have an active booking with this tutor.',
  EXISTING_BOOKING:
    'You already have a booking with this tutor. Check My Bookings.',
  NOT_LINKED_STUDENT: 'You can only book for a linked student.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_ASSIGNED_TUTOR:
    'Only the assigned tutor can accept this booking. Reject it and ask the student to book again.',
  INVALID_TRANSITION: 'This booking cannot be updated from its current status.',
  SESSION_EXPIRED:
    'This session time has already ended. Ask the student to cancel and book a future slot.',
  SESSION_NOT_ENDED: 'You can complete the session only after it ends.',
  INSUFFICIENT_BALANCE:
    'Student wallet balance is too low. Please top up before the tutor can confirm.',
  ESCROW_UNDER_DISPUTE:
    'This payment is under dispute. Contact support to resolve it.',
  WEEKEND_NOT_ALLOWED:
    'Sessions can only be scheduled Monday–Friday. Weekends are closed.',
  INVALID_DURATION: 'Each lecture must be exactly 90 minutes (1.5 hours).',
  OUTSIDE_AVAILABILITY:
    'That slot is outside your weekly availability windows.',
  SESSION_ALREADY_STARTED: 'This session has already started and cannot be moved.',
};

const rawApiMessage = (error: unknown): string | undefined => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    return typeof data?.message === 'string' ? data.message.trim() : undefined;
  }
  return undefined;
};

export const getBookingErrorMessage = (error: unknown): string => {
  if (typeof error === 'string' && error.trim()) {
    return error;
  }
  const code = getApiErrorCode(error);
  const serverMsg = rawApiMessage(error);
  if (code && BOOKING_ERROR_MESSAGES[code]) {
    if (
      serverMsg &&
      serverMsg.toLowerCase() !== BOOKING_ERROR_MESSAGES[code].toLowerCase()
    ) {
      return `${BOOKING_ERROR_MESSAGES[code]}\n\nServer: ${serverMsg}`;
    }
    return BOOKING_ERROR_MESSAGES[code];
  }
  return getApiErrorMessage(error);
};

export const getBookingErrorCode = (error: unknown): string | undefined =>
  getApiErrorCode(error);
