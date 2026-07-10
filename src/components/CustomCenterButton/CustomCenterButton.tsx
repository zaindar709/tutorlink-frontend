import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import useUi from '../../hooks/ui/useUi';
import GradientSurface from '../GradientSurface';

export const CustomCenterButton = ({ children, onPress }: any) => {
  const { colors } = useUi();
  const styles = createStyles(colors);

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <GradientSurface variant="primaryButton" style={styles.buttonInner}>
        {children}
      </GradientSurface>
    </Pressable>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      top: -22,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
    },
    buttonInner: {
      width: 64,
      height: 64,
      borderRadius: 32,
      borderWidth: 3,
      borderColor: colors.WHITE_COLOR,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
  });
