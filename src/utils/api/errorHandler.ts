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
        return 'The requested resource was not found.';
      case 409:
        return data?.message || 'This action conflicts with the current state.';
      case 410:
        return data?.message || 'This code has expired.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        break;
    }
  }

  if (error instanceof AxiosError) {
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return 'Upload timed out. The server may be waking up — please try again.';
      }
      return 'Network error. Please check your connection and try again.';
    }
  }

  if (error instanceof Error && error.message) {
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
