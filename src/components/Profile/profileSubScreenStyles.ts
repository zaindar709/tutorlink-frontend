import { StyleSheet } from 'react-native';
import { GLASS, glassTypography } from '../../theme/glass';

export const createProfileSubScreenStyles = (_colors: Record<string, any>) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      padding: 16,
      paddingBottom: 32,
    },
    heroCard: {
      backgroundColor: GLASS.cardBg,
      borderRadius: GLASS.radius.xl,
      padding: 18,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      ...GLASS.shadow.soft,
    },
    heroTitle: {
      ...glassTypography.h3,
      marginBottom: 6,
    },
    heroSubtitle: {
      ...glassTypography.subtitle,
      fontSize: 13,
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: GLASS.textMuted,
      marginBottom: 10,
      marginTop: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
  });
