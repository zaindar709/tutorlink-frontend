import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EditProfileScreen from '../../screens/MainScreens/TutorMainScreens/Profile/SubProfileScreens/EditProfile';
import ScheduleAvailabilityScreen from '../../screens/MainScreens/TutorMainScreens/Profile/SubProfileScreens/ScheduleAvailability';
import PaymentMethodScreen from '../../screens/MainScreens/TutorMainScreens/Profile/SubProfileScreens/PaymentMethods';
import SecurityPrivacyScreen from '../../screens/MainScreens/TutorMainScreens/Profile/SubProfileScreens/SecurityScreen';
import WithdrawMoneyScreen from '../../screens/MainScreens/TutorMainScreens/Earnings/SubEarningScreens/WithdrawMoney';
import EarningAnalyticsScreen from '../../screens/MainScreens/TutorMainScreens/Earnings/SubEarningScreens/EarningAnalytics';
import TransactionHistoryScreen from '../../screens/MainScreens/TutorMainScreens/Earnings/SubEarningScreens/TransactionHistory';
import TransactionCompleted from '../../screens/MainScreens/TutorMainScreens/Earnings/SubEarningScreens/TransactionHistory/TransactionCompleted';
import TransactionProcessing from '../../screens/MainScreens/TutorMainScreens/Earnings/SubEarningScreens/TransactionHistory/TransactionProcessing';
import ChatScreen from '../../screens/MainScreens/SharedScreens/Chat/ChatScreen';
import WalletScreen from '../../screens/MainScreens/StudentMainScreens/WalletScreen';
import TutorEarningsScreen from '../../screens/MainScreens/TutorMainScreens/Earnings';
import StudentEditProfileScreen from '../../screens/MainScreens/StudentMainScreens/Profile/SubProfileScreens/EditProfile';
import StudentInterestsScreen from '../../screens/MainScreens/StudentMainScreens/Profile/SubProfileScreens/MyInterests';
import StudentCertificatesScreen from '../../screens/MainScreens/StudentMainScreens/Profile/SubProfileScreens/Certificates';
import StudentLinkParentScreen from '../../screens/MainScreens/StudentMainScreens/Profile/SubProfileScreens/LinkParentAccount';
import StudentSessionHistoryScreen from '../../screens/MainScreens/StudentMainScreens/Profile/SubProfileScreens/SessionHistory';
import StudentProgressScreen from '../../screens/MainScreens/StudentMainScreens/Profile/SubProfileScreens/Progress';
import StudentNotificationsScreen from '../../screens/MainScreens/StudentMainScreens/Profile/SubProfileScreens/Notifications';
import StudentNotificationInboxScreen from '../../screens/MainScreens/StudentMainScreens/Home/NotificationInbox';
import StudentPrivacySecurityScreen from '../../screens/MainScreens/StudentMainScreens/Profile/SubProfileScreens/PrivacySecurity';
import StudentAppSettingsScreen from '../../screens/MainScreens/StudentMainScreens/Profile/SubProfileScreens/AppSettings';
import StudentHelpSupportScreen from '../../screens/MainScreens/StudentMainScreens/Profile/SubProfileScreens/HelpSupport';
import StudentTermsPoliciesScreen from '../../screens/MainScreens/StudentMainScreens/Profile/SubProfileScreens/TermsPolicies';
import ParentLinkRedeemScreen from '../../screens/AuthScreens/ParentAuthScreens/ParentLinkRedeem';
import TutorBookingDetailsScreen from '../../screens/MainScreens/StudentMainScreens/BookingFlow/TutorBookingDetailsScreen';
import BookingPendingScreen from '../../screens/MainScreens/StudentMainScreens/BookingFlow/BookingPendingScreen';
import BookingReviewScreen from '../../screens/MainScreens/StudentMainScreens/BookingFlow/BookingReviewScreen';
import TutorBookingRequestDetailsScreen from '../../screens/MainScreens/TutorMainScreens/BookingFlow/TutorBookingRequestDetailsScreen';
import TutorRescheduleScreen from '../../screens/MainScreens/TutorMainScreens/Schedule/TutorRescheduleScreen';
import DeveloperOptionsScreen from '../../screens/MainScreens/SharedScreens/DeveloperOptions';
import VideoSessionScreen from '../../screens/MainScreens/SharedScreens/VideoSession';
import SessionSummaryProcessingScreen from '../../screens/MainScreens/SharedScreens/Summary/SessionSummaryProcessingScreen';
import StudentSummariesScreen from '../../screens/MainScreens/StudentMainScreens/Summary/StudentSummariesScreen';
import StudentSummaryDetailScreen from '../../screens/MainScreens/StudentMainScreens/Summary/StudentSummaryDetailScreen';
import TutorSummariesScreen from '../../screens/MainScreens/TutorMainScreens/Summary/TutorSummariesScreen';
import TutorSummaryReviewScreen from '../../screens/MainScreens/TutorMainScreens/Summary/TutorSummaryReviewScreen';
import StudentAssessmentsScreen from '../../screens/MainScreens/StudentMainScreens/Assessment/StudentAssessmentsScreen';
import StudentAssessmentDetailScreen from '../../screens/MainScreens/StudentMainScreens/Assessment/StudentAssessmentDetailScreen';
import StudentTakeAssessmentScreen from '../../screens/MainScreens/StudentMainScreens/Assessment/StudentTakeAssessmentScreen';
import StudentAssessmentResultScreen from '../../screens/MainScreens/StudentMainScreens/Assessment/StudentAssessmentResultScreen';
import TutorAssessmentsScreen from '../../screens/MainScreens/TutorMainScreens/Assessment/TutorAssessmentsScreen';
import TutorAssessmentEditorScreen from '../../screens/MainScreens/TutorMainScreens/Assessment/TutorAssessmentEditorScreen';
import TutorSubmissionsScreen from '../../screens/MainScreens/TutorMainScreens/Assessment/TutorSubmissionsScreen';
import TutorGradeAttemptScreen from '../../screens/MainScreens/TutorMainScreens/Assessment/TutorGradeAttemptScreen';

