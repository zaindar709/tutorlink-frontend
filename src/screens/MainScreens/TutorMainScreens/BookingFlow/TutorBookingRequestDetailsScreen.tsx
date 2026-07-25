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
} from 'react-native';
import { IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import useUi from '../../../../hooks/ui/useUi';
import CustomButton from '../../../../components/CustomButton';
import { bookingFlowService } from '../../../../services/bookings/bookingFlowService';
import { BookingFlowItem } from '../../../../types/bookingFlow.types';

const TutorBookingRequestDetailsScreen = () => {
  const { colors } = useUi();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const bookingId = (route.params?.bookingId as string) || 'bk-req-1001';

  const [booking, setBooking] = useState<BookingFlowItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [suggestSlot, setSuggestSlot] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setBooking(await bookingFlowService.getBooking(bookingId));
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const act = async (
    status: 'accepted' | 'rejected' | 'unavailable',
    extra?: { suggestedSlot?: string }
  ) => {
    setBusy(true);
    try {
      await bookingFlowService.updateBookingStatus(bookingId, status, extra);
      await load();
      Alert.alert('Updated', `Request marked as ${status}.`);
    } finally {
      setBusy(false);
    }
  };

  if (loading || !booking) {
    return (
      <SafeAreaView style={styles.screen}>
        <ActivityIndicator style={{ marginTop: 40 }} color="#7548F5" />
      </SafeAreaView>
    );
  }

  const student = booking.student;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
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
              {student.rating ? ` · ${student.rating.toFixed(1)} ★` : ''}
            </Text>
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>{booking.status.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Row label="Subject" value={booking.subject} />
          <Row label="Date" value={booking.date} />
          <Row label="Time" value={`${booking.startTime} – ${booking.endTime}`} />
          <Row label="Duration" value={`${booking.durationHours} hour`} />
          <Row
            label="Mode"
            value={booking.teachingMode === 'online' ? 'Online' : 'Physical'}
          />
          <Row label="Location" value={booking.location} />
          <Row label="Amount" value={`PKR ${booking.totalCost.toLocaleString()}`} />
          <Row label="Payment" value={`${booking.paymentMethod} (${booking.paymentStatus})`} />
          {booking.notes ? <Row label="Notes" value={booking.notes} /> : null}
        </View>

        {booking.status === 'pending' ? (
          <View style={styles.card}>
            <Text style={styles.section}>Suggest another slot (UI)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Tomorrow 6:00 PM"
              placeholderTextColor="#94A3B8"
              value={suggestSlot}
              onChangeText={setSuggestSlot}
            />
            <CustomButton
              title="Suggest slot"
              disabled={busy || !suggestSlot.trim()}
              onPress={() =>
                void act('unavailable', { suggestedSlot: suggestSlot.trim() })
              }
              backgroundColor="#EEF2FF"
              textColor="#4338CA"
            />
          </View>
        ) : null}

        {booking.status === 'pending' ? (
          <View style={styles.actions}>
            <CustomButton
              title={busy ? 'Please wait…' : 'Accept Booking'}
              disabled={busy}
              onPress={() => void act('accepted')}
            />
            <CustomButton
              title="Reject Booking"
              disabled={busy}
              onPress={() => void act('rejected')}
              backgroundColor="#FEE2E2"
              textColor="#B91C1C"
            />
            <CustomButton
              title="Mark as Not Available"
              disabled={busy}
              onPress={() => void act('unavailable')}
              backgroundColor="#FFEDD5"
              textColor="#C2410C"
            />
          </View>
        ) : (
          <CustomButton
            title="Back to Requests"
            onPress={() => navigation.navigate('MyTabs', { screen: 'Request' })}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <View style={{ marginBottom: 10 }}>
    <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700' }}>{label}</Text>
    <Text style={{ color: '#0F172A', fontSize: 14, fontWeight: '600', marginTop: 2 }}>
      {value}
    </Text>
  </View>
);

export default TutorBookingRequestDetailsScreen;

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
    content: { padding: 16, paddingBottom: 40 },
    card: {
      backgroundColor: '#fff',
      borderRadius: 18,
      padding: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      flexDirection: 'row',
      gap: 12,
      flexWrap: 'wrap',
    },
    avatar: { width: 64, height: 64, borderRadius: 18 },
    name: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
    meta: { color: '#64748B', marginTop: 2 },
    statusPill: {
      alignSelf: 'flex-start',
      marginTop: 8,
      backgroundColor: '#FEF3C7',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
    },
    statusText: { color: '#B45309', fontWeight: '800', fontSize: 11 },
    section: { width: '100%', fontWeight: '800', color: '#0F172A', marginBottom: 8 },
    input: {
      width: '100%',
      borderWidth: 1,
      borderColor: '#E2E8F0',
      borderRadius: 12,
      padding: 12,
      marginBottom: 10,
      color: '#0F172A',
    },
    actions: { gap: 10, marginTop: 4 },
  });
