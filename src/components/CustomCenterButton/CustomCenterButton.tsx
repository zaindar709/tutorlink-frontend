import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import useUi from '../../hooks/ui/useUi';

export const CustomCenterButton = ({ children, onPress }:any) => {
    const {colors} = useUi();
    const styles = createStyles(colors);
  return (
    <Pressable
      style={styles.container}
      onPress={onPress}
    >
      <View style={styles.buttonInner}>
        {children}
    </View>
  </Pressable>
)};

const createStyles = (colors: any) => StyleSheet.create({
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
    backgroundColor: colors.PRIMARY_COLOR, 
    borderWidth: 3,
    borderColor: colors.WHITE_COLOR, 
    justifyContent: 'center',
    alignItems: 'center',
  },
});