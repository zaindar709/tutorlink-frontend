import {StyleSheet } from 'react-native';

export const createStyles = (colors: any, resp: any) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.CULTURED_GRAY,
    },
    container: {
      paddingTop: resp.dy(40),
      paddingHorizontal: resp.dx(24),
      paddingBottom: resp.dy(30),
      backgroundColor: colors.CULTURED_GRAY,
    },
    brandHeader: {
      marginBottom: resp.dy(30),
    },
    brandTitle: {
      fontSize: resp.df(28),
      fontWeight: '700',
      color: colors.PRIMARY_COLOR,
    },
    brandAccent: {
      width: resp.dx(60),
      height: resp.dy(4),
      borderRadius: resp.dxy(4),
      marginTop: resp.dy(10),
      backgroundColor: colors.PRIMARY_COLOR,
    },
    headerContent: {
      marginBottom: resp.dy(24),
    },
    title: {
      fontSize: resp.df(24),
      fontWeight: '700',
      color: colors.BLACK_COLOR,
      marginBottom: resp.dy(8),
    },
    subtitle: {
      fontSize: resp.df(15),
      lineHeight: resp.dy(22),
      color: colors.GRAY_COLOR,
    },
    formCard: {
      backgroundColor: colors.WHITE_COLOR,
      borderRadius: resp.dxy(24),
      padding: resp.dx(20),
      marginBottom: resp.dy(24),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 4,
    },
    inputField: {
      marginBottom: resp.dy(16),
    },
    nextButton: {
      marginBottom: resp.dy(24),
      width: resp.dx(380),
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: resp.dy(16),
    },
    footerText: {
      color: '#a09e9e',
      fontSize: resp.df(13),
    },
    footerLink: {
      color: colors.PRIMARY_COLOR,
      fontSize: resp.df(13),
      fontWeight: '700',
    },
    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: -15,
      marginTop: resp.dy(20),
    },

    backText: {
      fontSize: resp.df(14),
      color: colors.BLACK_COLOR as string,
      marginLeft: -8,
      fontWeight: '500',
    },
  });