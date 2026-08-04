import React from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { GLASS } from '../../theme/glass';

type Props = {
  uri?: string | null;
  size?: number;
  style?: ViewStyle;
};

const GlassAvatar = ({ uri, size = 56, style }: Props) => {
  const radius = size / 2;
  return (
    <View
      style={[
        styles.ring,
        {
          width: size + 6,
          height: size + 6,
          borderRadius: (size + 6) / 2,
        },
        style,
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: radius }}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            { width: size, height: size, borderRadius: radius },
          ]}
        >
          <MaterialCommunityIcons
            name="account"
            size={size * 0.5}
            color={GLASS.primary}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  ring: {
    borderWidth: 2,
    borderColor: 'rgba(117,72,245,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GLASS.cardBgStrong,
    ...GLASS.shadow.soft,
  },
  fallback: {
    backgroundColor: GLASS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default GlassAvatar;
