import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import useUi from '../../../../../../hooks/ui/useUi';
import EarningHeader from '../../../../../../components/EarningHeader';
import AnalyticsStatCard from '../../../../../../components/EarningAnalytics/AnalyticsStatCard';
import TrendChart from '../../../../../../components/EarningAnalytics/TrendChart';
import SubjectDonutChart from '../../../../../../components/EarningAnalytics/SubjectDonutChart';
import PeakHoursChart from '../../../../../../components/EarningAnalytics/PeakHoursChart';
import { useNavigation } from '@react-navigation/native';

const statCards = [
  {
    id: 'avg',
    icon: 'currency-inr',
    value: 'Rs. 2,000',
    label: 'Average per Session',
    accentColor: '#69c79b',
    trend: '+12%',
  },
  {
    id: 'students',
    icon: 'account-group-outline',
    value: '48',
    label: 'Total Students',
    accentColor: '#89a4fa',
    trend: '+8%',
  },
  {
    id: 'hours',
    icon: 'clock-outline',
    value: '342 hrs',
    label: 'Teaching Hours',
    accentColor: '#fdbae0',
    trend: '+24',
  },
  {
    id: 'completion',
    icon: 'chart-bubble',
    value: '96%',
    label: 'Completion Rate',
    accentColor: '#f5eb7f',
    trend: '+3%',
  },
];

const monthlyData = [
  { label: 'Jan', value: 12000 },
  { label: 'Feb', value: 18000 },
  { label: 'Mar', value: 22000 },
  { label: 'Apr', value: 26000 },
  { label: 'May', value: 34000 },
  { label: 'Jun', value: 42000 },
];

const subjectData = [
  { label: 'Mathematics', value: '45%', color: '#2563EB' },
  { label: 'Physics', value: '35%', color: '#A855F7' },
  { label: 'Chemistry', value: '20%', color: '#06B6D4' },
];

const peakHours = [
  { label: '9 AM', value: 2 },
  { label: '12 PM', value: 4 },
  { label: '2 PM', value: 5 },
  { label: '4 PM', value: 7 },
  { label: '6 PM', value: 5 },
  { label: '8 PM', value: 4 },
];

const filters = ['Week', 'Month', 'Year'];

const EarningAnalyticsScreen = () => {
  const { colors } = useUi();
  const [activeFilter, setActiveFilter] = useState('Month');
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={[styles.container]}>
      <EarningHeader
        navigation={navigation}
        title="Earnings Analytics"
        subtitle="Detailed performance insights"
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.filterRow}>
          {filters.map(filter => {
            const isActive = filter === activeFilter;
            return (
              <TouchableOpacity
                key={filter}
                onPress={() => setActiveFilter(filter)}
                activeOpacity={0.8}
                style={[
                  styles.filterButton,
                  {
                    backgroundColor: isActive
                      ? colors.PRIMARY_COLOR
                      : colors.WHITE_COLOR,
                    borderColor: isActive
                      ? colors.PRIMARY_COLOR
                      : colors.GRAY_COLOR,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color: isActive
                        ? colors.WHITE_COLOR
                        : colors.SECONDARY_COLOR,
                    },
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.statsGrid}>
          {statCards.map(card => (
            <AnalyticsStatCard
              key={card.id}
              icon={card.icon}
              value={card.value}
              label={card.label}
              accentColor={card.accentColor}
              trend={card.trend}
            />
          ))}
        </View>

        <TrendChart data={monthlyData} />

        <View style={styles.bottomCharts}>
          <SubjectDonutChart title="Earnings by Subject" data={subjectData} />
          <PeakHoursChart data={peakHours} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EarningAnalyticsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 18,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 4,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  bottomCharts: {
    gap: 18,
  },
});
