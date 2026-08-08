import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  Image,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { GlassScreen } from '../../../../components/Glass';
import { GLASS } from '../../../../theme/glass';
import useUi from '../../../../hooks/ui/useUi';
import { useBookings } from '../../../../hooks/api/useBookings';
import { usePendingBookingRequests } from '../../../../hooks/api/usePendingBookingRequests';
import { useWallet } from '../../../../hooks/api/useWallet';
import {
  getBookingStudentAvatar,
  getBookingStudentName,
  getDisplayName,
} from '../../../../utils/api/bookingHelpers';
import { navigateHomeStack } from '../../../../navigation/navigationRef';
import { canJoinMeeting } from '../../../../utils/bookings/bookingStatus';
import { createConversationThunk } from '../../../../store/chat/chatSlice';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { ApiUser } from '../../../../types/api.types';
import { getBookingErrorMessage } from '../../../../utils/bookings/bookingErrors';

export default function DashboardScreen() {
  const { colors, resp } = useUi();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const authUser = useAppSelector(state => state.auth.user as ApiUser | null);
  const displayName = getDisplayName(authUser);
  const { balance, refresh: refreshWallet } = useWallet();
  const pendingBookings = usePendingBookingRequests();
  const activeBookings = useBookings('active');
  const { cancelBooking } = useBookings('pending');
  const styles = useMemo(() => createStyles(colors, resp), [colors, resp]);

  const stats = useMemo(
    () => [
      {
        id: 'sessions',
        label: 'Sessions',
        value: String(activeBookings.bookings.length),
        icon: 'calendar-month-outline' as const,
        tint: '#EEF2FF',
        iconColor: GLASS.primary,
      },
      {
        id: 'requests',
        label: 'Requests',
        value: String(pendingBookings.bookings.length),
        icon: 'account-clock-outline' as const,
        tint: '#FFF7ED',
        iconColor: GLASS.warning,
      },
      {
        id: 'escrow',
        label: 'Escrow',
        value: `Rs ${(balance?.escrowBalance ?? 0).toLocaleString()}`,
        icon: 'shield-check-outline' as const,
        tint: '#ECFDF3',
        iconColor: GLASS.success,
      },
    ],
    [
      activeBookings.bookings.length,
      pendingBookings.bookings.length,
      balance?.escrowBalance,
    ]
  );

  const nextHint =
    pendingBookings.bookings.length > 0
      ? `${pendingBookings.bookings.length} new booking request${
          pendingBookings.bookings.length === 1 ? '' : 's'
        } waiting`
      : activeBookings.bookings.length > 0
        ? `${activeBookings.bookings.length} active session${
            activeBookings.bookings.length === 1 ? '' : 's'
          } today`
        : 'Your teaching dashboard is ready';

  const handleAccept = (id: string) => {
    navigateHomeStack('TutorBookingRequestDetailsScreen', { bookingId: id });
  };

  const handleDecline = (id: string) => {
    Alert.alert('Decline request?', 'This booking will be cancelled.', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Decline',
        style: 'destructive',
        onPress: () => {
          void cancelBooking(id, 'tutor').then(() => {
            void pendingBookings.refresh();
            void refreshWallet?.();
          });
        },
      },
    ]);
  };

  const handleMessage = async (
    bookingId: string,
    meta: { name: string; avatar: string; subject: string }
  ) => {
    try {
      const conversation = await dispatch(
        createConversationThunk({
          payload: { bookingId, subject: meta.subject },
          currentUser: authUser,
        })
      ).unwrap();
      navigation.navigate('HomeNavigator', {
        screen: 'ChatScreen',
        params: {
          chatId: conversation.id,
          bookingId,
          peerName: meta.name,
          peerAvatar: meta.avatar,
          subject: meta.subject,
        },
      });
    } catch (err) {
      Alert.alert('Chat unavailable', getBookingErrorMessage(err));
    }
  };

  const openEarnings = () => {
    navigation.navigate('Earnings' as never);
  };

  return (
    <GlassScreen
      scroll={false}
      edges={['top', 'left', 'right']}
      contentStyle={styles.screen}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.pageHeader}>
          <View style={styles.greetingGroup}>
            <Text style={styles.greeting}>Hello, {displayName}!</Text>
            <Text style={styles.subheading}>{nextHint}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.bellBtn}
              activeOpacity={0.85}
              onPress={() =>
                navigateHomeStack('StudentNotificationInboxScreen')
              }
            >
              <MaterialCommunityIcons
                name="bell-outline"
                size={22}
                color={GLASS.primary}
              />
              {pendingBookings.bookings.length > 0 ? (
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeText}>
                    {pendingBookings.bookings.length > 9
                      ? '9+'
                      : String(pendingBookings.bookings.length)}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
            <View style={styles.avatarRing}>
              <LinearGradient
                colors={[...GLASS.buttonGradient]}
                style={styles.avatarGrad}
              >
                <Text style={styles.avatarLetter}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
            </View>
          </View>
        </View>

        <LinearGradient
          colors={[...GLASS.buttonGradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroOrb} />
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroLabel}>Available balance</Text>
              <Text style={styles.heroAmount}>
                Rs. {(balance?.totalBalance ?? 0).toLocaleString()}
              </Text>
              <Text style={styles.heroSub}>
                Escrow held · Rs.{' '}
                {(balance?.escrowBalance ?? 0).toLocaleString()}
              </Text>
            </View>
            <View style={styles.heroIconBox}>
              <MaterialCommunityIcons
                name="wallet-outline"
                size={26}
                color="#FDE68A"
              />
            </View>
          </View>
          <TouchableOpacity
            style={styles.heroBtn}
            activeOpacity={0.88}
            onPress={openEarnings}
          >
            <Text style={styles.heroBtnText}>View earnings</Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={18}
              color={GLASS.primary}
            />
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.statsRow}>
          {stats.map(stat => (
            <View key={stat.id} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: stat.tint }]}>
                <MaterialCommunityIcons
                  name={stat.icon}
                  size={18}
                  color={stat.iconColor}
                />
              </View>
              <Text style={styles.statValue} numberOfLines={1}>
                {stat.value}
              </Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>New requests</Text>
          {pendingBookings.bookings.length > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {pendingBookings.bookings.length}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => navigation.navigate('Request' as never)}
            >
              <Text style={styles.viewAll}>View all</Text>
            </TouchableOpacity>
          )}
        </View>

        {pendingBookings.loading ? (
          <ActivityIndicator color={GLASS.primary} style={{ marginVertical: 16 }} />
        ) : pendingBookings.bookings.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons
              name="inbox-outline"
              size={28}
              color={GLASS.textMuted}
            />
            <Text style={styles.emptyTitle}>No pending requests</Text>
            <Text style={styles.emptySub}>
              When students book you, their requests show up here.
            </Text>
          </View>
        ) : (
          pendingBookings.bookings.slice(0, 4).map(booking => {
            const name = getBookingStudentName(booking);
            const avatar = getBookingStudentAvatar(booking);
            const dateLabel = String(booking.date).slice(0, 10);
            return (
              <Pressable
                key={booking._id}
                style={styles.requestCard}
                onPress={() => handleAccept(booking._id)}
              >
                <View style={styles.requestTop}>
                  <Image source={{ uri: avatar }} style={styles.requestAvatar} />
                  <View style={styles.requestInfo}>
                    <View style={styles.requestNameRow}>
                      <Text style={styles.requestName} numberOfLines={1}>
                        {name}
                      </Text>
                      <View style={styles.pendingPill}>
                        <Text style={styles.pendingPillText}>PENDING</Text>
                      </View>
                    </View>
                    <Text style={styles.requestMeta}>
                      {dateLabel} · {booking.startTime}–{booking.endTime}
                    </Text>
                    <Text style={styles.requestSubject} numberOfLines={1}>
                      {booking.subject}
                    </Text>
                  </View>
                </View>
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={() => handleAccept(booking._id)}
                  >
                    <Text style={styles.acceptText}>Review</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.declineBtn}
                    onPress={() => handleDecline(booking._id)}
                  >
                    <Text style={styles.declineText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              </Pressable>
            );
          })
        )}

        <View style={[styles.sectionHeader, { marginTop: 8 }]}>
          <Text style={styles.sectionTitle}>Today’s sessions</Text>
        </View>

        {activeBookings.loading ? (
          <ActivityIndicator color={GLASS.primary} style={{ marginVertical: 16 }} />
        ) : activeBookings.bookings.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons
              name="calendar-blank-outline"
              size={28}
              color={GLASS.textMuted}
            />
            <Text style={styles.emptyTitle}>No sessions yet</Text>
            <Text style={styles.emptySub}>
              Accepted bookings for today will appear here with join controls.
            </Text>
          </View>
        ) : (
          activeBookings.bookings.map(booking => {
            const name = getBookingStudentName(booking);
            const avatar = getBookingStudentAvatar(booking);
            return (
              <View key={booking._id} style={styles.sessionCard}>
                <View style={styles.sessionTop}>
                  <Image source={{ uri: avatar }} style={styles.sessionAvatar} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.sessionName} numberOfLines={1}>
                      {name}
                    </Text>
                    <Text style={styles.sessionSubject} numberOfLines={1}>
                      {booking.subject}
                    </Text>
                  </View>
                  <View style={styles.sessionTimeBox}>
                    <Text style={styles.sessionTime}>{booking.startTime}</Text>
                    <Text style={styles.sessionDuration}>
                      {booking.startTime}–{booking.endTime}
                    </Text>
                  </View>
                </View>
                <View style={styles.sessionActions}>
                  <TouchableOpacity
                    style={styles.messageBtn}
                    onPress={() =>
                      void handleMessage(booking._id, {
                        name,
                        avatar,
                        subject: booking.subject,
                      })
                    }
                  >
                    <MaterialCommunityIcons
                      name="chat-outline"
                      size={16}
                      color={GLASS.primary}
                    />
                    <Text style={styles.messageText}>Message</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.joinBtnWrap}
                    onPress={() => {
                      if (canJoinMeeting(booking)) {
                        void Linking.openURL(booking.meetingLink!);
                        return;
                      }
                      Alert.alert(
                        'Meeting link unavailable',
                        'Add a meeting link when accepting the booking.'
                      );
                    }}
                  >
                    <LinearGradient
                      colors={[...GLASS.buttonGradient]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.joinBtn}
                    >
                      <MaterialCommunityIcons
                        name="video-outline"
                        size={16}
                        color="#fff"
                      />
                      <Text style={styles.joinText}>Start class</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </GlassScreen>
  );
}

