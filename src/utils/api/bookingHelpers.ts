import { ApiUser, Booking } from '../../types/api.types';

export const getBookingParticipantName = (
  booking: Booking,
  role: 'student' | 'tutor' | 'parent'
): string => {
  const participant =
    role === 'tutor' ? booking.student : booking.tutor;

  if (typeof participant === 'string') {
    return 'Participant';
  }

  return participant?.name || 'Participant';
};

export const getBookingParticipantAvatar = (booking: Booking): string => {
  const tutor =
    typeof booking.tutor === 'object' ? booking.tutor : undefined;
  const student =
    typeof booking.student === 'object' ? booking.student : undefined;

  return (
    tutor?.avatarUrl ||
    student?.avatarUrl ||
    'https://randomuser.me/api/portraits/lego/1.jpg'
  );
};

export const getTutorUserId = (booking: Booking): string | null => {
  if (typeof booking.tutor === 'string') {
    return booking.tutor;
  }
  return booking.tutor?._id || booking.tutor?.id || null;
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
}) => {
  const isDeposit = transaction.amount > 0;
  const createdDate = new Date(transaction.createdAt);

  return {
    id: transaction.createdAt,
    type: isDeposit ? 'deposit' : 'payment',
    title: transaction.title,
    amount: `${isDeposit ? '+' : '-'}Rs. ${Math.abs(transaction.amount).toLocaleString()}`,
    time: createdDate.toLocaleString(),
    method: transaction.phoneNumber || 'Wallet',
  };
};

export const getDisplayName = (user?: ApiUser | null): string =>
  user?.name || user?.fullName || 'User';
