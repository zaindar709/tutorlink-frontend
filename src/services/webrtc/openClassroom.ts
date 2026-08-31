import { navigateHomeStack } from '../../navigation/navigationRef';
import { Booking } from '../../types/api.types';
import { ApiUser } from '../../types/api.types';
import { SessionRole } from '../../types/webrtc.types';
import {
  buildVideoSessionParams,
  canJoinClassroom,
} from '../../utils/webrtc/sessionHelpers';

type OpenClassroomOptions = {
  user: ApiUser | null;
  role: SessionRole;
  /** When true, VideoSessionScreen joins immediately (no lobby card). */
  autoStart?: boolean;
};

/**
 * Opens the in-app TutorLink classroom for an accepted booking.
 * Safe no-op with false when the booking is not joinable.
 */
export const openClassroom = (
  booking: Booking,
  viewer: OpenClassroomOptions
): boolean => {
  // Allow tutors to force-start a classroom when `autoStart` is supplied
  // (useful for local testing). Otherwise require the booking to be joinable.
  if (!canJoinClassroom(booking) && !(viewer.autoStart && viewer.role === 'tutor')) {
    return false;
  }

  const params = buildVideoSessionParams(booking, viewer);
  if (!params) return false;

  if (viewer.autoStart) {
    params.autoStart = true;
  }

  navigateHomeStack(
    'VideoSessionScreen',
    params as unknown as Record<string, unknown>
  );
  return true;
};
