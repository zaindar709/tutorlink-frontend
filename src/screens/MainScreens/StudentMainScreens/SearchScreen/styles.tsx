import { StyleSheet } from "react-native";
import { GLASS } from "../../../../theme/glass";

export const createStyles = (colors: any, resp: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: 'transparent',
    },

    screen: {
      flex: 1,
      backgroundColor: 'transparent',
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
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      alignItems: 'center',
      justifyContent: 'center',
      ...GLASS.shadow.soft,
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
      borderColor: GLASS.cardBgStrong,
      overflow: 'hidden',
      backgroundColor: GLASS.cardBgStrong,
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
      borderColor: GLASS.cardBgStrong,
    },
    errorBanner: {
      position: 'absolute',
      top: resp.dy(72),
      left: resp.dx(16),
      right: resp.dx(16),
      zIndex: 20,
      backgroundColor: '#FFFFFF',
      borderRadius: GLASS.radius.md,
      borderWidth: 1,
      borderColor: GLASS.warning,
      paddingHorizontal: resp.dx(12),
      paddingVertical: resp.dy(8),
    },
    errorText: {
      color: GLASS.warning,
      fontSize: resp.df(12),
      fontWeight: '600',
    },
  });