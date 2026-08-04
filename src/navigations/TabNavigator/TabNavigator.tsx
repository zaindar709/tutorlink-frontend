import { View, StyleSheet, Image, Pressable } from 'react-native';
import {
  createBottomTabNavigator,
  BottomTabBarButtonProps,
} from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { CustomCenterButton } from '../../components/CustomCenterButton/CustomCenterButton';
import TutorProfileTabTip from '../../components/Profile/TutorProfileTabTip';
import Images from '../../assets/images';
import { GLASS } from '../../theme/glass';
import GlassPillTabBar from './GlassPillTabBar';

import FirstTimeHome from '../../screens/MainScreens/StudentMainScreens/Home/HomeScreen/FirstTimeHome';
import SearchScreen from '../../screens/MainScreens/StudentMainScreens/SearchScreen';
import BookingsScreen from '../../screens/MainScreens/StudentMainScreens/BookingScreen';
import ProfileScreen from '../../screens/MainScreens/StudentMainScreens/ProfileScreen';
import ChatListScreen from '../../screens/MainScreens/SharedScreens/Chat/ChatListScreen';

import TutorProfileScreen from '../../screens/MainScreens/TutorMainScreens/Profile';
import TutorRequestScreen from '../../screens/MainScreens/TutorMainScreens/Requests';
import TutorScheduleScreen from '../../screens/MainScreens/TutorMainScreens/Schedule';
import DashboardScreen from '../../screens/MainScreens/TutorMainScreens/Home';

const Tab = createBottomTabNavigator();
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const TAB_ACTIVE = GLASS.primary;
const TAB_INACTIVE = '#9CA3AF';

const TabIcon = ({ source, focused }: { source: any; focused: boolean }) => (
  <Image
    source={source}
    style={{
      width: 22,
      height: 22,
      tintColor: focused ? TAB_ACTIVE : TAB_INACTIVE,
    }}
    resizeMode="contain"
  />
);

const ChatTabIcon = ({ focused }: { focused: boolean }) => (
  <View>
    <MaterialCommunityIcons
      name={focused ? 'message-text' : 'message-text-outline'}
      size={22}
      color={focused ? TAB_ACTIVE : TAB_INACTIVE}
    />
    <View style={styles.chatBadge} />
  </View>
);

const GlassTabButton = (props: BottomTabBarButtonProps) => {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={props.onPress}
      onPressIn={() => {
        scale.value = withSpring(0.9, { damping: 16, stiffness: 320 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14, stiffness: 280 });
      }}
      style={[props.style, animStyle, styles.tabBtn]}
      accessibilityRole={props.accessibilityRole}
      accessibilityState={props.accessibilityState}
      accessibilityLabel={props.accessibilityLabel}
      testID={props.testID}
    >
      {props.children}
    </AnimatedPressable>
  );
};

interface Props {
  role: 'student' | 'tutor' | 'parent';
}

export const MyTabs = ({ role }: Props) => {
  const isTutor = role === 'tutor';

  return (
    <View style={styles.root}>
      <Tab.Navigator
        initialRouteName="Home"
        tabBar={props => <GlassPillTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: TAB_ACTIVE,
          tabBarInactiveTintColor: TAB_INACTIVE,
          tabBarLabelStyle: styles.tabLabel,
          tabBarStyle: {
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
          // safeAreaInsets is not a valid option on screenOptions for the
          // Bottom Tab Navigator in this version of react-navigation.
          // If needed, handle safe area insets inside the custom tabBar component.
          tabBarHideOnKeyboard: true,
          tabBarButton: (props: BottomTabBarButtonProps) => (
            <GlassTabButton {...props} />
          ),
        }}
      >
        {role === 'student' || role === 'parent' ? (
          <>
            <Tab.Screen
              name="Search"
              component={SearchScreen}
              options={{
                title: 'Search',
                tabBarLabel: 'Search',
                tabBarIcon: ({ focused }) => (
                  <TabIcon source={Images.SearchIcon} focused={focused} />
                ),
              }}
            />

            <Tab.Screen
              name="Bookings"
              component={BookingsScreen}
              options={{
                title: 'Bookings',
                tabBarLabel: 'Bookings',
                tabBarIcon: ({ focused }) => (
                  <TabIcon source={Images.BookingIcon} focused={focused} />
                ),
              }}
            />

            <Tab.Screen
              name="Home"
              component={FirstTimeHome}
              options={{
                title: 'Home',
                tabBarLabel: () => null,
                tabBarIcon: () => null,
                tabBarButton: (props: BottomTabBarButtonProps) => (
                  <CustomCenterButton
                    onPress={props.onPress}
                    accessibilityState={props.accessibilityState}
                  />
                ),
              }}
            />

            <Tab.Screen
              name="Messages"
              component={ChatListScreen}
              options={{
                title: 'Messages',
                tabBarLabel: 'Messages',
                tabBarIcon: ({ focused }) => <ChatTabIcon focused={focused} />,
              }}
            />

            <Tab.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                title: 'Profile',
                tabBarLabel: 'Profile',
                tabBarIcon: ({ focused }) => (
                  <TabIcon source={Images.UserIcon} focused={focused} />
                ),
              }}
            />
          </>
        ) : (
          <>
            <Tab.Screen
              name="Request"
              component={TutorRequestScreen}
              options={{
                title: 'Requests',
                tabBarLabel: 'Requests',
                tabBarIcon: ({ focused }) => (
                  <TabIcon source={Images.RequestIcon} focused={focused} />
                ),
              }}
            />

            <Tab.Screen
              name="Schedule"
              component={TutorScheduleScreen}
              options={{
                title: 'Schedule',
                tabBarLabel: 'Schedule',
                tabBarIcon: ({ focused }) => (
                  <TabIcon source={Images.BookingIcon} focused={focused} />
                ),
              }}
            />

            <Tab.Screen
              name="Home"
              component={DashboardScreen}
              options={{
                title: 'Home',
                tabBarLabel: () => null,
                tabBarIcon: () => null,
                tabBarButton: (props: BottomTabBarButtonProps) => (
                  <CustomCenterButton
                    onPress={props.onPress}
                    accessibilityState={props.accessibilityState}
                  />
                ),
              }}
            />

            <Tab.Screen
              name="Messages"
              component={ChatListScreen}
              options={{
                title: 'Messages',
                tabBarLabel: 'Messages',
                tabBarIcon: ({ focused }) => <ChatTabIcon focused={focused} />,
              }}
            />

            <Tab.Screen
              name="Profile"
              component={TutorProfileScreen}
              options={{
                title: 'Profile',
                tabBarLabel: 'Profile',
                tabBarIcon: ({ focused }) => (
                  <TabIcon source={Images.UserIcon} focused={focused} />
                ),
              }}
            />
          </>
        )}
      </Tab.Navigator>

      {isTutor ? <TutorProfileTabTip enabled /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f6f7fc',
    height: '0%',
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  chatBadge: {
    position: 'absolute',
    top: -2,
    right: -6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: TAB_ACTIVE,
  },
});

export { GLASS_TAB_BAR_HEIGHT } from '../../components/Glass';
