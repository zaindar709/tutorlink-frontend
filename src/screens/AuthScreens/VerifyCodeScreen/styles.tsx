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
    headerRow: {
      marginBottom: resp.dy(20),
    },
    headerContent: {
      marginBottom: resp.dy(32),
    },
    title: {
      fontSize: resp.df(28),
      fontWeight: '700',
      color: colors.BLACK_COLOR,
      marginBottom: resp.dy(12),
    },
    subtitle: {
      fontSize: resp.df(14),
      color: colors.GRAY_COLOR,
      lineHeight: resp.df(22),
    },
    label: {
      marginBottom: resp.dy(18),
      fontSize: resp.df(14),
      fontWeight: '600',
      color: colors.BLACK_COLOR,
    },
    codeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: resp.dy(18),
    },
    codeInput: {
      width: resp.dx(65),
      height: resp.dy(65),
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#DDD',
      backgroundColor: colors.WHITE_COLOR,
      fontSize: resp.df(22),
      color: colors.BLACK_COLOR,
      fontWeight: '700',
    },
    codeInputFocused: {
      borderColor: colors.PRIMARY_COLOR,
    },
    resendRow: {
      alignItems: 'center',
      marginBottom: resp.dy(24),
    },
    resendText: {
      color: colors.PRIMARY_COLOR,
      fontSize: resp.df(13),
    },
    resendActive: {
      fontWeight: '600',
    },
    verifyButton: {
      borderRadius: 14,
    },
  });