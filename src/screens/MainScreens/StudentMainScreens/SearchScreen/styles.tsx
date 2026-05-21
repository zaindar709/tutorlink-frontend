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
    bottomSheet: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#F7F7F7',
      borderTopLeftRadius: resp.dx(30),
      borderTopRightRadius: resp.dx(30),
      paddingTop: resp.dy(18),
      maxHeight: resp.dy(320),
    },

    listHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: resp.dx(18),
      marginBottom: resp.dy(14),
    },

    listTitle: {
      fontSize: resp.df(18),
      fontWeight: '800',
      color: colors.BLACK_COLOR,
    },

    listCount: {
      marginTop: resp.dy(4),
      fontSize: resp.df(13),
      color: colors.SPACES_COLOR,
    },

    viewAllText: {
      color: colors.PRIMARY_COLOR,
      fontWeight: '700',
      fontSize: resp.df(13),
    },

    listContainer: {
      flex: 1,
      alignSelf: 'center',
    },

    listContent: {
      paddingHorizontal: resp.dx(16),
      paddingBottom: resp.dy(25),
    },
  });