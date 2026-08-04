// DocumentPickerField.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = {
  title: string;
  subtext?: string;
  value?: any;
  onPress: () => void;
  colors: any;
};

const DocumentPickerField = ({
  title,
  subtext = 'PDF or JPG format',
  value,
  onPress,
  colors,
}: Props) => {
  const uploaded = !!value;

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.BLACK }]}>
        {title}
      </Text>

      <TouchableOpacity
        activeOpacity={0.8}
        style={[
          styles.documentBox,
          {
            borderColor: uploaded ? '#22C55E' : '#c2c1c1',
            backgroundColor: uploaded ? '#F0FDF4' : colors.CARD_COLOR || '#EDE9FE',
            borderStyle: 'dashed',
          },
        ]}
        onPress={onPress}
      >
        <View style={styles.documentLeft}>
          {uploaded ? (
            <View style={styles.successCircle}>
              <Icon name="check-all" size={24} color="#22C55E" />
            </View>
          ) : (
            <View style={styles.uploadCircle}>
              <Icon
                name="upload-outline"
                size={24}
                color={colors.PRIMARY_COLOR}
              />
            </View>
          )}

          <View style={{ marginLeft: 12 }}>
            <Text
              style={[
                styles.documentTitle,
                {
                  color: uploaded ? '#22C55E' : colors.BLACK,
                },
              ]}
            >
              {uploaded ? 'Certificate Uploaded' : 'Upload Document'}
            </Text>

            <Text
              numberOfLines={1}
              style={[styles.documentSubtext, { color: colors.GRAY31 }]}
            >
              {uploaded ? value?.name : subtext}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default DocumentPickerField;

const styles = StyleSheet.create({
  section: {
    marginTop: 16,
    width: '90%',
    alignSelf: 'center',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },

  documentBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  documentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  documentTitle: {
    fontSize: 15,
    fontWeight: '600',
  },

  documentSubtext: {
    fontSize: 12,
    marginTop: 3,
    width: 180,
  },
  uploadCircle: {
    width: 42,
    height: 42,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
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
