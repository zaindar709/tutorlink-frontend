import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import useUi from '../../../../hooks/ui/useUi';
import SessionCard from '../../../../components/SessionCard';

const dates = [
  { day: 'Sun', date: '12' },
  { day: 'Mon', date: '13' },
  { day: 'Tue', date: '14' },
  { day: 'Wed', date: '15' },
];

const tabs = ['Active', 'Pending', 'Past'];

const BookingScreen = () => {
  const { colors, resp } = useUi();

  const styles = useMemo(() => createStyles(colors, resp), [colors, resp]);

  const [selectedTab, setSelectedTab] = useState('Active');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Bookings</Text>
        </View>

        {/* STATIC CALENDAR */}
        <View style={styles.calendarContainer}>
          <TouchableOpacity style={styles.arrowBtn}>
            <Icon
              source="chevron-left"
              size={20}
              color={colors.BLACK_COLOR as string}
            />
          </TouchableOpacity>

          {dates.map((item, index) => {
            const active = index === 3;

            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                style={[styles.dateCard, active && styles.activeDateCard]}
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

          <TouchableOpacity style={styles.arrowBtn}>
            <Icon
              source="chevron-right"
              size={20}
              color={colors.BLACK_COLOR as string}
            />
          </TouchableOpacity>
        </View>

        {/* TABS */}
        <View style={styles.tabsContainer}>
          {tabs.map(tab => {
            const active = selectedTab === tab;

            return (
              <TouchableOpacity
                key={tab}
                activeOpacity={0.8}
                onPress={() => setSelectedTab(tab)}
                style={[styles.tabButton, active && styles.activeTabButton]}
              >
                <Text style={[styles.tabText, active && styles.activeTabText]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* NEXT SESSION CARD */}
        <SessionCard
          colors={colors}
          resp={resp}
          title="NEXT SESSION"
          timerText="Starts in 12m 43s"
          name="Dr. Sarah Ahmed"
          subject="Advanced Mathematics"
          time="2:00 PM - 3:00 PM"
          image="https://randomuser.me/api/portraits/women/44.jpg"
          onJoin={() => {}}
          onMessage={() => {}}
          onAddCalendar={() => {}}
        />

        {/* TIMELINE */}
        <View style={styles.timelineWrapper}>
          <View style={styles.timelineLeft}>
            <Text style={styles.timelineTime}>4:00 PM</Text>

            <Text style={styles.timelineDuration}>1.5 hours</Text>

            <View style={styles.verticalLine} />
          </View>

          <View style={styles.timelineCard}>
            <View style={styles.profileRow}>
              <View style={styles.imageWrapper}>
                <Image
                  source={{
                    uri: 'https://randomuser.me/api/portraits/men/32.jpg',
                  }}
                  style={styles.profileImage}
                />

                <View style={styles.onlineDot} />
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.tutorName}>Prof. Hassan Ali</Text>

                <Text style={styles.subjectText}>
                  Physics - Quantum Mechanics
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.smallJoinButton}>
              <Icon source="video-outline" size={16} color="#fff" />

              <Text style={styles.smallJoinText}>Join</Text>
            </TouchableOpacity>
          </View>
        </View>
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

    /* CALENDAR */
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
      width: resp.dx(58),
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
      fontSize: resp.df(24),
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

    /* TABS */
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

    /* CARD */
    nextSessionCard: {
      marginHorizontal: resp.dx(20),
      marginTop: resp.dy(20),
      backgroundColor: '#F6F0FF',
      borderRadius: resp.dx(26),
      padding: resp.dx(20),
    },

    cardTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: resp.dy(18),
    },

    nextSessionText: {
      color: '#2F6BFF',
      fontWeight: '800',
      fontSize: resp.df(12),
    },

    timerBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FF4D4F',
      paddingHorizontal: resp.dx(12),
      paddingVertical: resp.dy(8),
      borderRadius: resp.dx(20),
    },

    timerText: {
      color: '#fff',
      marginLeft: resp.dx(6),
      fontWeight: '700',
      fontSize: resp.df(12),
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

    timeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: resp.dy(10),
    },

    timeText: {
      marginLeft: resp.dx(6),
      fontSize: resp.df(13),
      color: colors.SPACES_COLOR,
      fontWeight: '500',
    },

    joinButton: {
      height: resp.dy(54),
      borderRadius: resp.dx(18),
      backgroundColor: '#2F6BFF',
      marginTop: resp.dy(22),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },

    joinButtonText: {
      color: '#fff',
      fontSize: resp.df(16),
      fontWeight: '700',
      marginLeft: resp.dx(8),
    },

    actionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: resp.dy(14),
    },

    secondaryButton: {
      width: '48%',
      height: resp.dy(52),
      borderRadius: resp.dx(16),
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: '#E8E8E8',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },

    secondaryButtonText: {
      marginLeft: resp.dx(8),
      fontWeight: '600',
      color: colors.BLACK_COLOR,
      fontSize: resp.df(13),
    },

    /* TIMELINE */
    timelineWrapper: {
      flexDirection: 'row',
      marginTop: resp.dy(26),
      marginHorizontal: resp.dx(20),
      marginBottom: resp.dy(40),
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
  });
