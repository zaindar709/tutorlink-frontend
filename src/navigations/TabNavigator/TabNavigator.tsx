import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Image, Pressable, Text } from 'react-native';
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
import ProfileCompletionTooltip from '../../components/ProfileCompletionTooltip';
import Images from '../../assets/images';
import { GLASS } from '../../theme/glass';
import GlassPillTabBar from './GlassPillTabBar';
import { useAppSelector } from '../../store/hooks';
import { selectUnreadTotal } from '../../store/chat/chatSelectors';
import { isProfileSuggestionNeeded } from '../../services/profile/profileSuggestionStore';
import {
  hasProfileHintBeenShown,
  markProfileHintAsShown,
} from '../../services/profile/profileCompletionHintStore';

import StudentHome from '../../screens/MainScreens/StudentMainScreens/Home/HomeScreen';
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

const ChatTabIcon = ({ focused }: { focused: boolean }) => {
  const unread = useAppSelector(selectUnreadTotal);
  return (
    <View>
      <MaterialCommunityIcons
        name={focused ? 'message-text' : 'message-text-outline'}
        size={22}
        color={focused ? TAB_ACTIVE : TAB_INACTIVE}
      />
      {unread > 0 ? (
        <View style={styles.chatBadge}>
          <Text style={styles.chatBadgeText}>
            {unread > 99 ? '99+' : String(unread)}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

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
      onLayout={props.onLayout}
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
  const authUser = useAppSelector((state: any) => state.auth.user);
  const userId = String(
    authUser?.uid || authUser?.firebaseUid || authUser?.id || authUser?._id || ''
  );
  const [profileTabLayout, setProfileTabLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [showProfileHint, setShowProfileHint] = useState(false);

  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const captureProfileTabLayout = (eventOrLayout: any) => {
    const layout = eventOrLayout?.nativeEvent?.layout || eventOrLayout;
    if (!layout || typeof layout.x !== 'number') {
      return;
    }

    const { x, y, width, height } = layout;
    // Avoid updating state with an identical layout object to prevent
    // triggering continuous re-renders when onLayout fires repeatedly.
    setProfileTabLayout(prev => {
      if (
        prev &&
        prev.x === x &&
        prev.y === y &&
        prev.width === width &&
        prev.height === height
      ) {
        return prev;
      }
      return { x, y, width, height };
    });
  };

  const dismissProfileHint = async () => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setShowProfileHint(false);
    if (userId) {
      await markProfileHintAsShown(userId);
    }
  };

  useEffect(() => {
    return () => {
      if (showTimerRef.current) clearTimeout(showTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!userId || role === 'parent' || role === null) {
      setShowProfileHint(false);
      return;
    }

    let cancelled = false;

    const run = async () => {
      if (!profileTabLayout) {
        return;
      }

      const alreadySeen = await hasProfileHintBeenShown(userId);
      const needed = await isProfileSuggestionNeeded(role, userId);

      if (cancelled || alreadySeen || !needed || !profileTabLayout) {
        return;
      }

      // Wait ~1.5s after navigation, then show the tooltip for exactly 4s.
      showTimerRef.current = setTimeout(async () => {
        if (cancelled) return;

        setShowProfileHint(true);

        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        hideTimerRef.current = setTimeout(async () => {
          setShowProfileHint(false);
          if (userId) await markProfileHintAsShown(userId);
        }, 4000);
      }, 1500);
    };

    void run();

    return () => {
      cancelled = true;
      if (showTimerRef.current) {
        clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [role, userId, profileTabLayout]);

  return (
    <View style={styles.root}>
      <Tab.Navigator
        initialRouteName="Home"
        tabBar={props => (
          <GlassPillTabBar {...props} onProfileTabLayout={captureProfileTabLayout} />
        )}
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
              component={StudentHome}
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
                tabBarButton: (props: BottomTabBarButtonProps) => (
                  <GlassTabButton
                    {...props}
                    onPress={event => {
                      void dismissProfileHint();
                      props.onPress?.(event);
                    }}
                  />
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
                tabBarButton: (props: BottomTabBarButtonProps) => (
                  <GlassTabButton
                    {...props}
                    onPress={event => {
                      void dismissProfileHint();
                      props.onPress?.(event);
                    }}
                  />
                ),
              }}
            />
          </>
        )}
      </Tab.Navigator>

      <ProfileCompletionTooltip
        visible={showProfileHint}
        role={role}
        targetLayout={profileTabLayout}
        onDismiss={() => {
          void dismissProfileHint();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f6f7fc',
    // do not force a zero height; allow normal layout so tab measurements
    // are stable and do not trigger repeated onLayout events.
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
    top: -6,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: GLASS.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
});

export { GLASS_TAB_BAR_HEIGHT } from '../../components/Glass';
