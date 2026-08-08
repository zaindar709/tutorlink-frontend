import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Icon } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import useUi from '../../../../../../hooks/ui/useUi';
import Images from '../../../../../../assets/images';
import TopTutorCard from '../../../../../../components/StudentHome/TopTutorCard';
import ExploreTile from '../../../../../../components/StudentHome/ExploreTile';
import {
  AiRecommendationCard,
  AiTutorMascot,
} from '../../../../../../components/AiAssistant';
import { GlassScreen } from '../../../../../../components/Glass';
import { GLASS } from '../../../../../../theme/glass';
import { useDashboard } from '../../../../../../hooks/api/useDashboard';
import { useTutorSearch } from '../../../../../../hooks/api/useTutorSearch';
import { useAiTutorRecommendation } from '../../../../../../hooks/api/useAiTutorRecommendation';
import { useStudentTutorRelations } from '../../../../../../hooks/api/useStudentTutorRelations';
import { getDisplayName } from '../../../../../../utils/api/bookingHelpers';
import {
  leaveHomeStackToTabs,
  navigateHomeStack,
} from '../../../../../../navigation/navigationRef';
import { enrichTutorFromSearch } from '../../../../../../constants/bookingFlowMockData';
import { TutorProfile } from '../../../../../../types/api.types';
import {
  getUnreadNotificationCount,
  subscribeNotificationInbox,
} from '../../../../../../services/notifications/notificationInboxStore';
import { getUserId } from '../../../../../../utils/api/userId';

type FirstTimeHomeProps = {
  onFindTutorPress?: () => void;
};

/** Empty body — service tries unfiltered then verified. */
const HOME_TUTOR_FILTERS = {};

const homeExploreItems = [
  {
    icon: 'book-open-outline',
    title: 'How it Works',
    subtitle: 'Get started with our tutor matching process',
    color: '#4B84FF',
  },
  {
    icon: 'star-outline',
    title: 'Popular Topics',
    subtitle: 'Explore trending subjects and classes',
    color: '#F7B500',
  },
  {
    icon: 'shield-check-outline',
    title: 'Verified Tutors',
    subtitle: 'Learn from vetted and trusted professionals',
    color: '#6ACB8B',
  },
  {
    icon: 'trophy-outline',
    title: 'Top Rated',
    subtitle: 'Choose high-rated educators for every need',
    color: '#FF8C57',
  },
];

