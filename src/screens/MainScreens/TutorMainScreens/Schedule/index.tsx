import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { GlassScreen } from '../../../../components/Glass';
import { GLASS } from '../../../../theme/glass';
import useUi from '../../../../hooks/ui/useUi';
import { useTutorSchedule } from '../../../../hooks/api/useTutorSchedule';
import { useBookings } from '../../../../hooks/api/useBookings';
import {
  TutorScheduleBookedItem,
  TutorScheduleFreeItem,
  TutorScheduleItem,
} from '../../../../types/api.types';
import {
  canCompleteSession,
  canJoinMeeting,
} from '../../../../utils/bookings/bookingStatus';
import { navigateHomeStack } from '../../../../navigation/navigationRef';
import { formatDisplayDate } from '../../../../utils/api/userId';
import { getWorkWeekDates } from '../../../../utils/schedule/scheduleHelpers';
import { useAppSelector } from '../../../../store/hooks';
import { ApiUser, Booking } from '../../../../types/api.types';
import { openClassroom } from '../../../../services/webrtc/openClassroom';
import { useWallet } from '../../../../hooks/api/useWallet';
import { PANEL_DEMO_SESSION_MINUTES } from '../../../../config/features';
const statusTone = (status: string) => {
  switch (status) {
    case 'pending':
      return { bg: '#FEF3C7', text: '#B45309' };
    case 'accepted':
      return { bg: '#EDE9FE', text: GLASS.primaryDeep };
    case 'completed':
      return { bg: '#DCFCE7', text: '#15803D' };
    case 'cancelled':
    case 'missed':
      return { bg: '#FEE2E2', text: '#B91C1C' };
    default:
      return { bg: GLASS.primarySoft, text: GLASS.primary };
  }
};

