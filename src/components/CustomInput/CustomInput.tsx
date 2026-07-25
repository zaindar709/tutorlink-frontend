import React, { forwardRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TextInput as RNTextInput,
} from 'react-native';
import useUi from '../../hooks/ui/useUi';

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
      ...props
    },
    ref
  ) => {
    const { colors } = useUi();

    return (
      <View style={[styles.container, style]}>
        {label ? <Text style={styles.label}>{label}</Text> : null}

        <View
          style={[styles.inputWrapper, error ? { borderColor: 'red' } : null]}
        >
          {leftIcon ? (
            <View style={{ marginRight: 8 }}>{leftIcon}</View>
          ) : null}

          <TextInput
            ref={ref}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#999"
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            style={styles.input}
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
    fontSize: 14,
    fontWeight: '500',
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
  input: {
    flex: 1,
    height: 48,
    color: '#000',
  },
});
