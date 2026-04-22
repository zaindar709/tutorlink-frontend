import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import OnboardingScreens from '../../screens/SharedScreens/Onboarding/OnboardingScreens';
import RoleSelectionScreen from '../../screens/AuthScreens/RoleSelectionScreen/RoleSelection';
import AuthSelectionScreen from '../../screens/AuthScreens/AuthSelectionScreen/AuthSelectionScreen';
import StudentLoginScreen from '../../screens/AuthScreens/StudentAuthScreens/StudentLoginScreen/StudentLoginScreen';
import StudentSignUpScreen from '../../screens/AuthScreens/StudentAuthScreens/StudentSignUp/StudentSignUpScreen';
import StudentSubjectSelection from '../../screens/AuthScreens/StudentAuthScreens/StudenSubjectSelection/StudentSubjectSelection';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="OnboardingScreens"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="OnboardingScreens" component={OnboardingScreens} />
      <Stack.Screen
        name="RoleSelectionScreen"
        component={RoleSelectionScreen}
      />
      <Stack.Screen
        name="AuthSelectionScreen"
        component={AuthSelectionScreen}
      />
      <Stack.Screen 
      name="StudentLoginScreen" 
      component={StudentLoginScreen} 
      />
      <Stack.Screen 
      name='StudentSignUpScreen'
      component={StudentSignUpScreen}
      />
      <Stack.Screen
      name='StudentSubjectSelection'
      component={StudentSubjectSelection}
      />
    </Stack.Navigator>
  );
}
