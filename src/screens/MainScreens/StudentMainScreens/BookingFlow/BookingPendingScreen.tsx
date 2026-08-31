import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useUi from '../../../../hooks/ui/useUi';
import CustomButton from '../../../../components/CustomButton';
import { GlassScreen } from '../../../../components/Glass';
import { GLASS } from '../../../../theme/glass';
import { BookingFlowItem } from '../../../../types/bookingFlow.types';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  acceptRescheduleThunk,
  cancelBookingThunk,
  fetchBookingByIdThunk,
  rejectRescheduleThunk,
} from '../../../../store/booking/bookingSlice';
import { createConversationThunk } from '../../../../store/chat/chatSlice';
import { mapBookingToFlowItem } from '../../../../utils/bookings/bookingMappers';
import {
  canJoinMeeting,
  canMessage,
  canRate,
} from '../../../../utils/bookings/bookingStatus';
import { getBookingErrorMessage } from '../../../../utils/bookings/bookingErrors';
import { notifyStudentBookingAccepted, notifyStudentBookingRejected } from '../../../../services/bookings/bookingsService';
import { syncServerNotifications } from '../../../../services/notifications/notificationSyncService';
import { getUserId } from '../../../../utils/api/userId';
import { ApiUser } from '../../../../types/api.types';
import { leaveHomeStackToTabs } from '../../../../navigation/navigationRef';
import { openClassroom } from '../../../../services/webrtc/openClassroom';

const STATUS_COPY: Record<
  string,
  { title: string; subtitle: string; color: string; bg: string }
> = {
  pending: {
    title: 'Monthly request pending',
    subtitle: 'Waiting for tutor to accept Mon–Fri classes',
    color: '#B45309',
    bg: 'rgba(245, 158, 11, 0.18)',
  },
  accepted: {
    title: 'Monthly tuition accepted',
    subtitle: 'Weekday classes are on your Bookings calendar',
    color: '#15803D',
    bg: 'rgba(34, 197, 94, 0.16)',
  },
  cancelled: {
    title: 'Booking Cancelled',
    subtitle: 'This request was cancelled',
    color: GLASS.textSecondary,
    bg: 'rgba(148, 163, 184, 0.16)',
  },
  completed: {
    title: 'Session Completed',
    subtitle: 'Thanks for learning with TutorLink',
    color: GLASS.primaryDeep,
    bg: GLASS.primarySoft,
  },
  missed: {
    title: 'Session Missed',
    subtitle: 'This session was marked as missed',
    color: GLASS.textSecondary,
    bg: 'rgba(148, 163, 184, 0.16)',
  },
};

