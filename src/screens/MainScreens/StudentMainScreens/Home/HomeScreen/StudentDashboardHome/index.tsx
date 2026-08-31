import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Icon } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import useUi from '../../../../../../hooks/ui/useUi';
import { GlassScreen } from '../../../../../../components/Glass';
import { GLASS } from '../../../../../../theme/glass';
import CurrentLessonCard from '../../../../../../components/StudentHome/CurrentLessonCard';
import QuickAccessGrid from '../../../../../../components/StudentHome/QuickAccessGrid';
import AiSummaryCard from '../../../../../../components/StudentHome/AiSummaryCard';
import { useDashboard } from '../../../../../../hooks/api/useDashboard';
import { getDisplayName } from '../../../../../../utils/api/bookingHelpers';
import {
  leaveHomeStackToTabs,
  navigateHomeStack,
} from '../../../../../../navigation/navigationRef';
import {
  getUnreadNotificationCount,
  subscribeNotificationInbox,
} from '../../../../../../services/notifications/notificationInboxStore';
import { getUserId } from '../../../../../../utils/api/userId';
import { ApiUser, DashboardLesson } from '../../../../../../types/api.types';
import { openClassroom } from '../../../../../../services/webrtc/openClassroom';
import { useAppSelector } from '../../../../../../store/hooks';
import { canJoinMeeting } from '../../../../../../utils/bookings/bookingStatus';
import {
  ensureSummarySocket,
  releaseSummarySocketHandler,
} from '../../../../../../services/summaries/summarySocket';
import { SummarySocketPayload } from '../../../../../../types/summary.types';

/**
 * Student home after hiring a tutor — Today's Schedule + Quick Access + AI summaries.
 */
