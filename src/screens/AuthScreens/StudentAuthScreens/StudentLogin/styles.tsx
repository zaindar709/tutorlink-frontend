import { StyleSheet } from 'react-native';

/**
 * Shared Student/Tutor Login visual language.
 * Headings = AUTH_HEADING, subtext/footer/meta = AUTH_SUBTEXT (readable slate).
 */
export const createStyles = (colors: any, resp: any) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.CULTURED_GRAY,
    },
    container: {
      paddingHorizontal: resp.dx(24),
      paddingTop: resp.dy(40),
      paddingBottom: resp.dy(30),
      backgroundColor: colors.CULTURED_GRAY,
    },
    brandHeader: {
      marginBottom: resp.dy(32),
      marginTop: resp.dy(0),
    },
    brandTitle: {
      fontSize: resp.df(28),
      fontWeight: '700',
      color: colors.PRIMARY_COLOR,
    },
    brandAccent: {
      width: resp.dx(64),
      height: resp.dy(4),
      borderRadius: resp.dxy(4),
      marginTop: resp.dy(10),
      backgroundColor: colors.PRIMARY_COLOR,
    },
    headerContent: {
      marginBottom: resp.dy(28),
    },
    title: {
      fontSize: resp.df(24),
      fontWeight: '700',
      color: colors.AUTH_HEADING || colors.TEXT_PRIMARY || colors.BLACK_COLOR,
      marginTop: resp.dy(10),
    },
    subtitle: {
      fontSize: resp.df(15),
      lineHeight: resp.dy(22),
      color: colors.AUTH_SUBTEXT || colors.TEXT_SECONDARY,
      marginTop: resp.dy(6),
    },
    formCard: {
      backgroundColor: colors.CARD_COLOR,
      borderRadius: resp.dxy(24),
      padding: resp.dx(20),
      marginBottom: resp.dy(24),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.05,
      shadowRadius: 16,
      elevation: 4,
    },
    fieldGroup: {
      marginBottom: resp.dy(18),
    },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: resp.dy(4),
    },
    rememberRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    checkbox: {
      width: resp.dy(18),
      height: resp.dy(18),
      borderRadius: resp.dxy(6),
      borderWidth: 1,
      borderColor: '#CBD5E1',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: resp.dx(8),
    },
    checkboxSelected: {
      borderColor: colors.PRIMARY_COLOR,
      backgroundColor: colors.PRIMARY_COLOR,
    },
    checkboxDot: {
      width: resp.dy(8),
      height: resp.dy(8),
      borderRadius: resp.dxy(4),
      backgroundColor: colors.CARD_COLOR,
    },
    rememberText: {
      fontSize: resp.df(13),
      color: colors.AUTH_MUTED || colors.TEXT_SECONDARY,
    },
    forgotText: {
      fontSize: resp.df(13),
      color: colors.PRIMARY_COLOR,
      fontWeight: '600',
    },
    loginButton: {
      marginBottom: resp.dy(18),
    },
    socialButton: {
      marginBottom: resp.dy(12),
    },
    appleButton: {
      backgroundColor: colors.BLACK_COLOR,
    },
    socialButtonText: {
      fontWeight: '600',
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: resp.dy(8),
    },
    footerText: {
      color: colors.AUTH_FOOTER || colors.TEXT_SECONDARY,
      fontSize: resp.df(13),
    },
    footerAction: {
      color: colors.PRIMARY_COLOR,
      fontSize: resp.df(13),
      fontWeight: '700',
    },
    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: -15,
    },
    backText: {
      fontSize: resp.df(14),
      color: colors.AUTH_HEADING || colors.BLACK_COLOR,
      marginLeft: -8,
      fontWeight: '500',
    },
  });
