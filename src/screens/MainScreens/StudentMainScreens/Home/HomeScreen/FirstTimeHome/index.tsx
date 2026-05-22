import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Icon } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';
import useUi from '../../../../../../hooks/ui/useUi';
import CustomButton from '../../../../../../components/CustomButton';
import Images from '../../../../../../assets/images';
import TopTutorCard from '../../../../../../components/StudentHome/TopTutorCard';
import ExploreTile from '../../../../../../components/StudentHome/ExploreTile';

type FirstTimeHomeProps = {
  onFindTutorPress?: () => void;
};

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
  const userName =
    useSelector((state: any) => state.auth.user?.name) || 'Student';
  const styles = useMemo(() => createStyles(colors, resp), [colors, resp]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.pageHeader}>
        <View style={styles.greetingGroup}>
          <Text style={styles.greeting}>Hello, {userName}!</Text>
          <Text style={styles.subheading}>
            Find the best tutor to grow with confidence.
          </Text>
        </View>

        <TouchableOpacity style={styles.notificationButton} activeOpacity={0.8}>
          <Icon
            source="bell-outline"
            size={24}
            color={colors.PRIMARY_COLOR as string}
          />
        </TouchableOpacity>
      </View>

      <LinearGradient
        colors={['#3E76FF', '#1F4EFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.promoCard}
      >
        <Text style={styles.promoTitle}>Every expert was once a beginner</Text>
        <Text style={styles.promoSubtitle}>Start your journey today!</Text>
        <CustomButton
          title="Find a Tutor"
          onPress={onFindTutorPress ?? (() => null)}
          backgroundColor={colors.WHITE_COLOR}
          textColor={colors.PRIMARY_COLOR}
          style={styles.ctaButton}
        />
      </LinearGradient>

      <View style={styles.searchCard}>
        <Icon
          source="magnify"
          size={20}
          color={colors.PLACEHOLDER_TEXTCOLOR as string}
        />
        <TextInput
          placeholder="Search Subjects (e.g. Physics)"
          placeholderTextColor={colors.PLACEHOLDER_TEXTCOLOR as string}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Top Tutors for You</Text>
        <TouchableOpacity activeOpacity={0.8}>
          <Text style={styles.viewAll}>View all</Text>
        </TouchableOpacity>
      </View>

      <TopTutorCard
        image={Images.OneOnOne}
        name="Dr. Sarah Johnson"
        subject="Mathematics"
        rating={4.9}
        badge="Authentic Badge"
        onHire={() => null}
      />

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
  );
};

export default FirstTimeHome;

const createStyles = (colors: any, resp: any) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.WHITE_COLOR,
    },
    content: {
      paddingVertical: resp.dy(24),
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
    promoCard: {
      borderRadius: resp.dx(28),
      padding: resp.dx(24),
      marginBottom: resp.dy(24),
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
      marginBottom: resp.dy(20),
    },
    ctaButton: {
      // width: resp.dx(150),
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
      marginBottom: resp.dy(16),
    },
    sectionHeaderWithMargin: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: resp.dy(14),
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
    exploreGrid: {
      width: '100%',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: resp.dx(12),
    },
  });