const createStyles = (_colors: any, resp: any) =>
  StyleSheet.create({
    screen: { flex: 1 },
    content: {
      paddingTop: resp.dy(12),
      paddingHorizontal: resp.dx(20),
      paddingBottom: resp.dy(36),
    },
    pageHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: resp.dy(20),
      gap: resp.dx(12),
    },
    greetingGroup: { flex: 1 },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    bellBtn: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: GLASS.cardBgStrong,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
    },
    bellBadge: {
      position: 'absolute',
      top: 6,
      right: 6,
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: GLASS.error,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 3,
    },
    bellBadgeText: {
      color: '#fff',
      fontSize: 9,
      fontWeight: '800',
    },
    greeting: {
      color: GLASS.textPrimary,
      fontSize: resp.df(24),
      fontWeight: '800',
      marginBottom: 4,
    },
    subheading: {
      color: GLASS.textSecondary,
      fontSize: resp.df(14),
      lineHeight: resp.dy(20),
    },
    avatarRing: {
      padding: 2,
      borderRadius: 22,
      backgroundColor: GLASS.primarySoft,
    },
    avatarGrad: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarLetter: {
      color: '#fff',
      fontWeight: '800',
      fontSize: 16,
    },
    heroCard: {
      borderRadius: GLASS.radius.xl,
      padding: resp.dx(18),
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.28)',
      ...GLASS.shadow.medium,
      marginBottom: resp.dy(18),
    },
    heroOrb: {
      position: 'absolute',
      right: -30,
      top: -40,
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: 'rgba(255,255,255,0.12)',
    },
    heroTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    heroLabel: {
      color: 'rgba(255,255,255,0.82)',
      fontSize: resp.df(12),
      fontWeight: '600',
      marginBottom: 6,
    },
    heroAmount: {
      color: '#fff',
      fontSize: resp.df(30),
      fontWeight: '800',
    },
    heroSub: {
      color: 'rgba(255,255,255,0.75)',
      fontSize: resp.df(12),
      marginTop: 4,
    },
    heroIconBox: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: 'rgba(255,255,255,0.15)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroBtn: {
      marginTop: resp.dy(16),
      backgroundColor: '#fff',
      borderRadius: GLASS.radius.md,
      height: 46,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    heroBtnText: {
      color: GLASS.primary,
      fontWeight: '800',
      fontSize: resp.df(14),
    },
    statsRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: resp.dy(8),
    },
    statCard: {
      flex: 1,
      backgroundColor: GLASS.cardBgStrong,
      borderRadius: GLASS.radius.lg,
      paddingVertical: 14,
      paddingHorizontal: 8,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      ...GLASS.shadow.soft,
    },
    statIcon: {
      width: 34,
      height: 34,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    statValue: {
      fontSize: resp.df(15),
      fontWeight: '800',
      color: GLASS.textPrimary,
    },
    statLabel: {
      fontSize: resp.df(11),
      color: GLASS.textSecondary,
      marginTop: 2,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: resp.dy(20),
      marginBottom: resp.dy(12),
    },
    sectionTitle: {
      fontSize: resp.df(18),
      fontWeight: '800',
      color: GLASS.textPrimary,
    },
    viewAll: {
      color: GLASS.primary,
      fontWeight: '700',
      fontSize: resp.df(13),
    },
    badge: {
      minWidth: 24,
      height: 24,
      borderRadius: 12,
      paddingHorizontal: 7,
      backgroundColor: GLASS.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: {
      color: '#fff',
      fontSize: 11,
      fontWeight: '800',
    },
    emptyCard: {
      backgroundColor: GLASS.cardBg,
      borderRadius: GLASS.radius.xl,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      padding: 22,
      alignItems: 'center',
      gap: 6,
      marginBottom: 8,
    },
    emptyTitle: {
      fontWeight: '800',
      color: GLASS.textPrimary,
      fontSize: 15,
      marginTop: 4,
    },
    emptySub: {
      color: GLASS.textSecondary,
      fontSize: 12,
      textAlign: 'center',
      lineHeight: 18,
    },
    requestCard: {
      backgroundColor: GLASS.cardBgStrong,
      borderRadius: GLASS.radius.xl,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      padding: 14,
      marginBottom: 12,
      ...GLASS.shadow.soft,
    },
    requestTop: { flexDirection: 'row', gap: 12 },
    requestAvatar: { width: 48, height: 48, borderRadius: 16 },
    requestInfo: { flex: 1, minWidth: 0 },
    requestNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    requestName: {
      flex: 1,
      fontWeight: '800',
      fontSize: 15,
      color: GLASS.textPrimary,
    },
    pendingPill: {
      backgroundColor: '#FEF3C7',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 999,
    },
    pendingPillText: {
      color: '#B45309',
      fontSize: 10,
      fontWeight: '800',
    },
    requestMeta: {
      color: GLASS.textMuted,
      fontSize: 12,
      marginTop: 3,
    },
    requestSubject: {
      color: GLASS.primary,
      fontWeight: '700',
      fontSize: 13,
      marginTop: 4,
    },
    requestActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
    acceptBtn: {
      flex: 1.2,
      height: 42,
      borderRadius: 12,
      backgroundColor: GLASS.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    acceptText: { color: '#fff', fontWeight: '800', fontSize: 13 },
    declineBtn: {
      flex: 1,
      height: 42,
      borderRadius: 12,
      backgroundColor: GLASS.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    declineText: { color: GLASS.primaryDeep, fontWeight: '800', fontSize: 13 },
    sessionCard: {
      backgroundColor: GLASS.cardBgStrong,
      borderRadius: GLASS.radius.xl,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      padding: 14,
      marginBottom: 12,
      ...GLASS.shadow.soft,
    },
    sessionTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    sessionAvatar: { width: 44, height: 44, borderRadius: 14 },
    sessionName: {
      fontWeight: '800',
      fontSize: 15,
      color: GLASS.textPrimary,
    },
    sessionSubject: {
      color: GLASS.textSecondary,
      fontSize: 12,
      marginTop: 2,
    },
    sessionTimeBox: { alignItems: 'flex-end' },
    sessionTime: {
      color: GLASS.primary,
      fontWeight: '800',
      fontSize: 14,
    },
    sessionDuration: {
      color: GLASS.textMuted,
      fontSize: 11,
      marginTop: 2,
    },
    sessionActions: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 14,
    },
    messageBtn: {
      flex: 1,
      height: 44,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      backgroundColor: GLASS.primarySoft,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    messageText: {
      color: GLASS.primary,
      fontWeight: '800',
      fontSize: 13,
    },
    joinBtnWrap: { flex: 1.35 },
    joinBtn: {
      height: 44,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    joinText: {
      color: '#fff',
      fontWeight: '800',
      fontSize: 13,
    },
  });
