import { ApiUser } from '../../types/api.types';

export const getUserId = (user?: ApiUser | null): string | null => {
  if (!user) {
    return null;
  }

  return user.id || user._id || null;
};

export const formatDateParam = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDisplayDate = (date: Date) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return {
    day: days[date.getDay()],
    date: String(date.getDate()),
  };
};
