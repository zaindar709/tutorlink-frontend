import { StyleSheet } from "react-native";

export const createStyles = (colors: any, resp: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.WHITE_COLOR,
    },

    headerSection: {
      width: resp.dx(75),
      height: resp.dy(75),
      borderRadius: resp.dx(22),
      backgroundColor: 'rgba(255,255,255,0.15)',
      justifyContent: 'center',
      alignItems: 'center',
    },

    backRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: resp.dy(12),
    },

    backText: {
      fontSize: resp.df(15),
      marginLeft: resp.dx(2),
      fontWeight: '500',
      color: colors.BLACK,
    },

    stepContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: resp.dy(22),
      marginBottom: resp.dy(8),
      paddingHorizontal: resp.dx(22),
      alignItems: 'center',
    },

    stepText: {
      fontSize: resp.df(15),
      fontWeight: '600',
      color: colors.BLACK,
    },

    stepLabel: {
      fontSize: resp.df(14),
      fontWeight: '500',
      color: colors.GRAY31,
    },

    progressBarBackground: {
      height: resp.dy(6),
      borderRadius: resp.dx(3),
      marginBottom: resp.dy(12),
      marginHorizontal: resp.dx(24),
      overflow: 'hidden',
      backgroundColor: colors.LIGHT_GRAY || '#E2E2E2',
    },

    progressBarFill: {
      height: '100%',
      borderRadius: resp.dx(3),
    },

    section: {
      marginTop: resp.dy(22),
      paddingHorizontal: resp.dx(20),
    },

    sectionTitle: {
      fontSize: resp.df(19),
      fontWeight: '700',
      paddingHorizontal: resp.dx(6),
      marginBottom: resp.dy(0.8),
      color: colors.BLACK,
    },

    sectionSubtitle: {
      fontSize: resp.df(13),
      paddingHorizontal: resp.dx(8),
      marginBottom: resp.dy(1.8),
      color: colors.GRAY31,
    },

    uploadBox: {
      flexDirection: 'row',
      gap: resp.dx(3), // modern spacing instead of manual margins
    },
  });