const Stack = createNativeStackNavigator();

const HomeNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#f6f7fc' },
      }}
    >
      <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
      <Stack.Screen
        name="ScheduleAvailabilityScreen"
        component={ScheduleAvailabilityScreen}
      />
      <Stack.Screen name="PaymentMethodScreen" component={PaymentMethodScreen} />
      <Stack.Screen
        name="SecurityPrivacyScreen"
        component={SecurityPrivacyScreen}
      />
      <Stack.Screen name="WithdrawMoneyScreen" component={WithdrawMoneyScreen} />
      <Stack.Screen
        name="EarningAnalyticsScreen"
        component={EarningAnalyticsScreen}
      />
      <Stack.Screen
        name="TransactionHistoryScreen"
        component={TransactionHistoryScreen}
      />
      <Stack.Screen name="TransactionCompleted" component={TransactionCompleted} />
      <Stack.Screen
        name="TransactionProcessing"
        component={TransactionProcessing}
      />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="WalletScreen" component={WalletScreen} />
      <Stack.Screen name="TutorEarningsScreen" component={TutorEarningsScreen} />
      <Stack.Screen
        name="StudentEditProfileScreen"
        component={StudentEditProfileScreen}
      />
      <Stack.Screen
        name="StudentInterestsScreen"
        component={StudentInterestsScreen}
      />
      <Stack.Screen
        name="StudentCertificatesScreen"
        component={StudentCertificatesScreen}
      />
      <Stack.Screen
        name="StudentLinkParentScreen"
        component={StudentLinkParentScreen}
      />
      <Stack.Screen
        name="ParentLinkRedeemScreen"
        component={ParentLinkRedeemScreen}
      />
      <Stack.Screen
        name="StudentSessionHistoryScreen"
        component={StudentSessionHistoryScreen}
      />
      <Stack.Screen
        name="StudentProgressScreen"
        component={StudentProgressScreen}
      />
      <Stack.Screen
        name="StudentNotificationsScreen"
        component={StudentNotificationsScreen}
      />
      <Stack.Screen
        name="StudentNotificationInboxScreen"
        component={StudentNotificationInboxScreen}
      />
      <Stack.Screen
        name="StudentPrivacySecurityScreen"
        component={StudentPrivacySecurityScreen}
      />
      <Stack.Screen
        name="StudentAppSettingsScreen"
        component={StudentAppSettingsScreen}
      />
      <Stack.Screen
        name="StudentHelpSupportScreen"
        component={StudentHelpSupportScreen}
      />
      <Stack.Screen
        name="StudentTermsPoliciesScreen"
        component={StudentTermsPoliciesScreen}
      />
      <Stack.Screen
        name="TutorBookingDetailsScreen"
        component={TutorBookingDetailsScreen}
      />
      <Stack.Screen
        name="BookingPendingScreen"
        component={BookingPendingScreen}
      />
      <Stack.Screen
        name="BookingReviewScreen"
        component={BookingReviewScreen}
      />
      <Stack.Screen
        name="TutorBookingRequestDetailsScreen"
        component={TutorBookingRequestDetailsScreen}
      />
      <Stack.Screen
        name="TutorRescheduleScreen"
        component={TutorRescheduleScreen}
      />
      <Stack.Screen
        name="DeveloperOptionsScreen"
        component={DeveloperOptionsScreen}
      />
      <Stack.Screen
        name="VideoSessionScreen"
        component={VideoSessionScreen}
        options={{
          gestureEnabled: false,
          animation: 'fade',
        }}
      />
      <Stack.Screen
        name="SessionSummaryProcessingScreen"
        component={SessionSummaryProcessingScreen}
      />
      <Stack.Screen
        name="StudentSummariesScreen"
        component={StudentSummariesScreen}
      />
      <Stack.Screen
        name="StudentSummaryDetailScreen"
        component={StudentSummaryDetailScreen}
      />
      <Stack.Screen
        name="TutorSummariesScreen"
        component={TutorSummariesScreen}
      />
      <Stack.Screen
        name="TutorSummaryReviewScreen"
        component={TutorSummaryReviewScreen}
      />
      <Stack.Screen
        name="StudentAssessmentsScreen"
        component={StudentAssessmentsScreen}
      />
      <Stack.Screen
        name="StudentAssessmentDetailScreen"
        component={StudentAssessmentDetailScreen}
      />
      <Stack.Screen
        name="StudentTakeAssessmentScreen"
        component={StudentTakeAssessmentScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="StudentAssessmentResultScreen"
        component={StudentAssessmentResultScreen}
      />
      <Stack.Screen
        name="TutorAssessmentsScreen"
        component={TutorAssessmentsScreen}
      />
      <Stack.Screen
        name="TutorAssessmentEditorScreen"
        component={TutorAssessmentEditorScreen}
      />
      <Stack.Screen
        name="TutorSubmissionsScreen"
        component={TutorSubmissionsScreen}
      />
      <Stack.Screen
        name="TutorGradeAttemptScreen"
        component={TutorGradeAttemptScreen}
      />
    </Stack.Navigator>
  );
};

export default HomeNavigator;

