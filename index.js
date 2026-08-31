/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import {
  registerBackgroundMessageHandler,
  registerNotifeeBackgroundEvents,
} from './src/services/notifications/pushNotificationService';

// Must run before the app component mounts (background / quit delivery).
registerBackgroundMessageHandler();
registerNotifeeBackgroundEvents();

AppRegistry.registerComponent(appName, () => App);
