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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import useUi from '../../../../hooks/ui/useUi';
import CustomButton from '../../../../components/CustomButton';
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
      <SafeAreaView style={styles.screen}>
        <ActivityIndicator style={{ marginTop: 40 }} color="#7548F5" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
        <Text style={styles.title}>Rate your session</Text>
        <View style={{ width: 48 }} />
      </View>

      <View style={styles.card}>
        <Text style={styles.name}>{booking.tutor.name}</Text>
        <Text style={styles.meta}>
          {booking.subject} · {booking.date}
        </Text>

        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map(value => (
            <IconButton
              key={value}
              icon={value <= rating ? 'star' : 'star-outline'}
              iconColor={value <= rating ? '#F59E0B' : '#CBD5E1'}
              size={28}
              onPress={() => setRating(value)}
            />
          ))}
        </View>

        <TextInput
          style={styles.input}
          multiline
          placeholder="Write your feedback…"
          placeholderTextColor="#94A3B8"
          value={comment}
          onChangeText={setComment}
        />

        <CustomButton
          title={submitting ? 'Submitting…' : 'Submit review'}
          onPress={() => void submit()}
          disabled={submitting}
        />
      </View>
    </SafeAreaView>
  );
};

export default BookingReviewScreen;

const createStyles = (_colors: Record<string, unknown>) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff' },
    title: {
      flex: 1,
      textAlign: 'center',
      fontWeight: '800',
      fontSize: 17,
      color: '#0F172A',
    },
    card: {
      margin: 16,
      backgroundColor: '#fff',
      borderRadius: 20,
      padding: 18,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      gap: 8,
    },
    name: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
    meta: { color: '#64748B', marginBottom: 8 },
    stars: { flexDirection: 'row', justifyContent: 'center' },
    input: {
      minHeight: 120,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      borderRadius: 14,
      padding: 12,
      textAlignVertical: 'top',
      color: '#0F172A',
      marginBottom: 8,
    },
  });
