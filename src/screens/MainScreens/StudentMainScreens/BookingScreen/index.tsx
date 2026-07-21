import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import useUi from '../../../../hooks/ui/useUi';
import SessionCard from '../../../../components/SessionCard';
import { useBookings } from '../../../../hooks/api/useBookings';
import { formatDisplayDate } from '../../../../utils/api/userId';
import {
  formatBookingTimeRange,
  getBookingParticipantAvatar,
  getBookingParticipantName,
  mapTabLabel,
} from '../../../../utils/api/bookingHelpers';

const tabs = ['Active', 'Pending', 'Past'];

const BookingScreen = () => {
  const { colors, resp } = useUi();
  const navigation = useNavigation<any>();
  const styles = useMemo(() => createStyles(colors, resp), [colors, resp]);
  const [selectedTab, setSelectedTab] = useState('Active');
  const {
    bookings,
    selectedDate,
    setSelectedDate,
    loading,
    actionLoading,
    nextSession,
    cancelBooking,
    tab,
    setTab,
  } = useBookings('active');

  const weekDates = useMemo(() => {
    const start = new Date(selectedDate);
    start.setDate(start.getDate() - 3);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }, [selectedDate]);

  const handleTabChange = (label: string) => {
    setSelectedTab(label);
    setTab(mapTabLabel(label));
  };

  const handleJoin = (meetingLink?: string) => {
    if (meetingLink) {
      Linking.openURL(meetingLink);
      return;
    }
    Alert.alert('Meeting link unavailable', 'The tutor has not shared a meeting link yet.');
  };

  const handleCancel = async (bookingId: string) => {
    const success = await cancelBooking(bookingId);
    if (success) {
      Alert.alert('Cancelled', 'Booking cancelled successfully.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Bookings</Text>
        </View>

        <View style={styles.calendarContainer}>
          <TouchableOpacity
            style={styles.arrowBtn}
            onPress={() => {
              const prev = new Date(selectedDate);
              prev.setDate(prev.getDate() - 7);
              setSelectedDate(prev);
            }}
          >
            <Icon
              source="chevron-left"
              size={20}
              color={colors.BLACK_COLOR as string}
            />
          </TouchableOpacity>

          {weekDates.map(date => {
            const item = formatDisplayDate(date);
            const active =
              date.toDateString() === selectedDate.toDateString();

            return (
              <TouchableOpacity
                key={date.toISOString()}
                activeOpacity={0.8}
                style={[styles.dateCard, active && styles.activeDateCard]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[styles.dayText, active && styles.activeText]}>
                  {item.day}
                </Text>

                <Text style={[styles.dateText, active && styles.activeText]}>
                  {item.date}
                </Text>

                {active && <View style={styles.activeDot} />}
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={styles.arrowBtn}
            onPress={() => {
              const next = new Date(selectedDate);
              next.setDate(next.getDate() + 7);
              setSelectedDate(next);
            }}
          >
            <Icon
              source="chevron-right"
              size={20}
              color={colors.BLACK_COLOR as string}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.tabsContainer}>
          {tabs.map(tabLabel => {
            const active = selectedTab === tabLabel;

            return (
              <TouchableOpacity
                key={tabLabel}
                activeOpacity={0.8}
                onPress={() => handleTabChange(tabLabel)}
                style={[styles.tabButton, active && styles.activeTabButton]}
              >
                <Text style={[styles.tabText, active && styles.activeTabText]}>
                  {tabLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginTop: resp.dy(24) }} />
        ) : null}

        {nextSession && tab === 'active' ? (
          <SessionCard
            colors={colors}
            resp={resp}
            title="NEXT SESSION"
            timerText={nextSession.status}
            name={getBookingParticipantName(nextSession, 'student')}
            subject={nextSession.subject}
            time={formatBookingTimeRange(nextSession)}
            image={getBookingParticipantAvatar(nextSession)}
            onJoin={() => handleJoin(nextSession.meetingLink)}
            onMessage={() =>
              navigation.navigate('HomeNavigator', {
                screen: 'ChatScreen',
                params: { chatId: 'c1' },
              })
            }
            onAddCalendar={() => {}}
          />
        ) : null}

        {!loading && bookings.length === 0 ? (
          <Text style={styles.emptyText}>No bookings found for this date.</Text>
        ) : null}

        {bookings
          .filter(booking => !booking.isNextSession)
          .map(booking => (
            <View key={booking._id} style={styles.timelineWrapper}>
              <View style={styles.timelineLeft}>
                <Text style={styles.timelineTime}>{booking.startTime}</Text>
                <Text style={styles.timelineDuration}>{booking.status}</Text>
                <View style={styles.verticalLine} />
              </View>

              <View style={styles.timelineCard}>
                <View style={styles.profileRow}>
                  <View style={styles.imageWrapper}>
                    <Image
                      source={{
                        uri: getBookingParticipantAvatar(booking),
                      }}
                      style={styles.profileImage}
                    />
                    <View style={styles.onlineDot} />
                  </View>

                  <View style={styles.profileInfo}>
                    <Text style={styles.tutorName}>
                      {getBookingParticipantName(booking, 'student')}
                    </Text>
                    <Text style={styles.subjectText}>{booking.subject}</Text>
                  </View>
                </View>

                {booking.meetingLink ? (
                  <TouchableOpacity
                    style={styles.smallJoinButton}
                    onPress={() => handleJoin(booking.meetingLink)}
                  >
                    <Icon source="video-outline" size={16} color="#fff" />
                    <Text style={styles.smallJoinText}>Join</Text>
                  </TouchableOpacity>
                ) : null}

                {tab !== 'past' ? (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    disabled={actionLoading}
                    onPress={() => handleCancel(booking._id)}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default BookingScreen;

const createStyles = (colors: any, resp: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#F7F7FB',
    },
    container: {
      flex: 1,
    },
    header: {
      paddingHorizontal: resp.dx(20),
      paddingTop: resp.dy(10),
    },
    headerTitle: {
      fontSize: resp.df(24),
      fontWeight: '800',
      color: colors.BLACK_COLOR,
    },
    calendarContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: resp.dx(14),
      marginTop: resp.dy(24),
    },
    arrowBtn: {
      width: resp.dx(34),
      height: resp.dx(34),
      borderRadius: resp.dx(17),
      backgroundColor: '#F0F0F3',
      alignItems: 'center',
      justifyContent: 'center',
    },
    dateCard: {
      width: resp.dx(44),
      height: resp.dy(78),
      borderRadius: resp.dx(18),
      backgroundColor: '#F0F0F3',
      alignItems: 'center',
      justifyContent: 'center',
    },
    activeDateCard: {
      backgroundColor: '#2F6BFF',
    },
    dayText: {
      fontSize: resp.df(11),
      color: colors.SPACES_COLOR,
      marginBottom: resp.dy(6),
      fontWeight: '600',
    },
    dateText: {
      fontSize: resp.df(18),
      fontWeight: '800',
      color: colors.BLACK_COLOR,
    },
    activeText: {
      color: '#fff',
    },
    activeDot: {
      width: resp.dx(5),
      height: resp.dx(5),
      borderRadius: resp.dx(2.5),
      backgroundColor: '#fff',
      marginTop: resp.dy(6),
    },
    tabsContainer: {
      flexDirection: 'row',
      backgroundColor: '#ECECEF',
      marginHorizontal: resp.dx(20),
      borderRadius: resp.dx(18),
      padding: resp.dx(4),
      marginTop: resp.dy(24),
    },
    tabButton: {
      flex: 1,
      height: resp.dy(42),
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: resp.dx(14),
    },
    activeTabButton: {
      backgroundColor: '#fff',
    },
    tabText: {
      color: colors.SPACES_COLOR,
      fontWeight: '600',
      fontSize: resp.df(14),
    },
    activeTabText: {
      color: '#2F6BFF',
      fontWeight: '700',
    },
    emptyText: {
      textAlign: 'center',
      color: colors.SPACES_COLOR,
      marginTop: resp.dy(24),
      marginHorizontal: resp.dx(20),
    },
    timelineWrapper: {
      flexDirection: 'row',
      marginTop: resp.dy(26),
      marginHorizontal: resp.dx(20),
      marginBottom: resp.dy(20),
    },
    timelineLeft: {
      width: resp.dx(70),
      alignItems: 'center',
    },
    timelineTime: {
      fontWeight: '800',
      fontSize: resp.df(15),
      color: colors.BLACK_COLOR,
    },
    timelineDuration: {
      marginTop: resp.dy(8),
      color: colors.SPACES_COLOR,
      fontSize: resp.df(12),
      textTransform: 'capitalize',
    },
    verticalLine: {
      width: 1,
      flex: 1,
      borderStyle: 'dashed',
      borderWidth: 1,
      borderColor: '#D8D8D8',
      marginTop: resp.dy(10),
    },
    timelineCard: {
      flex: 1,
      backgroundColor: '#fff',
      borderRadius: resp.dx(22),
      padding: resp.dx(16),
    },
    profileRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    imageWrapper: {
      width: resp.dx(64),
      height: resp.dx(64),
      borderRadius: resp.dx(18),
      overflow: 'hidden',
      marginRight: resp.dx(14),
    },
    profileImage: {
      width: '100%',
      height: '100%',
    },
    onlineDot: {
      position: 'absolute',
      bottom: 3,
      right: 3,
      width: resp.dx(14),
      height: resp.dx(14),
      borderRadius: resp.dx(7),
      backgroundColor: '#20D67B',
      borderWidth: 2,
      borderColor: '#fff',
    },
    profileInfo: {
      flex: 1,
    },
    tutorName: {
      fontSize: resp.df(18),
      fontWeight: '800',
      color: colors.BLACK_COLOR,
    },
    subjectText: {
      marginTop: resp.dy(5),
      fontSize: resp.df(14),
      color: colors.SPACES_COLOR,
    },
    smallJoinButton: {
      marginTop: resp.dy(18),
      width: resp.dx(110),
      height: resp.dy(42),
      borderRadius: resp.dx(14),
      backgroundColor: '#2F6BFF',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    smallJoinText: {
      color: '#fff',
      marginLeft: resp.dx(6),
      fontWeight: '700',
    },
    cancelButton: {
      marginTop: resp.dy(10),
      alignSelf: 'flex-start',
    },
    cancelText: {
      color: '#EF4444',
      fontWeight: '600',
    },
  });
