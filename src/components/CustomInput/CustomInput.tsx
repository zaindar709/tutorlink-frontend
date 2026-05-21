import React from 'react';
import { View, Text, TextInput, StyleSheet,TouchableOpacity } from 'react-native';
import useUi from '../../hooks/ui/useUi';

const CustomInput = ({
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
}: any) => {
  const { colors } = useUi();

  return (
   <View style={[styles.container, style]}>
  {label && <Text style={styles.label}>{label}</Text>}

  <View style={[
    styles.inputWrapper,
    error && { borderColor: 'red' }
  ]}>

    {/* LEFT ICON */}
    {leftIcon && (
      <View style={{ marginRight: 8 }}>
        {leftIcon}
      </View>
    )}

    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#999"
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      style={styles.input}
      {...props}
    />

    {/* RIGHT ICON */}
    {rightIcon && (
      <TouchableOpacity onPress={onRightIconPress}>
        {rightIcon}
      </TouchableOpacity>
    )}
  </View>

  {error ? <Text style={{ color: 'red', fontSize: 12, marginTop:5 }}>{error}</Text> : null}
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
    color: "#000"
  },
});
