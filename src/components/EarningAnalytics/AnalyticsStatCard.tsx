import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import useUi from '../../hooks/ui/useUi';
import { GLASS } from '../../theme/glass';

type AnalyticsStatCardProps = {
  icon: string;
  value: string;
  label: string;
  accentColor: string;
  trend: string;
};

const AnalyticsStatCard: React.FC<AnalyticsStatCardProps> = ({
  icon,
  value,
  label,
  accentColor,
  trend,
}) => {
  const { colors, resp } = useUi();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: GLASS.cardBg,
          borderColor: GLASS.cardBorder,
          shadowColor: colors.BLACK_COLOR,
        },
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: accentColor }]}>
        <MaterialCommunityIcons name={icon} size={resp.df(20)} color="#fff" />
      </View>
      <Text style={[styles.value, { color: colors.BLACK_COLOR }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.SECONDARY_COLOR }]}>{label}</Text>
      <Text
        style={[styles.trend, { color: trend.startsWith('+') ? '#16A34A' : '#DC2626' }]}
      >
        {trend}
      </Text>
    </View>
  );
};

export default AnalyticsStatCard;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 22,
    padding: 18,
    minWidth: 150,
    borderWidth: 1,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 6,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
  },
  label: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
  },
  trend: {
    marginTop: 14,
    fontSize: 12,
    fontWeight: '700',
  },
});
