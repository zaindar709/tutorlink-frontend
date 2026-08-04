import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { GLASS } from '../../theme/glass';

type Props = {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  onClear?: () => void;
  style?: any;
};

const GlassSearchBar = ({
  value,
  onChangeText,
  placeholder = 'Search…',
  onClear,
  style,
}: Props) => (
  <View style={[styles.wrap, style]}>
    <MaterialCommunityIcons
      name="magnify"
      size={20}
      color={GLASS.textMuted}
      style={{ marginRight: 8 }}
    />
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={GLASS.placeholder}
      style={styles.input}
      selectionColor={GLASS.primary}
    />
    {value ? (
      <TouchableOpacity onPress={onClear || (() => onChangeText(''))}>
        <MaterialCommunityIcons
          name="close-circle"
          size={18}
          color={GLASS.textMuted}
        />
      </TouchableOpacity>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.cardBg,
    borderRadius: GLASS.radius.xl,
    borderWidth: 1,
    borderColor: GLASS.cardBorder,
    paddingHorizontal: 14,
    height: 48,
    ...GLASS.shadow.soft,
  },
  input: {
    flex: 1,
    color: GLASS.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },
});

export default GlassSearchBar;
