import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { GLASS, glassTypography } from '../../theme/glass';

type Props = {
  title: string;
  subtitle?: string;
  left?: ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  last?: boolean;
};

const GlassListItem = ({
  title,
  subtitle,
  left,
  onPress,
  showChevron = true,
  last,
}: Props) => {
  const content = (
    <View style={[styles.row, !last && styles.separator]}>
      {left ? <View style={styles.left}>{left}</View> : null}
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {showChevron ? (
        <MaterialCommunityIcons
          name="chevron-right"
          size={22}
          color={GLASS.textMuted}
        />
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  separator: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: GLASS.cardBorder,
  },
  left: { marginRight: 12 },
  text: { flex: 1 },
  title: { ...glassTypography.body, fontWeight: '600' },
  subtitle: { ...glassTypography.caption, marginTop: 2 },
});

export default GlassListItem;
