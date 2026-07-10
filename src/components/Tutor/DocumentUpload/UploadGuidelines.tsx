import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useColors from '../../../hooks/ui/useColors';

const UploadGuidelines = () => {
  const colors = useColors();
  return (
    <View
      style={[
        styles.container,
        {
          borderColor: colors.YELLOW_COLOR,
          backgroundColor: '#f9f5dd',
        },
      ]}
    >
      <View style={styles.row}>
        <Icon
          name="alert-circle-outline"
          size={18}
          color={colors.YELLOW_COLOR}
        />
        <Text style={styles.text}> Ensure text is clear and readable</Text>
      </View>
      <View style={styles.row}>
        <Icon
          name="alert-circle-outline"
          size={18}
          color={colors.YELLOW_COLOR}
        />
        <Text style={styles.text}> No glare or shadows on document</Text>
      </View>
      <View style={styles.row}>
        <Icon
          name="alert-circle-outline"
          size={18}
          color={colors.YELLOW_COLOR}
        />
        <Text style={styles.text}>
          {' '}
          Original document only (no photocopies)
        </Text>
      </View>
      <View style={styles.row}>
        <Icon
          name="alert-circle-outline"
          size={18}
          color={colors.YELLOW_COLOR}
        />
        <Text style={styles.text}> All four corners must be visible</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginTop: 18,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  text: {
    fontSize: 13,
    marginLeft: 6,
    color: '#333',
  },
});

export default UploadGuidelines;
