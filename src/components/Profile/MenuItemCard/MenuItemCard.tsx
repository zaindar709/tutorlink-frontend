import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Icon } from 'react-native-paper';
import { GLASS, glassTypography } from '../../../theme/glass';

type Props = {
  title: string;
  description?: string;
  icon: string;
  onPress: () => void;
  iconColor?: string;
  /** Row inside a section panel (no outer card). */
  embedded?: boolean;
  /** Hide bottom divider (last row in a section). */
  isLast?: boolean;
};

export default function MenuItemCard({
  title,
  description,
  icon,
  onPress,
  iconColor = GLASS.primary,
  embedded = false,
  isLast = false,
}: Props) {
  return (
    <TouchableOpacity
      style={[
        embedded ? styles.row : styles.card,
        embedded && !isLast && styles.rowDivider,
      ]}
      onPress={onPress}
      activeOpacity={0.72}
    >
      <View style={styles.left}>
        <View style={[styles.iconBox, { backgroundColor: `${iconColor}16` }]}>
          <Icon source={icon} size={20} color={iconColor} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {description ? (
            <Text style={styles.description} numberOfLines={1}>
              {description}
            </Text>
          ) : null}
        </View>
      </View>

      <Icon source="chevron-right" size={20} color={GLASS.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    minHeight: 68,
    alignSelf: 'center',
    backgroundColor: 'rgba(117, 72, 245, 0.05)',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: GLASS.radius.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(117, 72, 245, 0.14)',
  },
  row: {
    minHeight: 66,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(117, 72, 245, 0.12)',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...glassTypography.body,
    fontWeight: '700',
    color: GLASS.textPrimary,
  },
  description: {
    ...glassTypography.caption,
    marginTop: 2,
    color: GLASS.textSecondary,
  },
});
