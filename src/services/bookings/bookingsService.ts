import {
  cancelBookingAPI,
  completeBookingAPI,
  confirmBookingAPI,
  createBookingAPI,
  getBookingsAPI,
} from '../../api/bookings.api';
import {
  Booking,
  BookingTab,
  ConfirmBookingPayload,
  CreateBookingPayload,
} from '../../types/api.types';

export const fetchBookings = async (
  date: string,
  tab: BookingTab
): Promise<Booking[]> => {
  const response = await getBookingsAPI(date, tab);
  return response.data.data ?? [];
};

export const createBooking = async (
  payload: CreateBookingPayload
): Promise<Booking> => {
  const response = await createBookingAPI(payload);
  if (!response.data.data) {
    throw new Error(response.data.message || 'Failed to create booking');
  }
  return response.data.data;
};

export const confirmBooking = async (
  id: string,
  payload?: ConfirmBookingPayload
): Promise<Booking> => {
  const response = await confirmBookingAPI(id, payload);
  if (!response.data.data) {
    throw new Error(response.data.message || 'Failed to confirm booking');
  }
  return response.data.data;
};

export const cancelBooking = async (id: string): Promise<Booking> => {
  const response = await cancelBookingAPI(id);
  if (!response.data.data) {
    throw new Error(response.data.message || 'Failed to cancel booking');
  }
  return response.data.data;
};

export const completeBooking = async (id: string): Promise<Booking> => {
  const response = await completeBookingAPI(id);
  if (!response.data.data) {
    throw new Error(response.data.message || 'Failed to complete booking');
  }
  return response.data.data;
};
