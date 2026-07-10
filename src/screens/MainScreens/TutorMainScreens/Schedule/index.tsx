import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useUi from '../../../../hooks/ui/useUi';

const days = [
  { id: '1', day: 'Sun', date: '12' },
  { id: '2', day: 'Mon', date: '13' },
  { id: '3', day: 'Tue', date: '14' },
  { id: '4', day: 'Wed', date: '15', active: true },
];

const stats = [
  {
    id: '1',
    title: "Today's Sessions",
    value: '3',
    bg: '#EEF4FF',
    border: '#C4B5FD',
  },
  {
    id: '2',
    title: 'Total Hours',
    value: '210 min',
    bg: '#ECFDF3',
    border: '#4ADE80',
  },
];

const schedule = [
  { time: '9:00 AM', free: true },
  { time: '10:00 AM', free: true },
  { time: '10:00 AM', free: true },
  { time: '10:00 AM', free: true },
  { time: '10:00 AM', free: true },
  {
    time: '2:00 PM',
    free: false,
    live: true,
    student: 'Ahmed Raza',
    subject: 'Mathematics',
    topic: 'Calculus',
    start: '2:00 PM',
    end: '3:00 PM',
    status: 'Online',
    button: 'Join Classroom',
    cardBg: '#ECFDF5',
    border: '#4ADE80',
  },

  {
    time: '4:00 PM',
    free: false,
    live: false,
    student: 'Zainab Hassan',
    subject: 'Physics',
    topic: 'Mechanics',
    start: '4:00 PM',
    end: '5:30 PM',
    status: 'Online',
    button: 'View Details',
    secondaryBtn: 'Reschedule',
    cardBg: '#FFFFFF',
    border: '#BFDBFE',
  },

  { time: '5:00 PM', free: true },
  { time: '5:00 PM', free: true },
  { time: '5:00 PM', free: true },
  {
    time: '4:00 PM',
    free: false,
    live: false,
    student: 'Zainab Hassan',
    subject: 'Physics',
    topic: 'Mechanics',
    start: '4:00 PM',
    end: '5:30 PM',
    status: 'Online',
    button: 'View Details',
    secondaryBtn: 'Reschedule',
    cardBg: '#FFFFFF',
    border: '#BFDBFE',
  },
];

