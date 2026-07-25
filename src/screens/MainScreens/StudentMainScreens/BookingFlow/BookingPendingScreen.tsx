import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import useUi from '../../../../hooks/ui/useUi';
import CustomButton from '../../../../components/CustomButton';
import { bookingFlowService } from '../../../../services/bookings/bookingFlowService';
import { BookingFlowItem } from '../../../../types/bookingFlow.types';

const STATUS_COPY: Record<
  string,
  { title: string; subtitle: string; color: string; bg: string }
> = {
  pending: {
    title: 'Booking Pending',
    subtitle: 'Waiting for tutor response',
    color: '#B45309',
    bg: '#FEF3C7',
  },
  accepted: {
    title: 'Booking Accepted',
    subtitle: 'Your session is confirmed',
    color: '#047857',
    bg: '#D1FAE5',
  },
  rejected: {
    title: 'Booking Rejected',
    subtitle: 'Tutor declined this request',
    color: '#B91C1C',
    bg: '#FEE2E2',
  },
  cancelled: {
    title: 'Booking Cancelled',
    subtitle: 'This request was cancelled',
    color: '#475569',
    bg: '#E2E8F0',
  },
  completed: {
    title: 'Session Completed',
    subtitle: 'Thanks for learning with TutorLink',
    color: '#5B21B6',
    bg: '#EDE9FE',
  },
  unavailable: {
    title: 'Tutor Unavailable',
    subtitle: 'Please pick another time slot',
    color: '#B45309',
    bg: '#FFEDD5',
  },
};

const BookingPendingScreen = () => {
  const { colors } = useUi();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const bookingId = route.params?.bookingId as string;

  const [booking, setBooking] = useState<BookingFlowItem | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const item = await bookingFlowService.getBooking(bookingId);
      setBooking(item);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  if (loading || !booking) {
    return (
      <SafeAreaView style={styles.screen}>
        <ActivityIndicator style={{ marginTop: 40 }} color="#7548F5" />
      </SafeAreaView>
    );
  }

  const copy = STATUS_COPY[booking.status] || STATUS_COPY.pending;

  const cancel = () => {
    Alert.alert('Cancel request?', 'You can book another slot anytime.', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Cancel booking',
        style: 'destructive',
        onPress: async () => {
          await bookingFlowService.updateBookingStatus(booking.id, 'cancelled');
          await load();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <LinearGradient colors={['#EEF2FF', '#F8FAFC']} style={styles.hero}>
        <View style={[styles.badge, { backgroundColor: copy.bg }]}>
          <Text style={[styles.badgeText, { color: copy.color }]}>{copy.title}</Text>
        </View>
        <Text style={styles.subtitle}>{copy.subtitle}</Text>
        {booking.status === 'pending' ? (
          <Text style={styles.eta}>
            Estimated response · ~{booking.estimatedResponseMinutes} min
          </Text>
        ) : null}
      </LinearGradient>

      <View style={styles.card}>
        <Image source={{ uri: booking.tutor.avatarUrl }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{booking.tutor.name}</Text>
          <Text style={styles.meta}>
            {booking.subject} · {booking.date}
          </Text>
          <Text style={styles.meta}>
            {booking.startTime}–{booking.endTime} · PKR{' '}
            {booking.totalCost.toLocaleString()}
          </Text>
        </View>
      </View>

      <View style={styles.timeline}>
        {[
          'Request sent',
          'Waiting for tutor',
          booking.status === 'accepted'
            ? 'Accepted'
            : booking.status === 'rejected'
              ? 'Rejected'
              : booking.status === 'cancelled'
                ? 'Cancelled'
                : 'Session day',
        ].map((step, index) => (
          <View key={step} style={styles.timelineRow}>
            <View
              style={[
                styles.dot,
                index === 0 ||
                (index === 1 && booking.status === 'pending') ||
                (index === 2 && booking.status !== 'pending')
                  ? styles.dotActive
                  : null,
              ]}
            />
            <Text style={styles.timelineText}>{step}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        {booking.status === 'pending' ? (
          <CustomButton
            title="Cancel request"
            onPress={cancel}
            backgroundColor="#FEE2E2"
            textColor="#B91C1C"
          />
        ) : null}
        {booking.status === 'completed' ? (
          <CustomButton
            title="Rate this session"
            onPress={() =>
              navigation.navigate('BookingReviewScreen', { bookingId: booking.id })
            }
          />
        ) : null}
        {booking.status === 'accepted' ? (
          <CustomButton
            title="View in Bookings"
            onPress={() =>
              navigation.navigate('MyTabs', { screen: 'Bookings' })
            }
          />
        ) : null}
        <CustomButton
          title="Back to Home"
          onPress={() => navigation.navigate('MyTabs', { screen: 'Home' })}
          backgroundColor="#EDE9FE"
          textColor="#7548F5"
        />
      </View>
    </SafeAreaView>
  );
};

export default BookingPendingScreen;

const createStyles = (_colors: Record<string, unknown>) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#F8FAFC' },
    hero: { padding: 24, paddingTop: 40, alignItems: 'center' },
    badge: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      marginBottom: 12,
    },
    badgeText: { fontWeight: '800', fontSize: 14 },
    subtitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
    eta: { marginTop: 8, color: '#64748B', fontSize: 13 },
    card: {
      marginHorizontal: 16,
      backgroundColor: '#fff',
      borderRadius: 18,
      padding: 14,
      flexDirection: 'row',
      gap: 12,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      alignItems: 'center',
    },
    avatar: { width: 56, height: 56, borderRadius: 16 },
    name: { fontWeight: '800', fontSize: 16, color: '#0F172A' },
    meta: { color: '#64748B', fontSize: 12, marginTop: 2 },
    timeline: { margin: 16, backgroundColor: '#fff', borderRadius: 18, padding: 16 },
    timelineRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    dot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: '#E2E8F0',
    },
    dotActive: { backgroundColor: '#7548F5' },
    timelineText: { color: '#334155', fontWeight: '600' },
    actions: { padding: 16, gap: 10 },
  });
