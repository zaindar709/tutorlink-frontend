import { sendTestSystemNotification } from './pushNotificationService';

/** @deprecated use sendTestSystemNotification */
export const sendDemoAppNotification = async (_index = 0) => {
  return sendTestSystemNotification();
};
