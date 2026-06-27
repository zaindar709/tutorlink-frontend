import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
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



const Stack = createNativeStackNavigator();
const HomeNavigator = () => {
  return (
    <Stack.Navigator
    screenOptions={{
        headerShown: false
    }}>
      <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
      <Stack.Screen name="ScheduleAvailabilityScreen" component={ScheduleAvailabilityScreen} />
      <Stack.Screen name="PaymentMethodScreen" component={PaymentMethodScreen} />
      <Stack.Screen name="SecurityPrivacyScreen" component={SecurityPrivacyScreen} />
      <Stack.Screen name="WithdrawMoneyScreen" component={WithdrawMoneyScreen} />
      <Stack.Screen name="EarningAnalyticsScreen" component={EarningAnalyticsScreen} />
      <Stack.Screen name="TransactionHistoryScreen" component={TransactionHistoryScreen} />
      <Stack.Screen name="TransactionCompleted" component={TransactionCompleted} />
      <Stack.Screen name="TransactionProcessing" component={TransactionProcessing} />
    </Stack.Navigator>
  ); 
}

export default HomeNavigator;

const styles = StyleSheet.create({})