const { mongoose } = require('./db');

/**
 * Booking schema subset — matches TutorLink backend booking documents.
 * Only fields needed to authorize classroom join.
 */
const BookingSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.Mixed },
    tutor: { type: mongoose.Schema.Types.Mixed },
    subject: String,
    date: String,
    startTime: String,
    endTime: String,
    status: String,
  },
  { collection: 'bookings', strict: false }
);

const Booking =
  mongoose.models.Booking || mongoose.model('Booking', BookingSchema);

function extractId(value) {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (value._id) return String(value._id);
  if (value.id) return String(value.id);
  if (value.firebaseUid) return String(value.firebaseUid);
  return null;
}

/**
 * Validate sessionId (= bookingId) and ensure the caller is the booked student or tutor.
 */
async function assertCanJoinSession({ sessionId, userId, role }) {
  if (!sessionId) {
    return { ok: false, code: 'INVALID_SESSION', message: 'sessionId required' };
  }

  const booking = await Booking.findById(sessionId).lean();
  if (!booking) {
    // Allow join in demos when booking collection is unavailable / id is custom
    if (process.env.ALLOW_UNVERIFIED_SESSIONS === 'true') {
      return { ok: true, booking: null, unverified: true };
    }
    return {
      ok: false,
      code: 'SESSION_NOT_FOUND',
      message: 'Session / booking not found',
    };
  }

  if (booking.status !== 'accepted') {
    return {
      ok: false,
      code: 'SESSION_NOT_ACTIVE',
      message: `Booking status is ${booking.status}, expected accepted`,
    };
  }

  const studentId = extractId(booking.student);
  const tutorId = extractId(booking.tutor);
  const uid = String(userId);

  const isStudent =
    studentId === uid ||
    (booking.student && booking.student.firebaseUid === uid);
  const isTutor =
    tutorId === uid ||
    (booking.tutor && booking.tutor.firebaseUid === uid);

  if (!isStudent && !isTutor) {
    return {
      ok: false,
      code: 'SESSION_FORBIDDEN',
      message: 'Only the booked student and tutor may join this classroom',
    };
  }

  if (role === 'student' && !isStudent) {
    return {
      ok: false,
      code: 'SESSION_FORBIDDEN',
      message: 'Role mismatch: not the booked student',
    };
  }
  if (role === 'tutor' && !isTutor) {
    return {
      ok: false,
      code: 'SESSION_FORBIDDEN',
      message: 'Role mismatch: not the booked tutor',
    };
  }

  return { ok: true, booking };
}

module.exports = { Booking, assertCanJoinSession, extractId };
