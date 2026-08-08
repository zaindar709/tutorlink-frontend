import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { GlassScreen } from '../../../../components/Glass';
import { GLASS } from '../../../../theme/glass';
import useUi from '../../../../hooks/ui/useUi';
import { useTutorSchedule } from '../../../../hooks/api/useTutorSchedule';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  cancelRescheduleThunk,
  proposeRescheduleThunk,
} from '../../../../store/booking/bookingSlice';
import { getBookingErrorMessage } from '../../../../utils/bookings/bookingErrors';
import { formatDisplayDate, formatDateParam } from '../../../../utils/api/userId';
import { getUpcomingWorkDates } from '../../../../utils/schedule/scheduleHelpers';
import { TutorScheduleFreeItem } from '../../../../types/api.types';

const TutorRescheduleScreen = () => {
  const { resp } = useUi();
  const styles = useMemo(() => createStyles(resp), [resp]);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useAppDispatch();
  const bookingId = route.params?.bookingId as string;

  const booking = useAppSelector(state => state.booking.byId[bookingId]);
  const actionLoading = useAppSelector(state =>
    Boolean(state.booking.actionLoadingById[bookingId] || state.booking.mutating)
  );

  const {
    selectedDate,
    setSelectedDate,
    freeSlots,
    loading,
    refreshing,
    error,
    refresh,
    summary,
    isWeekend,
  } = useTutorSchedule(new Date());

  const [submitting, setSubmitting] = useState(false);
  const weekDates = useMemo(() => getUpcomingWorkDates(new Date(), 10), []);

  const pendingProposal =
    booking?.rescheduleProposal?.status === 'pending'
      ? booking.rescheduleProposal
      : null;

  const propose = (slot: TutorScheduleFreeItem) => {
    Alert.alert(
      'Propose new time?',
      `${formatDateParam(selectedDate)} · ${slot.startTime}–${slot.endTime}\n\nEscrow amount stays the same. Student must accept.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send proposal',
          onPress: async () => {
            setSubmitting(true);
            try {
              await dispatch(
                proposeRescheduleThunk({
                  id: bookingId,
                  payload: {
                    date: formatDateParam(selectedDate),
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                  },
                })
              ).unwrap();
              Alert.alert(
                'Proposal sent',
                'Waiting for the student to accept or reject.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (err) {
              Alert.alert('Reschedule failed', getBookingErrorMessage(err));
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const withdraw = () => {
    Alert.alert(
      'Withdraw proposal?',
      'The original session time will stay unchanged.',
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Withdraw',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(cancelRescheduleThunk(bookingId)).unwrap();
              Alert.alert('Withdrawn', 'Reschedule proposal cancelled.');
              void refresh();
            } catch (err) {
              Alert.alert('Failed', getBookingErrorMessage(err));
            }
          },
        },
      ]
    );
  };

  return (
    <GlassScreen
      scroll={false}
      edges={['top', 'left', 'right']}
      contentStyle={styles.screen}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={22}
            color={GLASS.textPrimary}
          />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Reschedule</Text>
          <Text style={styles.subtitle}>
            Pick a free 90‑min slot (Mon–Fri). Escrow unchanged.
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={Boolean(refreshing)}
            onRefresh={() => void refresh()}
            tintColor={GLASS.primary}
          />
        }
      >
        {booking ? (
          <View style={styles.currentCard}>
            <Text style={styles.currentLabel}>Current session</Text>
            <Text style={styles.currentSubject}>{booking.subject}</Text>
            <Text style={styles.currentMeta}>
              {booking.date} · {booking.startTime}–{booking.endTime}
            </Text>
          </View>
        ) : null}

        {pendingProposal ? (
          <View style={styles.pendingCard}>
            <Text style={styles.pendingTitle}>Proposal pending</Text>
            <Text style={styles.pendingMeta}>
              {pendingProposal.date} · {pendingProposal.startTime}–
              {pendingProposal.endTime}
            </Text>
            <TouchableOpacity
              style={styles.withdrawBtn}
              onPress={withdraw}
              disabled={actionLoading}
            >
              <Text style={styles.withdrawText}>Withdraw proposal</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Choose a day</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.weekRow}
        >
          {weekDates.map(date => {
            const item = formatDisplayDate(date);
            const active =
              date.toDateString() === selectedDate.toDateString();
            return (
              <TouchableOpacity
                key={date.toISOString()}
                onPress={() => setSelectedDate(date)}
                activeOpacity={0.85}
              >
                {active ? (
                  <LinearGradient
                    colors={[...GLASS.buttonGradient]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.dayCard, styles.dayCardActive]}
                  >
                    <Text style={[styles.dayLabel, styles.dayActiveText]}>
                      {item.day}
                    </Text>
                    <Text style={[styles.dateLabel, styles.dayActiveText]}>
                      {item.date}
                    </Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.dayCard}>
                    <Text style={styles.dayLabel}>{item.day}</Text>
                    <Text style={styles.dateLabel}>{item.date}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.sectionTitle}>
          Free time · {summary.freeSlotsCount} slots
        </Text>

        {loading ? (
          <ActivityIndicator color={GLASS.primary} style={{ marginTop: 24 }} />
        ) : null}

        {error ? (
          <TouchableOpacity style={styles.errorCard} onPress={() => void refresh()}>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.retry}>Tap to retry</Text>
          </TouchableOpacity>
        ) : null}

        {!loading && !error && isWeekend ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Weekend closed</Text>
            <Text style={styles.emptySub}>
              Reschedule only to Monday–Friday free slots.
            </Text>
          </View>
        ) : null}

        {!loading && !error && !isWeekend && freeSlots.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No free slots</Text>
            <Text style={styles.emptySub}>
              Pick another weekday, or update your weekly availability.
            </Text>
          </View>
        ) : null}

        {freeSlots.map(slot => (
          <TouchableOpacity
            key={`${slot.startTime}-${slot.endTime}`}
            style={styles.slotCard}
            activeOpacity={0.88}
            disabled={Boolean(pendingProposal) || submitting || actionLoading}
            onPress={() => propose(slot)}
          >
            <View style={styles.slotLeft}>
              <MaterialCommunityIcons
                name="clock-plus-outline"
                size={20}
                color={GLASS.primary}
              />
              <View>
                <Text style={styles.slotTime}>
                  {slot.startTime} – {slot.endTime}
                </Text>
                <Text style={styles.slotHint}>
                  {slot.durationMinutes} min · tap to propose
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={GLASS.textMuted}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </GlassScreen>
  );
};

export default TutorRescheduleScreen;

const createStyles = (resp: any) =>
  StyleSheet.create({
    screen: { flex: 1 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: resp.dx(16),
      paddingTop: resp.dy(8),
      paddingBottom: resp.dy(8),
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: GLASS.cardBgStrong,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
    },
    title: {
      fontSize: 20,
      fontWeight: '800',
      color: GLASS.textPrimary,
    },
    subtitle: {
      marginTop: 2,
      fontSize: 12,
      color: GLASS.textSecondary,
      lineHeight: 16,
    },
    content: {
      paddingHorizontal: resp.dx(20),
      paddingBottom: resp.dy(40),
    },
    currentCard: {
      backgroundColor: GLASS.cardBgStrong,
      borderRadius: GLASS.radius.xl,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      padding: 14,
      marginBottom: 12,
      ...GLASS.shadow.soft,
    },
    currentLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: GLASS.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    currentSubject: {
      marginTop: 6,
      fontSize: 16,
      fontWeight: '800',
      color: GLASS.textPrimary,
    },
    currentMeta: {
      marginTop: 4,
      fontSize: 13,
      color: GLASS.textSecondary,
    },
    pendingCard: {
      backgroundColor: '#FEF3C7',
      borderRadius: GLASS.radius.lg,
      padding: 14,
      marginBottom: 14,
    },
    pendingTitle: {
      fontWeight: '800',
      color: '#B45309',
      fontSize: 14,
    },
    pendingMeta: {
      marginTop: 4,
      color: '#92400E',
      fontSize: 13,
    },
    withdrawBtn: {
      marginTop: 10,
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: 'rgba(185, 28, 28, 0.12)',
    },
    withdrawText: {
      color: '#B91C1C',
      fontWeight: '800',
      fontSize: 12,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: GLASS.textPrimary,
      marginTop: 8,
      marginBottom: 10,
    },
    weekRow: {
      gap: 8,
      paddingBottom: 8,
    },
    dayCard: {
      width: 56,
      paddingVertical: 10,
      borderRadius: 16,
      backgroundColor: GLASS.cardBgStrong,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      alignItems: 'center',
      marginRight: 8,
    },
    dayCardActive: { borderColor: 'transparent' },
    dayLabel: {
      fontSize: 11,
      color: GLASS.textSecondary,
      fontWeight: '700',
    },
    dateLabel: {
      marginTop: 4,
      fontSize: 16,
      fontWeight: '800',
      color: GLASS.textPrimary,
    },
    dayActiveText: { color: '#fff' },
    slotCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: GLASS.cardBgStrong,
      borderRadius: GLASS.radius.xl,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: GLASS.primary,
      padding: 14,
      marginBottom: 10,
    },
    slotLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    slotTime: {
      fontWeight: '800',
      fontSize: 15,
      color: GLASS.textPrimary,
    },
    slotHint: {
      marginTop: 2,
      fontSize: 12,
      color: GLASS.textSecondary,
    },
    errorCard: {
      backgroundColor: '#FEF2F2',
      borderRadius: 16,
      padding: 14,
      marginBottom: 12,
    },
    errorText: { color: '#B91C1C', fontWeight: '600' },
    retry: { color: GLASS.primary, fontWeight: '700', marginTop: 6 },
    emptyCard: {
      backgroundColor: GLASS.cardBg,
      borderRadius: GLASS.radius.xl,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      padding: 20,
      alignItems: 'center',
      marginTop: 8,
    },
    emptyTitle: {
      fontWeight: '800',
      fontSize: 15,
      color: GLASS.textPrimary,
    },
    emptySub: {
      marginTop: 6,
      textAlign: 'center',
      color: GLASS.textSecondary,
      fontSize: 12,
      lineHeight: 18,
    },
  });
