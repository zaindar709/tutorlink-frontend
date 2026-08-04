import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { GLASS } from '../../theme/glass';

type PeakHourPoint = {
  label: string;
  value: number;
};

type PeakHoursChartProps = {
  data: PeakHourPoint[];
};

const PeakHoursChart: React.FC<PeakHoursChartProps> = ({ data }) => {
  const maxValue = Math.max(...data.map(item => item.value), 1);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="clock-outline"
          size={20}
          color="#D97706"
        />

        <Text style={styles.title}>
          Peak Teaching Hours
        </Text>
      </View>

      <View style={styles.chartWrapper}>
        {/* Y Axis */}
        <View style={styles.yAxis}>
          <Text style={styles.yLabel}>{maxValue}</Text>
          <Text style={styles.yLabel}>
            {Math.round(maxValue * 0.75)}
          </Text>
          <Text style={styles.yLabel}>
            {Math.round(maxValue * 0.5)}
          </Text>
          <Text style={styles.yLabel}>
            {Math.round(maxValue * 0.25)}
          </Text>
          <Text style={styles.yLabel}>0</Text>
        </View>

        {/* Chart */}
        <View style={styles.chartArea}>
          {[1, 2, 3, 4].map(item => (
            <View
              key={item}
              style={[
                styles.gridLine,
                {
                  top: `${item * 25}%`,
                },
              ]}
            />
          ))}

          <View style={styles.barsContainer}>
            {data.map(item => {
              const height =
                (item.value / maxValue) * 100;

              return (
                <View
                  key={item.label}
                  style={styles.barColumn}
                >
                  <Text style={styles.valueLabel}>
                    {item.value}
                  </Text>

                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${Math.max(
                          height,
                          10,
                        )}%`,
                      },
                    ]}
                  />

                  <Text style={styles.barLabel}>
                    {item.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
};

export default PeakHoursChart;

const styles = StyleSheet.create({
  card: {
    backgroundColor: GLASS.cardBg,
    borderRadius: 20,
    padding: 16,

    borderWidth: 1,
    borderColor: '#E5E7EB',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  title: {
    marginLeft: 8,
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },

  chartWrapper: {
    flexDirection: 'row',
  },

  yAxis: {
    width: 30,
    height: 180,
    justifyContent: 'space-between',
    marginRight: 10,
  },

  yLabel: {
    fontSize: 11,
    color: '#6B7280',
  },

  chartArea: {
    flex: 1,
    height: 180,
    position: 'relative',
  },

  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
  },

  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: '100%',
  },

  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 4,
  },

  valueLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 6,
  },

  bar: {
    width: 24,
    backgroundColor: '#F59E0B',

    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },

  barLabel: {
    marginTop: 10,
    fontSize: 11,
    color: '#6B7280',
  },
});