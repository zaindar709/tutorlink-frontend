import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { GlassScreen } from '../../../../components/Glass';
import { GLASS } from '../../../../theme/glass';
import { usePendingBookingRequests } from '../../../../hooks/api/usePendingBookingRequests';
import { useBookings } from '../../../../hooks/api/useBookings';
import {
  getBookingStudentAvatar,
  getBookingStudentName,
} from '../../../../utils/api/bookingHelpers';
import { navigateHomeStack } from '../../../../navigation/navigationRef';
import { getSessionAmount } from '../../../../utils/bookings/bookingStatus';
import { getBookingErrorMessage } from '../../../../utils/bookings/bookingErrors';
import { Booking } from '../../../../types/api.types';
import {
  estimateWeekdaySessionCount,
  getBookingDurationDays,
  isMonthlyWeekdaysBooking,
} from '../../../../utils/bookings/packageHelpers';

/**
 * Tutor Requests tab — live pending bookings only (no demo/mock cards).
 */
const TutorRequestsScreen = () => {
  const {
    bookings,
    loading,
    refreshing,
    error,
    refresh,
  } = usePendingBookingRequests();

  const {
    cancelBooking,
    actionLoading,
    error: actionError,
  } = useBookings('pending');

  const openDetails = useCallback((bookingId: string) => {
    navigateHomeStack('TutorBookingRequestDetailsScreen', { bookingId });
  }, []);

  const onAccept = async (item: Booking) => {
    // Open details so tutor can optionally add meeting link before confirm.
    openDetails(item._id);
  };

  const onDecline = (item: Booking) => {
    const studentName = getBookingStudentName(item);
    Alert.alert(
      'Decline request?',
      `${studentName}'s ${item.subject} request will be cancelled.`,
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await cancelBooking(item._id);
              if (result) {
                Alert.alert('Declined', 'Student will be notified.');
                void refresh();
              } else {
                Alert.alert(
                  'Could not decline',
                  actionError || 'Please try again.'
                );
              }
            } catch (err) {
              Alert.alert('Could not decline', getBookingErrorMessage(err));
            }
          },
        },
      ]
    );
  };

  const styles = useMemo(() => createStyles(), []);

  return (
    <GlassScreen scroll={false} contentStyle={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Requests</Text>
        <Text style={styles.headerSub}>
          {loading
            ? 'Loading requests…'
            : bookings.length === 0
              ? 'No pending requests right now'
              : `${bookings.length} pending request${bookings.length === 1 ? '' : 's'}`}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={GLASS.primary} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={Boolean(refreshing)}
              onRefresh={() => void refresh()}
              tintColor={GLASS.primary}
            />
          }
        >
          {error ? (
            <TouchableOpacity
              onPress={() => void refresh()}
              style={styles.empty}
            >
              <Text style={styles.emptyTitle}>Could not load requests</Text>
              <Text style={styles.emptySub}>{error}</Text>
              <Text style={styles.retry}>Tap to retry</Text>
            </TouchableOpacity>
          ) : null}

          {!error && bookings.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="mail-open-outline" size={40} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No pending requests</Text>
              <Text style={styles.emptySub}>
                When a student sends a monthly Mon–Fri request, it appears here
                as one pending package.
              </Text>
            </View>
          ) : null}

          {bookings.map(item => {
            const name = getBookingStudentName(item);
            const avatar = getBookingStudentAvatar(item);
            const amount = getSessionAmount(item);
            const dateLabel = String(item.date).slice(0, 10);
            const monthly = isMonthlyWeekdaysBooking(item);
            const durationDays = getBookingDurationDays(item);
            const sessions = estimateWeekdaySessionCount(item.date, durationDays);

            return (
              <TouchableOpacity
                key={item._id}
                style={styles.card}
                activeOpacity={0.9}
                onPress={() => openDetails(item._id)}
              >
                <View style={styles.topRow}>
                  <Image source={{ uri: avatar }} style={styles.avatarImg} />
                  <View style={styles.info}>
                    <View style={styles.nameRow}>
                      <Text style={styles.name} numberOfLines={1}>
                        {name}
                      </Text>
                      <View style={styles.newBadge}>
                        <Text style={styles.newText}>
                          {monthly ? 'MONTHLY' : 'PENDING'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.timeText}>
                      {monthly
                        ? `Mon–Fri · ${item.startTime}–${item.endTime} · ~${sessions} classes`
                        : `${dateLabel} · ${item.startTime}–${item.endTime}`}
                    </Text>
                    <Text style={styles.subjectName} numberOfLines={1}>
                      {item.subject}
                      {monthly ? ` · from ${dateLabel}` : ''}
                    </Text>
                    <Text style={styles.rateText}>
                      PKR {amount.toLocaleString()}
                      {monthly ? ' / class' : ''} · Tap for details
                    </Text>
                  </View>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.btn, styles.accept]}
                    disabled={actionLoading}
                    onPress={() => void onAccept(item)}
                  >
                    <Text style={styles.acceptText}>Review & Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btn, styles.decline]}
                    disabled={actionLoading}
                    onPress={() => onDecline(item)}
                  >
                    <Text style={styles.declineText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </GlassScreen>
  );
};

export default TutorRequestsScreen;

const createStyles = () =>
  StyleSheet.create({
    screen: { flex: 1 },
    header: {
      paddingHorizontal: GLASS.space.lg,
      paddingTop: GLASS.space.lg,
      paddingBottom: GLASS.space.sm,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: GLASS.textPrimary,
    },
    headerSub: {
      marginTop: 4,
      color: GLASS.textSecondary,
      fontSize: 13,
    },
    list: { padding: GLASS.space.lg, paddingBottom: 40, gap: 12 },
    card: {
      backgroundColor: GLASS.cardBg,
      borderRadius: GLASS.radius.xl,
      padding: 14,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      ...GLASS.shadow.soft,
    },
    topRow: { flexDirection: 'row', gap: 12 },
    avatarImg: { width: 52, height: 52, borderRadius: 16 },
    info: { flex: 1, minWidth: 0 },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    name: { fontWeight: '800', fontSize: 16, color: GLASS.textPrimary, flex: 1 },
    newBadge: {
      backgroundColor: '#FEF3C7',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 999,
    },
    newText: { color: '#B45309', fontWeight: '800', fontSize: 10 },
    timeText: { color: '#9CA3AF', fontSize: 12, marginTop: 4 },
    subjectName: {
      color: GLASS.textPrimary,
      fontWeight: '600',
      marginTop: 4,
      fontSize: 13,
    },
    rateText: {
      color: GLASS.primary,
      fontWeight: '700',
      marginTop: 4,
      fontSize: 12,
    },
    actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
    btn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 12,
      alignItems: 'center',
    },
    accept: { backgroundColor: GLASS.primary },
    decline: { backgroundColor: '#FEE2E2' },
    acceptText: { color: '#fff', fontWeight: '800', fontSize: 13 },
    declineText: { color: '#B91C1C', fontWeight: '800', fontSize: 13 },
    empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
    emptyTitle: { fontWeight: '800', fontSize: 16, color: GLASS.textPrimary },
    emptySub: {
      color: GLASS.textSecondary,
      textAlign: 'center',
      paddingHorizontal: 24,
      lineHeight: 20,
    },
    retry: { color: GLASS.primary, fontWeight: '700', marginTop: 8 },
  });
