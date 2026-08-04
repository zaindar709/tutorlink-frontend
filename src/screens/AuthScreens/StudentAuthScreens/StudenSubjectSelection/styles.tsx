import { StyleSheet } from "react-native";
import { GLASS } from "../../../../theme/glass";

export const createStyles = (colors: any, resp: any) =>
  StyleSheet.create({
    screen: {
      flexGrow: 1,
      padding: resp.dx(24),
      backgroundColor: 'transparent',
    },
    header: {
      marginBottom: resp.dy(24),
      paddingTop: resp.dy(20),
    },
    title: {
      fontSize: resp.df(24),
      fontWeight: '700',
      color: colors.AUTH_HEADING || colors.TEXT_PRIMARY || '#111827',
      marginBottom: resp.dy(8),
    },
    subtitle: {
      fontSize: resp.df(15),
      lineHeight: resp.dy(22),
      color: colors.AUTH_SUBTEXT || colors.TEXT_SECONDARY,
    },
    searchField: {
      marginBottom: resp.dy(20),
    },
    card: {
      backgroundColor: colors.CARD_COLOR || GLASS.cardBg,
      borderRadius: resp.dxy(24),
      padding: resp.dx(20),
      marginBottom: resp.dy(24),
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      shadowColor: '#7548F5',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 5,
    },
    chipGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: resp.dx(12),
      justifyContent: 'space-between',
    },
    subjectChip: {
      minWidth: resp.dx(140),
      marginBottom: resp.dy(12),
      borderColor: GLASS.cardBorder,
      backgroundColor: GLASS.cardBg,
      borderRadius: resp.dxy(18),
      height: resp.dy(44),
      justifyContent: 'center',
      alignContent: 'center',
    },
    subjectChipSelected: {
      backgroundColor: colors.PRIMARY_COLOR,
      borderColor: colors.PRIMARY_COLOR,
    },
    subjectText: {
      color: colors.TEXT_PRIMARY || '#111827',
      fontSize: resp.df(14),
    },
    subjectTextSelected: {
      color: colors.WHITE_COLOR,
      fontSize: resp.df(14),
      fontWeight: '600',
    },
    selectionInfo: {
      marginTop: resp.dy(16),
      borderTopWidth: 1,
      borderTopColor: GLASS.cardBorder,
      paddingTop: resp.dy(16),
    },
    selectionText: {
      color: colors.AUTH_MUTED || colors.TEXT_SECONDARY,
      fontSize: resp.df(13),
    },
    classCard: {
      backgroundColor: colors.CARD_COLOR || GLASS.cardBg,
      borderRadius: resp.dxy(24),
      padding: resp.dx(20),
      marginBottom: resp.dy(24),
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      shadowColor: '#7548F5',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 5,
      overflow: 'visible',
    },
    classCardTitle: {
      fontSize: resp.df(16),
      fontWeight: '700',
      color: colors.AUTH_HEADING || colors.TEXT_PRIMARY || '#111827',
      marginBottom: resp.dy(12),
    },
    classTrigger: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: resp.dy(8),
      paddingHorizontal: resp.dx(16),
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      borderRadius: resp.dxy(18),
      backgroundColor: GLASS.inputBg,
    },
    classTriggerText: {
      color: colors.AUTH_HEADING || colors.TEXT_PRIMARY || '#111827',
      fontSize: resp.df(15),
    },
    classTriggerPlaceholder: {
      color: colors.AUTH_MUTED || colors.TEXT_SECONDARY,
      fontSize: resp.df(15),
    },
    menuContainer: {
      width: '80%',
      backgroundColor: 'transparent',
      marginLeft: resp.dx(0),
    },
    menuContent: {
      backgroundColor: GLASS.cardBgStrong,
      borderRadius: resp.dxy(18),
      elevation: 4,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
    },
    menuIcon: {
      margin: 0,
    },
    menuItemText: {
      color: colors.AUTH_HEADING || colors.TEXT_PRIMARY || '#111827',
      fontSize: resp.df(15),
    },
    emptyText: {
      width: '100%',
      textAlign: 'center',
      color: colors.AUTH_MUTED || colors.TEXT_SECONDARY,
      fontSize: resp.df(14),
      marginTop: resp.dy(12),
    },
    button: {
      marginBottom: resp.dy(16),
      fontSize: resp.df(14),
    },
  });
