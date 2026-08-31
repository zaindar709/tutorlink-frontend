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
import LinearGradient from 'react-native-linear-gradient';
import useUi from '../hooks/ui/useUi';
import { GLASS } from '../theme/glass';

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
  const useGradient = !backgroundColor && !borderWidth;
  const resolvedDisabledBackgroundColor = backgroundColor ?? '#C4B5FD';

  const content = (
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

  if (useGradient) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[
          styles.button,
          styles.gradientWrap,
          isDisabled && styles.disabledButton,
          style,
        ]}
      >
        <LinearGradient
          colors={
            isDisabled
              ? ['#C4B5FD', '#C4B5FD', '#C4B5FD']
              : [...GLASS.buttonGradient]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const resolvedBackgroundColor = isDisabled
    ? resolvedDisabledBackgroundColor
    : backgroundColor ?? colors.PRIMARY_COLOR;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={[
        styles.button,
        {
          backgroundColor: resolvedBackgroundColor,
          borderColor: borderColor ?? 'transparent',
          borderWidth: borderWidth ?? 0,
        },
        isDisabled && styles.disabledButton,
        style,
      ]}
    >
      {content}
    </TouchableOpacity>
  );
};

export default CustomButton;

const createStyles = (colors: any, resp: any) =>
  StyleSheet.create({
    button: {
      width: '100%',
      minHeight: resp.dy(48),
      paddingVertical: resp.dy(10),
      borderRadius: GLASS.radius.lg,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'stretch',
      // reduce heavy glow which can visually overflow on small screens
      ...GLASS.shadow.soft,
      overflow: 'hidden',
    },
    gradientWrap: {
      paddingHorizontal: 0,
      backgroundColor: 'transparent',
    },
    disabledButton: {
      opacity: 0.64,
    },
    gradient: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: GLASS.radius.lg,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    text: {
      fontSize: resp.df(17),
      fontWeight: '700',
      textAlign: 'center',
      letterSpacing: 0.2,
    },
  });
