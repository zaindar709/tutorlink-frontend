import { StyleSheet } from "react-native";

export const createStyles = (colors: any, resp: any) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.CARD_COLOR,
    },
    container: {
      padding: resp.dx(20),
      paddingTop: resp.dy(40),
    },
    headerRow: {
      marginBottom: resp.dy(24),
    },
    headerContent: {
      marginBottom: resp.dy(30),
    },
    title: {
      fontSize: resp.df(26),
      fontWeight: '700',
      color: colors.AUTH_HEADING || colors.TEXT_PRIMARY || colors.BLACK_COLOR,
      marginBottom: resp.dy(12),
    },
    subtitle: {
      fontSize: resp.df(15),
      color: colors.AUTH_SUBTEXT || colors.TEXT_SECONDARY,
      lineHeight: resp.df(22),
    },
    formCard: {
      backgroundColor: colors.CARD_COLOR,
      borderRadius: 24,
      padding: resp.dx(20),
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowOffset: { width: 0, height: 10 },
      shadowRadius: 20,
      elevation: 5,
      marginBottom: resp.dy(20),
    },
    label: {
      fontSize: resp.df(13),
      fontWeight: '600',
      color: colors.AUTH_HEADING || colors.TEXT_PRIMARY || colors.BLACK_COLOR,
      marginBottom: resp.dy(10),
    },
    passwordInputContainer: {
      marginBottom: resp.dy(18),
    },
    requirementsList: {
      backgroundColor: '#F5F5F5',
      borderRadius: 12,
      padding: resp.dx(14),
      marginTop: resp.dy(12),
    },
    requirementText: {
      fontSize: resp.df(12),
      color: colors.AUTH_MUTED || colors.TEXT_SECONDARY,
      lineHeight: resp.df(18),
      marginBottom: resp.dy(6),
    },
    requirementTextMet: {
      color: '#4CAF50',
      fontWeight: '600',
    },
    resetButton: {
      marginTop: resp.dy(16),
      borderRadius: 14,
    },
    disabledButton: {
      opacity: 0.5,
    },
    roleText: {
      marginTop: resp.dy(24),
      color: colors.AUTH_FOOTER || colors.TEXT_SECONDARY,
      fontSize: resp.df(13),
      textAlign: 'center',
    },
  });
