import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Linking,
  Alert,
  RefreshControl,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import useUi from '../../../../hooks/ui/useUi';
import { GlassScreen } from '../../../../components/Glass';
import { GLASS } from '../../../../theme/glass';
import SessionCard from '../../../../components/SessionCard';
import { useBookings } from '../../../../hooks/api/useBookings';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  acceptRescheduleThunk,
  rejectRescheduleThunk,
} from '../../../../store/booking/bookingSlice';
import { createConversationThunk } from '../../../../store/chat/chatSlice';
import { formatDisplayDate } from '../../../../utils/api/userId';
import {
  formatBookingTimeRange,
  getBookingParticipantAvatar,
  getBookingParticipantName,
  getBookingTutorName,
  hasPendingRescheduleProposal,
  mapTabLabel,
} from '../../../../utils/api/bookingHelpers';
import {
  canCancel,
  canJoinMeeting,
  canMessage,
  canRate,
  getBookingDisplayLabel,
} from '../../../../utils/bookings/bookingStatus';
import { getBookingErrorMessage } from '../../../../utils/bookings/bookingErrors';
import { getCalendarWeekDates } from '../../../../utils/schedule/scheduleHelpers';
import { navigateHomeStack } from '../../../../navigation/navigationRef';
import { ApiUser, Booking } from '../../../../types/api.types';

const TAB_LABELS = ['Active', 'Pending', 'Past'] as const;

