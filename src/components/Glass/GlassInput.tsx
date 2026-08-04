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
import { GLASS, glassTypography } from '../../theme/glass';

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
  [key: string]: any;
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
            focused && styles.focused,
            error ? styles.errorBorder : null,
            animStyle,
          ]}
        >
          {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}
          <TextInput
            ref={ref}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={GLASS.placeholder}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            style={styles.input}
            onFocus={() => {
              setFocused(true);
              scale.value = withTiming(1.01, { duration: 140 });
            }}
            onBlur={() => {
              setFocused(false);
              scale.value = withTiming(1, { duration: 140 });
            }}
            selectionColor={GLASS.primary}
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

const styles = StyleSheet.create({
  container: { marginBottom: GLASS.space.md },
  label: { ...glassTypography.label, marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GLASS.inputBorder,
    borderRadius: GLASS.radius.lg,
    paddingHorizontal: 14,
    backgroundColor: GLASS.inputBg,
    minHeight: 52,
  },
  focused: {
    borderColor: GLASS.inputBorderFocus,
    backgroundColor: GLASS.cardBgStrong,
    ...GLASS.shadow.soft,
  },
  errorBorder: { borderColor: GLASS.error },
  iconLeft: { marginRight: 10 },
  input: {
    flex: 1,
    height: 52,
    color: GLASS.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },
  error: { color: GLASS.error, fontSize: 12, marginTop: 6 },
});

export default GlassInput;
