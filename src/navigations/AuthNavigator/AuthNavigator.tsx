import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import OnboardingScreens from '../../screens/SharedScreens/Onboarding/OnboardingScreens';
import RoleSelectionScreen from '../../screens/AuthScreens/RoleSelectionScreen/RoleSelection';
import AuthSelectionScreen from '../../screens/AuthScreens/AuthSelectionScreen/AuthSelectionScreen';
import StudentLoginScreen from '../../screens/AuthScreens/StudentAuthScreens/StudentLogin';
import StudentSignUpScreen from '../../screens/AuthScreens/StudentAuthScreens/StudentSignUp';
import StudentSubjectSelection from '../../screens/AuthScreens/StudentAuthScreens/StudenSubjectSelection';
import ForgotPasswordScreen from '../../screens/AuthScreens/ForgotPassword';
import ResetEmailSentScreen from '../../screens/AuthScreens/ResetEmailSentScreen';
import NewPasswordScreen from '../../screens/AuthScreens/NewPasswordScreen';
import SuccessScreen from '../../screens/AuthScreens/SuccessScreen';
import TutorLoginScreen from '../../screens/AuthScreens/TutorAuthScreens/TutorLoginScreen';
import TutorSignUpScreen from '../../screens/AuthScreens/TutorAuthScreens/TutorSignUpScreen';
import DocumentUploadScreen from '../../screens/AuthScreens/TutorAuthScreens/TutorDocumentUpload';
import DocumentReviewScreen from '../../screens/AuthScreens/TutorAuthScreens/TutorDocumentReview';
import TutorApprovalStatusScreen from '../../screens/AuthScreens/TutorAuthScreens/TutorApprovalStatus';
import ParentLinkRedeemScreen from '../../screens/AuthScreens/ParentAuthScreens/ParentLinkRedeem';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="OnboardingScreens"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#f6f7fc' },
      }}
    >
      <Stack.Screen name="OnboardingScreens" component={OnboardingScreens} />
      <Stack.Screen name="RoleSelectionScreen" component={RoleSelectionScreen} />
      <Stack.Screen name="AuthSelectionScreen" component={AuthSelectionScreen} />
      {/* student auth */}
      <Stack.Screen name="StudentLoginScreen" component={StudentLoginScreen} />
      <Stack.Screen name="StudentSignUpScreen" component={StudentSignUpScreen} />
      <Stack.Screen
        name="StudentSubjectSelection"
        component={StudentSubjectSelection}
      />
      <Stack.Screen
        name="ForgotPasswordScreen"
        component={ForgotPasswordScreen}
      />
      <Stack.Screen
        name="ResetEmailSentScreen"
        component={ResetEmailSentScreen}
      />
      <Stack.Screen name="NewPasswordScreen" component={NewPasswordScreen} />
      <Stack.Screen name="SuccessScreen" component={SuccessScreen} />
      {/* tutor auth */}
      <Stack.Screen name="TutorLoginScreen" component={TutorLoginScreen} />
      <Stack.Screen name="TutorSignUpScreen" component={TutorSignUpScreen} />
      <Stack.Screen
        name="DocumentUploadScreen"
        component={DocumentUploadScreen}
      />
      <Stack.Screen
        name="DocumentReviewScreen"
        component={DocumentReviewScreen}
      />
      <Stack.Screen
        name="TutorApprovalStatusScreen"
        component={TutorApprovalStatusScreen}
      />
      <Stack.Screen
        name="ParentLinkRedeemScreen"
        component={ParentLinkRedeemScreen}
      />
    </Stack.Navigator>
  );
}