const TutorScheduleScreen = () => {
  const { colors, resp } = useUi();
  const authUser = useAppSelector(state => state.auth.user as ApiUser | null);
  const styles = useMemo(() => createStyles(colors, resp), [colors, resp]);
  const {
    selectedDate,
    setSelectedDate,
    dateParam,
    items,
    summary,
    isWeekend,
    loading,
    refreshing,
    error,
    refresh,
  } = useTutorSchedule();
  const { completeBooking, actionLoading } = useBookings('active');
  const { refresh: refreshWallet } = useWallet();

  const weekDates = useMemo(() => getWorkWeekDates(new Date()), []);

  const selectedLabel = useMemo(() => {
    const today = new Date();
    if (selectedDate.toDateString() === today.toDateString()) return 'Today';
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    if (selectedDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    return selectedDate.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  }, [selectedDate]);

  const goToday = () => setSelectedDate(new Date());

  const handleComplete = async (bookingId: string) => {
    const result = await completeBooking(bookingId);
    if (result) {
      void refreshWallet();
      const amountMsg = result.sessionAmount
        ? `Escrow released: PKR ${result.sessionAmount.toLocaleString()}.`
        : 'Session completed.';
      Alert.alert('Completed', `${amountMsg}\n\nCheck Earnings for updated balance.`, [
        { text: 'OK', style: 'cancel' },
        {
          text: 'Open Earnings',
          onPress: () => navigateHomeStack('TutorEarningsScreen'),
        },
      ]);
      void refresh();
    }
  };

  const openDetails = (bookingId: string) => {
    navigateHomeStack('TutorBookingRequestDetailsScreen', { bookingId });
  };

  const openReschedule = (bookingId: string) => {
    navigateHomeStack('TutorRescheduleScreen', { bookingId });
  };

  const renderBooked = (item: TutorScheduleBookedItem, index: number) => {
    const tone = statusTone(item.status);
    const proposalPending = item.rescheduleProposal?.status === 'pending';
    const avatar =
      item.student.avatarUrl ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        item.student.name || 'S'
      )}&background=7548F5&color=fff`;
    const bookingLike = {
      _id: item.bookingId,
      status: item.status,
      meetingLink: item.meetingLink,
      startTime: item.startTime,
      endTime: item.endTime,
      date: dateParam,
      subject: item.subject,
      student: {
        _id: item.student._id,
        name: item.student.name,
        avatarUrl: item.student.avatarUrl,
      },
      tutor: authUser?._id || authUser?.id || '',
    } as Booking;

    return (
      <TouchableOpacity
        key={`booked-${item.bookingId}`}
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => openDetails(item.bookingId)}
      >
        <View style={styles.timelineRail}>
          <View style={styles.timelineDot} />
          {index < items.length - 1 ? (
            <View style={styles.timelineLine} />
          ) : null}
        </View>

        <View style={styles.cardBody}>
          <View style={styles.cardTop}>
            <Text style={styles.time}>
              {item.startTime} – {item.endTime}
            </Text>
            <View style={[styles.pill, { backgroundColor: tone.bg }]}>
              <Text style={[styles.pillText, { color: tone.text }]}>
                {proposalPending ? 'Reschedule pending' : item.status}
              </Text>
            </View>
          </View>

          <View style={styles.personRow}>
            <Image source={{ uri: avatar }} style={styles.avatar} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.name} numberOfLines={1}>
                {item.student.name || 'Student'}
              </Text>
              <Text style={styles.subject} numberOfLines={1}>
                {item.subject}
                {item.mode ? ` · ${item.mode}` : ''}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            {canJoinMeeting(bookingLike) || __DEV__ ? (
              <TouchableOpacity
                style={styles.joinWrap}
                onPress={() => {
                  const opened = openClassroom(bookingLike, {
                    user: authUser,
                    role: 'tutor',
                    autoStart: true,
                  });
                  if (!opened) {
                    Alert.alert(
                      'Unable to start',
                      'Class starts only for accepted bookings that have not ended yet.'
                    );
                  }
                }}
              >
                <LinearGradient
                  colors={[...GLASS.buttonGradient]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.joinBtn}
                >
                  <MaterialCommunityIcons
                    name="video-outline"
                    size={16}
                    color="#fff"
                  />
                  <Text style={styles.joinText}>Start class</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => openDetails(item.bookingId)}
            >
              <Text style={styles.secondaryBtnText}>View details</Text>
            </TouchableOpacity>

            {item.canReschedule && !proposalPending ? (
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => openReschedule(item.bookingId)}
              >
                <Text style={styles.secondaryBtnText}>Reschedule</Text>
              </TouchableOpacity>
            ) : null}

            {item.status === 'accepted' && !proposalPending ? (
              <TouchableOpacity
                style={[styles.secondaryBtn, actionLoading && styles.btnDisabled]}
                disabled={actionLoading}
                onPress={() => {
                  if (!canCompleteSession(bookingLike)) {
                    Alert.alert(
                      'Too early',
                      PANEL_DEMO_SESSION_MINUTES
                        ? `Panel demo: wait ~${PANEL_DEMO_SESSION_MINUTES} min after start time, then tap Complete to release escrow.`
                        : 'You can complete the session only after the scheduled end time.'
                    );
                    return;
                  }
                  void handleComplete(item.bookingId);
                }}
              >
                <Text style={styles.secondaryBtnText}>Complete</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFree = (item: TutorScheduleFreeItem, index: number) => (
    <View key={`free-${item.startTime}-${item.endTime}`} style={styles.card}>
      <View style={styles.timelineRail}>
        <View style={[styles.timelineDot, styles.freeDot]} />
        {index < items.length - 1 ? (
          <View style={styles.timelineLine} />
        ) : null}
      </View>
      <View style={styles.freeCard}>
        <View style={styles.freeTop}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={16}
            color={GLASS.primary}
          />
          <Text style={styles.freeLabel}>{item.label || 'Free Time'}</Text>
        </View>
        <Text style={styles.freeTime}>
          {item.startTime} – {item.endTime}
        </Text>
        <Text style={styles.freeHint}>
          {item.durationMinutes} min open slot · students can book here
        </Text>
      </View>
    </View>
  );

  const renderItem = (item: TutorScheduleItem, index: number) => {
    if (item.kind === 'booked') return renderBooked(item, index);
    return renderFree(item, index);
  };

  return (
    <GlassScreen
      scroll={false}
      edges={['top', 'left', 'right']}
      contentStyle={styles.screen}
    >
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
        <View style={styles.pageHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>My Schedule</Text>
            <Text style={styles.subheading}>
              Accepted sessions and free 90‑min slots for the day.
            </Text>
          </View>
          <TouchableOpacity style={styles.todayChip} onPress={goToday}>
            <MaterialCommunityIcons
              name="calendar-today"
              size={16}
              color={GLASS.primary}
            />
            <Text style={styles.todayChipText}>Today</Text>
          </TouchableOpacity>
        </View>

        <LinearGradient
          colors={[...GLASS.buttonGradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroOrb} />
          <Text style={styles.heroLabel}>{selectedLabel}</Text>
          <Text style={styles.heroTitle}>
            {summary.sessionsCount === 0
              ? 'No sessions yet'
              : `${summary.sessionsCount} session${
                  summary.sessionsCount === 1 ? '' : 's'
                }`}
          </Text>
          <Text style={styles.heroSub}>
            {summary.displayTotalHours}
            {summary.freeSlotsCount > 0
              ? ` · ${summary.freeSlotsCount} free slot${
                  summary.freeSlotsCount === 1 ? '' : 's'
                }`
              : ''}
            {isWeekend ? ' · Weekend (no free slots)' : ''}
          </Text>
        </LinearGradient>

        <Text style={styles.weekTitle}>This week · Mon–Fri</Text>
        <View style={styles.weekRow}>
          {weekDates.map(date => {
            const item = formatDisplayDate(date);
            const active =
              date.toDateString() === selectedDate.toDateString();
            const isToday =
              date.toDateString() === new Date().toDateString();
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
                  <View
                    style={[styles.dayCard, isToday && styles.dayCardToday]}
                  >
                    <Text style={styles.dayLabel}>{item.day}</Text>
                    <Text style={styles.dateLabel}>{item.date}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#EEF2FF' }]}>
              <MaterialCommunityIcons
                name="calendar-check"
                size={18}
                color={GLASS.primary}
              />
            </View>
            <Text style={styles.statValue}>{summary.sessionsCount}</Text>
            <Text style={styles.statLabel}>Today's sessions</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#ECFDF3' }]}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={18}
                color={GLASS.success}
              />
            </View>
            <Text style={styles.statValue}>{summary.displayTotalHours}</Text>
            <Text style={styles.statLabel}>Total hours</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
              <MaterialCommunityIcons
                name="calendar-blank-outline"
                size={18}
                color={GLASS.warning}
              />
            </View>
            <Text style={styles.statValue}>{summary.freeSlotsCount}</Text>
            <Text style={styles.statLabel}>Free time</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Day timeline</Text>
          <Text style={styles.sectionMeta}>{selectedLabel}</Text>
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 20 }} color={GLASS.primary} />
        ) : null}

        {error ? (
          <TouchableOpacity
            style={styles.errorCard}
            onPress={() => void refresh()}
          >
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.retry}>Tap to retry</Text>
          </TouchableOpacity>
        ) : null}

        {!loading && !error && items.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons
              name="calendar-blank-outline"
              size={32}
              color={GLASS.textMuted}
            />
            <Text style={styles.emptyTitle}>
              {isWeekend ? 'Weekend' : 'Open day'}
            </Text>
            <Text style={styles.emptySub}>
              {isWeekend
                ? 'No free slots on weekends. Accepted sessions still show here if any.'
                : 'No booked or free slots for this date. Set weekly hours in Profile → Availability.'}
            </Text>
          </View>
        ) : null}

        {items.map((item, index) => renderItem(item, index))}
      </ScrollView>
    </GlassScreen>
  );
};

export default TutorScheduleScreen;

const createStyles = (_colors: any, resp: any) =>
  StyleSheet.create({
    screen: { flex: 1 },
    content: {
      paddingTop: resp.dy(12),
      paddingHorizontal: resp.dx(20),
      paddingBottom: resp.dy(40),
    },
    pageHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: resp.dy(16),
    },
    greeting: {
      fontSize: resp.df(24),
      fontWeight: '800',
      color: GLASS.textPrimary,
      marginBottom: 4,
    },
    subheading: {
      color: GLASS.textSecondary,
      fontSize: resp.df(13),
      lineHeight: 18,
    },
    todayChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: GLASS.primarySoft,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
    },
    todayChipText: {
      color: GLASS.primary,
      fontWeight: '800',
      fontSize: 12,
    },
    heroCard: {
      borderRadius: GLASS.radius.xl,
      padding: 18,
      overflow: 'hidden',
      marginBottom: 18,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.28)',
      ...GLASS.shadow.medium,
    },
    heroOrb: {
      position: 'absolute',
      right: -24,
      top: -36,
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: 'rgba(255,255,255,0.12)',
    },
    heroLabel: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: 12,
      fontWeight: '700',
      marginBottom: 6,
    },
    heroTitle: {
      color: '#fff',
      fontSize: 22,
      fontWeight: '800',
    },
    heroSub: {
      color: 'rgba(255,255,255,0.78)',
      fontSize: 12,
      marginTop: 6,
      lineHeight: 17,
    },
    weekTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: GLASS.textSecondary,
      marginBottom: 10,
    },
    weekRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    dayCard: {
      width: resp.dx(56),
      paddingVertical: 10,
      borderRadius: 16,
      backgroundColor: GLASS.cardBgStrong,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      alignItems: 'center',
      ...GLASS.shadow.soft,
    },
    dayCardActive: {
      borderColor: 'transparent',
    },
    dayCardToday: {
      borderColor: GLASS.cardBorderStrong,
    },
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
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
    statCard: {
      flex: 1,
      backgroundColor: GLASS.cardBgStrong,
      borderRadius: GLASS.radius.lg,
      paddingVertical: 12,
      paddingHorizontal: 8,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      ...GLASS.shadow.soft,
    },
    statIcon: {
      width: 32,
      height: 32,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
    },
    statValue: {
      fontSize: 14,
      fontWeight: '800',
      color: GLASS.textPrimary,
      textAlign: 'center',
    },
    statLabel: {
      marginTop: 2,
      color: GLASS.textSecondary,
      fontSize: 10,
      textAlign: 'center',
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 16,
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: GLASS.textPrimary,
    },
    sectionMeta: {
      color: GLASS.textMuted,
      fontSize: 12,
      fontWeight: '600',
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
      padding: 24,
      alignItems: 'center',
      gap: 6,
    },
    emptyTitle: {
      fontWeight: '800',
      fontSize: 16,
      color: GLASS.textPrimary,
      marginTop: 4,
    },
    emptySub: {
      color: GLASS.textSecondary,
      textAlign: 'center',
      fontSize: 12,
      lineHeight: 18,
    },
    card: {
      flexDirection: 'row',
      marginBottom: 4,
    },
    timelineRail: {
      width: 18,
      alignItems: 'center',
      paddingTop: 22,
    },
    timelineDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: GLASS.primary,
      borderWidth: 2,
      borderColor: GLASS.primarySoft,
    },
    freeDot: {
      backgroundColor: '#94A3B8',
      borderColor: 'rgba(148,163,184,0.35)',
    },
    timelineLine: {
      flex: 1,
      width: 2,
      backgroundColor: GLASS.cardBorder,
      marginTop: 4,
      minHeight: 40,
    },
    cardBody: {
      flex: 1,
      backgroundColor: GLASS.cardBgStrong,
      borderRadius: GLASS.radius.xl,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      padding: 14,
      marginBottom: 12,
      marginLeft: 6,
      ...GLASS.shadow.soft,
    },
    freeCard: {
      flex: 1,
      borderRadius: GLASS.radius.xl,
      borderWidth: 1.5,
      borderColor: GLASS.primary,
      borderStyle: 'dashed',
      backgroundColor: 'rgba(117, 72, 245, 0.04)',
      padding: 14,
      marginBottom: 12,
      marginLeft: 6,
    },
    freeTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 6,
    },
    freeLabel: {
      fontWeight: '800',
      color: GLASS.primary,
      fontSize: 13,
    },
    freeTime: {
      fontWeight: '800',
      color: GLASS.textPrimary,
      fontSize: 15,
    },
    freeHint: {
      marginTop: 4,
      color: GLASS.textSecondary,
      fontSize: 12,
    },
    cardTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    time: {
      fontWeight: '800',
      color: GLASS.primary,
      fontSize: 13,
    },
    pill: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
    },
    pillText: { fontWeight: '800', fontSize: 10, textTransform: 'capitalize' },
    personRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 12,
    },
    avatar: { width: 42, height: 42, borderRadius: 14 },
    name: {
      fontSize: 15,
      fontWeight: '800',
      color: GLASS.textPrimary,
    },
    subject: {
      marginTop: 2,
      color: GLASS.textSecondary,
      fontSize: 12,
    },
    actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
    joinWrap: { minWidth: '46%', flexGrow: 1 },
    joinBtn: {
      height: 40,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    joinText: { color: '#fff', fontWeight: '800', fontSize: 13 },
    secondaryBtn: {
      minWidth: '30%',
      flexGrow: 1,
      height: 40,
      borderRadius: 12,
      backgroundColor: GLASS.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 10,
    },
    secondaryBtnText: {
      color: GLASS.primaryDeep,
      fontWeight: '800',
      fontSize: 12,
    },
    btnDisabled: { opacity: 0.5 },
  });
