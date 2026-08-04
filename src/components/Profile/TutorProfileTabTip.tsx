import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import useUi from '../../hooks/ui/useUi';
import {
  dismissProfileSuggestion,
  isProfileSuggestionNeeded,
} from '../../services/profile/profileSuggestionStore';

const AUTO_HIDE_MS = 2800;
/** Tutor tab bar height from TabNavigator (floating pill + labels) */
const TAB_BAR_HEIGHT = 70;
/** 5 tutor tabs — Profile is the last (rightmost) */
const TUTOR_TAB_COUNT = 5;

type Props = {
  enabled: boolean;
};

/**
 * One-time tip above the Profile tab for newly registered tutors.
 * Auto-hides after ~2.8s; tap opens the Profile tab.
 */
const TutorProfileTabTip = ({ enabled }: Props) => {
  const { colors } = useUi();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const navigation = useNavigation<any>();
  const authUser = useSelector((state: any) => state.auth.user);
  const userId = String(
    authUser?.uid || authUser?.firebaseUid || authUser?.id || authUser?._id || ''
  );

  const [visible, setVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const consumed = useRef(false);

  const hide = (markSeen: boolean) => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 4,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setVisible(false);
    });
    if (markSeen && userId) {
      void dismissProfileSuggestion('tutor', userId);
    }
  };

  useEffect(() => {
    if (!enabled || !userId || consumed.current) return;

    let cancelled = false;

    (async () => {
      const needed = await isProfileSuggestionNeeded('tutor', userId);
      if (cancelled || !needed) return;

      consumed.current = true;
      setVisible(true);
      opacity.setValue(0);
      translateY.setValue(10);

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 240,
          useNativeDriver: true,
        }),
      ]).start();

      hideTimer.current = setTimeout(() => hide(true), AUTO_HIDE_MS);
    })();

    return () => {
      cancelled = true;
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, userId]);

  if (!visible) return null;

  const primary = String(colors.PRIMARY_COLOR || '#7548F5');
  const sideInset = 16;
  const usableWidth = screenWidth - sideInset * 2;
  const tabWidth = usableWidth / TUTOR_TAB_COUNT;
  // Center of Profile tab (last tab) within floating pill
  const tipCenterX = sideInset + tabWidth * (TUTOR_TAB_COUNT - 0.5);
  const tipWidth = 168;
  const left = Math.min(
    Math.max(tipCenterX - tipWidth / 2, 8),
    screenWidth - tipWidth - 8
  );
  const bottom = TAB_BAR_HEIGHT + Math.max(insets.bottom, 10) + 8;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        {
          left,
          bottom,
          width: tipWidth,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <Pressable
        onPress={() => {
          hide(true);
          navigation.navigate('Profile');
        }}
        style={[styles.bubble, { backgroundColor: primary }]}
      >
        <Text style={styles.text}>Complete your profile</Text>
      </Pressable>
      <View
        style={[
          styles.arrow,
          {
            borderTopColor: primary,
            marginLeft: tipCenterX - left - 7,
          },
        ]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    zIndex: 100,
    elevation: 100,
    alignItems: 'flex-start',
  },
  bubble: {
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 8,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
});

export default TutorProfileTabTip;
