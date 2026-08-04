import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GlassScreen } from '../../../../components/Glass';
import { GLASS } from '../../../../theme/glass';
import useUi from '../../../../hooks/ui/useUi';
import Header from '../../../../components/Tutor/DashBoard/DashBoardHeader';
import BalanceCard from '../../../../components/Tutor/DashBoard/BalanceCard';
import StatCard from '../../../../components/Tutor/DashBoard/StatCard';
import { BookingRequestCard } from '../../../../components/Tutor/DashBoard/BookingCard';
import { TodaySessionCard } from '../../../../components/Tutor/DashBoard/TodaySession';
import { useBookings } from '../../../../hooks/api/useBookings';
import { useWallet } from '../../../../hooks/api/useWallet';
import {
  getBookingParticipantAvatar,
  getBookingParticipantName,
} from '../../../../utils/api/bookingHelpers';

export default function DashboardScreen() {
  const { colors, resp } = useUi();
  const navigation = useNavigation<any>();
  const { balance } = useWallet();
  const pendingBookings = useBookings('pending');
  const activeBookings = useBookings('active');

  const statsData = useMemo(
    () => [
      {
        id: '1',
        title: 'Sessions',
        value: String(activeBookings.bookings.length),
        icon: 'calendar-month-outline',
        bg: '#EEF2FF',
        iconColor: '#3B82F6',
      },
      {
        id: '2',
        title: 'Requests',
        value: String(pendingBookings.bookings.length),
        icon: 'account-outline',
        bg: '#FFF7ED',
        iconColor: '#F59E0B',
      },
      {
        id: '3',
        title: 'Escrow',
        value: `Rs. ${(balance?.escrowBalance ?? 0).toLocaleString()}`,
        icon: 'currency-usd',
        bg: '#ECFDF3',
        iconColor: '#16A34A',
      },
    ],
    [
      activeBookings.bookings.length,
      pendingBookings.bookings.length,
      balance?.escrowBalance,
    ]
  );

  const bookingRequests = pendingBookings.bookings.map(booking => ({
    id: booking._id,
    name: getBookingParticipantName(booking, 'tutor'),
    time: booking.startTime,
    subject: booking.subject,
    grade: booking.status,
  }));

  const todaySessions = activeBookings.bookings.map(booking => ({
    id: booking._id,
    name: getBookingParticipantName(booking, 'tutor'),
    avatar: getBookingParticipantAvatar(booking),
    subject: booking.subject,
    time: booking.startTime,
    duration: `${booking.startTime} - ${booking.endTime}`,
    meetingLink: booking.meetingLink,
  }));

  const screenStyles = styles(colors, resp);

  return (
    <GlassScreen scroll={false} edges={['bottom']}>
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        contentContainerStyle={screenStyles.contentContainer}
      >
        <BalanceCard
          colors={colors}
          resp={resp}
          balance={balance?.totalBalance ?? 0}
        />
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

        <View style={screenStyles.sectionHeader}>
          <Text style={screenStyles.sectionTitle}>New Booking Requests</Text>
          <View style={screenStyles.badge}>
            <Text style={screenStyles.badgeText}>
              {pendingBookings.bookings.length}
            </Text>
          </View>
        </View>

        {pendingBookings.loading ? (
          <ActivityIndicator />
        ) : (
          <FlatList
            data={bookingRequests}
            keyExtractor={item => item.id}
            ListEmptyComponent={
              <Text style={screenStyles.emptyText}>No pending requests.</Text>
            }
            renderItem={({ item }) => (
              <BookingRequestCard
                item={item}
                colors={colors}
                resp={resp}
                onAccept={() =>
                  pendingBookings.confirmBooking(item.id, {
                    meetingLink: 'https://meet.google.com/new',
                  })
                }
                onDecline={() => pendingBookings.cancelBooking(item.id)}
              />
            )}
          />
        )}

        <View style={screenStyles.sectionHeader}>
          <Text style={screenStyles.sectionTitle}>Today's Sessions</Text>
        </View>

        {activeBookings.loading ? (
          <ActivityIndicator />
        ) : (
          <FlatList
            data={todaySessions}
            scrollEnabled={false}
            keyExtractor={item => item.id}
            ListEmptyComponent={
              <Text style={screenStyles.emptyText}>No sessions today.</Text>
            }
            renderItem={({ item }) => (
              <TodaySessionCard
                item={item}
                colors={colors}
                resp={resp}
                onMessage={() =>
                  navigation.navigate('HomeNavigator', {
                    screen: 'ChatScreen',
                    params: {
                      bookingId: item.id,
                      peerName: item.name,
                      peerAvatar: item.avatar,
                      subject: item.subject,
                    },
                  })
                }
                onStartClassroom={() => {
                  // meeting join handled elsewhere when link available
                }}
              />
            )}
          />
        )}
      </ScrollView>
    </GlassScreen>
  );
}

const styles = (_colors: any, resp: any) =>
  StyleSheet.create({
    contentContainer: {
      paddingHorizontal: resp.dx(GLASS.space.lg),
      paddingBottom: resp.dy(30),
    },
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
      color: GLASS.textPrimary,
    },
    badge: {
      minWidth: resp.dx(24),
      height: resp.dy(24),
      borderRadius: resp.dx(12),
      backgroundColor: GLASS.error,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: resp.dx(6),
    },
    badgeText: {
      color: GLASS.textOnPrimary,
      fontSize: resp.df(11),
      fontWeight: '700',
    },
    emptyText: {
      color: GLASS.textSecondary,
      marginBottom: resp.dy(12),
    },
  });
