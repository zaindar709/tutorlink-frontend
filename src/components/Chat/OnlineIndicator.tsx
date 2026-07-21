import React from 'react';
import { View, StyleSheet } from 'react-native';
import useUi from '../../hooks/ui/useUi';

type Props = {
  size?: number;
  online?: boolean;
};

const OnlineIndicator = ({ size = 12, online = false }: Props) => {
  const { colors } = useUi();
  if (!online) return null;

  return (
    <View
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.CHAT_ONLINE as string,
          borderColor: (colors.CARD_COLOR || colors.WHITE_COLOR) as string,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  dot: {
    borderWidth: 2,
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
});

export default OnlineIndicator;
