import React, { forwardRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TextInput as RNTextInput,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { AUTH_GLASS } from './authGlassTheme';

type Props = {
  label?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: any;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  style?: any;
  editable?: boolean;
  autoCapitalize?: any;
  autoCorrect?: boolean;
  multiline?: boolean;
  maxLength?: number;
  pointerEvents?: any;
};

const AnimatedView = Animated.createAnimatedComponent(View);

const GlassInput = forwardRef<RNTextInput, Props>(
  (
    {
      label,
      value,
      onChangeText,
      placeholder,
      secureTextEntry,
      keyboardType,
      error,
      leftIcon,
      rightIcon,
      onRightIconPress,
      style,
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);
    const scale = useSharedValue(1);

    const animStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <View style={[styles.container, style]}>
        {label ? <Text style={styles.label}>{label}</Text> : null}

        <AnimatedView
          style={[
            styles.inputWrapper,
            focused && styles.inputFocused,
            error ? styles.inputError : null,
            animStyle,
          ]}
        >
          {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}

          <TextInput
            ref={ref}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={AUTH_GLASS.placeholder}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            style={styles.input}
            onFocus={() => {
              setFocused(true);
              scale.value = withTiming(1.015, { duration: 160 });
            }}
            onBlur={() => {
              setFocused(false);
              scale.value = withTiming(1, { duration: 160 });
            }}
            selectionColor={AUTH_GLASS.primary as string}
            {...props}
          />

          {rightIcon ? (
            <TouchableOpacity onPress={onRightIconPress} hitSlop={8}>
              {rightIcon}
            </TouchableOpacity>
          ) : null}
        </AnimatedView>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    );
  }
);

GlassInput.displayName = 'GlassInput';

export default GlassInput;

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  label: {
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '600',
    color: AUTH_GLASS.label,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AUTH_GLASS.inputBorder,
    borderRadius: AUTH_GLASS.inputRadius,
    paddingHorizontal: 14,
    backgroundColor: AUTH_GLASS.inputBg,
    minHeight: 52,
  },
  inputFocused: {
    borderColor: AUTH_GLASS.inputBorderFocus,
    backgroundColor: AUTH_GLASS.inputBg,
  },
  inputError: {
    borderColor: AUTH_GLASS.error,
  },
  iconLeft: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 52,
    color: AUTH_GLASS.title,
    fontSize: 15,
    fontWeight: '500',
  },
  error: {
    color: AUTH_GLASS.error,
    fontSize: 12,
    marginTop: 6,
  },
});
