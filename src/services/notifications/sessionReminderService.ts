import { Booking } from '../../types/api.types';
import { getBookingTutorName } from '../../utils/api/bookingHelpers';
import {
  getBookingDateTime,
  matchesBookingTab,
} from '../../utils/bookings/bookingStatus';
import { upsertNotification } from './notificationInboxStore';

const LOG = '[SessionReminder]';
/** Minutes before start to surface the local reminder in Notification Center. */
export const SESSION_REMINDER_LEAD_MINUTES = 15;
/** Only schedule reminders for sessions starting within this many days. */
const REMINDER_HORIZON_DAYS = 14;

/**
 * Local inbox backup for class-start reminders (student device).
 * System tray pushes for student + tutor still come from backend FCM
 * (see docs/BACKEND_MONTHLY_WEEKDAY_TUITION.md). Notifee tray is not wired
 * in this app build — inbox + FCM cover the product requirement.
 */
export const scheduleLocalSessionReminders = async (
  bookings: Booking[],
  recipientUserId?: string | null
): Promise<number> => {
  const now = new Date();
  const horizon = new Date(now);
  horizon.setDate(horizon.getDate() + REMINDER_HORIZON_DAYS);

  const upcoming = bookings.filter(b => {
    if (!matchesBookingTab(b, 'active', now)) return false;
    const start = getBookingDateTime(b.date, b.startTime);
    if (!start) return false;
    return start.getTime() > now.getTime() && start.getTime() <= horizon.getTime();
  });

  let scheduled = 0;
  for (const booking of upcoming) {
    const start = getBookingDateTime(booking.date, booking.startTime);
    if (!start) continue;

    const remindAt = new Date(
      start.getTime() - SESSION_REMINDER_LEAD_MINUTES * 60 * 1000
    );
    const tutorName = getBookingTutorName(booking);
    const id = `session-reminder-${booking._id}`;

    // Surface in Notification Center once we are within the lead window,
    // or immediately if the user opens Bookings inside that window.
    const shouldShowNow = now.getTime() >= remindAt.getTime();
    if (!shouldShowNow) {
      console.log(LOG, 'queued (not yet in lead window)', {
        bookingId: booking._id,
        start: start.toISOString(),
        remindAt: remindAt.toISOString(),
      });
      continue;
    }

    await upsertNotification({
      id,
      title: `Class at ${booking.startTime}`,
      body: `Your ${booking.subject} class with ${tutorName} starts at ${booking.startTime}.`,
      type: 'reminder',
      createdAt: new Date().toISOString(),
      read: false,
      recipientUserId: recipientUserId || undefined,
      data: {
        type: 'reminder',
        bookingId: booking._id,
        screen: 'Bookings',
        recipientUserId: recipientUserId || '',
      },
      source: 'local',
    });
    scheduled += 1;
    console.log(LOG, 'inbox reminder upserted', {
      bookingId: booking._id,
      start: start.toISOString(),
    });
  }

  console.log(LOG, 'done', {
    upcoming: upcoming.length,
    scheduled,
  });
  return scheduled;
};
