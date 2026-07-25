import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ViewStyle,
  TextStyle,
  ColorValue,
  ActivityIndicator,
} from 'react-native';
import { Icon } from 'react-native-paper';
import useUi from '../hooks/ui/useUi';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  backgroundColor?: ColorValue;
  textColor?: ColorValue;
  disabled?: boolean;
  borderColor?: ColorValue;
  borderWidth?: number;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
  icon?: string;
  iconPosition?: 'left' | 'right';
  iconSize?: number;
  loading?: boolean;
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
  borderColor,
  borderWidth,
  iconPosition = 'left',
  iconSize,
  loading = false,
}) => {
  const { resp, colors } = useUi();
  const styles = createStyles(colors, resp);
  const isDisabled = disabled || loading;
  const resolvedTextColor = String(textColor || colors.WHITE_COLOR);
  const resolvedBackgroundColor = isDisabled
    ? '#babbbc'
    : backgroundColor ?? colors.PRIMARY_COLOR;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          backgroundColor: resolvedBackgroundColor,
          borderColor: borderColor ?? 'transparent',
          borderWidth: borderWidth ?? 0,
        },
        style,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={resolvedTextColor} size="small" />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <Icon
                source={icon}
                size={iconSize || resp.df(20)}
                color={resolvedTextColor}
              />
            )}

            <Text
              style={[
                styles.text,
                { color: textColor || colors.WHITE_COLOR },
                textStyle,
              ]}
            >
              {title}
            </Text>

            {icon && iconPosition === 'right' && (
              <Icon
                source={icon}
                size={iconSize || resp.df(20)}
                color={resolvedTextColor}
              />
            )}
          </>
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
