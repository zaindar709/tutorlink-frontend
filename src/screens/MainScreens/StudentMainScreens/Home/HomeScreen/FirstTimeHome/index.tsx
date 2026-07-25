import React, { useCallback, useMemo } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import useUi from '../../../../../../hooks/ui/useUi';
import Images from '../../../../../../assets/images';
import TopTutorCard from '../../../../../../components/StudentHome/TopTutorCard';
import ExploreTile from '../../../../../../components/StudentHome/ExploreTile';
import {
  AiRecommendationCard,
  AiTutorMascot,
} from '../../../../../../components/AiAssistant';
import { useDashboard } from '../../../../../../hooks/api/useDashboard';
import { useTutorSearch } from '../../../../../../hooks/api/useTutorSearch';
import { useAiTutorRecommendation } from '../../../../../../hooks/api/useAiTutorRecommendation';
import { getDisplayName } from '../../../../../../utils/api/bookingHelpers';
import { navigateHomeStack } from '../../../../../../navigation/navigationRef';
import { enrichTutorFromSearch } from '../../../../../../constants/bookingFlowMockData';
import { TutorProfile } from '../../../../../../types/api.types';

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
  const styles = useMemo(() => createStyles(colors, resp), [colors, resp]);
  const { data: dashboard, loading: dashboardLoading } = useDashboard();
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

  useFocusEffect(
    useCallback(() => {
      void reloadTutors({}, { replace: true });
    }, [reloadTutors])
  );

  const topTutors = tutors.slice(0, 3);
  const nextLesson = dashboard?.todaySchedule?.currentLessons?.[0];

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

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
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
            {dashboard?.notifications?.hasUnread ? (
              <View style={styles.notificationDot} />
            ) : null}
          </TouchableOpacity>
        </View>

        <View style={styles.heroWrap}>
          <LinearGradient
            colors={[
              colors.PRIMARY_COLOR as string,
              '#5B2FD6',
              '#4C1D95',
            ]}
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
          topTutors.map(tutor => (
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
              onHire={() => openTutorBooking(tutor, 'Hire Tutor')}
            />
          ))
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
    </SafeAreaView>
  );
};

export default FirstTimeHome;

const createStyles = (colors: any, resp: any) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.WHITE_COLOR,
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
      color: colors.BLACK_COLOR,
      fontSize: resp.df(24),
      fontWeight: '800',
      marginBottom: resp.dy(4),
    },
    subheading: {
      color: colors.SPACES_COLOR,
      fontSize: resp.df(14),
      lineHeight: resp.dy(20),
      maxWidth: resp.dx(260),
    },
    notificationButton: {
      width: resp.dx(46),
      height: resp.dx(46),
      borderRadius: resp.dx(23),
      backgroundColor: colors.WHITE_COLOR,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.BLACK_COLOR,
      shadowOpacity: 0.08,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
      elevation: 4,
    },
    notificationDot: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#EF4444',
    },
    heroWrap: {
      marginBottom: resp.dy(8),
    },
    promoCard: {
      borderRadius: resp.dx(28),
      padding: resp.dx(22),
      marginBottom: resp.dy(12),
      width: '100%',
    },
    promoTitle: {
      color: colors.WHITE_COLOR,
      fontSize: resp.df(22),
      fontWeight: '800',
      marginBottom: resp.dy(10),
      lineHeight: resp.dy(32),
    },
    promoSubtitle: {
      color: colors.WHITE_COLOR,
      fontSize: resp.df(14),
      lineHeight: resp.dy(20),
      marginBottom: resp.dy(18),
    },
    findTutorBtn: {
      alignSelf: 'stretch',
      width: '100%',
      height: 48,
      borderRadius: 14,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    findTutorBtnText: {
      color: String(colors.PRIMARY_COLOR || '#7548F5'),
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
      backgroundColor: colors.WHITE_COLOR,
      borderRadius: resp.dx(20),
      paddingHorizontal: resp.dx(18),
      paddingVertical: resp.dy(14),
      shadowColor: colors.BLACK_COLOR,
      shadowOpacity: 0.05,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 2,
      marginBottom: resp.dy(24),
    },
    searchInput: {
      flex: 1,
      fontSize: resp.df(14),
      color: colors.BLACK_COLOR,
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
      color: colors.BLACK_COLOR,
      fontSize: resp.df(18),
      fontWeight: '700',
    },
    viewAll: {
      color: colors.PRIMARY_COLOR,
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
    emptyText: {
      color: colors.SPACES_COLOR,
      marginBottom: resp.dy(16),
    },
  });