const StudentDashboardHome = () => {
  const { resp } = useUi();
  const navigation = useNavigation<any>();
  const user = useSelector((state: any) => state.auth.user);
  const authUser = useAppSelector(state => state.auth.user as ApiUser | null);
  const userName = getDisplayName(user);
  const userId = getUserId(user);
  const styles = useMemo(() => createStyles(resp), [resp]);
  const { data: dashboard, loading, error, refresh } = useDashboard();
  const [inboxUnread, setInboxUnread] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const refreshUnread = useCallback(async () => {
    const count = await getUnreadNotificationCount(userId);
    setInboxUnread(count);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      const onSummaryEvent = (payload: SummarySocketPayload) => {
        if (payload.status === 'published') {
          void refresh();
          void refreshUnread();
        }
      };
      void ensureSummarySocket(onSummaryEvent);
      void refresh();
      void refreshUnread();
      return () => releaseSummarySocketHandler(onSummaryEvent);
    }, [refresh, refreshUnread])
  );

  useEffect(() => subscribeNotificationInbox(() => void refreshUnread()), [
    refreshUnread,
  ]);

  const lessons = dashboard?.todaySchedule?.currentLessons || [];
  const featured = lessons.find(l => l.isNextSession) || lessons[0];
  const quick = dashboard?.quickAccess;
  const summaries = dashboard?.aiSummaries || [];
  const unreadBadge =
    inboxUnread > 0
      ? inboxUnread
      : dashboard?.notifications?.unreadCount || 0;

  const onPullRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refresh(), refreshUnread()]);
    } finally {
      setRefreshing(false);
    }
  };

  const joinLesson = (lesson: DashboardLesson) => {
    const bookingLike = {
      _id: lesson._id,
      status: lesson.status || 'accepted',
      meetingLink: lesson.meetingLink,
      startTime: lesson.startTime,
      endTime: lesson.endTime,
      date: lesson.date,
      subject: lesson.subject,
      tutor: lesson.tutor
        ? {
            _id: lesson.tutor._id,
            name: lesson.tutor.name,
            avatarUrl: lesson.tutor.avatarUrl,
          }
        : '',
      student: authUser?._id || authUser?.id || '',
      packageId: lesson.packageId,
      mode: lesson.mode,
    };

    if (!canJoinMeeting(bookingLike as never)) {
      Alert.alert(
        'Classroom unavailable',
        'This class is not ready to join yet. Check back near the scheduled time.'
      );
      return;
    }

    const opened = openClassroom(bookingLike as never, {
      user: authUser,
      role: 'student',
      autoStart: true,
    });
    if (!opened) {
      Alert.alert(
        'Unable to join',
        'Could not open the TutorLink classroom for this session.'
      );
    }
  };

  const comingSoon = (feature: string) => {
    Alert.alert(
      feature,
      `${feature} will unlock once your tutor posts work. Backend endpoints are listed in the dashboard requirements doc.`
    );
  };

  const quickTiles = [
    {
      key: 'assignments',
      title: 'Assignments',
      subtitle: quick?.assignments?.label || `${quick?.assignments?.count ?? 0} new`,
      icon: 'book-open-page-variant',
      tone: 'orange' as const,
      onPress: () => comingSoon('Assignments'),
    },
    {
      key: 'quizzes',
      title: 'Quizzes',
      subtitle: quick?.quizzes?.label || `${quick?.quizzes?.count ?? 0} pending`,
      icon: 'help-circle-outline',
      tone: 'purple' as const,
      onPress: () => comingSoon('Quizzes'),
    },
    {
      key: 'tests',
      title: 'Tests',
      subtitle: quick?.tests?.label || `${quick?.tests?.count ?? 0} upcoming`,
      icon: 'check-circle-outline',
      tone: 'green' as const,
      onPress: () => comingSoon('Tests'),
    },
    {
      key: 'full',
      title: 'Full Dashboard',
      subtitle: 'View all',
      icon: 'calendar-month-outline',
      tone: 'blue' as const,
      onPress: () => leaveHomeStackToTabs('Bookings'),
    },
  ];

  return (
    <GlassScreen
      scroll={false}
      edges={['top', 'left', 'right']}
      contentStyle={styles.screen}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void onPullRefresh()}
            tintColor={GLASS.primary}
          />
        }
      >
        {/* Hero — student name first */}
        <View style={styles.hero}>
          <View style={styles.heroText}>
            <Text style={styles.welcome}>Welcome back,</Text>
            <Text style={styles.name} numberOfLines={1}>
              {userName}
            </Text>
            <Text style={styles.heroSub}>
              {featured
                ? `Next up: ${featured.subject} at ${featured.startTime}`
                : "Your tutors and classes live here."}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.bell}
            activeOpacity={0.85}
            onPress={() =>
              navigateHomeStack('StudentNotificationInboxScreen')
            }
          >
            <Icon source="bell-outline" size={22} color={GLASS.primary} />
            {unreadBadge > 0 ? <View style={styles.dot} /> : null}
          </TouchableOpacity>
        </View>

        <LinearGradient
          colors={['rgba(117,72,245,0.14)', 'rgba(91,47,214,0.06)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.scheduleBanner}
        >
          <Text style={styles.scheduleTitle}>Today&apos;s Schedule</Text>
          <Text style={styles.scheduleDate}>
            {dashboard?.todaySchedule?.date ||
              new Date().toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
          </Text>
        </LinearGradient>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Current Lessons</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => leaveHomeStackToTabs('Bookings')}
          >
            <Text style={styles.viewAll}>View all ›</Text>
          </TouchableOpacity>
        </View>

        {loading && !dashboard ? (
          <ActivityIndicator color={GLASS.primary} style={{ marginVertical: 24 }} />
        ) : featured ? (
          <CurrentLessonCard
            lesson={featured}
            onJoin={() => joinLesson(featured)}
            onPress={() => leaveHomeStackToTabs('Bookings')}
          />
        ) : (
          <View style={styles.emptyLesson}>
            <Text style={styles.emptyTitle}>No class on the clock</Text>
            <Text style={styles.emptySub}>
              {error
                ? `Could not load schedule: ${error}`
                : 'When your next weekday session is due, Join Room appears here.'}
            </Text>
            <TouchableOpacity
              onPress={() => leaveHomeStackToTabs('Bookings')}
              style={styles.emptyLink}
            >
              <Text style={styles.viewAll}>Open Bookings</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={[styles.sectionTitle, styles.sectionSpaced]}>
          Quick Access
        </Text>
        <QuickAccessGrid tiles={quickTiles} />

        <View style={[styles.sectionHeader, styles.sectionSpaced]}>
          <View style={styles.aiTitleRow}>
            <Text style={styles.sectionTitle}>Latest Learning Summary</Text>
            <Icon source="star-four-points" size={18} color={GLASS.accent} />
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigateHomeStack('StudentSummariesScreen')}
          >
            <Text style={styles.viewAll}>View all ›</Text>
          </TouchableOpacity>
        </View>

        {summaries.length > 0 ? (
          <View style={styles.summaryStack}>
            {summaries.slice(0, 2).map(item => (
              <AiSummaryCard
                key={item._id}
                summary={item}
                onPress={() =>
                  navigateHomeStack('StudentSummaryDetailScreen', {
                    summaryId: item._id,
                  })
                }
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptySummaries}>
            <View style={styles.emptyAiIcon}>
              <Icon source="star-four-points" size={22} color={GLASS.accent} />
            </View>
            <Text style={styles.emptyTitle}>No learning summaries yet</Text>
            <Text style={styles.emptySub}>
              After your tutor publishes a class summary, it will show here for
              revision.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.findMore}
          activeOpacity={0.88}
          onPress={() => navigation.navigate('Search')}
        >
          <Text style={styles.findMoreText}>Find another tutor</Text>
          <Icon source="magnify" size={18} color={GLASS.primary} />
        </TouchableOpacity>
      </ScrollView>
    </GlassScreen>
  );
};

export default StudentDashboardHome;

const createStyles = (resp: { dx: (n: number) => number; dy: (n: number) => number; df: (n: number) => number }) =>
  StyleSheet.create({
    screen: { flex: 1 },
    scroll: { flex: 1 },
    content: {
      paddingTop: resp.dy(8),
      paddingHorizontal: resp.dx(20),
      paddingBottom: resp.dy(36),
    },
    hero: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: resp.dy(16),
      gap: 12,
    },
    heroText: { flex: 1, minWidth: 0 },
    welcome: {
      color: GLASS.textSecondary,
      fontSize: resp.df(14),
      fontWeight: '600',
    },
    name: {
      color: GLASS.textPrimary,
      fontSize: resp.df(28),
      fontWeight: '800',
      marginTop: 2,
      letterSpacing: -0.4,
    },
    heroSub: {
      color: GLASS.textSecondary,
      fontSize: resp.df(13),
      lineHeight: resp.dy(19),
      marginTop: 6,
    },
    bell: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: GLASS.cardBgStrong,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      alignItems: 'center',
      justifyContent: 'center',
      ...GLASS.shadow.soft,
    },
    dot: {
      position: 'absolute',
      top: 10,
      right: 11,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: GLASS.error,
      borderWidth: 1.5,
      borderColor: '#fff',
    },
    scheduleBanner: {
      borderRadius: GLASS.radius.xl,
      paddingVertical: 14,
      paddingHorizontal: 16,
      marginBottom: resp.dy(18),
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
    },
    scheduleTitle: {
      color: GLASS.textPrimary,
      fontSize: resp.df(20),
      fontWeight: '800',
    },
    scheduleDate: {
      color: GLASS.textSecondary,
      fontSize: 13,
      marginTop: 4,
      fontWeight: '600',
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    sectionSpaced: {
      marginTop: resp.dy(22),
    },
    sectionTitle: {
      color: GLASS.textPrimary,
      fontSize: resp.df(18),
      fontWeight: '800',
    },
    viewAll: {
      color: GLASS.primary,
      fontSize: 13,
      fontWeight: '700',
    },
    aiTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    summaryStack: {
      gap: 12,
    },
    emptyLesson: {
      borderRadius: GLASS.radius.xxl,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      borderStyle: 'dashed',
      padding: 20,
      backgroundColor: 'rgba(255,255,255,0.45)',
    },
    emptySummaries: {
      borderRadius: GLASS.radius.xl,
      padding: 18,
      backgroundColor: 'rgba(253, 230, 138, 0.28)',
      borderWidth: 1,
      borderColor: 'rgba(247, 184, 75, 0.35)',
    },
    emptyAiIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: 'rgba(255,255,255,0.7)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    emptyTitle: {
      color: GLASS.textPrimary,
      fontWeight: '800',
      fontSize: 15,
    },
    emptySub: {
      color: GLASS.textSecondary,
      fontSize: 13,
      lineHeight: 19,
      marginTop: 6,
    },
    emptyLink: { marginTop: 12 },
    findMore: {
      marginTop: resp.dy(24),
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 10,
      paddingHorizontal: 14,
    },
    findMoreText: {
      color: GLASS.primary,
      fontWeight: '700',
      fontSize: 14,
    },
  });
