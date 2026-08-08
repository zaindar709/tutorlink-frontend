import { AxiosError } from 'axios';
import { ApiErrorResponse } from '../../types/api.types';
import { getFirebaseErrorMessage } from '../auth/firebaseErrorHandler';

export const getApiErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
): string => {
  const firebaseMessage = getFirebaseErrorMessage(error);
  if (firebaseMessage) {
    return firebaseMessage;
  }

  const axiosLike =
    error instanceof AxiosError
      ? error
      : error &&
          typeof error === 'object' &&
          'response' in error &&
          (error as { response?: { status?: number; data?: ApiErrorResponse } })
            .response
        ? (error as {
            response: { status?: number; data?: ApiErrorResponse };
            message?: string;
          })
        : null;

  if (axiosLike?.response) {
    const data = axiosLike.response.data as ApiErrorResponse | undefined;
    const code = data?.code;

    const bookingCodeMessages: Record<string, string> = {
      PAST_DATE: 'You cannot book a date in the past.',
      INVALID_TIME_RANGE: 'End time must be after start time.',
      SELF_BOOKING: 'You cannot book yourself.',
      TUTOR_UNAVAILABLE:
        'This tutor cannot be booked yet (needs rate, availability on, and verified/approved).',
      SLOT_CONFLICT: 'That time slot is already booked. Please choose another.',
      INSUFFICIENT_BALANCE:
        'Wallet balance is too low for this session. Please top up first.',
      INVALID_TRANSITION:
        'This booking cannot be updated from its current status.',
      SESSION_EXPIRED: 'This session has already ended.',
      SESSION_NOT_ENDED:
        'You can complete the session only after it ends.',
      ESCROW_UNDER_DISPUTE:
        'This payment is under dispute. Please contact support.',
      NOT_LINKED_STUDENT: 'You can only book for a linked student.',
    };

    if (code && bookingCodeMessages[code]) {
      return bookingCodeMessages[code];
    }

    if (data?.message) {
      return data.message;
    }

    const validationErrors = (data as { errors?: string[] } | undefined)?.errors;
    if (Array.isArray(validationErrors) && validationErrors.length > 0) {
      return validationErrors.join('\n');
    }

    switch (axiosLike.response.status) {
      case 400:
        return data?.message || 'Invalid request. Please check your input.';
      case 401:
        return (
          data?.message ||
          'Authentication failed. Please try again or log in if you already have an account.'
        );
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return (
          data?.message ||
          'Account not found on server. Please try again or sign up.'
        );
      case 409:
        return data?.message || 'This action conflicts with the current state.';
      case 410:
        return data?.message || 'This code has expired.';
      case 500:
        return (
          data?.message ||
          'Server error. Please try again later.'
        );
      default:
        break;
    }
  }

  if (error instanceof AxiosError) {
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return 'Server is taking too long. Please try again — it may be waking up.';
      }
      const msg = String(error.message || '').toLowerCase();
      if (msg.includes('unexpected end of stream') || msg.includes('network error')) {
        return 'Connection interrupted. Please try again.';
      }
      return 'Network error. Please check your connection and try again.';
    }
  }

  if (error instanceof Error && error.message) {
    const msg = error.message.toLowerCase();
    if (msg.includes('timed out')) {
      return 'Request timed out. Please try again.';
    }
    return error.message;
  }

  return fallback;
};

export const getApiErrorCode = (error: unknown): string | undefined => {
  if (error instanceof AxiosError) {
    return (error.response?.data as ApiErrorResponse | undefined)?.code;
  }
  return undefined;
};
