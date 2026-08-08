import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  Linking,
} from 'react-native';
import { IconButton } from 'react-native-paper';
import { GlassScreen } from '../../../../components/Glass';
import { GLASS } from '../../../../theme/glass';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import useUi from '../../../../hooks/ui/useUi';
import CustomButton from '../../../../components/CustomButton';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  cancelBookingThunk,
  completeBookingThunk,
  confirmBookingThunk,
  fetchBookingByIdThunk,
} from '../../../../store/booking/bookingSlice';
import { createConversationThunk } from '../../../../store/chat/chatSlice';
import { mapBookingToFlowItem } from '../../../../utils/bookings/bookingMappers';
import { canCompleteSession, canJoinMeeting, canMessage, isValidHttpsMeetingLink } from '../../../../utils/bookings/bookingStatus';
import { getBookingErrorMessage } from '../../../../utils/bookings/bookingErrors';
import { getConfirmBookingErrorMessage } from '../../../../utils/bookings/bookingResponse';
import { getSessionAmount } from '../../../../utils/bookings/bookingStatus';
import { ApiUser } from '../../../../types/api.types';
import { leaveHomeStackToTabs } from '../../../../navigation/navigationRef';
import { DEV_SKIP_WALLET_ESCROW } from '../../../../config/features';

const TutorBookingRequestDetailsScreen = () => {
  const { colors } = useUi();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useAppDispatch();
  const bookingId = route.params?.bookingId as string;
  const authUser = useAppSelector(state => state.auth.user as ApiUser | null);
  const apiBooking = useAppSelector(state =>
    bookingId ? state.booking.byId[bookingId] : undefined
  );

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [meetingLink, setMeetingLink] = useState('');

  const load = useCallback(async () => {
    if (!bookingId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      await dispatch(fetchBookingByIdThunk(bookingId)).unwrap();
    } finally {
      setLoading(false);
    }
  }, [bookingId, dispatch]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  React.useEffect(() => {
    if (apiBooking?.meetingLink) {
      setMeetingLink(apiBooking.meetingLink);
    }
  }, [apiBooking?.meetingLink]);

  if (loading || !apiBooking) {
    return (
      <GlassScreen scroll={false}>
        <ActivityIndicator style={{ marginTop: 40 }} color={GLASS.primary} />
      </GlassScreen>
    );
  }

  const booking = mapBookingToFlowItem(apiBooking);
  const student = booking.student;
  const completeEnabled = canCompleteSession(apiBooking);

  const accept = async () => {
    const link = meetingLink.trim();
    if (link && !isValidHttpsMeetingLink(link)) {
      Alert.alert(
        'Invalid meeting link',
        'Meeting link must be a valid HTTPS URL (max 500 characters).'
      );
      return;
    }

    // Soft gate: allow accept in skip-escrow mode even if rate was missing at book time.
    if (!DEV_SKIP_WALLET_ESCROW) {
      const sessionAmount = getSessionAmount(apiBooking);
      if (sessionAmount <= 0) {
        Alert.alert(
          'Cannot accept yet',
          'This booking has no session amount (hourly rate was missing when the student booked). Ask them to cancel and send a new request after your fee is saved on the server.'
        );
        return;
      }
    }

    setBusy(true);
    try {
      const result = await dispatch(
        confirmBookingThunk({
          id: bookingId,
          payload: {
            ...(link ? { meetingLink: link } : {}),
            ...(DEV_SKIP_WALLET_ESCROW
              ? { skipEscrow: true, bypassPayment: true }
              : {}),
          },
        })
      ).unwrap();
      Alert.alert(
        'Accepted',
        result.sessionAmount
          ? `Booking confirmed. Escrow held: PKR ${result.sessionAmount.toLocaleString()}.`
          : 'Booking confirmed successfully.'
      );
      await load();
    } catch (err) {
      Alert.alert('Could not accept', getConfirmBookingErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const reject = () => {
    Alert.alert('Reject booking?', 'The student will be notified.', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            await dispatch(
              cancelBookingThunk({ id: bookingId, actorRole: 'tutor' })
            ).unwrap();
            Alert.alert('Rejected', 'Booking was cancelled.');
            await load();
          } catch (err) {
            Alert.alert('Could not reject', getBookingErrorMessage(err));
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  };

  const complete = async () => {
    if (!completeEnabled) {
      Alert.alert(
        'Too early',
        'You can complete the session only after the scheduled end time.'
      );
      return;
    }
    setBusy(true);
    try {
      const result = await dispatch(completeBookingThunk(bookingId)).unwrap();
      Alert.alert(
        'Completed',
        result.sessionAmount
          ? `Escrow released: PKR ${result.sessionAmount.toLocaleString()}.`
          : 'Session marked complete.'
      );
      await load();
    } catch (err) {
      Alert.alert('Could not complete', getBookingErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const openChat = async () => {
    if (!canMessage(apiBooking)) return;
    setBusy(true);
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
      setBusy(false);
    }
  };

  return (
    <GlassScreen scroll={false} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
        <Text style={styles.title}>Booking request</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Image source={{ uri: student.avatarUrl }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{student.name}</Text>
              <Text style={styles.meta}>
                {student.grade || 'Student'}
                {student.subjects?.length
                  ? ` · ${student.subjects.join(', ')}`
                  : ''}
              </Text>
              <Text style={[styles.meta, { marginTop: 4 }]}>
                Request from {student.name}
              </Text>
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>
                {apiBooking.status.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Row label="Subject" value={booking.subject} />
          <Row label="Date" value={booking.date} />
          <Row
            label="Time"
            value={`${booking.startTime} – ${booking.endTime}`}
          />
          <Row label="Duration" value={`${booking.durationHours} hour`} />
          <Row
            label="Amount"
            value={`PKR ${booking.totalCost.toLocaleString()}`}
          />
          <Row
            label="Payment"
            value={`${booking.paymentMethod} (${booking.paymentStatus})`}
          />
          {apiBooking.meetingLink ? (
            <Row label="Meeting link" value={apiBooking.meetingLink} />
          ) : null}
        </View>

        {apiBooking.status === 'pending' ? (
          <View style={styles.card}>
            <Text style={styles.section}>Meeting link (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="https://meet.google.com/..."
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              value={meetingLink}
              onChangeText={setMeetingLink}
            />
            <Text style={styles.hint}>
              HTTPS only. Escrow is held from the student wallet on accept
              (mock funds work for FYP demos).
            </Text>
          </View>
        ) : null}

        {apiBooking.status === 'pending' ? (
          <View style={styles.actions}>
            <CustomButton
              title={busy ? 'Please wait…' : 'Accept Booking'}
              disabled={busy}
              onPress={() => void accept()}
            />
            <CustomButton
              title="Reject Booking"
              disabled={busy}
              onPress={reject}
              backgroundColor="#FEE2E2"
              textColor="#B91C1C"
            />
          </View>
        ) : null}

        {apiBooking.status === 'accepted' ? (
          <View style={styles.actions}>
            {canJoinMeeting(apiBooking) ? (
              <CustomButton
                title="Open meeting link"
                onPress={() => void Linking.openURL(apiBooking.meetingLink!)}
              />
            ) : null}
            {apiBooking.canReschedule &&
            apiBooking.rescheduleProposal?.status !== 'pending' ? (
              <CustomButton
                title="Reschedule"
                disabled={busy}
                onPress={() =>
                  navigation.navigate('TutorRescheduleScreen', {
                    bookingId: apiBooking._id,
                  })
                }
                backgroundColor={GLASS.primarySoft}
                textColor={GLASS.primary}
              />
            ) : null}
            {apiBooking.rescheduleProposal?.status === 'pending' ? (
              <CustomButton
                title="View reschedule proposal"
                disabled={busy}
                onPress={() =>
                  navigation.navigate('TutorRescheduleScreen', {
                    bookingId: apiBooking._id,
                  })
                }
                backgroundColor="#FEF3C7"
                textColor="#B45309"
              />
            ) : null}
            <CustomButton
              title={
                completeEnabled
                  ? busy
                    ? 'Completing…'
                    : 'Complete session'
                  : 'Complete (after session ends)'
              }
              disabled={busy || !completeEnabled}
              onPress={() => void complete()}
            />
            <CustomButton
              title="Cancel booking"
              disabled={busy}
              onPress={reject}
              backgroundColor="#FEE2E2"
              textColor="#B91C1C"
            />
          </View>
        ) : null}

        {canMessage(apiBooking) ? (
          <CustomButton
            title="Message student"
            disabled={busy}
            onPress={() => void openChat()}
            backgroundColor={GLASS.primarySoft}
            textColor={GLASS.primary}
          />
        ) : null}

        <CustomButton
          title="Back to Requests"
          onPress={() => leaveHomeStackToTabs('Request')}
          backgroundColor="#EEF2FF"
          textColor="#4338CA"
        />
      </ScrollView>
    </GlassScreen>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <View style={{ marginBottom: 10, width: '100%' }}>
    <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700' }}>
      {label}
    </Text>
    <Text
      style={{
        color: '#0F172A',
        fontSize: 14,
        fontWeight: '600',
        marginTop: 2,
      }}
    >
      {value}
    </Text>
  </View>
);

export default TutorBookingRequestDetailsScreen;

const createStyles = (_colors: Record<string, unknown>) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: GLASS.headerBg,
      borderBottomWidth: 1,
      borderBottomColor: GLASS.cardBorder,
    },
    title: {
      flex: 1,
      textAlign: 'center',
      fontWeight: '800',
      fontSize: 17,
      color: GLASS.textPrimary,
    },
    content: { padding: GLASS.space.lg, paddingBottom: 40 },
    card: {
      backgroundColor: GLASS.cardBg,
      borderRadius: GLASS.radius.xl,
      padding: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      flexDirection: 'row',
      gap: 12,
      flexWrap: 'wrap',
      ...GLASS.shadow.soft,
    },
    avatar: { width: 64, height: 64, borderRadius: GLASS.radius.lg },
    name: { fontSize: 17, fontWeight: '800', color: GLASS.textPrimary },
    meta: { color: GLASS.textSecondary, marginTop: 2 },
    statusPill: {
      alignSelf: 'flex-start',
      marginTop: 8,
      backgroundColor: '#FEF3C7',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
    },
    statusText: { color: '#B45309', fontWeight: '800', fontSize: 11 },
    section: {
      width: '100%',
      fontWeight: '800',
      color: GLASS.textPrimary,
      marginBottom: 8,
    },
    hint: {
      width: '100%',
      color: GLASS.textSecondary,
      fontSize: 12,
      marginTop: 4,
    },
    input: {
      width: '100%',
      borderWidth: 1,
      borderColor: GLASS.inputBorder,
      backgroundColor: GLASS.inputBg,
      borderRadius: GLASS.radius.sm,
      padding: 12,
      marginBottom: 10,
      color: GLASS.textPrimary,
    },
    actions: { gap: 10, marginTop: 4, width: '100%' },
  });
