import {
  createBottomTabNavigator,
  BottomTabBarButtonProps,
} from '@react-navigation/bottom-tabs';
import { Image, Pressable, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { CustomCenterButton } from '../../components/CustomCenterButton/CustomCenterButton';
import Images from '../../assets/images';

import useUi from '../../hooks/ui/useUi';

// STUDENT SCREENS
import FirstTimeHome from '../../screens/MainScreens/StudentMainScreens/Home/HomeScreen/FirstTimeHome';
import SearchScreen from '../../screens/MainScreens/StudentMainScreens/SearchScreen';
import BookingsScreen from '../../screens/MainScreens/StudentMainScreens/BookingScreen';
import ProfileScreen from '../../screens/MainScreens/StudentMainScreens/ProfileScreen';
import ChatListScreen from '../../screens/MainScreens/SharedScreens/Chat/ChatListScreen';

// Tutor screens
import TutorProfileScreen from '../../screens/MainScreens/TutorMainScreens/Profile';
import TutorRequestScreen from '../../screens/MainScreens/TutorMainScreens/Requests';
import TutorScheduleScreen from '../../screens/MainScreens/TutorMainScreens/Schedule';
import DashboardScreen from '../../screens/MainScreens/TutorMainScreens/Home';

const Tab = createBottomTabNavigator();

const TabIcon = ({ source, focused }: any) => {
  const { colors } = useUi();
  return (
    <Image
      source={source}
      style={{
        width: 24,
        height: 24,
        tintColor: focused
          ? (colors.PRIMARY_COLOR as string)
          : '#9CA3AF',
      }}
      resizeMode="contain"
    />
  );
};

const ChatTabIcon = ({ focused }: { focused: boolean; color?: string; size?: number }) => {
  const { colors } = useUi();
  return (
    <View>
      <MaterialCommunityIcons
        name={focused ? 'message-text' : 'message-text-outline'}
        size={24}
        color={focused ? (colors.PRIMARY_COLOR as string) : '#9CA3AF'}
      />
      <View
        style={{
          position: 'absolute',
          top: -2,
          right: -4,
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: colors.PRIMARY_COLOR as string,
        }}
      />
    </View>
  );
};

interface Props {
  role: 'student' | 'tutor' | 'parent';
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
          backgroundColor: colors.WHITE_COLOR as string,
          borderTopColor: '#E5E7EB',
        },
        tabBarButton: (props: BottomTabBarButtonProps) => (
          <Pressable onPress={props.onPress} style={props.style}>
            {props.children}
          </Pressable>
        ),
      }}
    >
      {role === 'student' || role === 'parent' ? (
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
                    tintColor: colors.WHITE_COLOR as string,
                  }}
                />
              ),
              tabBarButton: (props: BottomTabBarButtonProps) => (
                <CustomCenterButton {...props} />
              ),
            }}
          />

          <Tab.Screen
            name="Messages"
            component={ChatListScreen}
            options={{
              tabBarIcon: ({ focused }) => <ChatTabIcon focused={focused} />,
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
                    tintColor: colors.WHITE_COLOR as string,
                  }}
                />
              ),
              tabBarButton: (props: BottomTabBarButtonProps) => (
                <CustomCenterButton {...props} />
              ),
            }}
          />

          <Tab.Screen
            name="Messages"
            component={ChatListScreen}
            options={{
              tabBarIcon: ({ focused }) => <ChatTabIcon focused={focused} />,
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
