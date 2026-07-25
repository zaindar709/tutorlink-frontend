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
} from 'react-native';
import { Icon, IconButton } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import useUi from '../../../../hooks/ui/useUi';
import CustomButton from '../../../../components/CustomButton';
import { bookingFlowService } from '../../../../services/bookings/bookingFlowService';
import {
  TeachingMode,
  TimeSlot,
  TutorBookingProfile,
} from '../../../../types/bookingFlow.types';
import { MOCK_PAYMENT_METHODS } from '../../../../constants/bookingFlowMockData';
import { leaveHomeStackToTabs } from '../../../../navigation/navigationRef';

const tomorrowIso = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

const TutorBookingDetailsScreen = () => {
  const { colors, resp } = useUi();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors, resp), [colors, resp]);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const tutorId = route.params?.tutorId as string | undefined;
  const seedTutor = route.params?.tutor as TutorBookingProfile | undefined;
  const ctaLabel: 'Hire Tutor' | 'Book Now' =
    route.params?.ctaLabel === 'Book Now' ? 'Book Now' : 'Hire Tutor';

  const [tutor, setTutor] = useState<TutorBookingProfile | null>(
    seedTutor || null
  );
  const [similar, setSimilar] = useState<TutorBookingProfile[]>([]);
  const [loading, setLoading] = useState(!seedTutor);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [subject, setSubject] = useState('');
  const [mode, setMode] = useState<TeachingMode>('online');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [paymentId, setPaymentId] = useState(MOCK_PAYMENT_METHODS[0].id);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const profile =
          seedTutor || (await bookingFlowService.getTutorDetails(tutorId));
        if (!mounted) return;
        setTutor(profile);
        setSubject(profile.subjects[0] || 'General');
        setMode(profile.teachingMode === 'physical' ? 'physical' : 'online');
        const firstFree = profile.timeSlots.find((s: TimeSlot) => s.available);
        setSelectedSlot(firstFree || null);
        const sims = await bookingFlowService.listSimilarTutors(profile.id);
        if (mounted) setSimilar(sims);
      } finally {
        if (mounted) setLoading(false);
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
      <SafeAreaView style={styles.screen}>
        <ActivityIndicator
          style={{ marginTop: 40 }}
          color={colors.PRIMARY_COLOR as string}
        />
      </SafeAreaView>
    );
  }

  const durationHours = 1;
  const totalCost = Math.round(tutor.hourlyRate * durationHours);
  const payment = MOCK_PAYMENT_METHODS.find(p => p.id === paymentId);
  const footerBottomPad = Math.max(insets.bottom, 10);

  const openConfirm = () => {
    if (!selectedSlot) return;
    setConfirmOpen(true);
  };

  const confirmBooking = async () => {
    if (!selectedSlot) return;
    setSubmitting(true);
    try {
      const booking = await bookingFlowService.createBookingRequest({
        tutorId: tutor.id,
        tutor,
        subject,
        date: tomorrowIso(),
        slotId: selectedSlot.id,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        durationHours,
        teachingMode: mode,
        ctaLabel,
        notes: `Requested via ${ctaLabel}`,
      });
      setConfirmOpen(false);
      navigation.replace('BookingPendingScreen', { bookingId: booking.id });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
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
            iconColor="#0F172A"
          />
          <Text style={styles.topTitle}>Tutor details</Text>
          <View style={{ width: 48 }} />
        </View>

        <LinearGradient
          colors={['#7548F5', '#5B2FD6', '#4C1D95']}
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
              PKR {tutor.hourlyRate.toLocaleString()}/hr
            </Text>
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
          <Text style={styles.sectionTitle}>Availability</Text>
          <View style={styles.chipRow}>
            <View
              style={[
                styles.statusPill,
                tutor.availabilityStatus === 'available'
                  ? styles.statusAvailable
                  : styles.statusBusy,
              ]}
            >
              <Text style={styles.statusText}>
                {tutor.availabilityStatus === 'available'
                  ? 'Available now'
                  : 'Limited slots'}
              </Text>
            </View>
            <Text style={styles.muted}>{tutor.responseTime}</Text>
          </View>
          <Text style={[styles.sectionTitle, { marginTop: 14 }]}>
            Time slots · Tomorrow
          </Text>
          <View style={styles.chipRow}>
            {tutor.timeSlots.map(slot => {
              const selected = selectedSlot?.id === slot.id;
              return (
                <TouchableOpacity
                  key={slot.id}
                  disabled={!slot.available}
                  onPress={() => setSelectedSlot(slot)}
                  style={[
                    styles.slot,
                    !slot.available && styles.slotDisabled,
                    selected && styles.slotSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.slotText,
                      selected && styles.slotTextSelected,
                      !slot.available && styles.slotTextDisabled,
                    ]}
                  >
                    {slot.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
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
          <Text style={styles.body}>{tutor.bio}</Text>
          <Text style={[styles.muted, { marginTop: 10 }]}>
            {tutor.location} · {tutor.languages.join(', ')}
          </Text>
          <Text style={[styles.muted, { marginTop: 4 }]}>
            Member since {tutor.accountSummary.memberSince} ·{' '}
            {tutor.accountSummary.teachingStyle}
          </Text>
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
          <Text style={styles.footerLabel}>Total (1 hr)</Text>
          <Text style={styles.footerPrice}>
            PKR {totalCost.toLocaleString()}
          </Text>
        </View>
        <CustomButton
          title={ctaLabel}
          onPress={openConfirm}
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
            <Text style={styles.sheetTitle}>Confirm booking</Text>
            <Text style={styles.body}>
              {tutor.name} · {subject}
            </Text>
            <Text style={styles.muted}>
              Tomorrow · {selectedSlot?.label} (
              {selectedSlot?.startTime}–{selectedSlot?.endTime})
            </Text>
            <Text style={styles.muted}>
              {durationHours} hr · {mode === 'online' ? 'Online' : 'Physical'}
            </Text>
            <Text style={[styles.priceDark, { marginTop: 10 }]}>
              PKR {totalCost.toLocaleString()}
            </Text>

            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
              Payment method
            </Text>
            {MOCK_PAYMENT_METHODS.map(method => {
              const active = paymentId === method.id;
              return (
                <TouchableOpacity
                  key={method.id}
                  style={[styles.payRow, active && styles.payRowActive]}
                  onPress={() => setPaymentId(method.id)}
                >
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.certTitle}>{method.label}</Text>
                    <Text style={styles.muted}>{method.detail}</Text>
                  </View>
                  <Icon
                    source={active ? 'radiobox-marked' : 'radiobox-blank'}
                    size={22}
                    color="#7548F5"
                  />
                </TouchableOpacity>
              );
            })}

            <CustomButton
              title={submitting ? 'Confirming…' : 'Confirm Booking'}
              onPress={() => void confirmBooking()}
              disabled={submitting}
              loading={submitting}
              style={styles.sheetCta}
              textStyle={styles.footerCtaText}
            />
            <Text style={[styles.muted, { textAlign: 'center', marginTop: 8 }]}>
              Paying with {payment?.label}
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default TutorBookingDetailsScreen;

const createStyles = (_colors: Record<string, unknown>, resp: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#FFFFFF' },
    content: { paddingBottom: 24 },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
    },
    topTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: 17,
      fontWeight: '700',
      color: '#0F172A',
    },
    hero: {
      margin: 16,
      borderRadius: 24,
      padding: 16,
      flexDirection: 'row',
      gap: 14,
    },
    avatar: { width: 88, height: 88, borderRadius: 22 },
    heroText: { flex: 1 },
    nameRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 8,
    },
    name: { color: '#fff', fontSize: 20, fontWeight: '800' },
    verified: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(255,255,255,0.15)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 999,
    },
    verifiedText: { color: '#FDE68A', fontSize: 11, fontWeight: '700' },
    heroSub: { color: 'rgba(255,255,255,0.85)', marginTop: 4, fontSize: 13 },
    heroMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 8,
    },
    heroMetaText: { color: '#fff', fontSize: 13, fontWeight: '600' },
    price: { color: '#FDE68A', fontWeight: '800', fontSize: 16, marginTop: 8 },
    priceDark: { color: '#7548F5', fontWeight: '800', fontSize: 20 },
    statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16 },
    statCard: {
      flex: 1,
      backgroundColor: '#fff',
      borderRadius: 16,
      paddingVertical: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#E2E8F0',
    },
    statValue: { fontWeight: '800', fontSize: 16, color: '#0F172A' },
    statLabel: { color: '#64748B', fontSize: 11, marginTop: 2 },
    card: {
      marginHorizontal: 16,
      marginTop: 14,
      backgroundColor: '#fff',
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: '#E2E8F0',
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: '#0F172A',
      marginBottom: 10,
    },
    body: { color: '#475569', fontSize: 13, lineHeight: 20 },
    muted: { color: '#94A3B8', fontSize: 12 },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      alignItems: 'center',
    },
    statusPill: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
    },
    statusAvailable: { backgroundColor: '#DCFCE7' },
    statusBusy: { backgroundColor: '#FEF3C7' },
    statusText: { fontSize: 12, fontWeight: '700', color: '#166534' },
    slot: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: '#EEF2FF',
    },
    slotSelected: { backgroundColor: '#7548F5' },
    slotDisabled: { backgroundColor: '#F1F5F9' },
    slotText: { color: '#4338CA', fontWeight: '700', fontSize: 13 },
    slotTextSelected: { color: '#fff' },
    slotTextDisabled: { color: '#94A3B8' },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: '#F1F5F9',
    },
    chipActive: { backgroundColor: '#EDE9FE' },
    chipText: { color: '#64748B', fontWeight: '600', fontSize: 12 },
    chipTextActive: { color: '#7548F5' },
    certRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 12,
      alignItems: 'center',
    },
    certTitle: { fontWeight: '700', color: '#0F172A', fontSize: 13 },
    reviewRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
    reviewAvatar: { width: 40, height: 40, borderRadius: 20 },
    similarCard: {
      width: 110,
      marginRight: 10,
      backgroundColor: '#F8FAFC',
      borderRadius: 14,
      padding: 10,
      alignItems: 'center',
    },
    similarAvatar: { width: 56, height: 56, borderRadius: 18, marginBottom: 8 },
    similarName: { fontWeight: '700', fontSize: 12, color: '#0F172A' },
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
      backgroundColor: '#fff',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: '#E2E8F0',
      gap: 12,
    },
    footerPriceBlock: { flexShrink: 1, maxWidth: '40%' },
    footerLabel: { color: '#94A3B8', fontSize: 12 },
    footerPrice: { color: '#0F172A', fontWeight: '800', fontSize: 17 },
    footerCta: {
      width: 168,
      height: 48,
      paddingHorizontal: 10,
      borderRadius: 14,
      elevation: 0,
      alignSelf: 'center',
    },
    footerCtaText: { fontSize: 15 },
    sheetCta: {
      width: resp.dx(320),
      maxWidth: '100%',
      height: 52,
      marginTop: 16,
      borderRadius: 14,
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
      backgroundColor: '#fff',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 20,
      paddingTop: 10,
      maxHeight: '88%',
    },
    sheetHandle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: '#CBD5E1',
      marginBottom: 12,
    },
    sheetTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: '#0F172A',
      marginBottom: 8,
    },
    payRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      marginBottom: 8,
    },
    payRowActive: { borderColor: '#7548F5', backgroundColor: '#F5F3FF' },
  });
