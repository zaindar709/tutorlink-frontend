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
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import useUi from '../../../../hooks/ui/useUi';
import CustomButton from '../../../../components/CustomButton';
import { GlassScreen, GlassCard } from '../../../../components/Glass';
import { GLASS } from '../../../../theme/glass';
import { bookingFlowService } from '../../../../services/bookings/bookingFlowService';
import { BookingFlowItem } from '../../../../types/bookingFlow.types';

const STATUS_COPY: Record<
  string,
  { title: string; subtitle: string; color: string; bg: string }
> = {
  pending: {
    title: 'Booking Pending',
    subtitle: 'Waiting for tutor response',
    color: GLASS.warning,
    bg: 'rgba(245, 158, 11, 0.15)',
  },
  accepted: {
    title: 'Booking Accepted',
    subtitle: 'Your session is confirmed',
    color: GLASS.success,
    bg: 'rgba(34, 197, 94, 0.15)',
  },
  rejected: {
    title: 'Booking Rejected',
    subtitle: 'Tutor declined this request',
    color: GLASS.error,
    bg: 'rgba(239, 68, 68, 0.12)',
  },
  cancelled: {
    title: 'Booking Cancelled',
    subtitle: 'This request was cancelled',
    color: GLASS.textSecondary,
    bg: GLASS.cardBg,
  },
  completed: {
    title: 'Session Completed',
    subtitle: 'Thanks for learning with TutorLink',
    color: GLASS.primaryDeep,
    bg: GLASS.primarySoft,
  },
  unavailable: {
    title: 'Tutor Unavailable',
    subtitle: 'Please pick another time slot',
    color: GLASS.warning,
    bg: 'rgba(245, 158, 11, 0.12)',
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
      <GlassScreen
        scroll={false}
        contentStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <ActivityIndicator color={GLASS.primary} />
      </GlassScreen>
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
    <GlassScreen scroll={false} contentStyle={styles.screen}>
      <LinearGradient colors={[...GLASS.screenGradient]} style={styles.hero}>
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

      <GlassCard style={styles.card}>
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
      </GlassCard>

      <GlassCard style={styles.timeline}>
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
      </GlassCard>

      <View style={styles.actions}>
        {booking.status === 'pending' ? (
          <CustomButton
            title="Cancel request"
            onPress={cancel}
            backgroundColor="rgba(239, 68, 68, 0.12)"
            textColor={GLASS.error}
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
          backgroundColor={GLASS.primarySoft}
          textColor={GLASS.primary}
        />
      </View>
    </GlassScreen>
  );
};

export default BookingPendingScreen;

const createStyles = (_colors: Record<string, unknown>) =>
  StyleSheet.create({
    screen: { flex: 1 },
    hero: {
      padding: GLASS.space.xxl,
      paddingTop: GLASS.space.xxxl,
      alignItems: 'center',
      borderRadius: GLASS.radius.xl,
      marginBottom: GLASS.space.md,
    },
    badge: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: GLASS.radius.full,
      marginBottom: GLASS.space.md,
    },
    badgeText: { fontWeight: '800', fontSize: 14 },
    subtitle: { fontSize: 16, fontWeight: '700', color: GLASS.textPrimary },
    eta: { marginTop: 8, color: GLASS.textSecondary, fontSize: 13 },
    card: {
      flexDirection: 'row',
      gap: GLASS.space.md,
      alignItems: 'center',
      marginBottom: GLASS.space.md,
    },
    avatar: { width: 56, height: 56, borderRadius: GLASS.radius.lg },
    name: { fontWeight: '800', fontSize: 16, color: GLASS.textPrimary },
    meta: { color: GLASS.textSecondary, fontSize: 12, marginTop: 2 },
    timeline: { marginBottom: GLASS.space.md },
    timelineRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: GLASS.space.md,
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: GLASS.inputBorder,
    },
    dotActive: { backgroundColor: GLASS.primary },
    timelineText: { color: GLASS.textPrimary, fontWeight: '600' },
    actions: { gap: 10 },
  });
