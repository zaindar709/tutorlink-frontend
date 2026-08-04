import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  BottomTabBar,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Floating glass pill — transparent outer (no purple strip).
 * Top padding so elevated 3rd/Home tab is not clipped.
 */
export default function GlassPillTabBar(props: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.outer,
        { paddingBottom: Math.max(insets.bottom, 10) },
      ]}
    >
      <View style={styles.pill}>
        <BottomTabBar
          {...props}
          style={styles.innerBar}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  pill: {
    height: 70,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(117, 72, 245, 0.16)',
    overflow: 'visible',
    shadowColor: '#7548F5',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  innerBar: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    height: 75,
    paddingBottom: 2,
    paddingTop: 4,
  },
});
