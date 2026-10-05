import { Booking } from '../../types/api.types';

export const logActiveBookingTrace = (
  _label: string,
  _booking: Booking | null | undefined,
  _extra?: Record<string, unknown>
) => {
  /* debug logging disabled */
};

export const logActiveApiCall = (_payload: {
  date: string;
  tab: string;
  url?: string;
  count?: number;
  ids?: string[];
  tutorNames?: string[];
  raw?: unknown;
}) => {
  /* debug logging disabled */
};

export const logActiveFinalList = (_bookings: Booking[]) => {
  /* debug logging disabled */
};
