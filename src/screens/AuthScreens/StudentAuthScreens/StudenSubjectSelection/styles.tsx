import { StyleSheet } from 'react-native';
import { AUTH_GLASS } from '../../../../components/AuthGlass';

export const createStyles = (colors: any, resp: any) =>
  StyleSheet.create({
    shell: {
      flex: 1,
      paddingHorizontal: 22,
      paddingTop: 8,
      paddingBottom: 12,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 12,
    },
    searchField: {
      marginBottom: resp.dy(16),
    },
    card: {
      marginBottom: resp.dy(16),
    },
    cardInner: {
      padding: 16,
    },
    chipGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    subjectChip: {
      flexGrow: 1,
      flexBasis: '46%',
      maxWidth: '48%',
      marginBottom: 2,
      borderColor: AUTH_GLASS.cardBorder,
      backgroundColor: AUTH_GLASS.cardBg,
      borderRadius: 18,
      height: 44,
      justifyContent: 'center',
    },
    subjectChipSelected: {
      backgroundColor: colors.PRIMARY_COLOR,
      borderColor: colors.PRIMARY_COLOR,
    },
    subjectText: {
      color: AUTH_GLASS.title,
      fontSize: 14,
    },
    subjectTextSelected: {
      color: colors.WHITE_COLOR,
      fontSize: 14,
      fontWeight: '600',
    },
    selectionText: {
      color: AUTH_GLASS.muted,
      fontSize: 13,
      marginTop: 12,
    },
    classCard: {
      marginBottom: resp.dy(8),
      overflow: 'visible',
    },
    classCardTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: AUTH_GLASS.title,
      marginBottom: 12,
    },
    classTrigger: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: AUTH_GLASS.cardBorder,
      borderRadius: 18,
      backgroundColor: AUTH_GLASS.inputBg,
    },
    classTriggerText: {
      color: AUTH_GLASS.title,
      fontSize: 15,
      flex: 1,
    },
    classTriggerPlaceholder: {
      color: AUTH_GLASS.muted,
      fontSize: 15,
      flex: 1,
    },
    menuContainer: {
      width: '80%',
      backgroundColor: 'transparent',
    },
    menuContent: {
      backgroundColor: '#FFFFFF',
      borderRadius: 18,
      elevation: 4,
      borderWidth: 1,
      borderColor: AUTH_GLASS.cardBorder,
    },
    menuIcon: {
      margin: 0,
    },
    menuItemText: {
      color: AUTH_GLASS.title,
      fontSize: 15,
    },
    emptyText: {
      width: '100%',
      textAlign: 'center',
      color: AUTH_GLASS.muted,
      fontSize: 14,
      marginTop: 12,
    },
    ctaWrap: {
      width: '100%',
      paddingTop: 10,
      alignSelf: 'stretch',
    },
    ctaText: {
      marginLeft: 0,
    },
  });
