import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import BackButton from '../../BackButton/BackButton';
import { GLASS, glassTypography } from '../../../theme/glass';

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

      <Text numberOfLines={1} style={styles.title}>
        {title}
      </Text>

      <View style={styles.sideContainer}>
        {showSaveButton ? (
          <TouchableOpacity onPress={onSave} style={styles.actionButton}>
            <MaterialCommunityIcons
              name="content-save-outline"
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity onPress={onRightPress} style={styles.actionButton}>
            <MaterialCommunityIcons name={rightIcon} size={20} color="#fff" />
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
    backgroundColor: GLASS.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: GLASS.cardBorder,
  },
  sideContainer: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    ...glassTypography.h3,
    fontSize: 18,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: GLASS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...GLASS.shadow.soft,
  },
});
