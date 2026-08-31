import api from './client';
import {
  ApiSuccessResponse,
  Booking,
  BookingsWithTutorResult,
  BookingTab,
  ConfirmBookingPayload,
  CreateBookingPayload,
  ProposeReschedulePayload,
  RescheduleProposal,
} from '../types/api.types';

export type BookingMutationResponse = ApiSuccessResponse<
  | Booking
  | {
      kind?: string;
      packageId?: string;
      status?: string;
      sessionCount?: number;
      escrowBookingId?: string;
      sessions?: Booking[];
      booking?: Booking;
    }
> & {
  sessionAmount?: number;
  escrowRefunded?: boolean;
  sessionCount?: number;
  packageId?: string;
  kind?: string;
  escrowBookingId?: string;
  idempotent?: boolean;
};

export type RescheduleMutationResponse = ApiSuccessResponse<Booking> & {
  rescheduleProposal?: RescheduleProposal | null;
  escrowUnchanged?: boolean;
};

export const getBookingsWithTutorAPI = (
  tutorId: string,
  studentId?: string
) => {
  return api.get<ApiSuccessResponse<BookingsWithTutorResult>>(
    `/api/bookings/with-tutor/${tutorId}`,
    {
      params: studentId ? { studentId } : undefined,
    }
  );
};

export const createBookingAPI = (data: CreateBookingPayload) => {
  const tutorId = String(data.tutorId || data.tutor || '').trim();
  const body: CreateBookingPayload = {
    ...data,
    tutor: tutorId,
    tutorId,
  };
  return api.post<ApiSuccessResponse<Booking>>('/api/bookings', body);
};

export const getBookingsAPI = (date: string | undefined, tab: BookingTab) => {
  const params: { tab: BookingTab; date?: string } = { tab };
  if (date && date !== 'all') {
    params.date = date;
  }
  return api.get<ApiSuccessResponse<Booking[]>>('/api/bookings', {
    params,
  });
};

export const getBookingByIdAPI = (id: string) => {
  return api.get<ApiSuccessResponse<Booking>>(`/api/bookings/${id}`);
};

export const confirmBookingAPI = (id: string, data?: ConfirmBookingPayload) => {
  const body: ConfirmBookingPayload = {};
  const link = data?.meetingLink?.trim();
  if (link) {
    body.meetingLink = link;
  }
  if (data?.skipEscrow) {
    body.skipEscrow = true;
  }
  if (data?.bypassPayment) {
    body.bypassPayment = true;
  }
  return api.patch<BookingMutationResponse>(
    `/api/bookings/${id}/confirm`,
    body
  );
};

export const cancelBookingAPI = (id: string) => {
  return api.patch<BookingMutationResponse>(`/api/bookings/${id}/cancel`);
};

export const completeBookingAPI = (id: string) => {
  return api.patch<BookingMutationResponse>(`/api/bookings/${id}/complete`);
};

export const proposeRescheduleAPI = (
  id: string,
  data: ProposeReschedulePayload
) => {
  return api.post<RescheduleMutationResponse>(
    `/api/bookings/${id}/reschedule`,
    data
  );
};

export const acceptRescheduleAPI = (id: string) => {
  return api.post<RescheduleMutationResponse>(
    `/api/bookings/${id}/reschedule/accept`
  );
};

export const rejectRescheduleAPI = (id: string) => {
  return api.post<RescheduleMutationResponse>(
    `/api/bookings/${id}/reschedule/reject`
  );
};

export const cancelRescheduleAPI = (id: string) => {
  return api.delete<RescheduleMutationResponse>(
    `/api/bookings/${id}/reschedule`
  );
};
