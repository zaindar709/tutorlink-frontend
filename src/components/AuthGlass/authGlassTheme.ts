import { ColorValue } from 'react-native';

/**
 * Light glass auth tokens — onboarding + full auth flow.
 * Soft lavender screen + frosted white panels (matches main-app glass).
 */
export const AUTH_GLASS = {
  gradient: ['#f6f7fc', '#f6f7fc', '#f6f7fc'] as const,
  orbPrimary: 'rgba(117, 72, 245, 0.16)',
  orbAccent: 'rgba(91, 47, 214, 0.1)',
  orbSoft: 'rgba(255, 255, 255, 0.55)',
  cardBg: 'rgba(255, 255, 255, 0.38)',
  cardBorder: 'rgba(117, 72, 245, 0.16)',
  cardRadius: 28,
  inputBg: 'rgba(255, 255, 255, 0.55)',
  inputBorder: 'rgba(117, 72, 245, 0.2)',
  inputBorderFocus: 'rgba(117, 72, 245, 0.65)',
  inputRadius: 18,
  placeholder: '#94A3B8',
  label: '#64748B',
  title: '#0F172A',
  subtitle: '#64748B',
  muted: '#94A3B8',
  link: '#7548F5',
  divider: 'rgba(117, 72, 245, 0.16)',
  error: '#EF4444',
  primary: '#7548F5' as ColorValue,
  primaryDeep: '#5B2FD6',
  primaryDark: '#4C1D95',
  buttonGradient: ['#7548F5', '#5B2FD6', '#4C1D95'] as const,
  /** Solid text on primary buttons / filled chips */
  onPrimary: '#FFFFFF',
};
