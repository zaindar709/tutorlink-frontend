import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import useUi from '../../hooks/ui/useUi';

type TrendDataPoint = {
  label: string;
  value: number;
};

type TrendChartProps = {
  data: TrendDataPoint[];
};

const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  const { resp } = useUi();

  const maxValue = Math.max(...data.map(item => item.value), 1);

  const chartWidth = resp.dx(280);
  const chartHeight = resp.dy(170);

  const pointSpacing = chartWidth / Math.max(data.length - 1, 1);

  const points = data.map((point, index) => {
    const x = index * pointSpacing;

    const y =
      chartHeight -
      (point.value / maxValue) * (chartHeight - 40) -
      20;

    return {
      ...point,
      x,
      y,
    };
  });

  const getLineStyle = (from: any, to: any) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    const length = Math.sqrt(dx * dx + dy * dy);

    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

    return {
      position: 'absolute' as const,
      left: from.x,
      top: from.y,
      width: length,
      height: 3,
      backgroundColor: '#3B82F6',
      transform: [{ rotate: `${angle}deg` }],
      borderRadius: 10,
    };
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons
            name="trending-up"
            size={20}
            color="#2563EB"
          />

          <Text style={styles.title}>
            Monthly Earnings Trend
          </Text>
        </View>
      </View>

      {/* Chart */}
      <View style={styles.chartWrapper}>
        {/* Y Axis */}
        <View style={styles.yAxis}>
          <Text style={styles.yLabel}>
            {Math.round(maxValue / 1000)}k
          </Text>

          <Text style={styles.yLabel}>
            {Math.round(maxValue * 0.75 / 1000)}k
          </Text>

          <Text style={styles.yLabel}>
            {Math.round(maxValue * 0.5 / 1000)}k
          </Text>

          <Text style={styles.yLabel}>
            {Math.round(maxValue * 0.25 / 1000)}k
          </Text>

          <Text style={styles.yLabel}>0k</Text>
        </View>

        {/* Graph Area */}
        <View
          style={[
            styles.chartArea,
            {
              height: chartHeight,
            },
          ]}
        >
          {/* Grid Lines */}
          {[1, 2, 3, 4].map(item => (
            <View
              key={item}
              style={[
                styles.gridLine,
                {
                  top: (chartHeight / 4) * item,
                },
              ]}
            />
          ))}

          {/* Line */}
          {points.slice(1).map((point, index) => (
            <View
              key={index}
              style={getLineStyle(
                points[index],
                points[index + 1],
              )}
            />
          ))}

          {/* Dots */}
          {points.map(point => (
            <View
              key={point.label}
              style={[
                styles.dot,
                {
                  left: point.x - 5,
                  top: point.y - 5,
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* X Axis */}
      <View style={styles.labelsRow}>
        {points.map(point => (
          <Text
            key={point.label}
            style={styles.xLabel}
          >
            {point.label}
          </Text>
        ))}
      </View>
    </View>
  );
};

export default TrendChart;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',

    borderRadius: 20,
    padding: 16,

    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.08)',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },

  header: {
    marginBottom: 20,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    width: 35,
    justifyContent: 'space-between',
    marginRight: 10,
  },

  yLabel: {
    color: '#6B7280',
    fontSize: 11,
  },

  chartArea: {
    flex: 1,
    position: 'relative',
  },

  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
  },

  dot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,

    backgroundColor: '#3B82F6',

    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 45,
    marginTop: 14,
  },

  xLabel: {
    color: '#6B7280',
    fontSize: 11,
  },
});