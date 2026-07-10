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
import GradientSurface from './GradientSurface';
import { isPrimaryColor } from '../constants/gradients';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  backgroundColor?: ColorValue;
  textColor?: ColorValue;
  disabled?: boolean;
  borderColor?: ColorValue;
  borderWidth?: number;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: string;
  iconPosition?: 'left' | 'right';
  iconSize?: number;
  loading?: boolean;
  useGradient?: boolean;
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
  useGradient,
}) => {
  const { resp, colors } = useUi();
  const styles = createStyles(colors, resp);
  const isDisabled = disabled || loading;
  const resolvedTextColor = String(textColor || colors.WHITE_COLOR);
  const flattenedStyle = StyleSheet.flatten(style);
  const resolvedBackgroundColor = isDisabled
    ? '#babbbc'
    : backgroundColor ??
      (flattenedStyle?.backgroundColor as ColorValue | undefined) ??
      colors.PRIMARY_COLOR;
  const shouldUseGradient =
    useGradient ??
    (!isDisabled && isPrimaryColor(resolvedBackgroundColor, String(colors.PRIMARY_COLOR)));

  const buttonContent = (
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
  );

  if (shouldUseGradient) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.7}
        style={[
          styles.button,
          {
            borderColor: borderColor ?? 'transparent',
            borderWidth: borderWidth ?? 0,
            overflow: 'hidden',
          },
          style,
          { backgroundColor: 'transparent' },
        ]}
      >
        <GradientSurface variant="primaryButton" style={StyleSheet.absoluteFillObject} />
        {buttonContent}
      </TouchableOpacity>
    );
  }

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
      {buttonContent}
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
