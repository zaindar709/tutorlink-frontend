import api from './client';
import {
  ApiSuccessResponse,
  Booking,
  BookingTab,
  ConfirmBookingPayload,
  CreateBookingPayload,
} from '../types/api.types';

export const createBookingAPI = (data: CreateBookingPayload) => {
  return api.post<ApiSuccessResponse<Booking>>('/api/bookings', data);
};

export const getBookingsAPI = (date: string, tab: BookingTab) => {
  return api.get<ApiSuccessResponse<Booking[]>>('/api/bookings', {
    params: { date, tab },
  });
};

export const confirmBookingAPI = (id: string, data?: ConfirmBookingPayload) => {
  return api.patch<ApiSuccessResponse<Booking>>(
    `/api/bookings/${id}/confirm`,
    data
  );
};

export const cancelBookingAPI = (id: string) => {
  return api.patch<ApiSuccessResponse<Booking>>(`/api/bookings/${id}/cancel`);
};

export const completeBookingAPI = (id: string) => {
  return api.patch<ApiSuccessResponse<Booking>>(`/api/bookings/${id}/complete`);
};
