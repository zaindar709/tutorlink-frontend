// TutorDashboardScreen.tsx

import React from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native';
import { Icon } from 'react-native-paper';
import useUi from '../../../../hooks/ui/useUi';
import Header from '../../../../components/Tutor/DashBoard/DashBoardHeader';
import BalanceCard from '../../../../components/Tutor/DashBoard/BalanceCard';
import StatCard from '../../../../components/Tutor/DashBoard/StatCard';
import { BookingRequestCard } from '../../../../components/Tutor/DashBoard/BookingCard';
import { TodaySessionCard } from '../../../../components/Tutor/DashBoard/TodaySession';

const statsData = [
  {
    id: '1',
    title: 'Sessions',
    value: '12',
    icon: 'calendar-month-outline',
    bg: '#EEF2FF',
    iconColor: '#3B82F6',
  },
  {
    id: '2',
    title: 'Students',
    value: '8',
    icon: 'account-outline',
    bg: '#FFF7ED',
    iconColor: '#F59E0B',
  },
  {
    id: '3',
    title: 'Rating',
    value: '4.9',
    icon: 'currency-usd',
    bg: '#ECFDF3',
    iconColor: '#16A34A',
  },
];

const bookingRequests = [
  {
    id: '1',
    name: 'Sarah Ahmed',
    time: '2 hours ago',
    subject: 'Mathematics',
    grade: 'Grade 10',
  },
  {
    id: '2',
    name: 'Hassan Khan',
    time: '5 hours ago',
    subject: 'Physics',
    grade: 'O-Levels',
  },
];
const todaySessions = [
  {
    id: '1',
    name: 'Ahmed Raza',
    subject: 'Mathematics',
    time: '4:00 PM',
    duration: '60 min',
  },
  {
    id: '2',
    name: 'Zainab Hassan',
    subject: 'Physics',
    time: '5:30 PM',
    duration: '90 min',
  },
  {
    id: '3',
    name: 'Ali Hamza',
    subject: 'Chemistry',
    time: '7:00 PM',
    duration: '60 min',
  },
];

export default function DashboardScreen() {
  const { colors, resp } = useUi();

  return (
    <View style={styles(colors, resp).container}>
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        contentContainerStyle={styles(colors, resp).contentContainer}
      >
        <BalanceCard colors={colors} resp={resp} />
        <View style={{ alignSelf: 'center', flex: 1 }}>
          <FlatList
            data={statsData}
            horizontal
            scrollEnabled={false}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <StatCard item={item} colors={colors} resp={resp} />
            )}
          />
        </View>

        <View style={styles(colors, resp).sectionHeader}>
          <Text style={styles(colors, resp).sectionTitle}>
            New Booking Requests
          </Text>

          <View style={styles(colors, resp).badge}>
            <Text style={styles(colors, resp).badgeText}>3</Text>
          </View>
        </View>

        <FlatList
          data={bookingRequests}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <BookingRequestCard item={item} colors={colors} resp={resp} />
          )}
        />
        <View style={styles(colors, resp).sectionHeader}>
          <Text style={styles(colors, resp).sectionTitle}>
            Today's Sessions
          </Text>
        </View>

        <FlatList
          data={todaySessions}
          scrollEnabled={false}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TodaySessionCard item={item} colors={colors} resp={resp} />
          )}
        />
      </ScrollView>
    </View>
  );
}

const styles = (colors: any, resp: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F8FAFC',
    },

    contentContainer: {
      paddingHorizontal: resp.dx(16),
      paddingBottom: resp.dy(30),
    },
    // SECTION

    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: resp.dy(28),
      marginBottom: resp.dx(14),
    },

    sectionTitle: {
      fontSize: resp.df(20),
      fontWeight: '700',
      color: '#111827',
    },

    badge: {
      minWidth: resp.dx(24),
      height: resp.dy(24),
      borderRadius: resp.dx(12),
      backgroundColor: '#EF4444',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: resp.dx(6),
    },

    badgeText: {
      color: '#fff',
      fontSize: resp.df(11),
      fontWeight: '700',
    },
  });
