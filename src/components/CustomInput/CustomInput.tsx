import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import useUi from '../../hooks/ui/useUi';

const CustomInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  error,
  style,
  ...props
}:any) => {
  const { colors } = useUi();

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        style={[styles.input, error && { borderColor: colors.ERROR_COLOR }]}
        {...props}
      />

      {error ? <Text style={[styles.errorText, { color: colors.ERROR_COLOR }]}>{error}</Text> : null}
    </View>
  );
};

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
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
  },
});