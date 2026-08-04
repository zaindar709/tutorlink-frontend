import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import useUi from '../../hooks/ui/useUi';
import { GLASS } from '../../theme/glass';

type SubjectItem = {
  label: string;
  value: string;
  color: string;
};

type SubjectDonutChartProps = {
  data: SubjectItem[];
  title: string;
};

const SubjectDonutChart: React.FC<SubjectDonutChartProps> = ({ data, title }) => {
  const { colors, resp } = useUi();

  return (
    <View style={[styles.card, { backgroundColor: GLASS.cardBg, borderColor: GLASS.cardBorder, shadowColor: colors.BLACK_COLOR }]}> 
      <Text style={[styles.title, { color: colors.BLACK_COLOR }]}>{title}</Text>
      <View style={styles.chartRow}>
        <View style={styles.donutWrapper}>
          <View style={styles.donutBase} />
          {data.map((item, index) => (
            <View
              key={item.label}
              style={[
                styles.arc,
                {
                  borderTopColor: item.color,
                  transform: [{ rotate: `${index * 120 - 30}deg` }],
                },
              ]}
            />
          ))}
          <View style={[styles.donutCenter, { backgroundColor: GLASS.cardBgStrong }]} />
        </View>

        <View style={styles.legendColumn}>
          {data.map(item => (
            <View key={item.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <View>
                <Text style={[styles.legendLabel, { color: colors.BLACK_COLOR }]}>{item.label}</Text>
                <Text style={[styles.legendValue, { color: colors.SECONDARY_COLOR }]}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default SubjectDonutChart;

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  donutWrapper: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutBase: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 999,
    borderWidth: 16,
    borderColor: '#E5E7EB',
  },
  arc: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 999,
    borderWidth: 16,
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  donutCenter: {
    width: 70,
    height: 70,
    borderRadius: 999,
  },
  legendColumn: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    marginRight: 10,
  },
  legendLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  legendValue: {
    fontSize: 13,
  },
});