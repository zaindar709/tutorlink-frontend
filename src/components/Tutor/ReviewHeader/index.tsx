// components/ReviewHeader.tsx

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ReviewHeader = () => {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Icon name="check" size={50} color="#fff" />
      </View>

      <Text style={styles.title}>Documents Under Review!</Text>

      <Text style={styles.subtitle}>
        Your documents have been submitted successfully
      </Text>
    </View>
  );
};

export default ReviewHeader;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },

  iconWrapper: {
    width: 84,
    height: 84,
    borderRadius: 50,
    backgroundColor: '#10C44C',
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    marginTop: 18,
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },

  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});