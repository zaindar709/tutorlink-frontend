import { AxiosError } from 'axios';
import { ApiErrorResponse } from '../../types/api.types';

export const getApiErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    if (data?.message) {
      return data.message;
    }

    if (!error.response) {
      return 'Network error. Please check your connection and try again.';
    }

    switch (error.response.status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Your session has expired. Please log in again.';
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
        return fallback;
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
