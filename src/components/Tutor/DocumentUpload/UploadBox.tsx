// UploadBox.tsx

import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useColors from '../../../hooks/ui/useColors';
import { GLASS } from '../../../theme/glass';

interface UploadBoxProps {
  label: string;
  iconName: string;
  onPress: () => void;
  fileUri?: string;
}

const UploadBox: React.FC<UploadBoxProps> = ({
  label,
  iconName,
  onPress,
  fileUri,
}) => {
  const colors = useColors();

  const uploaded = !!fileUri;

  return (
    <Pressable
      style={[
        styles.uploadBox,
        {
          borderColor: uploaded ? '#22C55E' : colors.PRIMARY_COLOR,
          backgroundColor: uploaded ? '#F0FDF4' : GLASS.cardBg,
          borderStyle: 'dashed',
        },
      ]}
      onPress={onPress}>
      {uploaded ? (
        <>
          <View style={styles.successCircle}>
            <Icon name="check-all" size={24} color="#22C55E" />
          </View>

          <Text style={styles.uploadedText}>Uploaded</Text>
        </>
      ) : (
        <>
          <Icon
            name={iconName}
            size={32}
            color={colors.PRIMARY_COLOR}
          />

          <Text style={[styles.label, {color: colors.BLACK}]}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  uploadBox: {
    flex: 1,
    minHeight: 110,
    borderWidth: 1.5,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
  },

  label: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },

  uploadedText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: '#22C55E',
  },

  successCircle: {
    width: 42,
    height: 42,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ECFDF3',
  },
});

export default UploadBox;