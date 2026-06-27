import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import BackButton from '../../BackButton/BackButton';

const CustomHeader = ({
  navigation,
  title = 'Title',
  showBackButton = true,
  showSaveButton = false,
  onSave,
  rightIcon,
  onRightPress,
}: any) => {
  return (
    <View style={styles.container}>
      {/* Left */}
      <View style={styles.sideContainer}>
        {showBackButton ? (
          <BackButton
            showText={false}
            iconSize={24}
            onPress={() => navigation?.goBack()}
          />
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {/* Center */}
      <Text numberOfLines={1} style={styles.title}>
        {title}
      </Text>

      {/* Right */}
      <View style={styles.sideContainer}>
        {showSaveButton ? (
          <TouchableOpacity
            onPress={onSave}
            style={styles.actionButton}
          >
            <MaterialCommunityIcons
              name="content-save-outline"
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity
            onPress={onRightPress}
            style={styles.actionButton}
          >
            <MaterialCommunityIcons
              name={rightIcon}
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>
    </View>
  );
};

export default CustomHeader;
const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  sideContainer: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
});