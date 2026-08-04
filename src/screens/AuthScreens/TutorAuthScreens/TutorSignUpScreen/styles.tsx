import { StyleSheet } from 'react-native';

export const createStyles = (colors: any, resp: any) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.CARD_COLOR,
    },

    contentContainer: {
      paddingHorizontal: resp.dx(5),
      paddingTop: resp.dy(30),
      paddingBottom: resp.dy(4),
    },

    stepHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    stepText: {
      fontSize: resp.df(14),
      fontWeight: '600',
      color: colors.AUTH_HEADING || colors.TEXT_PRIMARY || colors.BLACK_COLOR,
      paddingHorizontal: resp.dx(10),
    },

    stepLabel: {
      fontSize: resp.df(12),
      color: colors.AUTH_SUBTEXT || colors.TEXT_SECONDARY,
      paddingRight: resp.dx(10),
    },

    progressBar: {
      width: '95%',
      alignSelf: 'center',
      height: resp.dy(10),
      backgroundColor: '#E5E7EB',
      borderRadius: resp.dx(10),
      marginTop: resp.dy(12),
      overflow: 'hidden',
    },

    progressFill: {
      width: '33%',
      height: '95%',
      backgroundColor: colors.PRIMARY_COLOR,
    },
    formWrapper: {
      width: '95%',
      alignSelf: 'center',
      backgroundColor: colors.CARD_COLOR,
      borderRadius: resp.dxy(24),
      padding: resp.dx(20),
      marginBottom: resp.dy(24),
      marginTop: resp.dy(20),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 4,
    },

    formContainer: {
      marginTop: resp.dy(30),
      gap: resp.dy(2),
    },

    classSection: {
      marginTop: resp.dy(10),
      marginBottom: resp.dy(10),
    },

    classTitle: {
      fontSize: resp.df(14),
      fontWeight: '600',
      marginBottom: resp.dy(1.5),
      color: colors.AUTH_HEADING || colors.BLACK_COLOR,
    },

    classCard: {
      borderWidth: 1,
      borderColor: '#D1D5DB',
      borderRadius: resp.df(12),
      paddingVertical: resp.dy(18),
      marginTop: resp.dy(10),
      paddingHorizontal: resp.dx(10),
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: resp.dy(1.5),
      backgroundColor: colors.CARD_COLOR,
    },

    selectedClassCard: {
      borderColor: colors.PRIMARY_COLOR,
      backgroundColor: colors.LIGHT_PRIMARY || '#EDE9FE',
    },

    checkbox: {
      width: resp.dx(15),
      height: resp.dy(15),
      borderWidth: 1.5,
      borderColor: '#9CA3AF',
      marginRight: resp.dx(3),
      justifyContent: 'center',
      alignItems: 'center',
    },

    checkboxSelected: {
      backgroundColor: colors.PRIMARY_COLOR,
      borderColor: colors.PRIMARY_COLOR,
    },

    checkboxDot: {
      width: resp.dx(4),
      height: resp.dy(4),
      backgroundColor: colors.CARD_COLOR,
      borderRadius: resp.dx(10),
    },

    classText: {
      fontSize: resp.df(14),
      color: colors.AUTH_HEADING || colors.BLACK_COLOR,
      fontWeight: '500',
      paddingHorizontal: 5,
    },

    selectedClassText: {
      color: colors.PRIMARY_COLOR,
      fontWeight: '700',
    },

    continueButton: {
      marginTop: resp.dy(10),
    },

    disabledButton: {
      opacity: 0.5,
    },

    footerRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: resp.dy(10),
      marginBottom: resp.dy(20),
    },

    footerText: {
      fontSize: resp.df(13),
      color: colors.AUTH_FOOTER || colors.TEXT_SECONDARY,
    },

    loginText: {
      fontSize: resp.df(13),
      fontWeight: '700',
      color: colors.PRIMARY_COLOR,
    },
  });
