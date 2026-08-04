import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import BackButton from '../../../components/BackButton/BackButton';
import useUi from '../../../hooks/ui/useUi';
import { GLASS, glassTypography } from '../../../theme/glass';

type Props = {
  navigation: { goBack: () => void };
  title: string;
  showBackButton?: boolean;
  showSaveButton?: boolean;
  onSave?: () => void;
  rightIcon?: string;
  onRightPress?: () => void;
};

export default function ProfileSubHeader({
  navigation,
  title,
  showBackButton = true,
  showSaveButton = false,
  onSave,
  rightIcon,
  onRightPress,
}: Props) {
  const { colors } = useUi();

  return (
    <View style={styles.container}>
      <View style={styles.side}>
        {showBackButton ? (
          <BackButton
            showText={false}
            iconSize={24}
            onPress={() => navigation.goBack()}
          />
        ) : (
          <View style={styles.sideSpacer} />
        )}
      </View>

      <Text numberOfLines={1} style={styles.title}>
        {title}
      </Text>

      <View style={styles.side}>
        {showSaveButton ? (
          <TouchableOpacity
            onPress={onSave}
            style={[styles.actionBtn, { backgroundColor: colors.PRIMARY_COLOR }]}
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
            style={[styles.actionBtn, { backgroundColor: colors.PRIMARY_COLOR }]}
          >
            <MaterialCommunityIcons name={rightIcon} size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={styles.sideSpacer} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#f6f7fc',
    borderBottomWidth: 0,
  },
  side: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideSpacer: {
    width: 40,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    ...glassTypography.h3,
    fontSize: 17,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...GLASS.shadow.soft,
  },
});
