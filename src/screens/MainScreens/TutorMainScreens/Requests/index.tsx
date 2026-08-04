import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { GlassScreen } from '../../../../components/Glass';
import { GLASS } from '../../../../theme/glass';
import { useNavigation } from '@react-navigation/native';
import { useBookings } from '../../../../hooks/api/useBookings';
import { getBookingParticipantName } from '../../../../utils/api/bookingHelpers';
import { bookingFlowService } from '../../../../services/bookings/bookingFlowService';
import { BookingFlowItem } from '../../../../types/bookingFlow.types';
import { navigateHomeStack } from '../../../../navigation/navigationRef';

const TutorRequestsScreen = () => {
  const navigation = useNavigation<any>();
  const { bookings, loading, actionLoading, confirmBooking, cancelBooking } =
    useBookings('pending');
  const [mockRequests, setMockRequests] = useState<BookingFlowItem[]>([]);

  useEffect(() => {
    void bookingFlowService.getTutorRequests('pending').then(setMockRequests);
  }, []);

  const openMockDetails = (bookingId: string) => {
    navigateHomeStack('TutorBookingRequestDetailsScreen', { bookingId });
  };

  const renderMock = ({ item }: { item: BookingFlowItem }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => openMockDetails(item.id)}
    >
      <View style={styles.topRow}>
        <Image source={{ uri: item.student.avatarUrl }} style={styles.avatarImg} />
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{item.student.name}</Text>
            <View style={styles.newBadge}>
              <Text style={styles.newText}>NEW</Text>
            </View>
          </View>
          <Text style={styles.timeText}>
            {item.date} · {item.startTime}–{item.endTime}
          </Text>
          <Text style={styles.subjectName}>{item.subject}</Text>
          <Text style={styles.rateText}>
            PKR {item.totalCost.toLocaleString()} · Tap for full details
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: any) => {
    const name = getBookingParticipantName(item, 'tutor');

    return (
      <View style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{name}</Text>
              <View style={styles.newBadge}>
                <Text style={styles.newText}>API</Text>
              </View>
            </View>
            <View style={styles.timeRow}>
              <Ionicons name="time-outline" size={14} color="#9CA3AF" />
              <Text style={styles.timeText}>{item.startTime}</Text>
            </View>
            <View style={styles.tagsRow}>
              <View style={styles.levelTag}>
                <Text style={styles.levelText}>{item.status}</Text>
              </View>
              <View style={styles.rateTag}>
                <Text style={styles.rateText}>
                  Rs. {item.hourlyRateAtBooking || 0}/hr
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.subjectBox}>
          <View style={styles.iconBox}>
            <Ionicons name="flask-outline" size={22} color="#6C5CE7" />
          </View>
          <View>
            <Text style={styles.subjectLabel}>Subject Requested</Text>
            <Text style={styles.subjectName}>{item.subject}</Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.acceptButton}
            disabled={actionLoading}
            onPress={async () => {
              const success = await confirmBooking(item._id, {
                meetingLink: 'https://meet.google.com/new',
              });
              if (success) {
                Alert.alert('Accepted', 'Booking confirmed successfully.');
              }
            }}
          >
            <Text style={styles.acceptText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.declineButton}
            disabled={actionLoading}
            onPress={async () => {
              const success = await cancelBooking(item._id);
              if (success) {
                Alert.alert('Declined', 'Booking request declined.');
              }
            }}
          >
            <Text style={styles.declineText}>Decline</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <GlassScreen scroll={false}>
      <ScrollView contentContainerStyle={styles.listContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Requests</Text>
          <Text style={styles.headerSubtitle}>
            Review and respond to new booking requests
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Demo booking flow</Text>
        {mockRequests.map(item => (
          <View key={item.id}>{renderMock({ item })}</View>
        ))}

        <Text style={styles.sectionLabel}>Live API requests</Text>
        {loading ? (
          <ActivityIndicator style={{ marginTop: 20 }} color="#6C5CE7" />
        ) : bookings.length === 0 ? (
          <Text style={styles.emptyText}>No pending API requests.</Text>
        ) : (
          bookings.map(item => <View key={item._id}>{renderItem({ item })}</View>)
        )}
      </ScrollView>
    </GlassScreen>
  );
};

export default TutorRequestsScreen;

const styles = StyleSheet.create({
  header: { paddingBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: GLASS.textPrimary },
  headerSubtitle: { marginTop: 4, color: GLASS.textSecondary },
  sectionLabel: {
    marginTop: 8,
    marginBottom: 10,
    fontSize: 12,
    fontWeight: '800',
    color: GLASS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  listContent: {
    padding: GLASS.space.lg,
    paddingBottom: 40,
  },
  emptyText: { textAlign: 'center', color: GLASS.textSecondary, marginTop: 12 },
  card: {
    backgroundColor: GLASS.cardBg,
    borderRadius: GLASS.radius.xl,
    borderWidth: 1,
    borderColor: GLASS.cardBorder,
    padding: GLASS.space.lg,
    marginBottom: GLASS.space.lg,
    ...GLASS.shadow.soft,
  },
  topRow: { flexDirection: 'row', alignItems: 'flex-start' },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    marginRight: 12,
  },
  avatarImg: {
    width: 48,
    height: 48,
    borderRadius: 16,
    marginRight: 12,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 16, fontWeight: '700', color: GLASS.textPrimary },
  newBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  newText: { color: '#EF4444', fontSize: 10, fontWeight: '700' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  timeText: { color: '#9CA3AF', fontSize: 12, marginTop: 4 },
  tagsRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  levelTag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  levelText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  rateTag: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  rateText: { color: '#059669', fontSize: 12, fontWeight: '600', marginTop: 6 },
  subjectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.primarySoft,
    borderRadius: GLASS.radius.md,
    padding: GLASS.space.md,
    marginTop: GLASS.space.lg,
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: GLASS.radius.sm,
    backgroundColor: GLASS.cardBgStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectLabel: { color: GLASS.textMuted, fontSize: 12 },
  subjectName: {
    color: GLASS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  acceptButton: {
    flex: 1,
    backgroundColor: GLASS.primary,
    borderRadius: GLASS.radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  acceptText: { color: GLASS.textOnPrimary, fontWeight: '700' },
  declineButton: {
    flex: 1,
    backgroundColor: GLASS.cardBgStrong,
    borderRadius: GLASS.radius.sm,
    borderWidth: 1,
    borderColor: GLASS.cardBorder,
    paddingVertical: 12,
    alignItems: 'center',
  },
  declineText: { color: GLASS.textPrimary, fontWeight: '700' },
});
