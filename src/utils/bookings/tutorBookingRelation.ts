import { Booking, TutorBookingRelationFlags } from '../../types/api.types';
import { getTutorUserId } from '../api/bookingHelpers';

export type TutorBookingCtaState = 'book' | 'request_sent' | 'already_booked';

export type TutorBookingRelation = {
  state: TutorBookingCtaState;
  label: string;
  booking?: Booking;
  canBook: boolean;
};

const collectTutorKeys = (booking: Booking): string[] => {
  const keys: string[] = [];
  const id = getTutorUserId(booking);
  if (id) keys.push(String(id));
  if (typeof booking.tutor === 'object' && booking.tutor) {
    if (booking.tutor._id) keys.push(String(booking.tutor._id));
    if (booking.tutor.id) keys.push(String(booking.tutor.id));
    const nested = (booking.tutor as { user?: { _id?: string; id?: string } })
      .user;
    if (nested?._id) keys.push(String(nested._id));
    if (nested?.id) keys.push(String(nested.id));
  } else if (typeof booking.tutor === 'string') {
    keys.push(booking.tutor);
  }
  return keys;
};

/** True if booking.tutor matches any of the tutor profile/user ids. */
export const bookingMatchesTutor = (
  booking: Booking,
  tutorKeys: Array<string | null | undefined>
): boolean => {
  const wanted = new Set(
    tutorKeys.filter(Boolean).map(k => String(k).trim()).filter(Boolean)
  );
  if (wanted.size === 0) return false;
  return collectTutorKeys(booking).some(k => wanted.has(k));
};

/** Map POST /api/tutors/search `relation` flags to CTA state. */
export const relationFromSearchFlags = (
  flags?: TutorBookingRelationFlags | null,
  booking?: Booking
): TutorBookingRelation | null => {
  if (!flags) return null;

  if (flags.hasPending || flags.hasPendingPackage) {
    return {
      state: 'request_sent',
      label: 'Request Sent',
      booking,
      canBook: false,
    };
  }

  if (flags.hasActive || flags.hasActivePackage) {
    return {
      state: 'already_booked',
      label: 'Already in Your Bookings',
      booking,
      canBook: false,
    };
  }

  return {
    state: 'book',
    label: 'Book Now',
    canBook: flags.canRequest !== false,
  };
};

/**
 * Student ↔ tutor booking CTA state for cards / Book Now footer.
 * Prefer known bookings (for bookingId deep-link), else search.relation flags.
 */
export const resolveTutorBookingRelation = (
  tutorKeys: Array<string | null | undefined>,
  bookings: Booking[],
  searchFlags?: TutorBookingRelationFlags | null
): TutorBookingRelation => {
  const matches = bookings.filter(b => bookingMatchesTutor(b, tutorKeys));

  const pending = matches.find(b => b.status === 'pending');
  if (pending) {
    return {
      state: 'request_sent',
      label: 'Request Sent',
      booking: pending,
      canBook: false,
    };
  }

  const active = matches.find(b => b.status === 'accepted');
  if (active) {
    return {
      state: 'already_booked',
      label: 'Already in Your Bookings',
      booking: active,
      canBook: false,
    };
  }

  const fromFlags = relationFromSearchFlags(searchFlags);
  if (fromFlags) return fromFlags;

  return {
    state: 'book',
    label: 'Book Now',
    canBook: true,
  };
};
