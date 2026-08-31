import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { Icon, IconButton } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import useUi from '../../../../hooks/ui/useUi';
import CustomButton from '../../../../components/CustomButton';
import { GlassScreen } from '../../../../components/Glass';
import { GLASS } from '../../../../theme/glass';
import { enrichTutorFromSearch } from '../../../../constants/bookingFlowMockData';
import {
  TeachingMode,
  TimeSlot,
  TutorBookingProfile,
} from '../../../../types/bookingFlow.types';
import { leaveHomeStackToTabs } from '../../../../navigation/navigationRef';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { createBookingThunk } from '../../../../store/booking/bookingSlice';
import { resolveTutorUserId } from '../../../../utils/bookings/bookingMappers';
import { getBookingErrorMessage } from '../../../../utils/bookings/bookingErrors';
import {
  filterFutureSlots,
  getSessionDurationHours,
  pickFirstFutureSlot,
} from '../../../../utils/bookings/bookingStatus';
import { formatDateParam, getUserId } from '../../../../utils/api/userId';
import { fetchTutorById } from '../../../../services/tutors/tutorsService';
import AppToast from '../../../../components/AppToast/AppToast';
import {
  invalidateStudentTutorRelationsCache,
  useStudentTutorRelations,
} from '../../../../hooks/api/useStudentTutorRelations';
import { MOCK_WALLET_DEPOSITS } from '../../../../config/features';
import { getAvailableWalletBalance } from '../../../../services/wallet/mockWallet';
import { ApiUser, CreateBookingPayload } from '../../../../types/api.types';
import {
  getWorkDatesForDuration,
  isWeekendDate,
  nextWeekdayOnOrAfter,
} from '../../../../utils/schedule/scheduleHelpers';

const MONTHLY_DURATION_DAYS = 30;
const DATE_OPTIONS_COUNT = 10;

