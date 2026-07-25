import { StyleSheet } from 'react-native';

export const createProfileSubScreenStyles = (colors: Record<string, string>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
    },
    content: {
      padding: 16,
      paddingBottom: 32,
    },
    heroCard: {
      backgroundColor: colors.WHITE_COLOR,
      borderRadius: 16,
      padding: 18,
      marginBottom: 16,
      shadowColor: '#7548F5',
      shadowOpacity: 0.06,
      shadowRadius: 10,
      elevation: 2,
    },
    heroTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.BLACK_COLOR,
      marginBottom: 6,
    },
    heroSubtitle: {
      fontSize: 13,
      lineHeight: 20,
      color: colors.LIGHT_GRAY,
    },
    sectionLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: '#64748B',
      marginBottom: 10,
      marginTop: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
  });
