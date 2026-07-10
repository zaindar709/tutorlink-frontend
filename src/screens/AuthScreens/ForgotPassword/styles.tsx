import { StyleSheet } from "react-native";

export const createStyles = (colors: any, resp: any) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.WHITE_COLOR,
    },
    container: {
      padding: resp.dx(20),
      paddingTop: resp.dy(40),
    },
    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: resp.dy(24),
      alignSelf: 'flex-start',
    },
    backText: {
      fontSize: resp.df(14),
      color: colors.BLACK_COLOR,
      fontWeight: '600',
    },
    headerContent: {
      marginBottom: resp.dy(30),
    },
    title: {
      fontSize: resp.df(26),
      fontWeight: '700',
      color: colors.BLACK_COLOR,
      marginBottom: resp.dy(12),
    },
    subtitle: {
      fontSize: resp.df(14),
      color: colors.GRAY_COLOR,
      lineHeight: resp.df(22),
    },
    formCard: {
      backgroundColor: colors.WHITE_COLOR,
      borderRadius: 24,
      padding: resp.dx(20),
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowOffset: { width: 0, height: 10 },
      shadowRadius: 20,
      elevation: 5,
      marginBottom: resp.dy(20),
    },
    infoCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: '#E7F1FF',
      borderRadius: 16,
      padding: resp.dx(14),
      marginTop: resp.dy(16),
    },
    infoIcon: {
      marginTop: 1,
      marginRight: resp.dx(8),
    },
    infoText: {
      flex: 1,
      color: colors.PRIMARY_COLOR,
      fontSize: resp.df(13),
      lineHeight: resp.df(20),
    },
    sendButton: {
      marginTop: resp.dy(16),
      borderRadius: 14,
    },
    successText: {
      marginTop: resp.dy(16),
      color: colors.PRIMARY_COLOR,
      fontSize: resp.df(14),
      fontWeight: '600',
    },
    roleText: {
      marginTop: resp.dy(24),
      color: colors.GRAY_COLOR,
      fontSize: resp.df(13),
      textAlign: 'center',
    },
  });