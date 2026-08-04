import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-paper';
import useUi from '../../hooks/ui/useUi';
import { GLASS } from '../../theme/glass';

type ExploreTileProps = {
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  onPress?: () => void;
};

const ExploreTile: React.FC<ExploreTileProps> = ({
  icon,
  title,
  subtitle,
  color,
  onPress,
}) => {
  const { colors, resp } = useUi();
  const styles = createStyles(colors, resp, color);

  return (
    <TouchableOpacity
      style={styles.tile}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.iconWrapper}>
        <Icon source={icon} size={resp.df(22)} color={colors.WHITE_COLOR as string} />
      </View>
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default ExploreTile;

const createStyles = (colors: any, resp: any, color: string) =>
  StyleSheet.create({
    tile: {
      backgroundColor: '#FFFFFF',
      borderRadius: GLASS.radius.xl,
      padding: resp.dx(16),
      minWidth: resp.dx(150),
      flex: 1,
      marginBottom: resp.dy(14),
      marginRight: resp.dx(16),
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      ...GLASS.shadow.soft,
    },
    iconWrapper: {
      width: resp.dx(44),
      height: resp.dx(44),
      borderRadius: resp.dx(16),
      backgroundColor: color,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: resp.dy(12),
    },
    title: {
      color: GLASS.textPrimary,
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
