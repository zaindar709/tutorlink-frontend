import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import AuthNavigator from '../AuthNavigator/AuthNavigator';
import SplashScreen from '../../screens/SharedScreens/Splash/SplashScreen';

const Stack = createNativeStackNavigator();
export default function RootNavigator() {
  return (
    <Stack.Navigator 
    initialRouteName="SplashScreen"
     screenOptions={{
        headerShown: false,   
      }}
    >
      <Stack.Screen name="SplashScreen" component={SplashScreen} />
      <Stack.Screen name="AuthNavigator" component={AuthNavigator} />
    </Stack.Navigator>
  );
}
