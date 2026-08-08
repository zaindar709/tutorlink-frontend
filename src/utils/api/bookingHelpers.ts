import { ApiUser, Booking } from '../../types/api.types';
import { isMockWalletPhone } from '../../services/wallet/mockWallet';

const asUser = (value: Booking['student'] | Booking['tutor']): ApiUser | null =>
  typeof value === 'object' && value ? value : null;

export const getUserDisplayName = (
  user?: ApiUser | string | null,
  fallback = 'User'
): string => {
  if (!user) return fallback;
  if (typeof user === 'string') return fallback;
  const nested = (user as ApiUser & { user?: ApiUser }).user;
  const fromRoot =
    user.name ||
    user.fullName ||
    (typeof user.email === 'string' ? user.email.split('@')[0] : '');
  const fromNested =
    nested?.name ||
    nested?.fullName ||
    (typeof nested?.email === 'string' ? nested.email.split('@')[0] : '');
  return fromRoot || fromNested || fallback;
};

/**
 * Name of the *other* party relative to the viewer role.
 * - viewerRole `tutor`  → student name (requests / tutor dashboard)
 * - viewerRole `student`|`parent` → tutor name
 */
export const getBookingParticipantName = (
  booking: Booking,
  viewerRole: 'student' | 'tutor' | 'parent'
): string => {
  const participant =
    viewerRole === 'tutor' ? booking.student : booking.tutor;
  return getUserDisplayName(
    participant,
    viewerRole === 'tutor' ? 'Student' : 'Tutor'
  );
};

/** True when tutor has a pending reschedule the student must answer. */
export const hasPendingRescheduleProposal = (booking: Booking): boolean => {
  const proposal = booking.rescheduleProposal;
  if (!proposal || proposal.status !== 'pending') return false;
  return Boolean(proposal.date && proposal.startTime && proposal.endTime);
};

/** Always the booking student (for tutor-facing request cards/details). */
export const getBookingStudentName = (booking: Booking): string =>
  getUserDisplayName(booking.student, 'Student');

/** Always the booking tutor. */
export const getBookingTutorName = (booking: Booking): string =>
  getUserDisplayName(booking.tutor, 'Tutor');

export const getBookingStudentAvatar = (booking: Booking): string => {
  const student = asUser(booking.student);
  return (
    student?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      getBookingStudentName(booking)
    )}&background=7548F5&color=fff`
  );
};

export const getBookingTutorAvatar = (booking: Booking): string => {
  const tutor = asUser(booking.tutor);
  return (
    tutor?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      getBookingTutorName(booking)
    )}&background=7548F5&color=fff`
  );
};

/**
 * Avatar of the other party relative to viewer.
 * Prefer this over the old helper that always preferred tutor avatar.
 */
export const getBookingParticipantAvatar = (
  booking: Booking,
  viewerRole: 'student' | 'tutor' | 'parent' = 'student'
): string =>
  viewerRole === 'tutor'
    ? getBookingStudentAvatar(booking)
    : getBookingTutorAvatar(booking);

export const getTutorUserId = (booking: Booking): string | null => {
  if (typeof booking.tutor === 'string') {
    return booking.tutor;
  }
  return booking.tutor?._id || booking.tutor?.id || null;
};

export const getStudentUserId = (booking: Booking): string | null => {
  if (typeof booking.student === 'string') {
    return booking.student;
  }
  return booking.student?._id || booking.student?.id || null;
};

export const formatBookingTimeRange = (booking: Booking): string =>
  `${booking.startTime} - ${booking.endTime}`;

export const mapTabLabel = (tab: string): 'active' | 'pending' | 'past' => {
  const normalized = tab.toLowerCase();
  if (normalized === 'pending') return 'pending';
  if (normalized === 'past') return 'past';
  return 'active';
};

export const formatTransactionForCard = (transaction: {
  title: string;
  amount: number;
  createdAt: string;
  phoneNumber?: string;
  isMock?: boolean;
  mock?: boolean;
}) => {
  const isDeposit = transaction.amount > 0;
  const createdDate = new Date(transaction.createdAt);
  const mock =
    transaction.isMock ||
    transaction.mock ||
    isMockWalletPhone(transaction.phoneNumber) ||
    /mock/i.test(transaction.title || '');

  return {
    id: transaction.createdAt,
    type: isDeposit ? 'deposit' : 'payment',
    title: mock && isDeposit ? `${transaction.title || 'Deposit'} (Mock)` : transaction.title,
    amount: `${isDeposit ? '+' : '-'}Rs. ${Math.abs(transaction.amount).toLocaleString()}`,
    time: createdDate.toLocaleString(),
    method: mock
      ? `Mock · ${transaction.phoneNumber || 'Wallet'}`
      : transaction.phoneNumber || 'Wallet',
  };
};

export const getDisplayName = (user?: ApiUser | null): string =>
  getUserDisplayName(user, 'User');