const BookingPendingScreen = () => {
  const { colors, resp } = useUi();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(resp), [resp]);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useAppDispatch();
  const bookingId = route.params?.bookingId as string;
  const authUser = useAppSelector(state => state.auth.user as ApiUser | null);
  const authRole = useAppSelector(state => state.auth.role);
  const apiBooking = useAppSelector(state => state.booking.byId[bookingId]);
  const actionLoading = useAppSelector(state =>
    Boolean(state.booking.actionLoadingById[bookingId] || state.booking.mutating)
  );

  const [flowItem, setFlowItem] = useState<BookingFlowItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [messaging, setMessaging] = useState(false);
  const lastStatusRef = useRef<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const booking = await dispatch(
        fetchBookingByIdThunk({ id: bookingId, force: true })
      ).unwrap();
      if (booking) {
        setFlowItem(mapBookingToFlowItem(booking));
      }
    } finally {
      setLoading(false);
    }
  }, [bookingId, dispatch]);

  useFocusEffect(
    useCallback(() => {
      void load();
      void syncServerNotifications(getUserId(authUser));
      const timer = setInterval(() => {
        void dispatch(fetchBookingByIdThunk({ id: bookingId, force: true }));
        void syncServerNotifications(getUserId(authUser));
      }, 5000);
      return () => clearInterval(timer);
    }, [authUser, bookingId, dispatch, load])
  );

  React.useEffect(() => {
    if (!apiBooking) return;

    const prev = lastStatusRef.current;
    if (prev === 'pending' && apiBooking.status === 'accepted') {
      notifyStudentBookingAccepted(apiBooking);
      void syncServerNotifications(getUserId(authUser));
    }
    if (prev === 'pending' && apiBooking.status === 'cancelled') {
      notifyStudentBookingRejected(apiBooking);
      void syncServerNotifications(getUserId(authUser));
    }
    lastStatusRef.current = apiBooking.status;
    setFlowItem(mapBookingToFlowItem(apiBooking));
  }, [apiBooking, authUser]);

  if (loading || !flowItem || !apiBooking) {
    return (
      <GlassScreen
        scroll={false}
        contentStyle={styles.centered}
      >
        <ActivityIndicator color={colors.PRIMARY_COLOR as string} />
      </GlassScreen>
    );
  }

  const booking = flowItem;
  const copy = STATUS_COPY[apiBooking.status] || STATUS_COPY.pending;

  const cancel = () => {
    Alert.alert('Cancel request?', 'You can book another slot anytime.', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Cancel booking',
        style: 'destructive',
        onPress: async () => {
          try {
            await dispatch(cancelBookingThunk({ id: booking.id })).unwrap();
            await load();
          } catch (err) {
            Alert.alert('Cancel failed', getBookingErrorMessage(err));
          }
        },
      },
    ]);
  };

  const openChat = async () => {
    if (!canMessage(apiBooking) || messaging) return;
    setMessaging(true);
    try {
      const conversation = await dispatch(
        createConversationThunk({
          payload: {
            bookingId: apiBooking._id,
            subject: apiBooking.subject,
          },
          currentUser: authUser,
        })
      ).unwrap();
      navigation.navigate('ChatScreen', {
        chatId: conversation.id,
        bookingId: apiBooking._id,
        name: conversation.participant.name,
        avatar: conversation.participant.avatar,
        subject: conversation.subject,
      });
    } catch (err) {
      Alert.alert('Chat unavailable', getBookingErrorMessage(err));
    } finally {
      setMessaging(false);
    }
  };

  const joinMeeting = () => {
    if (!apiBooking || !canJoinMeeting(apiBooking)) {
      Alert.alert(
        'Classroom unavailable',
        'This session is not ready to join yet.'
      );
      return;
    }
    const role = authRole === 'tutor' ? 'tutor' : 'student';
    const opened = openClassroom(apiBooking, {
      user: authUser,
      role,
    });
    if (!opened) {
      Alert.alert(
        'Unable to join',
        'Could not open the TutorLink classroom for this booking.'
      );
    }
  };

  const pendingReschedule =
    apiBooking.rescheduleProposal?.status === 'pending'
      ? apiBooking.rescheduleProposal
      : null;

  const baseButtonStyle = {
    alignSelf: 'center',
    width: '92%',
    shadowColor: 'transparent',
    elevation: 0,
    marginTop: resp.dy(10),
  } as const;

  const acceptReschedule = () => {
    if (!pendingReschedule) return;
    Alert.alert(
      'Accept new time?',
      `${pendingReschedule.date} · ${pendingReschedule.startTime}–${pendingReschedule.endTime}\n\nEscrow amount stays the same.`,
      [
        { text: 'Not now', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              await dispatch(acceptRescheduleThunk(bookingId)).unwrap();
              await load();
              Alert.alert('Session moved', 'Your booking time was updated.');
            } catch (err) {
              Alert.alert('Accept failed', getBookingErrorMessage(err));
            }
          },
        },
      ]
    );
  };

  const rejectReschedule = () => {
    if (!pendingReschedule) return;
    Alert.alert(
      'Keep original time?',
      'The tutor’s proposal will be declined and your current schedule stays.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(rejectRescheduleThunk(bookingId)).unwrap();
              await load();
            } catch (err) {
              Alert.alert('Reject failed', getBookingErrorMessage(err));
            }
          },
        },
      ]
    );
  };

  const steps = [
    'Request sent',
    'Waiting for tutor',
    apiBooking.status === 'accepted'
      ? 'Accepted'
      : apiBooking.status === 'cancelled'
        ? 'Cancelled'
        : apiBooking.status === 'completed'
          ? 'Completed'
          : 'Session day',
  ];

  return (
    <GlassScreen scroll={false} edges={['top', 'left', 'right']} contentStyle={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 16) + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={[styles.badge, { backgroundColor: copy.bg }]}>
            <Text style={[styles.badgeText, { color: copy.color }]}>
              {copy.title}
            </Text>
          </View>
          <Text style={styles.subtitle}>{copy.subtitle}</Text>
          {apiBooking.status === 'pending' ? (
            <Text style={styles.eta}>
              Estimated response · ~{booking.estimatedResponseMinutes} min
            </Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Image
            source={{ uri: booking.tutor.avatarUrl }}
            style={styles.avatar}
          />
          <View style={styles.tutorInfo}>
            <Text style={styles.name} numberOfLines={1}>
              {booking.tutor.name}
            </Text>
            <Text style={styles.meta} numberOfLines={2}>
              {booking.subject} · {booking.date}
            </Text>
            <Text style={styles.meta} numberOfLines={1}>
              {booking.startTime}–{booking.endTime} · PKR{' '}
              {booking.totalCost.toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {pendingReschedule ? (
          <View style={styles.rescheduleCard}>
            <Text style={styles.rescheduleTitle}>Reschedule proposed</Text>
            <Text style={styles.rescheduleMeta}>
              New time · {pendingReschedule.date} · {pendingReschedule.startTime}
              –{pendingReschedule.endTime}
            </Text>
            <Text style={styles.rescheduleHint}>
              Escrow amount is unchanged. Accept to move the session, or reject
              to keep the original time.
            </Text>
            <View style={styles.rescheduleActions}>
              <CustomButton
                title={actionLoading ? 'Updating…' : 'Accept new time'}
                onPress={acceptReschedule}
                disabled={actionLoading}
                style={baseButtonStyle}
              />
              <CustomButton
                title="Keep original"
                onPress={rejectReschedule}
                disabled={actionLoading}
                backgroundColor={GLASS.primarySoft}
                textColor={GLASS.primary}
                style={baseButtonStyle}
              />
            </View>
          </View>
        ) : null}

        <View style={styles.timeline}>
          {steps.map((step, index) => {
            const active =
              index === 0 ||
              (index === 1 && apiBooking.status === 'pending') ||
              (index === 2 && apiBooking.status !== 'pending');
            return (
              <View key={`${step}-${index}`} style={styles.timelineRow}>
                <View style={[styles.dot, active ? styles.dotActive : null]} />
                <Text
                  style={[
                    styles.timelineText,
                    active ? styles.timelineTextActive : null,
                  ]}
                >
                  {step}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.actions}>
          {apiBooking.status === 'pending' ? (
            <CustomButton
              title={actionLoading ? 'Cancelling…' : 'Cancel request'}
              onPress={cancel}
              disabled={actionLoading}
              backgroundColor="rgba(239, 68, 68, 0.12)"
              textColor={GLASS.error}
              style={baseButtonStyle}
            />
          ) : null}
          {canJoinMeeting(apiBooking) ? (
            <CustomButton title="Join session" onPress={joinMeeting} style={baseButtonStyle} />
          ) : null}
          {canMessage(apiBooking) ? (
            <CustomButton
              title={messaging ? 'Opening chat…' : 'Message tutor'}
              onPress={() => void openChat()}
              disabled={messaging}
              backgroundColor={GLASS.primarySoft}
              textColor={GLASS.primary}
              style={baseButtonStyle}
            />
          ) : null}
          {canRate(apiBooking) ? (
            <CustomButton
              title="Rate this session"
              onPress={() =>
                navigation.navigate('BookingReviewScreen', {
                  bookingId: booking.id,
                })
              }
              style={baseButtonStyle}
            />
          ) : null}
          {apiBooking.status === 'accepted' ? (
            <CustomButton
              title="View in Bookings"
              onPress={() => leaveHomeStackToTabs('Bookings')}
              style={baseButtonStyle}
            />
          ) : null}
          <CustomButton
            title="Back to Home"
            onPress={() => leaveHomeStackToTabs('Home')}
            backgroundColor={GLASS.primarySoft}
            textColor={GLASS.primary}
            style={baseButtonStyle}
          />
        </View>
      </ScrollView>
    </GlassScreen>
  );
};

export default BookingPendingScreen;

const createStyles = (resp: { dx: (n: number) => number; dy: (n: number) => number; df: (n: number) => number }) =>
  StyleSheet.create({
    screen: {
      flex: 1,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scroll: {
      flex: 1,
      width: '100%',
    },
    content: {
      width: '100%',
      maxWidth: 480,
      alignSelf: 'center',
      paddingHorizontal: resp.dx(20),
      paddingTop: resp.dy(8),
    },
    hero: {
      alignItems: 'center',
      paddingVertical: resp.dy(20),
      marginBottom: resp.dy(8),
    },
    badge: {
      paddingHorizontal: resp.dx(14),
      paddingVertical: resp.dy(8),
      borderRadius: 999,
      marginBottom: resp.dy(10),
    },
    badgeText: {
      fontWeight: '800',
      fontSize: resp.df(13),
    },
    subtitle: {
      fontSize: resp.df(16),
      fontWeight: '700',
      color: GLASS.textPrimary,
      textAlign: 'center',
    },
    eta: {
      marginTop: resp.dy(6),
      color: GLASS.textSecondary,
      fontSize: resp.df(13),
      textAlign: 'center',
    },
    section: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: resp.dx(12),
      width: '100%',
      paddingVertical: resp.dy(4),
    },
    avatar: {
      width: resp.dx(52),
      height: resp.dx(52),
      borderRadius: resp.dx(14),
      backgroundColor: 'rgba(117, 72, 245, 0.12)',
    },
    tutorInfo: {
      flex: 1,
      minWidth: 0,
    },
    name: {
      fontWeight: '800',
      fontSize: resp.df(16),
      color: GLASS.textPrimary,
    },
    meta: {
      color: GLASS.textSecondary,
      fontSize: resp.df(12),
      marginTop: 2,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: GLASS.cardBorder,
      width: '100%',
      marginVertical: resp.dy(14),
    },
    rescheduleCard: {
      width: '100%',
      backgroundColor: '#FEF3C7',
      borderRadius: 16,
      padding: resp.dx(14),
      marginBottom: resp.dy(14),
    },
    rescheduleTitle: {
      fontWeight: '800',
      fontSize: resp.df(14),
      color: '#B45309',
    },
    rescheduleMeta: {
      marginTop: 6,
      fontWeight: '700',
      fontSize: resp.df(13),
      color: '#92400E',
    },
    rescheduleHint: {
      marginTop: 6,
      fontSize: resp.df(12),
      lineHeight: 17,
      color: '#92400E',
    },
    rescheduleActions: {
      marginTop: 12,
      gap: 8,
    },
    timeline: {
      width: '100%',
      marginBottom: resp.dy(8),
    },
    timelineRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: resp.dx(10),
      marginBottom: resp.dy(12),
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: 'rgba(148, 163, 184, 0.45)',
    },
    dotActive: {
      backgroundColor: GLASS.primary,
    },
    timelineText: {
      flex: 1,
      color: GLASS.textSecondary,
      fontWeight: '600',
      fontSize: resp.df(14),
    },
    timelineTextActive: {
      color: GLASS.textPrimary,
    },
    actions: {
      width: '100%',
      gap: resp.dy(10),
      marginTop: resp.dy(8),
    },
  });
