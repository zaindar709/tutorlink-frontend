import { Dimensions, StyleSheet } from 'react-native';
import { AUTH_GLASS } from '../../../components/AuthGlass/authGlassTheme';

const { width } = Dimensions.get('window');

export const createStyles = (_colors: any, resp: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    skipBtn: {
      alignSelf: 'flex-end',
      paddingHorizontal: resp.dx(22),
      paddingVertical: resp.dy(10),
      zIndex: 2,
    },
    skipText: {
      fontSize: resp.df(15),
      color: AUTH_GLASS.link,
      fontWeight: '700',
    },
    /** FlatList wrapper — no horizontal padding (breaks paging). */
    listWrap: {
      flex: 1,
    },
    /** One full-width page slide */
    slide: {
      width,
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: resp.dx(28),
    },
    imageWrapper: {
      width: width * 0.7,
      height: width * 0.7,
      borderRadius: resp.dx(24),
      marginBottom: resp.dy(28),
      overflow: 'hidden',
      backgroundColor: AUTH_GLASS.cardBg,
      borderWidth: 1,
      borderColor: AUTH_GLASS.cardBorder,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    title: {
      fontSize: resp.df(24),
      fontWeight: '800',
      textAlign: 'center',
      color: AUTH_GLASS.title,
      marginBottom: resp.dy(10),
    },
    description: {
      fontSize: resp.df(15),
      textAlign: 'center',
      color: AUTH_GLASS.subtitle,
      lineHeight: resp.dy(22),
      paddingHorizontal: resp.dx(8),
    },
    footer: {
      paddingHorizontal: resp.dx(22),
      paddingBottom: resp.dy(16),
      paddingTop: resp.dy(4),
    },
    pagination: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: resp.dy(22),
    },
    dot: {
      height: resp.dy(8),
      borderRadius: resp.dx(5),
      marginHorizontal: resp.dx(4),
    },
  });
