import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { GLASS, glassTypography } from '../../theme/glass';

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
  style?: ViewStyle;
};

const GlassHeader = ({ title, subtitle, onBack, right, style }: Props) => (
  <View style={[styles.wrap, style]}>
    <View style={styles.row}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={10}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={22}
            color={GLASS.textPrimary}
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.backBtn} />
      )}
      <View style={styles.center}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.right}>{right}</View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: GLASS.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: GLASS.cardBorder,
    paddingHorizontal: GLASS.space.md,
    paddingVertical: GLASS.space.md,
    borderBottomLeftRadius: GLASS.radius.lg,
    borderBottomRightRadius: GLASS.radius.lg,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 36, alignItems: 'flex-start' },
  center: { flex: 1, alignItems: 'center' },
  title: { ...glassTypography.h3, fontSize: 17 },
  subtitle: { ...glassTypography.caption, marginTop: 2 },
  right: { width: 36, alignItems: 'flex-end' },
});

export default GlassHeader;
