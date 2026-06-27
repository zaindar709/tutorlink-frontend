import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import BackButton from '../BackButton/BackButton';
import useUi from '../../hooks/ui/useUi';

type EarningHeaderProps = {
  navigation?: any;
  title: string;
  subtitle?: string;
  rightIcon?: string;
  onRightPress?: () => void;
  showBackButton?: boolean;
};

const EarningHeader: React.FC<EarningHeaderProps> = ({
  navigation,
  title,
  subtitle,
  rightIcon,
  onRightPress,
  showBackButton = true,
}) => {
  const { colors, resp } = useUi();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.WHITE_COLOR, borderBottomColor: colors.PRIMARY_GRAY_COLOR },
      ]}
    >
      <View style={styles.side}>
        {showBackButton && navigation ? (
          <BackButton
            onPress={() => navigation.goBack()}
            showText={false}
            iconSize={resp.df(22)}
            color={colors.BLACK_COLOR as string}
          />
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      <View style={styles.center}>
        <Text style={[styles.title, { color: colors.BLACK_COLOR }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: colors.SECONDARY_COLOR }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.side}>
        {rightIcon && onRightPress ? (
          <TouchableOpacity style={styles.actionButton} onPress={onRightPress}>
            <MaterialCommunityIcons
              name={rightIcon}
              size={28}
              color={colors.PRIMARY_COLOR as string}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </View>
  );
};

export default EarningHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  side: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '500',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
    height: 40,
  },
});