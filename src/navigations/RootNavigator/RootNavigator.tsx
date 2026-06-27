import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import AuthNavigator from '../AuthNavigator/AuthNavigator';
import { MyTabs } from '../TabNavigator/TabNavigator';
import SplashScreen from '../../screens/SharedScreens/Splash/SplashScreen';
import { useSelector } from 'react-redux';
import HomeNavigator from '../HomeNavigator';

const Stack = createNativeStackNavigator();
export default function RootNavigator() {
  const role = useSelector((state: any) => state.auth.role);
  return (
    <Stack.Navigator
      initialRouteName="SplashScreen"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="SplashScreen" component={SplashScreen} />
      <Stack.Screen name="AuthNavigator" component={AuthNavigator} />
      <Stack.Screen name="HomeNavigator" component={HomeNavigator} />
      <Stack.Screen name="MyTabs">
        {props => <MyTabs {...props} role={role} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
