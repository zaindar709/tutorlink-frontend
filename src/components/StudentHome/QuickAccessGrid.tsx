import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { GLASS } from '../../theme/glass';

export type QuickAccessTone = 'orange' | 'purple' | 'green' | 'blue';

type Tile = {
  key: string;
  title: string;
  subtitle: string;
  icon: string;
  tone: QuickAccessTone;
  onPress: () => void;
};

type Props = {
  tiles: Tile[];
};

const TONE: Record<
  QuickAccessTone,
  { bg: string; iconBg: string; icon: string; sub: string }
> = {
  orange: {
    bg: 'rgba(255, 237, 213, 0.95)',
    iconBg: '#F97316',
    icon: '#fff',
    sub: '#C2410C',
  },
  purple: {
    bg: 'rgba(237, 233, 254, 0.95)',
    iconBg: GLASS.primary,
    icon: '#fff',
    sub: GLASS.primaryDeep,
  },
  green: {
    bg: 'rgba(220, 252, 231, 0.95)',
    iconBg: '#16A34A',
    icon: '#fff',
    sub: '#15803D',
  },
  blue: {
    bg: 'rgba(219, 234, 254, 0.95)',
    iconBg: '#2563EB',
    icon: '#fff',
    sub: '#1D4ED8',
  },
};

const QuickAccessGrid: React.FC<Props> = ({ tiles }) => (
  <View style={styles.grid}>
    {tiles.map(tile => {
      const tone = TONE[tile.tone];
      return (
        <TouchableOpacity
          key={tile.key}
          style={[styles.tile, { backgroundColor: tone.bg }]}
          activeOpacity={0.88}
          onPress={tile.onPress}
        >
          <View style={[styles.iconBox, { backgroundColor: tone.iconBg }]}>
            <MaterialCommunityIcons
              name={tile.icon as never}
              size={20}
              color={tone.icon}
            />
          </View>
          <Text style={styles.title}>{tile.title}</Text>
          <Text style={[styles.subtitle, { color: tone.sub }]}>
            {tile.subtitle}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  tile: {
    width: '48%',
    borderRadius: GLASS.radius.xl,
    padding: 14,
    minHeight: 118,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    color: GLASS.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '700',
  },
});

export default QuickAccessGrid;
