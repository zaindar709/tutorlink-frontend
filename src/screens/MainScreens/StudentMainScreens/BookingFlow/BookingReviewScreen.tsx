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
import { bookingFlowService } from '../../../../services/bookings/bookingFlowService';
import { BookingFlowItem } from '../../../../types/bookingFlow.types';

const BookingReviewScreen = () => {
  const { colors } = useUi();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const bookingId = route.params?.bookingId as string;

  const [booking, setBooking] = useState<BookingFlowItem | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setBooking(await bookingFlowService.getBooking(bookingId));
      } finally {
        setLoading(false);
      }
    })();
  }, [bookingId]);

  const submit = async () => {
    if (!comment.trim()) {
      Alert.alert('Add a short review', 'Tell others how the session went.');
      return;
    }
    setSubmitting(true);
    try {
      await bookingFlowService.submitReview({
        bookingId,
        rating,
        comment: comment.trim(),
      });
      Alert.alert('Thanks!', 'Your review was submitted.', [
        {
          text: 'Done',
          onPress: () => navigation.navigate('MyTabs', { screen: 'Home' }),
        },
      ]);
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

  return (
    <GlassScreen scroll={false} contentStyle={styles.screen}>
      <GlassHeader
        title="Rate your session"
        onBack={() => navigation.goBack()}
        style={styles.header}
      />

      <GlassCard style={styles.card}>
        <Text style={styles.name}>{booking.tutor.name}</Text>
        <Text style={styles.meta}>
          {booking.subject} · {booking.date}
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
          placeholder="Write your feedback…"
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
