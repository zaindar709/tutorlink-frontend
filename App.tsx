import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import RootNavigator from './src/navigations/RootNavigator/RootNavigator';
import { store } from './src/store/store';
import { configureGoogleSignIn } from './src/services/googleSignin';
import { navigationRef } from './src/navigation/navigationRef';

export default function App() {
  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  return (
    <ReduxProvider store={store}>
      <PaperProvider>
        <NavigationContainer ref={navigationRef}>
          <RootNavigator />
        </NavigationContainer>
      </PaperProvider>
    </ReduxProvider>
  );
}
