import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Image } from 'react-native';
import useUi from '../../hooks/ui/useUi';
import Images from '../../assets/images';
import { AUTH_GLASS } from '../AuthGlass/authGlassTheme';

export default function AuthCard({ title, subtitle, onPress, type }: any) {
  const { resp } = useUi();
  const styles = createStyles(resp);

  const getIcon = () => {
    switch (type) {
      case 'login':
        return Images.LockIcon;
      case 'signup':
        return Images.UserIcon;
    }
  };

  return (
    <View style={styles.shell}>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.88}
      >
        <View style={styles.iconBox}>
          <Image
            source={getIcon()}
            style={styles.iconImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.textBox}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <Text style={styles.arrow}>→</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (resp: any) =>
  StyleSheet.create({
    /** Outer shell draws full 4-side border (TouchableOpacity clips bottom on Android). */
    shell: {
      borderRadius: resp.dx(18),
      borderTopWidth: 1,
      borderRightWidth: 1,
      borderBottomWidth: 1,
      borderLeftWidth: 1,
      borderColor: AUTH_GLASS.cardBorder,
      backgroundColor: AUTH_GLASS.cardBg,
      marginBottom: resp.dy(12),
      overflow: 'hidden',
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: resp.dy(96),
      padding: resp.dx(16),
      backgroundColor: 'transparent',
    },

    iconBox: {
      width: resp.dx(48),
      height: resp.dy(48),
      borderRadius: resp.dx(14),
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: resp.dx(12),
      backgroundColor: AUTH_GLASS.primary as string,
    },

    textBox: {
      flex: 1,
    },

    title: {
      fontSize: resp.df(16),
      fontWeight: '700',
      color: AUTH_GLASS.title,
    },

    subtitle: {
      fontSize: resp.df(12),
      color: AUTH_GLASS.subtitle,
      marginTop: 3,
    },

    arrow: {
      fontSize: resp.df(18),
      color: AUTH_GLASS.link,
      fontWeight: 'bold',
    },

    iconImage: {
      width: resp.dx(22),
      height: resp.dy(22),
      tintColor: '#fff',
    },
  });
