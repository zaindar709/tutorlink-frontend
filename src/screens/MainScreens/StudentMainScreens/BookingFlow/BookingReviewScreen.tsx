import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { IconButton } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import useUi from '../../../../hooks/ui/useUi';
import CustomButton from '../../../../components/CustomButton';
import { GlassScreen, GlassCard, GlassHeader } from '../../../../components/Glass';
import { GLASS } from '../../../../theme/glass';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  fetchBookingByIdThunk,
  rateBookingThunk,
} from '../../../../store/booking/bookingSlice';
import {
  addLocalRating,
} from '../../../../store/rating/ratingSlice';import {
  getBookingParticipantName,
} from '../../../../utils/api/bookingHelpers';
import { getBookingErrorMessage } from '../../../../utils/bookings/bookingErrors';
import { canRate } from '../../../../utils/bookings/bookingStatus';
import { leaveHomeStackToTabs } from '../../../../navigation/navigationRef';
import { getUserId } from '../../../../utils/api/userId';

const BookingReviewScreen = () => {
  const { colors } = useUi();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useAppDispatch();
  const bookingId = route.params?.bookingId as string;
  const booking = useAppSelector(state => state.booking.byId[bookingId]);
  const authUser = useAppSelector(state => state.auth.user);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(!booking);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await dispatch(fetchBookingByIdThunk(bookingId)).unwrap();
      } finally {
        setLoading(false);
      }
    })();
  }, [bookingId, dispatch]);

  const submit = async () => {
    if (!booking) return;
    if (!canRate(booking)) {
      Alert.alert(
        'Rating unavailable',
        'You can rate only after the session is completed.'
      );
      return;
    }
    setSubmitting(true);
    try {
      const tutorId =
        typeof booking.tutor === 'object'
          ? String(
              (booking.tutor as any)?._id ||
                (booking.tutor as any)?.id ||
                ''
            )
          : String(booking.tutor || '');
      const tutorName = getBookingParticipantName(booking, 'student');

      await dispatch(
        rateBookingThunk({
          bookingId,
          rating,
          review: comment.trim() || undefined,
        })
      ).unwrap();

      dispatch(
        addLocalRating({
          id: `${bookingId}-${Date.now()}`,
          bookingId,
          tutorId: tutorId || 'tutor',
          tutorName,
          subject: booking.subject,
          studentId: getUserId(authUser as any) || undefined,
          studentName:
            (authUser as any)?.name ||
            (authUser as any)?.fullName ||
            undefined,
          rating,
          liked: rating >= 4,
          review: comment.trim() || undefined,
          ratedAt: new Date().toISOString(),
        })
      );

      Alert.alert('Thanks!', 'Your review was submitted.', [
        {
          text: 'Done',
          onPress: () => leaveHomeStackToTabs('Home'),
        },
      ]);
    } catch (err) {
      Alert.alert('Could not submit', getBookingErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

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

  const tutorName = getBookingParticipantName(booking, 'student');

  return (
    <GlassScreen scroll={false} contentStyle={styles.screen}>
      <GlassHeader
        title="Rate your session"
        onBack={() => navigation.goBack()}
        style={styles.header}
      />

      <GlassCard style={styles.card}>
        <Text style={styles.name}>{tutorName}</Text>
        <Text style={styles.meta}>
          {booking.subject} · {String(booking.date).slice(0, 10)}
        </Text>

        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map(value => (
            <IconButton
              key={value}
              icon={value <= rating ? 'star' : 'star-outline'}
              iconColor={value <= rating ? GLASS.accent : GLASS.textMuted}
              size={28}
              onPress={() => setRating(value)}
            />
          ))}
        </View>

        <TextInput
          style={styles.input}
          multiline
          placeholder="Write your feedback… (optional)"
          placeholderTextColor={GLASS.placeholder}
          value={comment}
          onChangeText={setComment}
        />

        <CustomButton
          title={submitting ? 'Submitting…' : 'Submit review'}
          onPress={() => void submit()}
          disabled={submitting}
        />
      </GlassCard>
    </GlassScreen>
  );
};

export default BookingReviewScreen;

const createStyles = (_colors: Record<string, unknown>) =>
  StyleSheet.create({
    screen: { flex: 1 },
    header: {
      marginHorizontal: -GLASS.space.lg,
      marginBottom: GLASS.space.md,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    },
    card: {
      marginTop: GLASS.space.sm,
    },
    name: { fontSize: 18, fontWeight: '800', color: GLASS.textPrimary },
    meta: { color: GLASS.textSecondary, marginBottom: 8 },
    stars: { flexDirection: 'row', justifyContent: 'center' },
    input: {
      minHeight: 120,
      borderWidth: 1,
      borderColor: GLASS.inputBorder,
      borderRadius: GLASS.radius.md,
      padding: GLASS.space.md,
      textAlignVertical: 'top',
      color: GLASS.textPrimary,
      backgroundColor: GLASS.inputBg,
      marginBottom: 8,
    },
  });
