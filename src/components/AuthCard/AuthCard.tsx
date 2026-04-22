import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Image } from 'react-native';
import useUi from '../../ui/useUi';
import Images from '../../assets/images';

export default function AuthCard({ title, subtitle, onPress, type }: any) {
  const { colors, resp } = useUi();
  const styles = createStyles(colors, resp, type);

  const getIcon = () => {
    switch (type) {
      case 'login':
        return Images.LockIcon;
      case 'signup':
        return Images.UserIcon;
    }
  };

  const getIconBg = () => {
    switch (type) {
      case 'login':
        return colors.PRIMARY_COLOR;
      case 'signup':
        return colors.PRIMARY_COLOR;
      default:
        return colors.PRIMARY_COLOR;
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={[styles.iconBox, { backgroundColor: getIconBg() }]}>
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
  );
}

const createStyles = (colors: any, resp: any, type: string) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      height: resp.dy(110),
      padding: resp.dx(18),
      borderRadius: resp.dx(16),
      backgroundColor: colors.WHITE_COLOR,
      marginBottom: resp.dy(15),
      borderWidth: 1,
      elevation: 10,
      borderColor: colors.PRIMARY_COLOR,
    },

    iconBox: {
      width: resp.dx(50),
      height: resp.dy(50),
      borderRadius: resp.dx(16),
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: resp.dx(12),
    },

    textBox: {
      flex: 1,
    },

    title: {
      fontSize: resp.df(16),
      fontWeight: '600',
    },

    subtitle: {
      fontSize: resp.df(12),
      color: colors.TEXT_SECONDARY,
      marginTop: 2,
    },

    arrow: {
      fontSize: resp.df(18),
      color: colors.PRIMARY_COLOR,
      fontWeight: 'bold',
    },

    iconImage: {
      width: resp.dx(24),
      height: resp.dy(24),
      tintColor: '#fff',
    },
  });