import { StyleSheet } from 'react-native';
import { AUTH_GLASS } from '../../../../components/AuthGlass/authGlassTheme';

export const createStyles = (_colors: any, resp: any) =>
  StyleSheet.create({
    headerSection: {
      width: resp.dx(75),
      height: resp.dy(75),
      borderRadius: resp.dx(22),
      backgroundColor: AUTH_GLASS.primary as string,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      marginBottom: resp.dy(16),
    },
    progressBarBackground: {
      height: resp.dy(6),
      borderRadius: resp.dx(3),
      marginBottom: resp.dy(16),
      overflow: 'hidden',
      backgroundColor: 'rgba(117, 72, 245, 0.12)',
    },
    progressBarFill: {
      height: '100%',
      borderRadius: resp.dx(3),
      backgroundColor: AUTH_GLASS.primary as string,
    },
    section: {
      marginTop: resp.dy(8),
    },
    sectionTitle: {
      fontSize: resp.df(17),
      fontWeight: '700',
      marginBottom: resp.dy(4),
      color: AUTH_GLASS.title,
    },
    sectionSubtitle: {
      fontSize: resp.df(13),
      marginBottom: resp.dy(12),
      color: AUTH_GLASS.subtitle,
    },
    uploadBox: {
      flexDirection: 'row',
      gap: resp.dx(3),
    },
  });
