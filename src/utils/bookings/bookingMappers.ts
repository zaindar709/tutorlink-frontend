import { Booking } from '../../types/api.types';
import {
  BookingFlowItem,
  BookingFlowStatus,
  StudentBookingProfile,
  TutorBookingProfile,
} from '../../types/bookingFlow.types';
import {
  getBookingStudentAvatar,
  getBookingStudentName,
  getBookingTutorAvatar,
  getBookingTutorName,
} from '../api/bookingHelpers';
import { getSessionAmount, getSessionDurationHours } from './bookingStatus';

const toFlowStatus = (status: Booking['status']): BookingFlowStatus => {
  if (status === 'missed') return 'cancelled';
  return status as BookingFlowStatus;
};

const asUser = (value: Booking['student'] | Booking['tutor']) =>
  typeof value === 'object' && value ? value : null;

export const mapBookingToFlowItem = (
  booking: Booking,
  extras?: {
    tutorProfile?: Partial<TutorBookingProfile>;
    studentProfile?: Partial<StudentBookingProfile>;
    notes?: string;
  }
): BookingFlowItem => {
  const tutorUser = asUser(booking.tutor);
  const studentUser = asUser(booking.student);
  const durationHours = getSessionDurationHours(
    booking.startTime,
    booking.endTime
  );
  const totalCost =
    booking.hourlyRateAtBooking != null
      ? getSessionAmount(booking)
      : extras?.tutorProfile?.hourlyRate
        ? Math.round(extras.tutorProfile.hourlyRate * durationHours)
        : 0;

  const tutorName = getBookingTutorName(booking);
  const studentName = getBookingStudentName(booking);

  const tutor: TutorBookingProfile = {
    id: String(tutorUser?._id || tutorUser?.id || booking.tutor || ''),
    name: extras?.tutorProfile?.name || tutorName,
    avatarUrl:
      extras?.tutorProfile?.avatarUrl ||
      tutorUser?.avatarUrl ||
      getBookingTutorAvatar(booking),
    rating: extras?.tutorProfile?.rating ?? 0,
    totalReviews: extras?.tutorProfile?.totalReviews ?? 0,
    hourlyRate:
      booking.hourlyRateAtBooking ?? extras?.tutorProfile?.hourlyRate ?? 0,
    availabilityStatus: extras?.tutorProfile?.availabilityStatus ?? 'available',
    subjects: extras?.tutorProfile?.subjects ?? [booking.subject],
    experienceYears: extras?.tutorProfile?.experienceYears ?? 0,
    qualification: extras?.tutorProfile?.qualification ?? '',
    bio: extras?.tutorProfile?.bio ?? '',
    languages: extras?.tutorProfile?.languages ?? [],
    teachingMode: extras?.tutorProfile?.teachingMode ?? 'online',
    location: extras?.tutorProfile?.location ?? 'Online',
    isVerified: extras?.tutorProfile?.isVerified ?? false,
    responseTime: extras?.tutorProfile?.responseTime ?? '~30 min',
    completedSessions: extras?.tutorProfile?.completedSessions ?? 0,
    successRate: extras?.tutorProfile?.successRate ?? 0,
    accountSummary: extras?.tutorProfile?.accountSummary ?? {
      memberSince: '',
      teachingStyle: '',
      preferredGrades: [],
    },
    certificates: extras?.tutorProfile?.certificates ?? [],
    reviews: extras?.tutorProfile?.reviews ?? [],
    timeSlots: extras?.tutorProfile?.timeSlots ?? [],
    similarTutorIds: extras?.tutorProfile?.similarTutorIds ?? [],
  };

  const student: StudentBookingProfile = {
    id: String(studentUser?._id || studentUser?.id || booking.student || ''),
    name: extras?.studentProfile?.name || studentName,
    avatarUrl:
      extras?.studentProfile?.avatarUrl ||
      studentUser?.avatarUrl ||
      getBookingStudentAvatar(booking),
    grade: extras?.studentProfile?.grade,
    subjects: extras?.studentProfile?.subjects ?? [booking.subject],
    notes: extras?.notes || extras?.studentProfile?.notes,
    rating: extras?.studentProfile?.rating,
  };

  const paymentStatus =
    booking.status === 'accepted'
      ? 'held'
      : booking.status === 'completed'
        ? 'paid'
        : booking.status === 'cancelled'
          ? 'refunded'
          : 'pending';

  return {
    id: booking._id,
    status: toFlowStatus(booking.status),
    tutor,
    student,
    subject: booking.subject,
    date: String(booking.date).slice(0, 10),
    startTime: booking.startTime,
    endTime: booking.endTime,
    durationHours,
    totalCost,
    teachingMode: tutor.teachingMode,
    location: tutor.location || 'Online',
    paymentMethod: 'TutorLink Wallet',
    paymentStatus,
    notes: extras?.notes,
    createdAt: booking.createdAt || new Date().toISOString(),
    estimatedResponseMinutes: 25,
  };
};

/** Resolve User _id for POST /api/bookings — never use TutorProfile _id. */
export const resolveTutorUserId = (tutor: {
  _id?: string;
  id?: string;
  userId?: string;
  user?: { _id?: string; id?: string } | string;
}): string => {
  const profileId = String(tutor._id || tutor.id || '').trim();
  const nestedUser =
    tutor.user && typeof tutor.user === 'object' ? tutor.user : null;
  const userFromString =
    typeof tutor.user === 'string' ? tutor.user.trim() : '';

  const candidates = [
    nestedUser?._id,
    nestedUser?.id,
    tutor.userId,
    userFromString,
  ]
    .map(v => String(v || '').trim())
    .filter(Boolean);

  // Prefer an id that is NOT the tutor profile document id.
  const userId =
    candidates.find(id => !profileId || id !== profileId) || candidates[0] || '';

  if (!userId) return '';
  if (profileId && userId === profileId) {
    // Ambiguous — caller should refetch tutor details before booking.
    return '';
  }
  return userId;
};