const TutorScheduleScreen = () => {
  const { colors, resp } = useUi();
  const styles = createStyles(colors, resp);
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <Text style={styles.heading}>My Schedule</Text>
        <Text style={styles.subHeading}>
          Manage your sessions and availability
        </Text>

        {/* DAYS */}
        {/* CALENDAR HEADER */}
        <View style={styles.weekHeader}>
          <Text style={styles.weekTitle}>This Week</Text>

          <View style={styles.weekBadge}>
            <Text style={styles.weekBadgeText}>May</Text>
          </View>
        </View>

        {/* CALENDAR STRIP */}
        <View style={styles.calendarContainer}>
          <TouchableOpacity style={styles.navBtn}>
            <Ionicons name="chevron-back" size={18} color="#475569" />
          </TouchableOpacity>

          <FlatList
            horizontal
            data={days}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.calendarList}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.dayItem, item.active && styles.dayItemActive]}
              >
                <Text
                  style={[styles.dayName, item.active && styles.dayActiveText]}
                >
                  {item.day}
                </Text>

                <Text
                  style={[
                    styles.dayNumber,
                    item.active && styles.dayActiveText,
                  ]}
                >
                  {item.date}
                </Text>

                {item.active && <View style={styles.activeDot} />}
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity style={styles.navBtn}>
            <Ionicons name="chevron-forward" size={18} color="#475569" />
          </TouchableOpacity>
        </View>
        {/* STATS */}
        <View style={styles.statsRow}>
          {stats.map(item => (
            <View
              key={item.id}
              style={[
                styles.statsCard,
                { backgroundColor: item.bg, borderColor: item.border },
              ]}
            >
              <Text style={styles.statsTitle}>{item.title}</Text>
              <Text style={styles.statsValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* SCHEDULE */}
        <View style={styles.scheduleWrapper}>
          {schedule.map((item, index) => (
            <View key={index} style={styles.scheduleRow}>
              {/* TIME */}
              <View style={styles.timeWrapper}>
                <Text style={styles.timeText}>{item.time}</Text>

                <View style={styles.lineWrapper}>
                  <View
                    style={[styles.circle, !item.free && styles.activeCircle]}
                  />

                  {index !== schedule.length - 1 && (
                    <View style={styles.verticalLine} />
                  )}
                </View>
              </View>

              {/* SLOT */}
              {/* SLOT */}
              <View style={styles.slotContainer}>
                {item.free ? (
                  <View style={styles.freeCard}>
                    <Text style={styles.freeText}>Free Time</Text>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.sessionCard,
                      {
                        backgroundColor: item.cardBg,
                        borderColor: item.border,
                      },
                    ]}
                  >
                    {/* LIVE BADGE */}
                    {item.live && (
                      <View style={styles.liveBadge}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>LIVE NOW</Text>
                      </View>
                    )}

                    {/* TOP CONTENT */}
                    <View style={styles.sessionTop}>
                      <View style={styles.avatar} />

                      <View style={{ flex: 1 }}>
                        <Text style={styles.studentName}>{item.student}</Text>

                        <Text style={styles.subjectText}>{item.subject} -</Text>

                        <Text style={styles.topicText}>{item.topic}</Text>

                        {/* TIME + STATUS */}
                        <View style={styles.infoRow}>
                          <View style={styles.timeInfo}>
                            <Ionicons
                              name="time-outline"
                              size={13}
                              color="#64748B"
                            />

                            <Text style={styles.infoText}>
                              {item.start} - {item.end}
                            </Text>
                          </View>

                          <View style={styles.statusRow}>
                            <Ionicons
                              name="videocam-outline"
                              size={13}
                              color="#64748B"
                            />

                            <Text style={styles.infoText}>{item.status}</Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* BUTTONS */}
                    <View style={styles.btnRow}>
                      <TouchableOpacity
                        style={[
                          styles.joinBtn,
                          !item.live && styles.detailsBtn,
                        ]}
                      >
                        <Text
                          style={[
                            styles.joinBtnText,
                            !item.live && styles.detailsBtnText,
                          ]}
                        >
                          {item.button}
                        </Text>
                      </TouchableOpacity>

                      {item.secondaryBtn && (
                        <TouchableOpacity style={styles.secondaryBtn}>
                          <Text style={styles.secondaryBtnText}>
                            {item.secondaryBtn}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TutorScheduleScreen;

const createStyles = (colors: any, resp: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F8FAFC',
    },

    heading: {
      fontSize: 26,
      fontWeight: '800',
      color: '#0F172A',
      marginTop: 18,
      marginHorizontal: 20,
    },

    subHeading: {
      marginHorizontal: 20,
      marginTop: 4,
      color: '#64748B',
      fontSize: 13,
    },

    /* DAYS */
    arrowBtn: {
      width: 34,
      height: 34,
      borderRadius: 12,
      backgroundColor: '#F1F5F9',
      justifyContent: 'center',
      alignItems: 'center',
    },
    weekHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginTop: 20,
    },

    weekTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: '#0F172A',
    },

    weekBadge: {
      backgroundColor: '#EEF2FF',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },

    weekBadgeText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#4F46E5',
    },

    calendarContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 14,
      paddingHorizontal: 12,
    },

    calendarList: {
      paddingHorizontal: 10,
      gap: 10,
    },

    navBtn: {
      width: 34,
      height: 34,
      borderRadius: 12,
      backgroundColor: '#F1F5F9',
      justifyContent: 'center',
      alignItems: 'center',
    },

    dayItem: {
      width: 64,
      height: 80,
      borderRadius: 18,
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 6,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },

    dayItemActive: {
      backgroundColor: colors.PRIMARY_COLOR,
      shadowColor: '#2563EB',
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 5,
      transform: [{ scale: 1.08 }],
    },

    dayName: {
      fontSize: 12,
      color: '#64748B',
      fontWeight: '600',
    },

    dayNumber: {
      fontSize: 22,
      fontWeight: '800',
      color: '#0F172A',
      marginTop: 4,
    },

    dayActiveText: {
      color: '#FFFFFF',
    },

    activeDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#FFFFFF',
      marginTop: 6,
    },
    /* STATS */
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      marginTop: 18,
    },

    statsCard: {
      borderWidth: 1,
      width: '48%',
      borderRadius: 18,
      padding: 16,
    },

    statsTitle: {
      fontSize: 12,
      color: '#64748B',
    },

    statsValue: {
      fontSize: 26,
      fontWeight: '800',
      color: '#0F172A',
      marginTop: 8,
    },

    /* SCHEDULE */
    scheduleWrapper: {
      marginTop: 22,
      paddingBottom: 40,
    },

    scheduleRow: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      marginBottom: 18,
    },

    timeWrapper: {
      width: 75,
      alignItems: 'center',
    },

    timeText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#475569',
    },

    lineWrapper: {
      alignItems: 'center',
      flex: 1,
      marginTop: 4,
    },

    circle: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: '#CBD5E1',
    },

    activeCircle: {
      backgroundColor: '#22C55E',
    },

    verticalLine: {
      width: 2,
      flex: 1,
      backgroundColor: '#E2E8F0',
      marginTop: 2,
    },

    slotContainer: {
      flex: 1,
      marginLeft: 10,
    },
    sessionCard: {
      borderRadius: 20,
      borderWidth: 1,
      padding: 14,
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },

    liveBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#22C55E',
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginBottom: 14,
    },

    liveDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#fff',
      marginRight: 6,
    },

    liveText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: '800',
    },

    sessionTop: {
      flexDirection: 'row',
    },

    avatar: {
      width: 54,
      height: 54,
      borderRadius: 27,
      backgroundColor: '#D1D5DB',
      marginRight: 12,
    },

    studentName: {
      fontSize: 16,
      fontWeight: '800',
      color: '#0F172A',
    },

    subjectText: {
      fontSize: 14,
      color: '#475569',
      marginTop: 2,
    },

    topicText: {
      fontSize: 14,
      color: '#475569',
      marginBottom: 10,
    },

    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    timeInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },

    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },

    infoText: {
      fontSize: 12,
      color: '#64748B',
    },

    btnRow: {
      flexDirection: 'row',
      marginTop: 14,
      alignItems: 'center',
    },

    joinBtn: {
      backgroundColor: '#22C55E',
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 14,
      flex: 1,
      alignItems: 'center',
    },

    joinBtnText: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '700',
    },

    detailsBtn: {
      backgroundColor: '#EEF2FF',
    },

    detailsBtnText: {
      color: '#4F46E5',
    },

    secondaryBtn: {
      marginLeft: 10,
      backgroundColor: '#F8FAFC',
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: '#E2E8F0',
    },

    secondaryBtnText: {
      color: '#334155',
      fontSize: 12,
      fontWeight: '600',
    },

    freeCard: {
      height: 80,
      borderRadius: 18,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: '#CBD5E1',
      backgroundColor: '#F8FAFC',
      justifyContent: 'center',
      paddingHorizontal: 16,
    },

    freeText: {
      color: '#94A3B8',
      fontSize: 14,
      fontWeight: '600',
    },
  });
