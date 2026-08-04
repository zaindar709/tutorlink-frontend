/** Central light-glass design tokens for the main app. */

export const GLASS = {
  primary: '#7548F5',
  primaryDeep: '#5B2FD6',
  primaryDark: '#4C1D95',
  primarySoft: '#EDE9FE',

  /** Matches TabNavigator root `#f6f7fc` */
  screenGradient: ['#f6f7fc', '#f6f7fc', '#f6f7fc'] as const,

  orbPrimary: 'rgba(117, 72, 245, 0.18)',
  orbAccent: 'rgba(91, 47, 214, 0.12)',
  orbSoft: 'rgba(255, 255, 255, 0.6)',

  cardBg: 'rgba(255, 255, 255, 0.78)',
  cardBgStrong: 'rgba(255, 255, 255, 0.92)',
  cardBorder: 'rgba(117, 72, 245, 0.12)',
  cardBorderStrong: 'rgba(117, 72, 245, 0.22)',

  inputBg: 'rgba(255, 255, 255, 0.7)',
  inputBorder: 'rgba(148, 163, 184, 0.35)',
  inputBorderFocus: 'rgba(117, 72, 245, 0.65)',

  headerBg: 'rgba(255, 255, 255, 0.72)',
  tabBarBg: 'rgba(255, 255, 255, 0.88)',
  tabBarBorder: 'rgba(117, 72, 245, 0.1)',

  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textOnPrimary: '#FFFFFF',
  placeholder: '#94A3B8',

  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  accent: '#F7B84B',

  buttonGradient: ['#7548F5', '#5B2FD6', '#4C1D95'] as const,

  radius: {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 28,
    full: 999,
  },

  space: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  shadow: {
    soft: {
      shadowColor: '#7548F5',
      shadowOpacity: 0.1,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
    },
    medium: {
      shadowColor: '#7548F5',
      shadowOpacity: 0.18,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
    },
    glow: {
      shadowColor: '#7548F5',
      shadowOpacity: 0.35,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
    },
  },
} as const;

export type GlassTokens = typeof GLASS;
