import {
  createBottomTabNavigator,
  BottomTabBarButtonProps,
} from '@react-navigation/bottom-tabs';
import { Image, Pressable } from 'react-native';

import { CustomCenterButton } from '../../components/CustomCenterButton/CustomCenterButton';
import Images from '../../assets/images';

import useUi from '../../hooks/ui/useUi';

// STUDENT SCREENS
import FirstTimeHome from '../../screens/MainScreens/StudentMainScreens/Home/HomeScreen/FirstTimeHome';
import SearchScreen from '../../screens/MainScreens/StudentMainScreens/SearchScreen';
import BookingsScreen from '../../screens/MainScreens/StudentMainScreens/BookingScreen';
import WalletScreen from '../../screens/MainScreens/StudentMainScreens/WalletScreen';
import ProfileScreen from '../../screens/MainScreens/StudentMainScreens/ProfileScreen';

// Tutor screens
import TutorHomeScreen from '../../screens/MainScreens/TutorMainScreens/Home';
import TutorProfileScreen from '../../screens/MainScreens/TutorMainScreens/Profile';
import TutorRequestScreen from '../../screens/MainScreens/TutorMainScreens/Requests';
import TutorScheduleScreen from '../../screens/MainScreens/TutorMainScreens/Schedule';
import TutorEarningsScreen from '../../screens/MainScreens/TutorMainScreens/Earnings';
import DashboardScreen from '../../screens/MainScreens/TutorMainScreens/Home';


const Tab = createBottomTabNavigator();

const TabIcon = ({ source, focused }: any) => (
  <Image
    source={source}
    style={{
      width: 24,
      height: 24,
      tintColor: focused ? 'rgba(117,72,245,1)' : '#9CA3AF',
    }}
    resizeMode="contain"
  />
);

interface Props {
  role: 'student' | 'tutor';
}

export const MyTabs = ({ role }: Props) => {
  const { colors } = useUi();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.PRIMARY_COLOR as string,
        tabBarInactiveTintColor: '#9CA3AF',

        tabBarStyle: {
          height: 70,
          paddingBottom: 0,
        },

        tabBarButton: (props: BottomTabBarButtonProps) => (
          <Pressable onPress={props.onPress} style={props.style}>
            {props.children}
          </Pressable>
        ),
      }}
    >
      {role === 'student' ? (
        <>
          <Tab.Screen
            name="Search"
            component={SearchScreen}
            options={{
              tabBarIcon: props => (
                <TabIcon source={Images.SearchIcon} {...props} />
              ),
            }}
          />

          <Tab.Screen
            name="Bookings"
            component={BookingsScreen}
            options={{
              tabBarIcon: props => (
                <TabIcon source={Images.BookingIcon} {...props} />
              ),
            }}
          />

          <Tab.Screen
            name="Home"
            component={FirstTimeHome}
            options={{
              tabBarLabel: '',
              tabBarIcon: () => (
                <Image
                  source={Images.HomeIcon}
                  style={{
                    width: 28,
                    height: 28,
                    tintColor: colors.WHITE_COLOR,
                  }}
                />
              ),
              tabBarButton: (props: BottomTabBarButtonProps) => (
                <CustomCenterButton {...props} />
              ),
            }}
          />

          <Tab.Screen
            name="Wallet"
            component={WalletScreen}
            options={{
              tabBarIcon: props => (
                <TabIcon source={Images.WalletIcon} {...props} />
              ),
            }}
          />

          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              tabBarIcon: props => (
                <TabIcon source={Images.UserIcon} {...props} />
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
              tabBarIcon: props => (
                <TabIcon source={Images.RequestIcon} {...props} />
              ),
            }}
          />

          <Tab.Screen
            name="Schedule"
            component={TutorScheduleScreen}
            options={{
              tabBarIcon: props => (
                <TabIcon source={Images.BookingIcon} {...props} />
              ),
            }}
          />

          <Tab.Screen
            name="Home"
            component={DashboardScreen}
            options={{
              tabBarLabel: '',
              tabBarIcon: () => (
                <Image
                  source={Images.HomeIcon}
                  style={{
                    width: 28,
                    height: 28,
                    tintColor: colors.WHITE_COLOR,
                  }}
                />
              ),
              tabBarButton: (props: BottomTabBarButtonProps) => (
                <CustomCenterButton {...props} />
              ),
            }}
          />

          <Tab.Screen
            name="Earnings"
            component={TutorEarningsScreen}
            options={{
              tabBarIcon: props => (
                <TabIcon source={Images.WalletIcon} {...props} />
              ),
            }}
          />

          <Tab.Screen
            name="Profile"
            component={TutorProfileScreen}
            options={{
              tabBarIcon: props => (
                <TabIcon source={Images.UserIcon} {...props} />
              ),
            }}
          />
        </>
      )}
    </Tab.Navigator>
  );
};