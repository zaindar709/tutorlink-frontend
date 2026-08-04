import { TextStyle } from 'react-native';
import { GLASS } from './tokens';

export const glassTypography = {
  display: {
    fontSize: 28,
    fontWeight: '800',
    color: GLASS.textPrimary,
    letterSpacing: 0.2,
  } as TextStyle,
  h1: {
    fontSize: 24,
    fontWeight: '800',
    color: GLASS.textPrimary,
  } as TextStyle,
  h2: {
    fontSize: 20,
    fontWeight: '700',
    color: GLASS.textPrimary,
  } as TextStyle,
  h3: {
    fontSize: 17,
    fontWeight: '700',
    color: GLASS.textPrimary,
  } as TextStyle,
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: GLASS.textSecondary,
    lineHeight: 22,
  } as TextStyle,
  body: {
    fontSize: 14,
    fontWeight: '500',
    color: GLASS.textPrimary,
    lineHeight: 20,
  } as TextStyle,
  caption: {
    fontSize: 12,
    fontWeight: '500',
    color: GLASS.textMuted,
    lineHeight: 16,
  } as TextStyle,
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: GLASS.textSecondary,
    letterSpacing: 0.2,
  } as TextStyle,
  button: {
    fontSize: 16,
    fontWeight: '700',
    color: GLASS.textOnPrimary,
    letterSpacing: 0.3,
  } as TextStyle,
};
