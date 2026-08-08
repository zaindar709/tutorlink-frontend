import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { GlassScreen } from '../../../../components/Glass';
import { GLASS } from '../../../../theme/glass';
import {
  MenuItemCard,
  ProfileMenuSection,
} from '../../../../components/Profile';
import { logout } from '../../../../store/auth/authSlice';
import { logoutUser } from '../../../../services/auth/authService';
import { ApiUser } from '../../../../types/api.types';
import { loadTutorEditableProfile } from '../../../../services/profile/tutorProfileLocalStore';
import { getDisplayName } from '../../../../utils/api/bookingHelpers';
import { navigateHomeStack } from '../../../../navigation/navigationRef';
import useUi from '../../../../hooks/ui/useUi';

type MenuItem = {
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  screen: string;
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

const MENU_SECTIONS: MenuSection[] = [
  {
    title: 'Teaching',
    items: [
      {
        title: 'Schedule Availability',
        description: 'Set weekly teaching hours',
        icon: 'calendar-clock',
        iconColor: '#D946EF',
        screen: 'ScheduleAvailabilityScreen',
      },
      {
        title: 'My Earnings',
        description: 'Balance, withdraw & history',
        icon: 'wallet-outline',
        iconColor: '#7548F5',
        screen: 'TutorEarningsScreen',
      },
      {
        title: 'Payment Methods',
        description: 'JazzCash & Easypaisa',
        icon: 'credit-card-outline',
        iconColor: '#22C55E',
        screen: 'PaymentMethodScreen',
      },
    ],
  },
  {
    title: 'Account',
    items: [
      {
        title: 'Edit Profile',
        description: 'Name, bio, fee & photo',
        icon: 'account-edit-outline',
        iconColor: '#0EA5E9',
        screen: 'EditProfileScreen',
      },
      {
        title: 'Security & Privacy',
        description: 'Password & protection',
        icon: 'shield-lock-outline',
        iconColor: '#F97316',
        screen: 'SecurityPrivacyScreen',
      },
    ],
  },
  {
    title: 'Developer',
    items: [
      {
        title: 'Developer Options',
        description: 'QA login, switch accounts & jumps',
        icon: 'code-tags',
        iconColor: '#64748B',
        screen: 'DeveloperOptionsScreen',
      },
    ],
  },
];

const TutorProfileScreen = () => {
  const { resp } = useUi();
  const styles = useMemo(() => createStyles(resp), [resp]);
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.auth.user as ApiUser | null);
  const displayName = getDisplayName(user) === 'User' ? 'Tutor' : getDisplayName(user);
  const userId = String(
    user?.uid || user?.firebaseUid || user?.id || user?._id || ''
  );
  const [loggingOut, setLoggingOut] = useState(false);
  const [localProfile, setLocalProfile] = useState({
    bio: '',
    phone: '',
    email: '',
    education: '',
    hourlyRate: '',
    experience: '',
  });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const local = await loadTutorEditableProfile(userId || null);
      if (!mounted) return;
      setLocalProfile({
        bio: local.bio || '',
        phone: local.phone || String(user?.phoneNumber || user?.phone || ''),
        email: local.email || String(user?.email || ''),
        education: local.education || '',
        hourlyRate: local.hourlyRate || '',
        experience: local.experience || '',
      });
    };
    void load();
    const unsubscribe = navigation.addListener('focus', () => {
      void load();
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [navigation, user, userId]);

  const avatarUri =
    user?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      displayName
    )}&background=7548F5&color=fff`;
  const contactEmail = localProfile.email || user?.email || '';
  const rateLabel = localProfile.hourlyRate
    ? `Rs. ${Number(localProfile.hourlyRate).toLocaleString()}/hr`
    : 'Set your fee';
  const experienceLabel = localProfile.experience
    ? localProfile.experience
    : 'Add experience';
  const educationLabel = localProfile.education || 'Add education';

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logoutUser();
      dispatch(logout());
      navigation.reset({
        index: 0,
        routes: [{ name: 'AuthNavigator' }],
      });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <GlassScreen
      scroll={false}
      edges={['top', 'left', 'right']}
      contentStyle={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.pageEyebrow}>Tutor workspace</Text>
            <Text style={styles.pageTitle}>Profile</Text>
          </View>
          <TouchableOpacity
            style={styles.headerEdit}
            activeOpacity={0.85}
            onPress={() => navigateHomeStack('EditProfileScreen')}
          >
            <MaterialCommunityIcons
              name="pencil-outline"
              size={18}
              color={GLASS.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Modern inset split hero — not full-bleed / not centered stack */}
        <View style={styles.heroShell}>
          <LinearGradient
            colors={[...GLASS.buttonGradient]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroBlobA} />
            <View style={styles.heroBlobB} />

            <View style={styles.heroSplit}>
              <View style={styles.avatarStack}>
                <View style={styles.avatarGlow} />
                <Image source={{ uri: avatarUri }} style={styles.avatar} />
                <View style={styles.verifyBadge}>
                  <MaterialCommunityIcons
                    name="check-decagram"
                    size={14}
                    color="#fff"
                  />
                </View>
              </View>

              <View style={styles.heroCopy}>
                <View style={styles.livePill}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>Available to teach</Text>
                </View>
                <Text style={styles.name} numberOfLines={2}>
                  {displayName}
                </Text>
                <Text style={styles.roleLine}>Verified professional tutor</Text>
                <Text style={styles.bio} numberOfLines={2}>
                  {localProfile.bio ||
                    'Add a short bio so students understand your teaching style.'}
                </Text>
              </View>
            </View>

            <View style={styles.heroGlassBar}>
              <View style={styles.glassCell}>
                <Text style={styles.glassLabel}>Fee</Text>
                <Text style={styles.glassValue} numberOfLines={1}>
                  {rateLabel}
                </Text>
              </View>
              <View style={styles.glassSep} />
              <View style={styles.glassCell}>
                <Text style={styles.glassLabel}>Experience</Text>
                <Text style={styles.glassValue} numberOfLines={1}>
                  {experienceLabel}
                </Text>
              </View>
              <View style={styles.glassSep} />
              <View style={styles.glassCell}>
                <Text style={styles.glassLabel}>Contact</Text>
                <Text style={styles.glassValue} numberOfLines={1}>
                  {contactEmail ? contactEmail.split('@')[0] : '—'}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Floating snapshot strip — different from student grade/ID hero */}
        <View style={styles.snapshotCard}>
          <View style={styles.snapshotItem}>
            <Text style={styles.snapshotValue}>4.9</Text>
            <Text style={styles.snapshotLabel}>Rating</Text>
          </View>
          <View style={styles.snapshotDivider} />
          <View style={styles.snapshotItem}>
            <Text style={styles.snapshotValue}>48</Text>
            <Text style={styles.snapshotLabel}>Students</Text>
          </View>
          <View style={styles.snapshotDivider} />
          <View style={styles.snapshotItem}>
            <Text style={styles.snapshotValue}>342h</Text>
            <Text style={styles.snapshotLabel}>Taught</Text>
          </View>
        </View>

        <View style={styles.focusCard}>
          <Text style={styles.focusTitle}>Teaching focus</Text>
          <Text style={styles.focusSub} numberOfLines={2}>
            {educationLabel}
          </Text>
          <View style={styles.focusTags}>
            {['Mathematics', 'Physics', 'Chemistry'].map(tag => (
              <View key={tag} style={styles.focusTag}>
                <Text style={styles.focusTagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Same bottom components as student profile tab */}
        <View style={styles.menuWrapper}>
          {MENU_SECTIONS.map(section => (
            <ProfileMenuSection key={section.title} title={section.title}>
              {section.items.map((item, index) => (
                <MenuItemCard
                  key={item.screen}
                  embedded
                  isLast={index === section.items.length - 1}
                  title={item.title}
                  description={item.description}
                  icon={item.icon}
                  iconColor={item.iconColor}
                  onPress={() => navigateHomeStack(item.screen)}
                />
              ))}
            </ProfileMenuSection>
          ))}
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          activeOpacity={0.75}
          disabled={loggingOut}
          onPress={() => void handleLogout()}
        >
          <MaterialCommunityIcons name="logout" size={20} color="#DC2626" />
          <Text style={styles.logoutText}>
            {loggingOut ? 'Logging out…' : 'Logout'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.version}>TutorLink v1.1.0 · Tutor</Text>
      </ScrollView>
    </GlassScreen>
  );
};

export default TutorProfileScreen;

const createStyles = (resp: any) =>
  StyleSheet.create({
    container: { flex: 1 },
    scrollContent: {
      paddingTop: resp.dy(18),
      paddingBottom: resp.dy(28),
    },
    pageHeader: {
      paddingHorizontal: resp.dx(20),
      marginBottom: resp.dy(14),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    pageEyebrow: {
      color: GLASS.textMuted,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    pageTitle: {
      marginTop: 2,
      color: GLASS.textPrimary,
      fontSize: 26,
      fontWeight: '800',
    },
    headerEdit: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor: GLASS.primarySoft,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroShell: {
      marginHorizontal: resp.dx(16),
      marginBottom: resp.dy(8),
    },
    hero: {
      borderRadius: GLASS.radius.xxl,
      padding: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.28)',
      ...GLASS.shadow.medium,
    },
    heroBlobA: {
      position: 'absolute',
      width: 140,
      height: 140,
      borderRadius: 70,
      right: -36,
      top: -48,
      backgroundColor: 'rgba(255,255,255,0.14)',
    },
    heroBlobB: {
      position: 'absolute',
      width: 90,
      height: 90,
      borderRadius: 45,
      left: -28,
      bottom: 36,
      backgroundColor: 'rgba(253, 230, 138, 0.12)',
    },
    heroSplit: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    avatarStack: {
      position: 'relative',
    },
    avatarGlow: {
      position: 'absolute',
      top: -6,
      left: -6,
      right: -6,
      bottom: -6,
      borderRadius: 28,
      backgroundColor: 'rgba(255,255,255,0.22)',
    },
    avatar: {
      width: 84,
      height: 84,
      borderRadius: 24,
      borderWidth: 2.5,
      borderColor: 'rgba(255,255,255,0.9)',
    },
    verifyBadge: {
      position: 'absolute',
      right: -4,
      bottom: -4,
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: GLASS.success,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: '#fff',
    },
    heroCopy: {
      flex: 1,
      minWidth: 0,
    },
    livePill: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(255,255,255,0.16)',
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
      marginBottom: 8,
    },
    liveDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: '#4ADE80',
    },
    liveText: {
      color: 'rgba(255,255,255,0.92)',
      fontSize: 11,
      fontWeight: '700',
    },
    name: {
      color: '#fff',
      fontSize: 22,
      fontWeight: '800',
      lineHeight: 26,
    },
    roleLine: {
      marginTop: 4,
      color: '#FDE68A',
      fontSize: 12,
      fontWeight: '700',
    },
    bio: {
      marginTop: 8,
      color: 'rgba(255,255,255,0.86)',
      fontSize: 12,
      lineHeight: 17,
    },
    heroGlassBar: {
      marginTop: 16,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.16)',
      borderRadius: GLASS.radius.lg,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.28)',
      paddingVertical: 10,
      paddingHorizontal: 6,
    },
    glassCell: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: 4,
    },
    glassLabel: {
      color: 'rgba(255,255,255,0.7)',
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    glassValue: {
      marginTop: 3,
      color: '#fff',
      fontSize: 12,
      fontWeight: '800',
    },
    glassSep: {
      width: 1,
      height: 28,
      backgroundColor: 'rgba(255,255,255,0.22)',
    },
    snapshotCard: {
      marginTop: 12,
      marginHorizontal: resp.dx(16),
      backgroundColor: GLASS.cardBgStrong,
      borderRadius: GLASS.radius.xl,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      ...GLASS.shadow.soft,
    },
    snapshotItem: {
      flex: 1,
      alignItems: 'center',
    },
    snapshotValue: {
      fontSize: 18,
      fontWeight: '800',
      color: GLASS.textPrimary,
    },
    snapshotLabel: {
      marginTop: 2,
      fontSize: 11,
      color: GLASS.textSecondary,
      fontWeight: '600',
    },
    snapshotDivider: {
      width: 1,
      height: 28,
      backgroundColor: GLASS.cardBorder,
    },
    focusCard: {
      marginTop: 14,
      marginHorizontal: resp.dx(16),
      backgroundColor: 'rgba(117, 72, 245, 0.05)',
      borderRadius: GLASS.radius.xl,
      borderWidth: 1,
      borderColor: 'rgba(117, 72, 245, 0.14)',
      padding: 14,
    },
    focusTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: GLASS.textPrimary,
    },
    focusSub: {
      marginTop: 4,
      color: GLASS.textSecondary,
      fontSize: 12,
      lineHeight: 17,
    },
    focusTags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 10,
    },
    focusTag: {
      backgroundColor: GLASS.primarySoft,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
    },
    focusTagText: {
      color: GLASS.primaryDeep,
      fontWeight: '700',
      fontSize: 11,
    },
    menuWrapper: {
      paddingHorizontal: resp.dx(16),
      marginTop: resp.dy(18),
    },
    logoutBtn: {
      marginTop: resp.dy(4),
      marginBottom: resp.dy(8),
      marginHorizontal: resp.dx(16),
      minHeight: 52,
      borderRadius: GLASS.radius.lg,
      borderWidth: 1,
      borderColor: 'rgba(220, 38, 38, 0.28)',
      backgroundColor: 'rgba(254, 226, 226, 0.55)',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    logoutText: {
      color: '#DC2626',
      fontSize: resp.df(16),
      fontWeight: '700',
    },
    version: {
      textAlign: 'center',
      color: GLASS.textMuted,
      fontSize: resp.df(12),
      marginBottom: resp.dy(28),
    },
  });
