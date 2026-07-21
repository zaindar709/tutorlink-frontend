import React from 'react';
import { View, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import useUi from '../../hooks/ui/useUi';

type Props = {
  size?: number;
  verified?: boolean;
};

const VerifiedBadge = ({ size = 16, verified = false }: Props) => {
  const { colors } = useUi();
  if (!verified) return null;

  return (
    <View style={styles.wrap}>
      <MaterialCommunityIcons
        name="check-decagram"
        size={size}
        color={colors.PRIMARY_COLOR as string}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginLeft: 4,
  },
});

export default VerifiedBadge;
