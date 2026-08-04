import { ViewStyle } from 'react-native';
import { GLASS } from '../../theme/glass';

/**
 * Floating glass pill — NOT absolute, so content is never covered.
 * Layout reserves tab space; margins create the floating look.
 */
export const getGlassTabBarStyle = (bottomInset = 0): ViewStyle => ({
  height: 74,
  marginHorizontal: 16,
  marginBottom: Math.max(bottomInset, 10),
  borderRadius: 36,
  backgroundColor: 'rgba(255, 255, 255, 0.78)',
  borderWidth: 1,
  borderColor: 'rgba(117, 72, 245, 0.16)',
  borderTopWidth: 1,
  elevation: 10,
  shadowColor: '#7548F5',
  shadowOpacity: 0.14,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  paddingBottom: 0,
  paddingTop: 8,
});

/** @deprecated use getGlassTabBarStyle(insets.bottom) */
export const glassTabBarStyle: ViewStyle = getGlassTabBarStyle(0);

export const glassTabActive = GLASS.primary;
export const glassTabInactive = '#9CA3AF';

export const GLASS_TAB_BAR_HEIGHT = 74;
export const GLASS_TAB_BAR_H_MARGIN = 16;
