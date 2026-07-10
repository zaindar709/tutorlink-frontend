import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-paper';
import useUi from '../../hooks/ui/useUi';
import GradientSurface from '../GradientSurface';

type ExploreTileProps = {
  icon: string;
  title: string;
  subtitle: string;
  color?: string;
  gradient?: string[];
  onPress?: () => void;
};

const ExploreTile: React.FC<ExploreTileProps> = ({
  icon,
  title,
  subtitle,
  color,
  gradient,
  onPress,
}) => {
  const { colors, resp } = useUi();
  const styles = createStyles(colors, resp, color);

  const iconContent = (
    <Icon source={icon} size={resp.df(22)} color={colors.WHITE_COLOR as string} />
  );

  return (
    <TouchableOpacity
      style={styles.tile}
      activeOpacity={0.8}
      onPress={onPress}
    >
      {gradient ? (
        <GradientSurface colors={gradient} style={styles.iconWrapper}>
          {iconContent}
        </GradientSurface>
      ) : (
        <View style={styles.iconWrapper}>{iconContent}</View>
      )}
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default ExploreTile;

const createStyles = (colors: any, resp: any, color?: string) =>
  StyleSheet.create({
    tile: {
      backgroundColor: colors.WHITE_COLOR,
      borderRadius: resp.dx(24),
      padding: resp.dx(16),
      minWidth: resp.dx(150),
      flex: 1,
      marginBottom: resp.dy(14),
      marginRight: resp.dx(16),
      shadowColor: colors.BLACK_COLOR,
      shadowOpacity: 0.06,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
    },
    iconWrapper: {
      width: resp.dx(44),
      height: resp.dx(44),
      borderRadius: resp.dx(16),
      backgroundColor: color,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: resp.dy(12),
      overflow: 'hidden',
    },
    title: {
      color: colors.BLACK_COLOR,
      fontSize: resp.df(15),
      fontWeight: '700',
      marginBottom: resp.dy(4),
    },
    subtitle: {
      color: colors.SPACES_COLOR,
      fontSize: resp.df(13),
      lineHeight: resp.dy(18),
    },
  });
