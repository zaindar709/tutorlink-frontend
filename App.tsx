import React, { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
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

export default function App() {
  useEffect(() => {
    configureGoogleSignIn();
    startApiKeepAlive();
    const removePushListeners = initPushListeners();

    const onAppState = (state: AppStateStatus) => {
      if (state === 'active') {
        void warmupApi();
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
            <NavigationContainer ref={navigationRef}>
              <RootNavigator />
            </NavigationContainer>
          </PaperProvider>
        </ReduxProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
