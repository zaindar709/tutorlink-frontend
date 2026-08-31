import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { GLASS } from '../theme/glass';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  closeRateTutorModal,
  hydrateRatingsThunk,
  submitTutorRatingThunk,
} from '../store/rating/ratingSlice';
import { upsertBookingLocal } from '../store/booking/bookingSlice';
import { getUserId } from '../utils/api/userId';
import type { Booking } from '../types/api.types';
/**
 * Opens after a student ends a live class — stars + like, saved via Redux.
 */
export default function RateTutorModal() {
  const dispatch = useAppDispatch();
  const pending = useAppSelector(s => s.rating.pendingModal);
  const submitting = useAppSelector(s => s.rating.submitting);
  const authUser = useAppSelector(s => s.auth.user);
  const hydrated = useAppSelector(s => s.rating.hydrated);
  const booking = useAppSelector(s =>
    pending?.bookingId ? s.booking.byId[pending.bookingId] : undefined
  );

  const [rating, setRating] = useState(5);
  const [liked, setLiked] = useState(true);
  const [review, setReview] = useState('');

  useEffect(() => {
    if (!hydrated) {
      void dispatch(hydrateRatingsThunk());
    }
  }, [dispatch, hydrated]);

  useEffect(() => {
    if (pending) {
      setRating(5);
      setLiked(true);
      setReview('');
    }
  }, [pending?.bookingId]);

  const visible = Boolean(pending);

  const stars = useMemo(() => [1, 2, 3, 4, 5], []);

  const handleClose = () => {
    dispatch(closeRateTutorModal());
  };

  const handleSubmit = async () => {
    if (!pending) return;
    const studentId = getUserId(authUser as any) || undefined;
    const studentName =
      (authUser as any)?.name ||
      (authUser as any)?.fullName ||
      'Afifa';

    const result = await dispatch(
      submitTutorRatingThunk({
        bookingId: pending.bookingId,
        tutorId: pending.tutorId,
        tutorName: pending.tutorName || 'Ammar',
        subject: pending.subject,
        studentId,
        studentName,
        rating,
        liked,
        review: review.trim() || undefined,
      })
    );

    if (submitTutorRatingThunk.fulfilled.match(result) && booking) {
      const next: Booking = {
        ...booking,
        studentRating: rating,
        studentReview: review.trim() || undefined,
        ratedAt: result.payload.ratedAt,
      };
      dispatch(upsertBookingLocal(next));
    }
  };

  if (!pending) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.card} onPress={e => e.stopPropagation()}>
          <Text style={styles.eyebrow}>Rate your tutor</Text>
          <Text style={styles.title}>{pending.tutorName}</Text>
          <Text style={styles.meta}>
            {pending.subject}
            {pending.subject ? ' · ' : ''}
            How was this class?
          </Text>

          <View style={styles.stars}>
            {stars.map(value => (
              <TouchableOpacity
                key={value}
                onPress={() => setRating(value)}
                hitSlop={8}
              >
                <MaterialCommunityIcons
                  name={value <= rating ? 'star' : 'star-outline'}
                  size={34}
                  color={value <= rating ? '#F59E0B' : GLASS.textMuted}
                />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.likeBtn, liked && styles.likeBtnOn]}
            onPress={() => setLiked(v => !v)}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons
              name={liked ? 'thumb-up' : 'thumb-up-outline'}
              size={20}
              color={liked ? '#fff' : GLASS.primary}
            />
            <Text style={[styles.likeText, liked && styles.likeTextOn]}>
              {liked ? 'Liked this tutor' : 'Like this tutor'}
            </Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Optional feedback…"
            placeholderTextColor={GLASS.textMuted}
            value={review}
            onChangeText={setReview}
            multiline
            maxLength={400}
          />

          <TouchableOpacity
            style={[styles.submit, submitting && styles.submitDisabled]}
            disabled={submitting}
            onPress={() => void handleSubmit()}
            activeOpacity={0.9}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Submit rating</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleClose} style={styles.skip}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.55)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(117,72,245,0.15)',
  },
  eyebrow: {
    color: GLASS.primary,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 6,
    color: GLASS.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  meta: {
    marginTop: 4,
    color: GLASS.textSecondary,
    fontSize: 14,
  },
  stars: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 18,
    marginBottom: 14,
  },
  likeBtn: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: GLASS.primary,
    backgroundColor: 'rgba(117,72,245,0.06)',
    marginBottom: 14,
  },
  likeBtnOn: {
    backgroundColor: GLASS.primary,
    borderColor: GLASS.primary,
  },
  likeText: {
    color: GLASS.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  likeTextOn: {
    color: '#fff',
  },
  input: {
    minHeight: 80,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: GLASS.cardBorder || '#E2E8F0',
    padding: 12,
    color: GLASS.textPrimary,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  submit: {
    marginTop: 16,
    height: 48,
    borderRadius: 14,
    backgroundColor: GLASS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  skip: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 6,
  },
  skipText: {
    color: GLASS.textMuted,
    fontWeight: '600',
    fontSize: 13,
  },
});
