import { StyleSheet } from "react-native";

export const createStyles = (colors: any, resp: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
    },

    screen: {
      flex: 1,
      backgroundColor: colors.WHITE_COLOR,
    },

    mapWrapper: {
      flex: 1,
    },

    map: {
      flex: 1,
    },
    searchOverlay: {
      position: 'absolute',
      top: resp.dy(10),
      left: resp.dx(16),
      right: resp.dx(16),
    },

    customSearchInput: {
      marginBottom: 0,
    },
    locationButton: {
      position: 'absolute',
      right: resp.dx(16),
      top: resp.dy(90),
      width: resp.dx(48),
      height: resp.dx(48),
      borderRadius: resp.dx(24),
      backgroundColor: colors.WHITE_COLOR,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.BLACK_COLOR,
      shadowOpacity: 0.1,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 5 },
      elevation: 5,
    },
    markerContainer: {
      alignItems: 'center',
    },

    ratingBadge: {
      backgroundColor: '#FFB11B',
      paddingHorizontal: resp.dx(8),
      paddingVertical: resp.dy(3),
      borderRadius: resp.dx(10),
      marginBottom: resp.dy(-6),
      zIndex: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: resp.dx(3),
    },

    ratingStar: {
      color: '#fff',
      fontSize: resp.df(9),
      fontWeight: '700',
    },

    ratingText: {
      color: '#fff',
      fontSize: resp.df(10),
      fontWeight: '700',
    },

    imageWrapper: {
      width: resp.dx(58),
      height: resp.dx(58),
      borderRadius: resp.dx(29),
      borderWidth: 3,
      borderColor: colors.WHITE_COLOR,
      overflow: 'hidden',
      backgroundColor: colors.WHITE_COLOR,
    },

    imageWrapperSelected: {
      borderColor: colors.PRIMARY_COLOR,
    },

    markerImage: {
      width: '100%',
      height: '100%',
    },

    onlineDot: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      width: resp.dx(12),
      height: resp.dx(12),
      borderRadius: resp.dx(6),
      backgroundColor: '#1ED760',
      borderWidth: 2,
      borderColor: colors.WHITE_COLOR,
    },
    errorBanner: {
      position: 'absolute',
      top: resp.dy(72),
      left: resp.dx(16),
      right: resp.dx(16),
      zIndex: 20,
      backgroundColor: '#FFF4E5',
      borderRadius: resp.dx(12),
      paddingHorizontal: resp.dx(12),
      paddingVertical: resp.dy(8),
    },
    errorText: {
      color: '#9A6700',
      fontSize: resp.df(12),
      fontWeight: '600',
    },
  });