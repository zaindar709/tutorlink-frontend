import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import useUi from '../../hooks/ui/useUi';
import { GLASS } from '../../theme/glass';

type Props = {
  visible: boolean;
  message: string;
  onHide?: () => void;
  durationMs?: number;
};

/**
 * Bottom toast — white surface, primary text (matches app brand).
 */
const AppToast = ({
  visible,
  message,
  onHide,
  durationMs = 1800,
}: Props) => {
  const insets = useSafeAreaInsets();
  const { colors } = useUi();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;
  const primary = String(colors.PRIMARY_COLOR || GLASS.primary);

  useEffect(() => {
    if (!visible) return;

    opacity.setValue(0);
    translateY.setValue(24);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();

    const hideTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 16,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) onHide?.();
      });
    }, durationMs);

    return () => clearTimeout(hideTimer);
  }, [visible, durationMs, onHide, opacity, translateY]);

  if (!visible) return null;

  return (
    <View pointerEvents="none" style={styles.overlay}>
      <Animated.View
        style={[
          styles.toast,
          {
            marginBottom: Math.max(insets.bottom, 16) + 8,
            opacity,
            transform: [{ translateY }],
            borderColor: primary + '33',
          },
        ]}
      >
        <View style={[styles.iconWrap, { backgroundColor: primary + '14' }]}>
          <MaterialCommunityIcons name="check-circle" size={18} color={primary} />
        </View>
        <Text style={[styles.text, { color: primary }]}>{message}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 1000,
  },
  toast: {
    maxWidth: '92%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.cardBgStrong,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: GLASS.radius.md,
    borderWidth: 1,
    ...GLASS.shadow.medium,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  text: {
    fontSize: 14,
    fontWeight: '700',
    flexShrink: 1,
  },
});

export default AppToast;
