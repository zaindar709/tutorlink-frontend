import { WeekdayName } from '../../types/api.types';

export const WORK_DAYS: WeekdayName[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
];

export const WORK_DAY_LABELS: Record<WeekdayName, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

/** Parse "9:00 AM - 5:00 PM" or "09:00 - 17:00" into start/end for the API. */
export const parseWindowLabel = (
  label: string
): { startTime: string; endTime: string } | null => {
  const cleaned = label.trim().replace(/\s+/g, ' ');
  const parts = cleaned.split(/\s*[-–—]\s*/);
  if (parts.length !== 2) return null;
  const startTime = parts[0].trim();
  const endTime = parts[1].trim();
  if (!startTime || !endTime) return null;
  return { startTime, endTime };
};

export const formatWindowLabel = (startTime: string, endTime: string) =>
  `${startTime} - ${endTime}`;

/** Mon–Sun calendar week containing `from` (Monday-first). */
export const getCalendarWeekDates = (from: Date = new Date()): Date[] => {
  const cursor = new Date(from);
  cursor.setHours(12, 0, 0, 0);
  const day = cursor.getDay(); // 0 Sun … 6 Sat
  const toMonday = day === 0 ? -6 : 1 - day;
  cursor.setDate(cursor.getDate() + toMonday);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(cursor);
    d.setDate(cursor.getDate() + i);
    return d;
  });
};

/** Mon–Fri of the calendar week that contains `from`. */
export const getWorkWeekDates = (from: Date = new Date()): Date[] => {
  return getCalendarWeekDates(from).slice(0, 5);
};

/** Next N Mon–Fri dates starting from `from` (inclusive if weekday). */
export const getUpcomingWorkDates = (
  from: Date = new Date(),
  count = 10
): Date[] => {
  const dates: Date[] = [];
  const cursor = new Date(from);
  cursor.setHours(12, 0, 0, 0);

  while (dates.length < count) {
    const day = cursor.getDay();
    if (day >= 1 && day <= 5) {
      dates.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
};

/**
 * All Mon–Fri dates from `from` through `from + durationDays` (calendar days).
 * Used for monthly_weekdays tuition packages.
 */
export const getWorkDatesForDuration = (
  from: Date = new Date(),
  durationDays = 30
): Date[] => {
  const start = new Date(from);
  start.setHours(12, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + Math.max(1, durationDays) - 1);

  const dates: Date[] = [];
  const cursor = new Date(start);
  while (cursor.getTime() <= end.getTime()) {
    const day = cursor.getDay();
    if (day >= 1 && day <= 5) {
      dates.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
};

/** Skip Sat/Sun when picking the first preferred class day. */
export const nextWeekdayOnOrAfter = (from: Date = new Date()): Date => {
  const cursor = new Date(from);
  cursor.setHours(12, 0, 0, 0);
  while (isWeekendDate(cursor)) {
    cursor.setDate(cursor.getDate() + 1);
  }
  return cursor;
};

export const isWeekendDate = (date: Date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};
