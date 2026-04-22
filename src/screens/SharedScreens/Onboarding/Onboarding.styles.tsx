import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

export const createStyles = (colors: any, resp: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.BACKGROUND_COLOR,
    },
    skipBtn: {
      alignSelf: 'flex-end',
      padding: resp.dy(20),
    },
    skipText: {
      fontSize: resp.df(16),
      color: colors.INACTIVE_COLOR || '#64748B',
      fontWeight: '600',
    },
    itemContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    imageWrapper: {
      width: width * 0.8,
      height: width * 0.8,
      borderRadius: resp.dx(28),
      marginBottom: resp.dy(40),
      elevation: 12,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 12,
      },
      shadowOpacity: 0.25,
      shadowRadius: 18,
      borderWidth: 0,
      overflow: 'hidden',
      transform: [{ perspective: 1000 }, { rotateX: '5deg' }, { scale: 1 }],
    },
    image: {
      width: '100%',
      height: '100%',
      borderRadius: resp.dx(30),
    },
    glow: {
      ...StyleSheet.absoluteFill,
      borderRadius: resp.dx(30),
      opacity: 0.15,
      transform: [{ scale: 1.1 }],
    },
    title: {
      fontSize: resp.df(28),
      fontWeight: 'bold',
      textAlign: 'center',
      color: colors.TEXT_PRIMARY || '#1E293B',
      marginBottom: resp.dy(15),
    },
    description: {
      fontSize: resp.df(16),
      textAlign: 'center',
      color: colors.TEXT_SECONDARY || '#64748B',
      lineHeight: resp.dy(24),
      paddingHorizontal: resp.dx(20),
    },
    footer: {
      paddingHorizontal: resp.dx(30),
      paddingVertical: resp.dy(20),
    },
    pagination: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: resp.dy(50),
      gap: resp.dx(8),
    },
    dot: {
      width: resp.dx(10),
      height: resp.dy(10),
      borderRadius: resp.dx(5),
      backgroundColor: colors.INACTIVE_COLOR || '#E2E8F0',
    },
    buttonText: {
      fontWeight: 'bold',
    },
  });
