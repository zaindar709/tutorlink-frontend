import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import useUi from '../../../hooks/ui/useUi';

type Props = {
  icon: string;
  iconColor?: string;
  iconBg?: string;
  title: string;
  description?: string;
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  onPress?: () => void;
  showChevron?: boolean;
  trailing?: React.ReactNode;
};

export default function ProfileSettingRow({
  icon,
  iconColor,
  iconBg,
  title,
  description,
  value,
  onValueChange,
  onPress,
  showChevron = false,
  trailing,
}: Props) {
  const { colors } = useUi();
  const resolvedIconColor = iconColor || colors.PRIMARY_COLOR;
  const resolvedIconBg = iconBg || `${resolvedIconColor}18`;

  const content = (
    <>
      <View style={[styles.iconBox, { backgroundColor: resolvedIconBg }]}>
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={resolvedIconColor}
        />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        {description ? (
          <Text style={styles.description}>{description}</Text>
        ) : null}
      </View>
      {trailing}
      {onValueChange != null && value != null ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#E2E8F0', true: colors.LIGHT_PRIMARY }}
          thumbColor={value ? colors.PRIMARY_COLOR : '#f4f4f5'}
        />
      ) : null}
      {showChevron ? (
        <MaterialCommunityIcons
          name="chevron-right"
          size={22}
          color="#94A3B8"
        />
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.75}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.row}>{content}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textWrap: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  description: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
});
