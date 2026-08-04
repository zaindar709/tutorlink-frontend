import React, { forwardRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TextInput as RNTextInput,
} from 'react-native';
import useUi from '../../hooks/ui/useUi';
import { GLASS } from '../../theme/glass';

const CustomInput = forwardRef<RNTextInput, any>(
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
      variant = 'glass',
      ...props
    },
    ref
  ) => {
    const { colors } = useUi();
    const [focused, setFocused] = useState(false);
    const isGlass = variant === 'glass';

    return (
      <View style={[styles.container, style]}>
        {label ? (
          <Text
            style={[
              styles.label,
              isGlass && { color: GLASS.textSecondary },
            ]}
          >
            {label}
          </Text>
        ) : null}

        <View
          style={[
            styles.inputWrapper,
            isGlass && styles.glassWrapper,
            focused && isGlass && styles.glassFocused,
            error ? { borderColor: colors.ERROR_COLOR || 'red' } : null,
          ]}
        >
          {leftIcon ? (
            <View style={{ marginRight: 8 }}>{leftIcon}</View>
          ) : null}

          <TextInput
            ref={ref}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={
              isGlass ? GLASS.placeholder : '#94A3B8'
            }
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            style={[styles.input, isGlass && styles.glassInput]}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            selectionColor={GLASS.primary}
            {...props}
          />

          {rightIcon ? (
            <TouchableOpacity onPress={onRightIconPress}>
              {rightIcon}
            </TouchableOpacity>
          ) : null}
        </View>

        {error ? (
          <Text style={{ color: 'red', fontSize: 12, marginTop: 5 }}>
            {error}
          </Text>
        ) : null}
      </View>
    );
  }
);

CustomInput.displayName = 'CustomInput';

export default CustomInput;

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 6,
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.8,
    borderColor: '#ddd',
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  glassWrapper: {
    backgroundColor: GLASS.inputBg,
    borderColor: GLASS.inputBorder,
    borderWidth: 1,
    borderRadius: GLASS.radius.lg,
    minHeight: 52,
  },
  glassFocused: {
    borderColor: GLASS.inputBorderFocus,
    backgroundColor: GLASS.cardBgStrong,
  },
  input: {
    flex: 1,
    height: 48,
    color: '#000',
  },
  glassInput: {
    height: 52,
    color: GLASS.textPrimary,
    fontWeight: '500',
  },
});
