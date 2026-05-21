import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import useUi from '../../hooks/ui/useUi';

type Props = {
  title?: string;
  onPress?: () => void;
  iconSize?: number;
  color?: string; // 👈 new prop
};

const BackButton = ({
  title = 'Back',
  onPress,
  iconSize,
   color,
}: Props) => {
  const { colors, resp } = useUi();
   const finalColor = color || colors.BLACK_COLOR;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <IconButton
        icon="arrow-left"
        size={iconSize || resp.df(16)}
        iconColor={finalColor as string}
        onPress={onPress}
      />
      <Text style={[styles.text,  { color: finalColor }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default BackButton;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -10,
    // marginTop: 10
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: -5,
  },
});