const buildDateOptions = () => {
  const start = nextWeekdayOnOrAfter(new Date());
  const options: { iso: string; label: string }[] = [];
  const cursor = new Date(start);
  while (options.length < DATE_OPTIONS_COUNT) {
    if (!isWeekendDate(cursor)) {
      const iso = formatDateParam(cursor);
      let label = cursor.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      const todayIso = formatDateParam(new Date());
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowIso = formatDateParam(tomorrow);
      if (iso === todayIso) label = 'Today';
      else if (iso === tomorrowIso) label = 'Tomorrow';
      options.push({ iso, label });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return options;
};

const TutorBookingDetailsScreen = () => {
  const { colors, resp } = useUi();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors, resp), [colors, resp]);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useAppDispatch();
  const authUser = useAppSelector(state => state.auth.user as ApiUser | null);
  const { getRelation, refresh: refreshRelations } = useStudentTutorRelations();

  const tutorId = route.params?.tutorId as string | undefined;
  const seedTutor = route.params?.tutor as TutorBookingProfile | undefined;
  const ctaLabel: 'Hire Tutor' | 'Book Now' =
    route.params?.ctaLabel === 'Book Now' ? 'Book Now' : 'Hire Tutor';

  const dateOptions = useMemo(() => buildDateOptions(), []);

  const [tutor, setTutor] = useState<TutorBookingProfile | null>(
    seedTutor || null
  );
  const [similar, setSimilar] = useState<TutorBookingProfile[]>([]);
  const [loading, setLoading] = useState(!seedTutor);
  const [refreshingRate, setRefreshingRate] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dateOptions[0]?.iso || '');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [subject, setSubject] = useState('');
  const [mode, setMode] = useState<TeachingMode>('online');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        let profile =
          seedTutor ||
          (tutorId ? enrichTutorFromSearch({ _id: tutorId }) : null);

        // Refresh hourlyRate from server — search often omits it; local tutor UI is AsyncStorage-only.
        const idsToTry = Array.from(
          new Set(
            [seedTutor?.userId, seedTutor?.id, tutorId].filter(Boolean) as string[]
          )
        );
        setRefreshingRate(true);
        for (const id of idsToTry) {
          const live = await fetchTutorById(id);
          if (!live || !mounted) continue;
          const enrichedLive = enrichTutorFromSearch(live);
          profile = {
            ...(profile || enrichedLive),
            ...enrichedLive,
            name: enrichedLive.name || profile?.name || 'Tutor',
            avatarUrl: enrichedLive.avatarUrl || profile?.avatarUrl || '',
            userId: enrichedLive.userId || profile?.userId,
            hourlyRate:
              enrichedLive.hourlyRate > 0
                ? enrichedLive.hourlyRate
                : profile?.hourlyRate || 0,
            timeSlots:
              profile?.timeSlots?.length
                ? profile.timeSlots
                : enrichedLive.timeSlots,
          };
          console.log('[Booking] live tutor rate', {
            id,
            rate: enrichedLive.hourlyRate,
            userId: enrichedLive.userId,
          });
          if (enrichedLive.hourlyRate > 0) break;
        }

        if (!mounted || !profile) return;
        setTutor(profile);
        setSubject(profile.subjects[0] || 'General');
        setMode(profile.teachingMode === 'physical' ? 'physical' : 'online');
        const initialDate = dateOptions[0]?.iso || formatDateParam(new Date());
        setSelectedDate(initialDate);
        setSelectedSlot(
          pickFirstFutureSlot(profile.timeSlots, initialDate) ||
            profile.timeSlots[0] ||
            null
        );
        if (mounted) setSimilar([]);
      } finally {
        if (mounted) {
          setLoading(false);
          setRefreshingRate(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [tutorId, seedTutor]);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    leaveHomeStackToTabs('Home');
  };

  if (loading || !tutor) {
    return (
      <GlassScreen
        scroll={false}
        contentStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <ActivityIndicator color={colors.PRIMARY_COLOR as string} />
      </GlassScreen>
    );
  }

  const durationHours = selectedSlot
    ? getSessionDurationHours(selectedSlot.startTime, selectedSlot.endTime)
    : 1;
  const totalCost = Math.round(Math.max(0, tutor.hourlyRate) * durationHours);
  const footerBottomPad = Math.max(insets.bottom, 10);
  const selectedDateLabel =
    dateOptions.find(d => d.iso === selectedDate)?.label || selectedDate;
  const relation = getRelation([tutor.id, tutor.userId, tutorId]);
  const footerCtaLabel = relation.canBook ? ctaLabel : relation.label;
  const bookableSlots = useMemo(
    () => filterFutureSlots(tutor.timeSlots, selectedDate),
    [tutor.timeSlots, selectedDate]
  );

  React.useEffect(() => {
    const stillValid =
      selectedSlot &&
      bookableSlots.some(
        s =>
          s.id === selectedSlot.id ||
          (s.startTime === selectedSlot.startTime &&
            s.endTime === selectedSlot.endTime)
      );
    if (!stillValid) {
      setSelectedSlot(bookableSlots[0] || null);
    }
    // Only re-pick when date/slots change — not when selectedSlot itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, bookableSlots]);

  const openConfirm = () => {
    const currentRelation = getRelation([
      tutor.id,
      tutor.userId,
      tutorId,
    ]);
    if (!currentRelation.canBook) {
      if (currentRelation.state === 'request_sent' && currentRelation.booking) {
        navigation.replace('BookingPendingScreen', {
          bookingId: currentRelation.booking._id,
        });
        return;
      }
      leaveHomeStackToTabs('Bookings');
      return;
    }
    if (!selectedSlot) {
      Alert.alert(
        'Choose a time',
        bookableSlots.length === 0
          ? 'No future times left for this day. Pick another date.'
          : 'Pick a preferred class time for your request.'
      );
      return;
    }
    if (!selectedDate) {
      Alert.alert('Choose a date', 'Pick a preferred class date.');
      return;
    }
    if (!subject.trim()) {
      Alert.alert('Subject required', 'Please choose a subject.');
      return;
    }
    if (!tutor.userId) {
      Alert.alert(
        'Cannot book',
        'Tutor account id is missing from search. Please go back and open this tutor again from Search.'
      );
      return;
    }
    if (!(tutor.hourlyRate > 0)) {
      Alert.alert(
        'Tutor fee missing on server',
        'Student APIs still return hourlyRate = 0 for this tutor.\n\nFee on the tutor phone is often only saved in local storage — not on the backend.\n\nTutor: Profile → Edit Profile → set fee → Save until sync succeeds. Backend must store hourlyRate on TutorProfile and return it from /api/tutors/search.'
      );
      return;
    }
    setConfirmOpen(true);
  };

  const confirmBooking = async () => {
    if (!selectedSlot || submitting) return;

    const relation = getRelation([tutor.id, tutor.userId, tutorId]);
    if (!relation.canBook) {
      setConfirmOpen(false);
      Alert.alert(
        relation.state === 'request_sent'
          ? 'Request already sent'
          : 'Already booked',
        relation.state === 'request_sent'
          ? 'You already have a pending request with this tutor.'
          : 'You already have an active booking with this tutor.'
      );
      return;
    }

    const tutorUserId = resolveTutorUserId({
      _id: tutor.id,
      userId: tutor.userId,
      user: tutor.userId ? { _id: tutor.userId } : undefined,
    });

    if (!tutorUserId) {
      Alert.alert(
        'Cannot book',
        'Tutor account id is missing (need User id, not profile id). Please go back to Search and open this tutor again.'
      );
      return;
    }

    const sessionCount = getWorkDatesForDuration(
      new Date(selectedDate + 'T12:00:00'),
      MONTHLY_DURATION_DAYS
    ).length;

    const payload: CreateBookingPayload = {
      tutor: tutorUserId,
      tutorId: tutorUserId,
      subject: subject.trim(),
      date: selectedDate,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      mode: 'monthly_weekdays',
      durationDays: MONTHLY_DURATION_DAYS,
    };

    console.log('[Booking] POST /api/bookings', payload, {
      estimatedWeekdaySessions: sessionCount,
    });

    setSubmitting(true);
    try {
      if (MOCK_WALLET_DEPOSITS) {
        const available = await getAvailableWalletBalance(getUserId(authUser));
        if (available < totalCost) {
          setSubmitting(false);
          setConfirmOpen(false);
          Alert.alert(
            'Add mock funds first',
            `This session needs about PKR ${totalCost.toLocaleString()}.\n\nWallet available: PKR ${available.toLocaleString()}.\n\nOpen Wallet → Add Mock Funds, then book again.`,
            [
              {
                text: 'Open Wallet',
                onPress: () => navigation.navigate('WalletScreen'),
              },
              { text: 'OK', style: 'cancel' },
            ]
          );
          return;
        }
      }

      const booking = await dispatch(createBookingThunk(payload)).unwrap();
      setConfirmOpen(false);
      setToastMsg('Monthly Mon–Fri request sent');
      invalidateStudentTutorRelationsCache();
      void refreshRelations();
      navigation.replace('BookingPendingScreen', { bookingId: booking._id });
    } catch (err) {
      Alert.alert('Booking failed', getBookingErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GlassScreen
      scroll={false}
      edges={['top', 'left', 'right']}
      contentStyle={styles.screen}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 88 + footerBottomPad },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <IconButton
            icon="arrow-left"
            size={22}
            onPress={handleBack}
            iconColor={GLASS.textPrimary}
          />
          <Text style={styles.topTitle}>Tutor details</Text>
          <View style={{ width: 48 }} />
        </View>

        <LinearGradient
          colors={[...GLASS.buttonGradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Image source={{ uri: tutor.avatarUrl }} style={styles.avatar} />
          <View style={styles.heroText}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{tutor.name}</Text>
              {tutor.isVerified ? (
                <View style={styles.verified}>
                  <Icon source="check-decagram" size={16} color="#FDE68A" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.heroSub}>{tutor.qualification}</Text>
            <View style={styles.heroMeta}>
              <Icon source="star" size={16} color="#FDE68A" />
              <Text style={styles.heroMetaText}>
                {tutor.rating.toFixed(1)} ({tutor.totalReviews} reviews)
              </Text>
            </View>
            <Text style={styles.price}>
              {refreshingRate
                ? 'Loading rate…'
                : `PKR ${tutor.hourlyRate.toLocaleString()}/hr`}
            </Text>
            {!(tutor.hourlyRate > 0) && !refreshingRate ? (
              <Text style={{ color: '#FECACA', fontSize: 11, marginTop: 4 }}>
                Server rate missing — booking blocked
              </Text>
            ) : null}
          </View>
        </LinearGradient>

        <View style={styles.statsRow}>
          {[
            { label: 'Sessions', value: String(tutor.completedSessions) },
            { label: 'Success', value: `${tutor.successRate}%` },
            { label: 'Exp.', value: `${tutor.experienceYears}y` },
          ].map(stat => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Preferred class time</Text>
          <View style={styles.monthlyBanner}>
            <Icon source="calendar-month" size={18} color={GLASS.primary} />
            <Text style={styles.monthlyBannerText}>
              Monthly tuition · Mon–Fri at this time · weekends off (~
              {MONTHLY_DURATION_DAYS} days)
            </Text>
          </View>
          <Text style={styles.hint}>
            Pick the first weekday and time. After the tutor accepts, classes
            continue every Mon–Fri at this slot. You will get a reminder before
            each class.
          </Text>

          <Text style={[styles.subLabel, { marginTop: 12 }]}>Date</Text>
          <View style={styles.chipRow}>
            {dateOptions.map(option => {
              const selected = selectedDate === option.iso;
              return (
                <TouchableOpacity
                  key={option.iso}
                  onPress={() => setSelectedDate(option.iso)}
                  style={[styles.slot, selected && styles.slotSelected]}
                >
                  <Text
                    style={[
                      styles.slotText,
                      selected && styles.slotTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.subLabel, { marginTop: 14 }]}>Start time</Text>
          {bookableSlots.length === 0 ? (
            <Text style={styles.hint}>
              No future slots left for this day. Choose tomorrow or another
              date.
            </Text>
          ) : (
            <View style={styles.chipRow}>
              {bookableSlots.map(slot => {
                const selected = selectedSlot?.id === slot.id;
                return (
                  <TouchableOpacity
                    key={slot.id}
                    onPress={() => setSelectedSlot(slot)}
                    style={[styles.slot, selected && styles.slotSelected]}
                  >
                    <Text
                      style={[
                        styles.slotText,
                        selected && styles.slotTextSelected,
                      ]}
                    >
                      {slot.startTime}–{slot.endTime}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Subjects</Text>
          <View style={styles.chipRow}>
            {tutor.subjects.map(item => {
              const active = subject === item;
              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => setSubject(item)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 14 }]}>
            Teaching mode
          </Text>
          <View style={styles.chipRow}>
            {(['online', 'physical'] as TeachingMode[]).map(item => {
              const active = mode === item;
              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => setMode(item)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {item === 'online' ? 'Online' : 'Physical'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.body}>{tutor.bio || 'No bio added yet.'}</Text>
          <Text style={[styles.muted, { marginTop: 10 }]}>
            {tutor.location} · {tutor.languages.join(', ')}
          </Text>
          {tutor.accountSummary.memberSince ? (
            <Text style={[styles.muted, { marginTop: 4 }]}>
              Member since {tutor.accountSummary.memberSince}
              {tutor.accountSummary.teachingStyle
                ? ` · ${tutor.accountSummary.teachingStyle}`
                : ''}
            </Text>
          ) : null}
        </View>

        {tutor.certificates.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Certificates</Text>
            {tutor.certificates.map(cert => (
              <View key={cert.id} style={styles.certRow}>
                <Icon source="certificate" size={20} color="#7548F5" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.certTitle}>{cert.title}</Text>
                  <Text style={styles.muted}>
                    {cert.issuer} · {cert.year}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Student reviews</Text>
          {tutor.reviews.length === 0 ? (
            <Text style={styles.muted}>No reviews yet.</Text>
          ) : (
            tutor.reviews.map(review => (
              <View key={review.id} style={styles.reviewRow}>
                <Image
                  source={{ uri: review.studentAvatar }}
                  style={styles.reviewAvatar}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.certTitle}>{review.studentName}</Text>
                  <Text style={styles.muted}>
                    {'★'.repeat(review.rating)}
                    {review.subject ? ` · ${review.subject}` : ''}
                  </Text>
                  <Text style={styles.body}>{review.comment}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {similar.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Similar tutors</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {similar.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.similarCard}
                  onPress={() =>
                    navigation.push('TutorBookingDetailsScreen', {
                      tutorId: item.id,
                      ctaLabel,
                    })
                  }
                >
                  <Image
                    source={{ uri: item.avatarUrl }}
                    style={styles.similarAvatar}
                  />
                  <Text style={styles.similarName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.muted}>{item.rating.toFixed(1)} ★</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: footerBottomPad }]}>
        <View style={styles.footerPriceBlock}>
          <Text style={styles.footerLabel}>Est. / class ({durationHours} hr)</Text>
          <Text style={styles.footerPrice}>
            PKR {totalCost.toLocaleString()}
          </Text>
        </View>
        <CustomButton
          title={footerCtaLabel}
          onPress={openConfirm}
          disabled={!relation.canBook}
          style={styles.footerCta}
          textStyle={styles.footerCtaText}
        />
      </View>

      <Modal
        visible={confirmOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setConfirmOpen(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setConfirmOpen(false)}
          />
          <View
            style={[
              styles.sheet,
              { paddingBottom: Math.max(insets.bottom, 20) },
            ]}
          >
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Send monthly tuition request</Text>
            <Text style={styles.body}>
              {tutor.name} · {subject}
            </Text>
            <Text style={styles.muted}>
              Starts {selectedDateLabel} · {selectedSlot?.startTime}–
              {selectedSlot?.endTime} · Mon–Fri
            </Text>
            <Text style={styles.muted}>
              {durationHours} hr/day · {mode === 'online' ? 'Online' : 'Physical'}{' '}
              · ~{MONTHLY_DURATION_DAYS} days (weekends off)
            </Text>
            <Text style={[styles.hint, { marginTop: 10 }]}>
              Tutor sees this on Requests. After accept, weekday classes continue
              at this time and both of you get class reminders.
            </Text>
            <Text style={[styles.priceDark, { marginTop: 10 }]}>
              PKR {totalCost.toLocaleString()}
            </Text>

            <View
              style={[styles.payRow, styles.payRowActive, { marginTop: 16 }]}
            >
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.certTitle}>TutorLink Wallet</Text>
                <Text style={styles.muted}>
                  No charge yet. Escrow is held when the tutor accepts.
                </Text>
              </View>
              <Icon source="wallet-outline" size={22} color="#7548F5" />
            </View>

            <CustomButton
              title={submitting ? 'Sending…' : 'Send request'}
              onPress={() => void confirmBooking()}
              disabled={submitting}
              loading={submitting}
              style={styles.sheetCta}
              textStyle={styles.footerCtaText}
            />
            <Text style={[styles.muted, { textAlign: 'center', marginTop: 8 }]}>
              You can cancel while the request is pending.
            </Text>
          </View>
        </View>
      </Modal>

      <AppToast
        visible={Boolean(toastMsg)}
        message={toastMsg}
        onHide={() => setToastMsg('')}
      />
    </GlassScreen>
  );
};

export default TutorBookingDetailsScreen;

const createStyles = (_colors: Record<string, unknown>, resp: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: 'transparent' },
    content: { paddingBottom: 24 },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f6f7fc',
      borderBottomWidth: 0,
    },
    topTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: 17,
      fontWeight: '700',
      color: GLASS.textPrimary,
    },
    hero: {
      margin: 16,
      borderRadius: GLASS.radius.xl,
      padding: 16,
      flexDirection: 'row',
      gap: 14,
    },
    avatar: { width: 88, height: 88, borderRadius: GLASS.radius.lg },
    heroText: { flex: 1 },
    nameRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 8,
    },
    name: { color: GLASS.textOnPrimary, fontSize: 20, fontWeight: '800' },
    verified: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(255,255,255,0.15)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: GLASS.radius.full,
    },
    verifiedText: { color: GLASS.accent, fontSize: 11, fontWeight: '700' },
    heroSub: { color: 'rgba(255,255,255,0.85)', marginTop: 4, fontSize: 13 },
    heroMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 8,
    },
    heroMetaText: {
      color: GLASS.textOnPrimary,
      fontSize: 13,
      fontWeight: '600',
    },
    price: {
      color: GLASS.accent,
      fontWeight: '800',
      fontSize: 16,
      marginTop: 8,
    },
    priceDark: { color: GLASS.primary, fontWeight: '800', fontSize: 20 },
    statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16 },
    statCard: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      borderRadius: GLASS.radius.lg,
      paddingVertical: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      ...GLASS.shadow.soft,
    },
    statValue: { fontWeight: '800', fontSize: 16, color: GLASS.textPrimary },
    statLabel: { color: GLASS.textSecondary, fontSize: 11, marginTop: 2 },
    card: {
      marginHorizontal: 16,
      marginTop: 14,
      backgroundColor: '#FFFFFF',
      borderRadius: GLASS.radius.xl,
      padding: 16,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      ...GLASS.shadow.soft,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: GLASS.textPrimary,
      marginBottom: 10,
    },
    subLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: GLASS.textSecondary,
      marginBottom: 8,
    },
    monthlyBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: 'rgba(117, 72, 245, 0.08)',
      borderRadius: GLASS.radius.md,
      paddingHorizontal: 10,
      paddingVertical: 8,
      marginBottom: 10,
    },
    monthlyBannerText: {
      flex: 1,
      fontSize: 12,
      fontWeight: '600',
      color: GLASS.primary,
      lineHeight: 16,
    },
    hint: {
      color: GLASS.textSecondary,
      fontSize: 12,
      lineHeight: 18,
      marginBottom: 4,
    },
    body: { color: GLASS.textSecondary, fontSize: 13, lineHeight: 20 },
    muted: { color: GLASS.textMuted, fontSize: 12 },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      alignItems: 'center',
    },
    slot: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: GLASS.radius.md,
      backgroundColor: GLASS.primarySoft,
    },
    slotSelected: { backgroundColor: GLASS.primary },
    slotText: { color: GLASS.primaryDeep, fontWeight: '700', fontSize: 13 },
    slotTextSelected: { color: GLASS.textOnPrimary },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: GLASS.radius.full,
      backgroundColor: GLASS.primarySoft,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
    },
    chipActive: {
      backgroundColor: GLASS.primary,
      borderColor: GLASS.primary,
    },
    chipText: { color: GLASS.textSecondary, fontWeight: '600', fontSize: 12 },
    chipTextActive: { color: GLASS.textOnPrimary },
    certRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 12,
      alignItems: 'center',
    },
    certTitle: { fontWeight: '700', color: GLASS.textPrimary, fontSize: 13 },
    reviewRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
    reviewAvatar: { width: 40, height: 40, borderRadius: 20 },
    similarCard: {
      width: 110,
      marginRight: 10,
      backgroundColor: GLASS.primarySoft,
      borderRadius: GLASS.radius.md,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      padding: 10,
      alignItems: 'center',
    },
    similarAvatar: {
      width: 56,
      height: 56,
      borderRadius: GLASS.radius.lg,
      marginBottom: 8,
    },
    similarName: { fontWeight: '700', fontSize: 12, color: GLASS.textPrimary },
    footer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 12,
      backgroundColor: '#f6f7fc',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: GLASS.cardBorder,
      gap: 12,
    },
    footerPriceBlock: { flexShrink: 1, maxWidth: '40%' },
    footerLabel: { color: GLASS.textMuted, fontSize: 12 },
    footerPrice: { color: GLASS.textPrimary, fontWeight: '800', fontSize: 17 },
    footerCta: {
      width: 168,
      height: 48,
      paddingHorizontal: 10,
      borderRadius: GLASS.radius.md,
      elevation: 0,
      alignSelf: 'center',
    },
    footerCtaText: { fontSize: 15 },
    sheetCta: {
      width: resp.dx(320),
      maxWidth: '100%',
      height: 52,
      marginTop: 16,
      borderRadius: GLASS.radius.md,
      elevation: 0,
      paddingHorizontal: 12,
      alignSelf: 'center',
    },
    modalRoot: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    modalBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(15,23,42,0.45)',
    },
    sheet: {
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: GLASS.radius.xl,
      borderTopRightRadius: GLASS.radius.xl,
      paddingHorizontal: 20,
      paddingTop: 10,
      maxHeight: '88%',
    },
    sheetHandle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: GLASS.inputBorder,
      marginBottom: 12,
    },
    sheetTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: GLASS.textPrimary,
      marginBottom: 8,
    },
    payRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12,
      borderRadius: GLASS.radius.md,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      marginBottom: 8,
      backgroundColor: GLASS.primarySoft,
    },
    payRowActive: {
      borderColor: GLASS.cardBorderStrong,
      backgroundColor: GLASS.primarySoft,
    },
  });
