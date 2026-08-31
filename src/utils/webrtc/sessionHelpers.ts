import { Booking } from '../../types/api.types';
import {
  SessionRole,
  VideoSessionParams,
  VideoSessionParticipant,
} from '../../types/webrtc.types';
import {
  getBookingParticipantAvatar,
  getBookingParticipantName,
  getBookingStudentAvatar,
  getBookingStudentName,
  getBookingTutorAvatar,
  getBookingTutorName,
  getDisplayName,
  getStudentUserId,
  getTutorUserId,
} from '../api/bookingHelpers';
import { ApiUser } from '../../types/api.types';
import { hasSessionEnded } from '../bookings/bookingStatus';

/** Classroom session id is the accepted booking id. */
export const getClassroomSessionId = (booking: Booking): string => booking._id;

export const canJoinClassroom = (
  booking: Booking,
  now = new Date()
): boolean => {
  const status = String(booking.status || '').toLowerCase();
  // Backend classroom join requires accepted; treat confirmed as accepted alias.
  return (
    (status === 'accepted' || status === 'confirmed') &&
    !hasSessionEnded(booking, now)
  );
};

const resolveUserId = (user?: ApiUser | null): string =>
  String(user?._id || user?.id || user?.firebaseUid || user?.uid || 'unknown');

export const buildVideoSessionParams = (
  booking: Booking,
  viewer: {
    user: ApiUser | null;
    role: SessionRole;
  }
): VideoSessionParams | null => {
  if (!booking?._id) return null;

  const selfId = resolveUserId(viewer.user);

  const self: VideoSessionParticipant = {
    userId: String(selfId),
    name: getDisplayName(viewer.user) || (viewer.role === 'tutor' ? 'Tutor' : 'Student'),
    role: viewer.role,
    avatarUrl: viewer.user?.avatarUrl,
    verified: viewer.role === 'tutor',
  };

  const peerRole: SessionRole = viewer.role === 'tutor' ? 'student' : 'tutor';
  const peer: VideoSessionParticipant = {
    userId: String(
      (peerRole === 'tutor'
        ? getTutorUserId(booking)
        : getStudentUserId(booking)) || ''
    ),
    name:
      peerRole === 'tutor'
        ? getBookingTutorName(booking)
        : getBookingStudentName(booking),
    role: peerRole,
    avatarUrl:
      peerRole === 'tutor'
        ? getBookingTutorAvatar(booking)
        : getBookingStudentAvatar(booking),
    verified: peerRole === 'tutor',
  };

  // Fallback display helpers when ids are sparse
  if (!peer.name) {
    peer.name = getBookingParticipantName(booking, viewer.role);
  }
  if (!peer.avatarUrl) {
    peer.avatarUrl = getBookingParticipantAvatar(booking, viewer.role);
  }

  return {
    sessionId: getClassroomSessionId(booking),
    bookingId: booking._id,
    subject: booking.subject || 'Lesson',
    date: booking.date,
    startTime: booking.startTime,
    endTime: booking.endTime,
    role: viewer.role,
    peer,
    self,
  };
};