const BookingScreen = () => {
  const { colors, resp } = useUi();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const authUser = useAppSelector(state => state.auth.user as ApiUser | null);
  const styles = useMemo(() => createStyles(colors, resp), [colors, resp]);

  const {
    bookings,
    tab,
    setTab,
    selectedDate,
    setSelectedDate,
    loading,
    refreshing,
    actionLoading,
    nextSession,
    error,
    refresh,
    cancelBooking,
  } = useBookings('active');

  const weekDates = useMemo(
    () => getCalendarWeekDates(selectedDate),
    [selectedDate]
  );

  const listBookings = useMemo(() => {
    if (tab !== 'active' || !nextSession) return bookings;
    return bookings.filter(b => b._id !== nextSession._id);
  }, [bookings, nextSession, tab]);

  const handleTabChange = (label: string) => {
    setTab(mapTabLabel(label));
  };

  const openBookingDetail = (booking: Booking) => {
    navigateHomeStack('BookingPendingScreen', { bookingId: booking._id });
  };

  const handleJoin = (booking: Booking) => {
    if (!canJoinMeeting(booking)) {
      Alert.alert(
        'Meeting link unavailable',
        'The tutor has not shared a meeting link yet.'
      );
      return;
    }
    void Linking.openURL(booking.meetingLink!);
  };

  const handleCancel = (booking: Booking) => {
    if (!canCancel(booking)) return;
    Alert.alert(
      'Cancel booking?',
      booking.status === 'accepted'
        ? 'Escrow will be refunded to your wallet if payment was held.'
        : 'You can book another slot anytime.',
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Cancel booking',
          style: 'destructive',
          onPress: async () => {
            const result = await cancelBooking(booking._id, 'student');
            if (result) {
              Alert.alert(
                'Cancelled',
                result.escrowRefunded
                  ? `Booking cancelled. Escrow refunded${
                      result.sessionAmount
                        ? `: PKR ${result.sessionAmount.toLocaleString()}`
                        : ''
                    }.`
                  : 'Booking cancelled successfully.'
              );
              void refresh();
            } else {
              Alert.alert(
                'Cancel failed',
                'Could not cancel this booking. Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  const handleMessage = async (booking: Booking) => {
    if (!canMessage(booking)) {
      Alert.alert(
        'Chat unavailable',
        'Messaging opens after a booking is created.'
      );
      return;
    }
    try {
      const conversation = await dispatch(
        createConversationThunk({
          payload: {
            bookingId: booking._id,
            subject: booking.subject,
          },
          currentUser: authUser,
        })
      ).unwrap();
      navigation.navigate('HomeNavigator', {
        screen: 'ChatScreen',
        params: {
          chatId: conversation.id,
          bookingId: booking._id,
          name: conversation.participant.name,
          avatar: conversation.participant.avatar,
          subject: conversation.subject,
        },
      });
    } catch (err) {
      Alert.alert('Chat unavailable', getBookingErrorMessage(err));
    }
  };

  const handleRate = (booking: Booking) => {
    if (!canRate(booking)) return;
    navigateHomeStack('BookingReviewScreen', { bookingId: booking._id });
  };

  const handleAcceptReschedule = (booking: Booking) => {
    const proposal = booking.rescheduleProposal;
    if (!proposal) return;
    Alert.alert(
      'Accept new time?',
      `${proposal.date} · ${proposal.startTime}–${proposal.endTime}\n\nEscrow amount stays the same.`,
      [
        { text: 'Not now', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              await dispatch(acceptRescheduleThunk(booking._id)).unwrap();
              Alert.alert('Session moved', 'Your booking time was updated.');
              // Jump to the new date if provided
              if (proposal.date) {
                const next = new Date(`${String(proposal.date).slice(0, 10)}T12:00:00`);
                if (!Number.isNaN(next.getTime())) {
                  setSelectedDate(next);
                  setTab('active');
                }
              }
              void refresh();
            } catch (err) {
              Alert.alert('Accept failed', getBookingErrorMessage(err));
            }
          },
        },
      ]
    );
  };

  const handleRejectReschedule = (booking: Booking) => {
    Alert.alert(
      'Keep original time?',
      'The tutor’s proposal will be declined.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(rejectRescheduleThunk(booking._id)).unwrap();
              void refresh();
            } catch (err) {
              Alert.alert('Reject failed', getBookingErrorMessage(err));
            }
          },
        },
      ]
    );
  };

  const shiftWeek = (deltaDays: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + deltaDays);
    setSelectedDate(next);
  };

  const emptyHint =
    tab === 'active'
      ? 'Accepted sessions with your tutor appear here after they confirm.'
      : tab === 'pending'
        ? 'Requests waiting for tutor response show on this day.'
        : 'Completed and cancelled sessions for this day show here.';

  const renderRescheduleBanner = (booking: Booking) => {
    if (!hasPendingRescheduleProposal(booking) || !booking.rescheduleProposal) {
      return null;
    }
    const proposal = booking.rescheduleProposal;
    return (
      <View style={styles.rescheduleCard}>
        <Text style={styles.rescheduleTitle}>Reschedule proposed</Text>
        <Text style={styles.rescheduleMeta}>
          {String(proposal.date).slice(0, 10)} · {proposal.startTime}–
          {proposal.endTime}
        </Text>
        <View style={styles.rescheduleActions}>
          <TouchableOpacity
            style={styles.acceptRescheduleBtn}
            disabled={actionLoading}
            onPress={() => handleAcceptReschedule(booking)}
          >
            <Text style={styles.acceptRescheduleText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectRescheduleBtn}
            disabled={actionLoading}
            onPress={() => handleRejectReschedule(booking)}
          >
            <Text style={styles.rejectRescheduleText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderBookingCard = (booking: Booking) => {
    const tutorName = getBookingTutorName(booking);
    const statusLabel = hasPendingRescheduleProposal(booking)
      ? 'Reschedule pending'
      : getBookingDisplayLabel(booking);

    return (
      <TouchableOpacity
        key={booking._id}
        style={styles.timelineWrapper}
        activeOpacity={0.9}
        onPress={() => openBookingDetail(booking)}
      >
        <View style={styles.timelineLeft}>
          <Text style={styles.timelineTime}>{booking.startTime}</Text>
          <Text style={styles.timelineDuration}>{statusLabel}</Text>
          <View style={styles.verticalLine} />
        </View>

        <View style={styles.timelineCard}>
          <View style={styles.profileRow}>
            <View style={styles.imageWrapper}>
              <Image
                source={{
                  uri: getBookingParticipantAvatar(booking, 'student'),
                }}
                style={styles.profileImage}
              />
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.tutorName} numberOfLines={1}>
                {tutorName}
              </Text>
              <Text style={styles.subjectText} numberOfLines={1}>
                {booking.subject}
              </Text>
              <Text style={styles.dateHint}>
                {booking.startTime}–{booking.endTime}
                {booking.hourlyRateAtBooking
                  ? ` · PKR ${booking.hourlyRateAtBooking.toLocaleString()}/hr`
                  : ''}
              </Text>
            </View>
          </View>

          {renderRescheduleBanner(booking)}

          <View style={styles.cardActions}>
            {canJoinMeeting(booking) ? (
              <TouchableOpacity
                style={styles.smallJoinButton}
                onPress={() => handleJoin(booking)}
              >
                <Icon source="video-outline" size={16} color="#fff" />
                <Text style={styles.smallJoinText}>Join</Text>
              </TouchableOpacity>
            ) : null}

            {canMessage(booking) ? (
              <TouchableOpacity
                style={styles.messageButton}
                onPress={() => void handleMessage(booking)}
              >
                <Text style={styles.messageText}>Message</Text>
              </TouchableOpacity>
            ) : null}

            {canRate(booking) ? (
              <TouchableOpacity
                style={styles.rateButton}
                onPress={() => handleRate(booking)}
              >
                <Text style={styles.rateText}>Rate</Text>
              </TouchableOpacity>
            ) : null}

            {canCancel(booking) ? (
              <TouchableOpacity
                style={styles.cancelButton}
                disabled={actionLoading}
                onPress={() => handleCancel(booking)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <GlassScreen scroll={false} contentStyle={styles.screen}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={Boolean(refreshing)}
            onRefresh={() => void refresh()}
            tintColor={GLASS.primary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Bookings</Text>
          <Text style={styles.headerSub}>
            Your sessions with tutors by day
          </Text>
        </View>

        <View style={styles.calendarContainer}>
          <TouchableOpacity
            style={styles.arrowBtn}
            onPress={() => shiftWeek(-7)}
          >
            <Icon
              source="chevron-left"
              size={20}
              color={colors.BLACK_COLOR as string}
            />
          </TouchableOpacity>

          {weekDates.map(date => {
            const item = formatDisplayDate(date);
            const active =
              date.toDateString() === selectedDate.toDateString();

            return (
              <TouchableOpacity
                key={date.toISOString()}
                activeOpacity={0.8}
                style={[styles.dateCard, active && styles.activeDateCard]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[styles.dayText, active && styles.activeText]}>
                  {item.day}
                </Text>
                <Text style={[styles.dateText, active && styles.activeText]}>
                  {item.date}
                </Text>
                {active ? <View style={styles.activeDot} /> : null}
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={styles.arrowBtn}
            onPress={() => shiftWeek(7)}
          >
            <Icon
              source="chevron-right"
              size={20}
              color={colors.BLACK_COLOR as string}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.tabsContainer}>
          {TAB_LABELS.map(tabLabel => {
            const active = tab === mapTabLabel(tabLabel);
            return (
              <TouchableOpacity
                key={tabLabel}
                activeOpacity={0.8}
                onPress={() => handleTabChange(tabLabel)}
                style={[styles.tabButton, active && styles.activeTabButton]}
              >
                <Text style={[styles.tabText, active && styles.activeTabText]}>
                  {tabLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {loading ? (
          <ActivityIndicator
            style={{ marginTop: resp.dy(24) }}
            color={GLASS.primary}
          />
        ) : null}

        {error && !loading ? (
          <TouchableOpacity
            style={styles.errorCard}
            onPress={() => void refresh()}
          >
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.retryText}>Tap to retry</Text>
          </TouchableOpacity>
        ) : null}

        {nextSession && tab === 'active' ? (
          <SessionCard
            colors={colors}
            resp={resp}
            title="NEXT SESSION"
            timerText={
              hasPendingRescheduleProposal(nextSession)
                ? 'Reschedule pending'
                : getBookingDisplayLabel(nextSession)
            }
            name={getBookingParticipantName(nextSession, 'student')}
            subject={nextSession.subject}
            time={formatBookingTimeRange(nextSession)}
            image={getBookingParticipantAvatar(nextSession, 'student')}
            showJoin={canJoinMeeting(nextSession)}
            onJoin={() => handleJoin(nextSession)}
            onMessage={() => void handleMessage(nextSession)}
            onPress={() => openBookingDetail(nextSession)}
          />
        ) : null}

        {nextSession &&
        tab === 'active' &&
        hasPendingRescheduleProposal(nextSession) ? (
          <View style={styles.nextRescheduleWrap}>
            {renderRescheduleBanner(nextSession)}
          </View>
        ) : null}

        {!loading && bookings.length === 0 && !error ? (
          <View style={styles.emptyCard}>
            <Icon
              source="calendar-blank-outline"
              size={36}
              color={GLASS.textMuted}
            />
            <Text style={styles.emptyTitle}>
              No bookings found for this date.
            </Text>
            <Text style={styles.emptyHint}>{emptyHint}</Text>
          </View>
        ) : null}

        {listBookings.map(booking => renderBookingCard(booking))}
      </ScrollView>
    </GlassScreen>
  );
};

export default BookingScreen;

const createStyles = (colors: any, resp: any) =>
  StyleSheet.create({
    screen: {
      flex: 1,
    },
    container: {
      flex: 1,
    },
    header: {
      paddingHorizontal: resp.dx(20),
      paddingTop: resp.dy(10),
    },
    headerTitle: {
      fontSize: resp.df(24),
      fontWeight: '800',
      color: GLASS.textPrimary,
    },
    headerSub: {
      marginTop: 4,
      fontSize: resp.df(13),
      color: GLASS.textSecondary,
    },
    calendarContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: resp.dx(10),
      marginTop: resp.dy(20),
    },
    arrowBtn: {
      width: resp.dx(32),
      height: resp.dx(32),
      borderRadius: resp.dx(16),
      backgroundColor: GLASS.cardBg,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dateCard: {
      width: resp.dx(40),
      height: resp.dy(72),
      borderRadius: GLASS.radius.lg,
      backgroundColor: GLASS.cardBg,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    activeDateCard: {
      backgroundColor: GLASS.primary,
      borderColor: GLASS.primaryDeep,
    },
    dayText: {
      fontSize: resp.df(10),
      color: GLASS.textSecondary,
      marginBottom: resp.dy(4),
      fontWeight: '600',
    },
    dateText: {
      fontSize: resp.df(16),
      fontWeight: '800',
      color: GLASS.textPrimary,
    },
    activeText: {
      color: GLASS.textOnPrimary,
    },
    activeDot: {
      width: resp.dx(5),
      height: resp.dx(5),
      borderRadius: resp.dx(2.5),
      backgroundColor: GLASS.textOnPrimary,
      marginTop: resp.dy(4),
    },
    tabsContainer: {
      flexDirection: 'row',
      backgroundColor: GLASS.cardBg,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      marginHorizontal: resp.dx(20),
      borderRadius: GLASS.radius.lg,
      padding: resp.dx(4),
      marginTop: resp.dy(20),
    },
    tabButton: {
      flex: 1,
      height: resp.dy(42),
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: GLASS.radius.md,
    },
    activeTabButton: {
      backgroundColor: GLASS.cardBgStrong,
      ...GLASS.shadow.soft,
    },
    tabText: {
      color: GLASS.textSecondary,
      fontWeight: '600',
      fontSize: resp.df(14),
    },
    activeTabText: {
      color: GLASS.primary,
      fontWeight: '700',
    },
    errorCard: {
      marginHorizontal: resp.dx(20),
      marginTop: resp.dy(16),
      backgroundColor: '#FEF2F2',
      borderRadius: 14,
      padding: 14,
    },
    errorText: {
      color: '#B91C1C',
      fontWeight: '600',
      fontSize: resp.df(13),
    },
    retryText: {
      marginTop: 6,
      color: GLASS.primary,
      fontWeight: '700',
      fontSize: resp.df(12),
    },
    emptyCard: {
      marginHorizontal: resp.dx(20),
      marginTop: resp.dy(28),
      padding: 24,
      alignItems: 'center',
      backgroundColor: GLASS.cardBg,
      borderRadius: GLASS.radius.xl,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      gap: 8,
    },
    emptyTitle: {
      fontWeight: '800',
      fontSize: resp.df(15),
      color: GLASS.textPrimary,
      textAlign: 'center',
      marginTop: 4,
    },
    emptyHint: {
      textAlign: 'center',
      color: GLASS.textSecondary,
      fontSize: resp.df(12),
      lineHeight: 18,
    },
    nextRescheduleWrap: {
      marginHorizontal: resp.dx(20),
      marginTop: resp.dy(8),
    },
    timelineWrapper: {
      flexDirection: 'row',
      marginTop: resp.dy(22),
      marginHorizontal: resp.dx(20),
      marginBottom: resp.dy(8),
    },
    timelineLeft: {
      width: resp.dx(70),
      alignItems: 'center',
    },
    timelineTime: {
      fontWeight: '800',
      fontSize: resp.df(13),
      color: GLASS.textPrimary,
      textAlign: 'center',
    },
    timelineDuration: {
      marginTop: resp.dy(6),
      color: GLASS.textSecondary,
      fontSize: resp.df(11),
      textTransform: 'capitalize',
      textAlign: 'center',
    },
    verticalLine: {
      width: 1,
      flex: 1,
      borderStyle: 'dashed',
      borderWidth: 1,
      borderColor: GLASS.inputBorder,
      marginTop: resp.dy(10),
      minHeight: 40,
    },
    timelineCard: {
      flex: 1,
      backgroundColor: GLASS.cardBg,
      borderRadius: GLASS.radius.xl,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      padding: resp.dx(14),
      ...GLASS.shadow.soft,
    },
    profileRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    imageWrapper: {
      width: resp.dx(56),
      height: resp.dx(56),
      borderRadius: GLASS.radius.lg,
      overflow: 'hidden',
      marginRight: resp.dx(12),
      backgroundColor: GLASS.primarySoft,
    },
    profileImage: {
      width: '100%',
      height: '100%',
    },
    profileInfo: {
      flex: 1,
      minWidth: 0,
    },
    tutorName: {
      fontSize: resp.df(16),
      fontWeight: '800',
      color: GLASS.textPrimary,
    },
    subjectText: {
      marginTop: resp.dy(3),
      fontSize: resp.df(13),
      color: GLASS.textSecondary,
    },
    dateHint: {
      marginTop: resp.dy(4),
      fontSize: resp.df(12),
      color: GLASS.textMuted,
      fontWeight: '600',
    },
    cardActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: resp.dy(12),
    },
    smallJoinButton: {
      height: resp.dy(38),
      paddingHorizontal: resp.dx(14),
      borderRadius: GLASS.radius.md,
      backgroundColor: GLASS.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    smallJoinText: {
      color: GLASS.textOnPrimary,
      marginLeft: resp.dx(6),
      fontWeight: '700',
    },
    messageButton: {
      paddingHorizontal: resp.dx(12),
      paddingVertical: resp.dy(8),
      borderRadius: GLASS.radius.md,
      backgroundColor: GLASS.primarySoft,
    },
    messageText: {
      color: GLASS.primary,
      fontWeight: '700',
      fontSize: resp.df(12),
    },
    rateButton: {
      paddingHorizontal: resp.dx(12),
      paddingVertical: resp.dy(8),
      borderRadius: GLASS.radius.md,
      backgroundColor: 'rgba(245, 158, 11, 0.15)',
    },
    rateText: {
      color: '#B45309',
      fontWeight: '700',
      fontSize: resp.df(12),
    },
    cancelButton: {
      paddingHorizontal: resp.dx(12),
      paddingVertical: resp.dy(8),
    },
    cancelText: {
      color: GLASS.error,
      fontWeight: '700',
      fontSize: resp.df(12),
    },
    rescheduleCard: {
      marginTop: 12,
      backgroundColor: '#FEF3C7',
      borderRadius: 12,
      padding: 12,
    },
    rescheduleTitle: {
      fontWeight: '800',
      fontSize: 13,
      color: '#B45309',
    },
    rescheduleMeta: {
      marginTop: 4,
      fontWeight: '700',
      fontSize: 12,
      color: '#92400E',
    },
    rescheduleActions: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 10,
    },
    acceptRescheduleBtn: {
      flex: 1,
      height: 36,
      borderRadius: 10,
      backgroundColor: GLASS.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    acceptRescheduleText: {
      color: '#fff',
      fontWeight: '800',
      fontSize: 12,
    },
    rejectRescheduleBtn: {
      flex: 1,
      height: 36,
      borderRadius: 10,
      backgroundColor: 'rgba(185, 28, 28, 0.12)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    rejectRescheduleText: {
      color: '#B91C1C',
      fontWeight: '800',
      fontSize: 12,
    },
  });
