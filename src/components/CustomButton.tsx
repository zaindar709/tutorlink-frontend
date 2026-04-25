import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ViewStyle,
  TextStyle,
  ColorValue,
} from 'react-native';
import { Icon } from 'react-native-paper';
import useUi from '../hooks/ui/useUi';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  backgroundColor?: ColorValue;
  textColor?: ColorValue;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: string;
  iconPosition?: 'left' | 'right';
  iconSize?: number;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  backgroundColor,
  textColor,
  disabled = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
  iconSize,
}) => {
  const { resp, colors } = useUi();
  const styles = createStyles(colors, resp);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          backgroundColor: disabled
            ? '#babbbc'
            : backgroundColor ?? colors.PRIMARY_COLOR,
        },
        style,
      ]}
    >
      <View style={styles.content}>
        {/* 🔹 Left Icon */}
        {icon && iconPosition === 'left' && (
          <Icon
            source={icon}
            size={iconSize || resp.df(20)}
            color={String(textColor || colors.WHITE_COLOR)}
          />
        )}

        {/* 🔹 Button Text */}
        <Text
          style={[
            styles.text,
            { color: textColor || colors.WHITE_COLOR },
            textStyle,
          ]}
        >
          {title}
        </Text>

        {/* 🔹 Right Icon */}
        {icon && iconPosition === 'right' && (
          <Icon
            source={icon}
            size={iconSize || resp.df(20)}
            color={String(textColor || colors.WHITE_COLOR)}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default CustomButton;

const createStyles = (colors: any, resp: any) =>
  StyleSheet.create({
    button: {
      width: resp.dx(350),
      height: resp.dy(56),
      paddingHorizontal: resp.dx(32),
      borderRadius: resp.dx(20),
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 3,
      alignSelf: 'center',
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    text: {
      fontSize: resp.df(18),
      fontWeight: '600',
      textAlign: 'center',
    },
  });