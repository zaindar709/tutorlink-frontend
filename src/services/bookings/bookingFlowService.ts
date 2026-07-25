import {
  BookingDraft,
  BookingFlowItem,
  BookingFlowStatus,
  TutorBookingProfile,
} from '../../types/bookingFlow.types';
import {
  MOCK_BOOKING_REQUESTS,
  MOCK_TUTOR_PROFILES,
  enrichTutorFromSearch,
  getMockBookingById,
  getMockTutorById,
} from '../../constants/bookingFlowMockData';
import { upsertNotification } from '../notifications/notificationInboxStore';

const notifyBooking = (notification: {
  id: string;
  title: string;
  body: string;
  type: string;
  createdAt: string;
  read: boolean;
  data: Record<string, string>;
  source: 'local';
}) => {
  void upsertNotification(notification);
};

/** In-memory store so UI can update status before APIs exist. */
let bookingsStore: BookingFlowItem[] = [...MOCK_BOOKING_REQUESTS];

const delay = (ms = 350) => new Promise(resolve => setTimeout(resolve, ms));

export const bookingFlowService = {
  async getTutorDetails(tutorId?: string): Promise<TutorBookingProfile> {
    await delay();
    return getMockTutorById(tutorId);
  },

  async getTutorDetailsFromSearch(tutor: Parameters<typeof enrichTutorFromSearch>[0]) {
    await delay(200);
    return enrichTutorFromSearch(tutor);
  },

  async listSimilarTutors(tutorId: string): Promise<TutorBookingProfile[]> {
    await delay(200);
    const tutor = getMockTutorById(tutorId);
    return tutor.similarTutorIds
      .map((id: string) => MOCK_TUTOR_PROFILES.find(t => t.id === id))
      .filter(Boolean) as TutorBookingProfile[];
  },

  async createBookingRequest(draft: BookingDraft & { tutor: TutorBookingProfile }) {
    await delay(500);
    const item: BookingFlowItem = {
      id: `bk-${Date.now()}`,
      status: 'pending',
      tutor: draft.tutor,
      student: {
        id: 'stu-current',
        name: 'You',
        avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
        grade: 'A-Level',
        subjects: [draft.subject],
        notes: draft.notes,
      },
      subject: draft.subject,
      date: draft.date,
      startTime: draft.startTime,
      endTime: draft.endTime,
      durationHours: draft.durationHours,
      totalCost: Math.round(draft.tutor.hourlyRate * draft.durationHours),
      teachingMode: draft.teachingMode,
      location: draft.teachingMode === 'online' ? 'Google Meet' : draft.tutor.location,
      paymentMethod: 'TutorLink Wallet',
      paymentStatus: 'held',
      notes: draft.notes,
      createdAt: new Date().toISOString(),
      estimatedResponseMinutes: 25,
    };
    bookingsStore = [item, ...bookingsStore];

    notifyBooking({
      id: `booking-created-${item.id}`,
      title: 'Booking request sent',
      body: `Waiting for ${draft.tutor.name} to respond.`,
      type: 'booking',
      createdAt: new Date().toISOString(),
      read: false,
      data: {
        type: 'booking',
        bookingId: item.id,
        screen: 'Bookings',
      },
      source: 'local',
    });

    return item;
  },

  async getBooking(bookingId: string) {
    await delay();
    return bookingsStore.find(b => b.id === bookingId) || getMockBookingById(bookingId);
  },

  async getTutorRequests(status?: BookingFlowStatus) {
    await delay();
    if (!status) return bookingsStore;
    return bookingsStore.filter(b => b.status === status);
  },

  async updateBookingStatus(
    bookingId: string,
    status: BookingFlowStatus,
    extra?: { suggestedSlot?: string }
  ) {
    await delay(400);
    bookingsStore = bookingsStore.map(b =>
      b.id === bookingId
        ? {
            ...b,
            status,
            notes: extra?.suggestedSlot
              ? `${b.notes || ''}\nSuggested slot: ${extra.suggestedSlot}`.trim()
              : b.notes,
          }
        : b
    );
    const booking = bookingsStore.find(b => b.id === bookingId);

    const titles: Partial<Record<BookingFlowStatus, string>> = {
      accepted: 'Booking accepted',
      rejected: 'Booking rejected',
      unavailable: 'Tutor unavailable',
      cancelled: 'Booking cancelled',
      completed: 'Session completed',
      pending: 'Booking pending',
    };
    const bodies: Partial<Record<BookingFlowStatus, string>> = {
      accepted: `${booking?.tutor.name || 'Tutor'} accepted the session.`,
      rejected: 'Your booking request was declined.',
      unavailable: 'Tutor marked this slot as unavailable.',
      cancelled: 'The booking was cancelled.',
      completed: 'Please rate your session.',
      pending: 'Booking is waiting for a response.',
    };

    notifyBooking({
      id: `booking-${status}-${bookingId}-${Date.now()}`,
      title: titles[status] || 'Booking update',
      body: bodies[status] || 'Your booking status changed.',
      type: 'booking',
      createdAt: new Date().toISOString(),
      read: false,
      data: {
        type: 'booking',
        bookingId,
        screen: status === 'completed' ? 'BookingReviewScreen' : 'Bookings',
      },
      source: 'local',
    });

    return booking;
  },

  async submitReview(input: {
    bookingId: string;
    rating: number;
    comment: string;
  }) {
    await delay(450);
    await this.updateBookingStatus(input.bookingId, 'completed');
    return { success: true, ...input };
  },
};
