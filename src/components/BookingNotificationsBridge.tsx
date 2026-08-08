import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useSelector } from 'react-redux';
import {
  startBookingRealtime,
  stopBookingRealtime,
} from '../services/notifications/bookingRealtime';
import { syncServerNotifications } from '../services/notifications/notificationSyncService';
import { scheduleRegisterDeviceForPush } from '../services/notifications/pushNotificationService';
import { RootState } from '../store/store';
import { getUserId } from '../utils/api/userId';

/**
 * While authenticated: keep FCM registered, poll/sync inbox, and listen for
 * socket `booking-updated` so student/tutor see accept/reject without delay.
 */
export default function BookingNotificationsBridge() {
  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);
  const userId = getUserId(user as any);

  useEffect(() => {
    if (!token) {
      stopBookingRealtime();
      return;
    }

    scheduleRegisterDeviceForPush(800);
    void startBookingRealtime();
    void syncServerNotifications(userId);

    const poll = setInterval(() => {
      void syncServerNotifications(userId);
    }, 20_000);

    const onAppState = (state: AppStateStatus) => {
      if (state === 'active') {
        scheduleRegisterDeviceForPush(400);
        void startBookingRealtime();
        void syncServerNotifications(userId);
      }
    };
    const sub = AppState.addEventListener('change', onAppState);

    return () => {
      clearInterval(poll);
      sub.remove();
      stopBookingRealtime();
    };
  }, [token, userId]);

  return null;
}
