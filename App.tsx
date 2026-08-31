import React, { useEffect } from 'react';
import { AppState, AppStateStatus, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigations/RootNavigator/RootNavigator';
import { store } from './src/store/store';
import { configureGoogleSignIn } from './src/services/googleSignin';
import { navigationRef } from './src/navigation/navigationRef';
import { initPushListeners } from './src/services/notifications/pushNotificationService';
import {
  startApiKeepAlive,
  stopApiKeepAlive,
  warmupApi,
} from './src/services/api/apiWarmup';
import BookingNotificationsBridge from './src/components/BookingNotificationsBridge';
import PasswordResetLinkBridge from './src/components/PasswordResetLinkBridge';
import RateTutorModal from './src/components/RateTutorModal';
import { hydrateRatingsThunk } from './src/store/rating/ratingSlice';

// Hide yellow/red LogBox overlays so demos/panels stay clean.
LogBox.ignoreAllLogs(true);

export default function App() {
  useEffect(() => {
    configureGoogleSignIn();
    startApiKeepAlive();
    const removePushListeners = initPushListeners();
    // Load saved ratings + push them to admin dashboard if it's running.
    void store.dispatch(hydrateRatingsThunk());

    const onAppState = (state: AppStateStatus) => {
      if (state === 'active') {
        void warmupApi();
        void store.dispatch(hydrateRatingsThunk());
      }
    };
    const appStateSub = AppState.addEventListener('change', onAppState);

    return () => {
      stopApiKeepAlive();
      removePushListeners();
      appStateSub.remove();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ReduxProvider store={store}>
          <PaperProvider>
            <BookingNotificationsBridge />
            <RateTutorModal />
            <NavigationContainer ref={navigationRef}>
              <PasswordResetLinkBridge />
              <RootNavigator />
            </NavigationContainer>
          </PaperProvider>
        </ReduxProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