const FirstTimeHome: React.FC<FirstTimeHomeProps> = ({ onFindTutorPress }) => {
  const { colors, resp } = useUi();
  const navigation = useNavigation<any>();
  const user = useSelector((state: any) => state.auth.user);
  const userName = getDisplayName(user);
  const userId = getUserId(user);
  const styles = useMemo(() => createStyles(colors, resp), [colors, resp]);
  const { data: dashboard, loading: dashboardLoading } = useDashboard();
  const [inboxUnread, setInboxUnread] = useState(0);
  const {
    tutors,
    loading: tutorsLoading,
    error: tutorsError,
    search: reloadTutors,
  } = useTutorSearch(HOME_TUTOR_FILTERS, { autoLoad: false });
  const {
    recommendation,
    loading: aiLoading,
    error: aiError,
    interests,
    guideMode,
    finishGuide,
    refresh: refreshAi,
    requestAnother,
  } = useAiTutorRecommendation();
  const { getRelation } = useStudentTutorRelations();

  const refreshUnread = useCallback(async () => {
    const count = await getUnreadNotificationCount(userId);
    setInboxUnread(count);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      void reloadTutors({}, { replace: true });
      void refreshUnread();
    }, [reloadTutors, refreshUnread])
  );

  useEffect(() => subscribeNotificationInbox(() => void refreshUnread()), [
    refreshUnread,
  ]);

  const topTutors = tutors.slice(0, 4);
  const nextLesson = dashboard?.todaySchedule?.currentLessons?.[0];
  const unreadBadge =
    inboxUnread > 0
      ? inboxUnread
      : dashboard?.notifications?.unreadCount || 0;

  const guideMessage =
    guideMode === 'no_match'
      ? "Oops! I couldn't find any tutor related to your interests. Try Search for more."
      : 'Here is the best tutor for you!';

  const handleFindTutor = (viewAll = false) => {
    if (onFindTutorPress && !viewAll) {
      onFindTutorPress();
      return;
    }
    navigation.navigate('Search', viewAll ? { viewAll: true } : undefined);
  };

  const handleOpenSearchTab = () => {
    navigation.navigate('Search', { focusSearch: true });
  };

  const handleOpenNotifications = () => {
    navigateHomeStack('StudentNotificationInboxScreen');
  };

  const openTutorBooking = (
    tutor: TutorProfile,
    ctaLabel: 'Hire Tutor' | 'Book Now'
  ) => {
    const relation = getRelation(
      [tutor._id, tutor.user?._id, tutor.user?.id],
      tutor.relation
    );
    if (!relation.canBook) {
      if (relation.state === 'request_sent' && relation.booking) {
        navigateHomeStack('BookingPendingScreen', {
          bookingId: relation.booking._id,
        });
        return;
      }
      leaveHomeStackToTabs('Bookings');
      return;
    }
    try {
      const enriched = enrichTutorFromSearch(tutor);
      navigateHomeStack('TutorBookingDetailsScreen', {
        tutorId: enriched.id,
        tutor: enriched,
        ctaLabel,
      });
    } catch (error) {
      console.warn('[Home] tutor navigate failed', error);
      navigateHomeStack('TutorBookingDetailsScreen', {
        tutorId: tutor._id,
        ctaLabel,
      });
    }
  };

  const handleAiViewProfile = () => {
    if (!recommendation?.tutor.source) return;
    openTutorBooking(recommendation.tutor.source, 'Hire Tutor');
  };

  const handleAiBookNow = () => {
    if (!recommendation?.tutor.source) return;
    openTutorBooking(recommendation.tutor.source, 'Book Now');
  };

  const aiRelation = recommendation?.tutor.source
    ? getRelation(
        [
          recommendation.tutor.source._id,
          recommendation.tutor.source.user?._id,
          recommendation.tutor.source.user?.id,
          recommendation.tutor.id,
        ],
        recommendation.tutor.source.relation
      )
    : null;

  return (
    <GlassScreen scroll={false} edges={['top', 'left', 'right']} contentStyle={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeader}>
          <View style={styles.greetingGroup}>
            <Text style={styles.greeting}>Hello, {userName}!</Text>
            <Text style={styles.subheading}>
              {dashboardLoading
                ? 'Loading your dashboard...'
                : nextLesson
                  ? `Next up: ${nextLesson.subject} at ${nextLesson.startTime}`
                  : 'Find the best tutor to grow with confidence.'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.notificationButton}
            activeOpacity={0.8}
            onPress={handleOpenNotifications}
          >
            <Icon
              source="bell-outline"
              size={24}
              color={colors.PRIMARY_COLOR as string}
            />
            {unreadBadge > 0 ? (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadBadge > 99 ? '99+' : String(unreadBadge)}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>

        <View style={styles.heroWrap}>
          <LinearGradient
            colors={[...GLASS.buttonGradient]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.promoCard}
          >
            <Text style={styles.promoTitle}>
              Every expert was once a beginner
            </Text>
            <Text style={styles.promoSubtitle}>Start your journey today!</Text>
            <TouchableOpacity
              style={styles.findTutorBtn}
              activeOpacity={0.85}
              onPress={() => handleFindTutor(false)}
            >
              <Text style={styles.findTutorBtnText}>Find a Tutor</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Original order: search field → Top Tutors + View all */}
        <View style={styles.searchWrap}>
          {guideMode === 'no_match' ? (
            <AiTutorMascot
              visible
              message={guideMessage}
              pointTo="search"
              onAutoDismiss={() => void finishGuide()}
            />
          ) : null}
          <TouchableOpacity
            style={styles.searchCard}
            activeOpacity={0.85}
            onPress={handleOpenSearchTab}
          >
            <Icon
              source="magnify"
              size={20}
              color={colors.PLACEHOLDER_TEXTCOLOR as string}
            />
            <Text
              style={[
                styles.searchInput,
                { color: colors.PLACEHOLDER_TEXTCOLOR as string },
              ]}
            >
              Search Subjects (e.g. Physics)
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Tutors for You</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleFindTutor(true)}
          >
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>

        {tutorsLoading ? (
          <ActivityIndicator style={{ marginBottom: resp.dy(16) }} />
        ) : topTutors.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tutorsRow}
            style={styles.tutorsScroll}
          >
            {topTutors.map(tutor => {
              const relation = getRelation(
                [tutor._id, tutor.user?._id, tutor.user?.id],
                tutor.relation
              );
              return (
                <TopTutorCard
                  key={tutor._id}
                  image={
                    tutor.user?.avatarUrl
                      ? { uri: tutor.user.avatarUrl }
                      : Images.OneOnOne
                  }
                  name={tutor.user?.name || 'Top Tutor'}
                  subject={(tutor.subjects || []).join(', ') || 'General'}
                  rating={tutor.rating || 4}
                  badge={tutor.isVerified ? 'Verified Tutor' : 'Recommended'}
                  verified={!!tutor.isVerified}
                  university={
                    tutor.qualification ||
                    (tutor.isVerified ? 'Verified Tutor' : 'Recommended')
                  }
                  ctaLabel={
                    relation.canBook ? 'Hire Tutor' : relation.label
                  }
                  ctaDisabled={!relation.canBook}
                  onHire={() => openTutorBooking(tutor, 'Hire Tutor')}
                />
              );
            })}
          </ScrollView>
        ) : (
          <View style={{ marginBottom: 16 }}>
            <Text style={styles.emptyText}>
              {tutorsError
                ? `Could not load tutors: ${tutorsError}`
                : 'No verified tutors available right now.'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                void reloadTutors({}, { replace: true });
              }}
            >
              <Text style={styles.viewAll}>Tap to retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* AI block stays below live backend tutors */}
        <View style={styles.aiSection}>
          {guideMode === 'match' ? (
            <AiTutorMascot
              visible
              message={guideMessage}
              pointTo="card"
              onAutoDismiss={() => void finishGuide()}
            />
          ) : null}
          <AiRecommendationCard
            recommendation={recommendation}
            loading={aiLoading}
            error={aiError}
            interests={interests}
            onViewProfile={handleAiViewProfile}
            onBookNow={handleAiBookNow}
            onRefresh={() => void refreshAi()}
            onAnother={() => void requestAnother()}
            bookLabel={
              aiRelation?.canBook
                ? 'Book Now'
                : aiRelation?.label || 'Book Now'
            }
            bookDisabled={Boolean(aiRelation && !aiRelation.canBook)}
          />
        </View>

        <View style={styles.sectionHeaderWithMargin}>
          <Text style={styles.sectionTitle}>Explore</Text>
        </View>

        <View style={styles.exploreGrid}>
          {homeExploreItems.map(item => (
            <ExploreTile
              key={item.title}
              icon={item.icon}
              title={item.title}
              subtitle={item.subtitle}
              color={item.color}
            />
          ))}
        </View>
      </ScrollView>
    </GlassScreen>
  );
};

export default FirstTimeHome;

const createStyles = (colors: any, resp: any) =>
  StyleSheet.create({
    screen: {
      flex: 1,
    },
    scroll: {
      flex: 1,
    },
    content: {
      paddingTop: resp.dy(12),
      paddingHorizontal: resp.dx(20),
      paddingBottom: resp.dy(32),
    },
    pageHeader: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: resp.dy(24),
      gap: resp.dx(12),
    },
    greetingGroup: {
      flex: 1,
    },
    greeting: {
      color: GLASS.textPrimary,
      fontSize: resp.df(24),
      fontWeight: '800',
      marginBottom: resp.dy(4),
    },
    subheading: {
      color: GLASS.textSecondary,
      fontSize: resp.df(14),
      lineHeight: resp.dy(20),
      maxWidth: resp.dx(260),
    },
    notificationButton: {
      width: resp.dx(46),
      height: resp.dx(46),
      borderRadius: resp.dx(23),
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      alignItems: 'center',
      justifyContent: 'center',
      ...GLASS.shadow.soft,
    },
    notificationBadge: {
      position: 'absolute',
      top: 4,
      right: 4,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      paddingHorizontal: 4,
      backgroundColor: GLASS.error,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: '#FFFFFF',
    },
    notificationBadgeText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '800',
      lineHeight: 12,
    },
    notificationDot: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: GLASS.error,
    },
    heroWrap: {
      marginBottom: resp.dy(8),
    },
    promoCard: {
      borderRadius: GLASS.radius.xxl,
      padding: resp.dx(22),
      marginBottom: resp.dy(12),
      width: '100%',
    },
    promoTitle: {
      color: GLASS.textOnPrimary,
      fontSize: resp.df(22),
      fontWeight: '800',
      marginBottom: resp.dy(10),
      lineHeight: resp.dy(32),
    },
    promoSubtitle: {
      color: GLASS.textOnPrimary,
      fontSize: resp.df(14),
      lineHeight: resp.dy(20),
      marginBottom: resp.dy(18),
      opacity: 0.9,
    },
    findTutorBtn: {
      alignSelf: 'stretch',
      width: '100%',
      height: 48,
      borderRadius: GLASS.radius.md,
      backgroundColor: GLASS.cardBgStrong,
      alignItems: 'center',
      justifyContent: 'center',
    },
    findTutorBtnText: {
      color: GLASS.primary,
      fontSize: 16,
      fontWeight: '700',
    },
    searchWrap: {
      position: 'relative',
      width: '100%',
      zIndex: 4,
      overflow: 'visible',
    },
    searchCard: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: resp.dx(12),
      backgroundColor: '#FFFFFF',
      borderRadius: GLASS.radius.xl,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      paddingHorizontal: resp.dx(18),
      paddingVertical: resp.dy(14),
      ...GLASS.shadow.soft,
      marginBottom: resp.dy(24),
    },
    searchInput: {
      flex: 1,
      fontSize: resp.df(14),
      color: GLASS.textPrimary,
      padding: 0,
    },
    sectionHeader: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: resp.dy(8),
    },
    sectionHeaderWithMargin: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: resp.dy(14),
      marginTop: resp.dy(8),
    },
    sectionTitle: {
      color: GLASS.textPrimary,
      fontSize: resp.df(18),
      fontWeight: '700',
    },
    viewAll: {
      color: GLASS.primary,
      fontSize: resp.df(13),
      fontWeight: '600',
    },
    aiSection: {
      position: 'relative',
      width: '100%',
      zIndex: 3,
      overflow: 'visible',
      marginTop: resp.dy(4),
      marginBottom: resp.dy(8),
    },
    exploreGrid: {
      width: '100%',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: resp.dx(12),
    },
    tutorsScroll: {
      marginHorizontal: resp.dx(-4),
      marginBottom: resp.dy(12),
    },
    tutorsRow: {
      paddingHorizontal: resp.dx(4),
      paddingBottom: resp.dy(6),
      paddingRight: resp.dx(12),
    },
    emptyText: {
      color: GLASS.textSecondary,
      marginBottom: resp.dy(16),
    },
  });
