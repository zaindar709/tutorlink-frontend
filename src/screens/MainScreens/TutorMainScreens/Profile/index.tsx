import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { GlassScreen, GlassCard } from '../../../../components/Glass';
import { GLASS } from '../../../../theme/glass';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import CustomButton from '../../../../components/CustomButton';
import { logout } from '../../../../store/auth/authSlice';
import { logoutUser } from '../../../../services/auth/authService';
import { ApiUser } from '../../../../types/api.types';
import { loadTutorEditableProfile } from '../../../../services/profile/tutorProfileLocalStore';

const subjects = [
  {
    id: '1',
    title: 'Mathematics',
    level: 'O & A Levels',
    icon: 'math-compass',
    maxClasses: 'Max 2 Classes',
  },
  {
    id: '2',
    title: 'Physics',
    level: 'Intermediate',
    icon: 'atom',
    maxClasses: 'Max 3 Classes',
  },
  {
    id: '3',
    title: 'Chemistry',
    level: 'A Levels',
    icon: 'flask-outline',
    maxClasses: 'Max 1 Class',
  },
];
const verificationData = [
  {
    id: '1',
    title: 'CNIC Verified',
    icon: 'file-document-outline',
  },
  {
    id: '2',
    title: 'Degree Verified',
    icon: 'school-outline',
  },
  {
    id: '3',
    title: 'Background Check',
    icon: 'shield-outline',
  },
];
const settingsData = [
  {
    id: '1',
    title: 'Edit Profile',
    subtitle: 'Update your information',
    icon: 'pencil-outline',
    color: '#0EA5E9',
    screen: 'EditProfileScreen',
  },
  {
    id: '2',
    title: 'My Earnings',
    subtitle: 'Balance, withdraw & history',
    icon: 'wallet-outline',
    color: '#7548F5',
    screen: 'TutorEarningsScreen',
  },
  {
    id: '3',
    title: 'Schedule Availability',
    subtitle: 'Manage your teaching hours',
    icon: 'calendar-outline',
    color: '#D946EF',
    screen: 'ScheduleAvailabilityScreen',
  },
  {
    id: '4',
    title: 'Payment Methods',
    subtitle: 'JazzCash, Easypaisa settings',
    icon: 'card-outline',
    color: '#22C55E',
    screen: 'PaymentMethodScreen',
  },
  {
    id: '5',
    title: 'Security & Privacy',
    subtitle: 'Password, 2FA settings',
    icon: 'lock-closed-outline',
    color: '#F97316',
    screen: 'SecurityPrivacyScreen',
  },
  {
    id: '6',
    title: 'Developer Options',
    subtitle: 'QA login, switch accounts & jumps',
    icon: 'code-slash-outline',
    color: '#64748B',
    screen: 'DeveloperOptionsScreen',
  },
];
const VerificationItem = ({ item }: any) => {
  return (
    <View style={styles.verificationItem}>
      <View style={styles.verificationLeft}>
        <View style={styles.verificationIcon}>
          <Ionicons name={item.icon} size={20} color="#22C55E" />
        </View>

        <Text style={styles.verificationTitle}>{item.title}</Text>
      </View>

      <Ionicons name="checkmark-circle" size={22} color="#04a356" />
    </View>
  );
};
const SettingItem = ({ item }: any) => {
  const navigation = useNavigation<any>();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() =>
        navigation.navigate('HomeNavigator', {
          screen: item.screen,
        })
      }
    >
      <GlassCard style={styles.settingCard}>
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: item.color }]}>
          <Ionicons name={item.icon} size={20} color="#fff" />
        </View>

        <View>
          <Text style={styles.settingTitle}>{item.title}</Text>
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={20} color={GLASS.textSecondary} />
      </GlassCard>
    </TouchableOpacity>
  );
};
const SubjectCard = ({ item }: any) => {
  return (
    <GlassCard style={styles.subjectCard}>
      <View style={styles.subjectLeft}>
        <View style={styles.subjectIcon}>
          <MaterialCommunityIcons name={item.icon} size={24} color="#8f73fd" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.subjectName}>{item.title}</Text>
          <Text style={styles.subjectLevel}>{item.level}</Text>
        </View>
      </View>

      <View style={styles.classBadge}>
        <Text style={styles.classBadgeText}>{item.maxClasses}</Text>
      </View>
    </GlassCard>
  );
};
const TutorProfileScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.auth.user as ApiUser | null);
  const displayName = String(user?.name || user?.fullName || '').trim() || 'Tutor';
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

  const avatarUri = user?.avatarUrl || 'https://i.pravatar.cc/300';
  const contactEmail = localProfile.email || user?.email || '';
  const contactPhone =
    localProfile.phone ||
    String(user?.phoneNumber || user?.phone || '');
  const bioText =
    localProfile.bio ||
    'Add a short bio from Edit Profile so students know your teaching style.';

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
    <GlassScreen scroll={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.headerText}>
          <Text style={styles.screenTitle}>Profile</Text>
          <Text style={styles.screenSubtitle}>Your Professional Identity</Text>
        </View>

        {/* PROFILE CARD */}
        <LinearGradient
          colors={[...GLASS.buttonGradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          <View style={styles.topRow}>
            <View style={styles.imageWrapper}>
              <Image
                source={{
                  uri: avatarUri,
                }}
                style={styles.profileImage}
              />
              <View style={styles.verifyBadge}>
                <Ionicons name="checkmark" size={16} color="#ececec" />
              </View>

              <View style={styles.premiumBadge}>
                <Ionicons name="ribbon" size={12} color="#fff" />
              </View>
            </View>

            {/* INFO */}
            <View style={styles.infoContainer}>
              <Text style={styles.name} numberOfLines={2}>
                {displayName}
              </Text>

              <View style={styles.row}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={14}
                  color="#bcb1e6"
                />

                <Text style={styles.verifyText}>Verified Expert</Text>
              </View>

              <View style={styles.row}>
                <Ionicons name="medal-outline" size={14} color="#FCD34D" />

                <Text style={styles.badgeText}>Badge of Authenticity</Text>
              </View>
            </View>

            {/* EDIT BUTTON */}
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() =>
                navigation.navigate('HomeNavigator', {
                  screen: 'EditProfileScreen',
                })
              }
            >
              <Ionicons name="create-outline" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* DESCRIPTION */}
          <Text style={styles.description}>{bioText}</Text>

          {(localProfile.education || localProfile.hourlyRate) && (
            <View style={styles.metaChips}>
              {localProfile.education ? (
                <View style={styles.metaChip}>
                  <Ionicons name="school-outline" size={13} color="#EDE9FE" />
                  <Text style={styles.metaChipText}>
                    {localProfile.education}
                  </Text>
                </View>
              ) : null}
              {localProfile.hourlyRate ? (
                <View style={styles.metaChip}>
                  <Ionicons name="cash-outline" size={13} color="#EDE9FE" />
                  <Text style={styles.metaChipText}>
                    Rs. {Number(localProfile.hourlyRate).toLocaleString()}/hr
                  </Text>
                </View>
              ) : null}
            </View>
          )}

          {/* CONTACT */}
          {contactEmail ? (
            <Text style={styles.contact}>{contactEmail}</Text>
          ) : null}
          {contactPhone ? (
            <Text style={styles.contact}>{contactPhone}</Text>
          ) : null}
        </LinearGradient>

        {/* STATS */}
        <View style={styles.statsRow}>
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: '#EFF6FF',
                borderColor: '#BFDBFE',
              },
            ]}
          >
            <View
              style={[styles.iconCircle, { backgroundColor: 'transparent' }]}
            >
              <Ionicons name="time-outline" size={24} color="#0891B2" />
            </View>

            <Text style={[styles.statValue, { color: '#111827' }]}>342</Text>

            <Text style={[styles.statLabel, { color: '#0E7490' }]}>
              Total Hours
            </Text>
          </View>

          <View
            style={[
              styles.statCard,
              {
                backgroundColor: '#FAF5FF',
                borderColor: '#E9D5FF',
              },
            ]}
          >
            <View
              style={[styles.iconCircle, { backgroundColor: 'transparent' }]}
            >
              <Ionicons name="star" size={24} color="#EAB308" />
            </View>

            <Text style={[styles.statValue, { color: '#111827' }]}>4.9</Text>

            <Text style={[styles.statLabel, { color: '#7E22CE' }]}>Rating</Text>
          </View>

          <View
            style={[
              styles.statCard,
              {
                backgroundColor: '#ECFDF5',
                borderColor: '#BBF7D0',
              },
            ]}
          >
            <View
              style={[styles.iconCircle, { backgroundColor: 'transparent' }]}
            >
              <Ionicons name="people-outline" size={24} color="#16A34A" />
            </View>

            <Text style={[styles.statValue, { color: '#111827' }]}>48</Text>

            <Text style={[styles.statLabel, { color: '#15803D' }]}>
              Students
            </Text>
          </View>
        </View>

        {/* SUBJECTS */}
        <View style={styles.sectionHeader}>
          <Ionicons name="book-outline" size={18} color="#8f73fd" />

          <Text style={styles.sectionTitle}>Teaching Subjects</Text>
        </View>

        {/* SUBJECT CARD */}
        <FlatList
          data={subjects}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.subjectList}
          ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
          renderItem={({ item }) => <SubjectCard item={item} />}
        />
        {/* VERIFICATION STATUS */}

        <View style={styles.sectionHeader}>
          <Ionicons name="shield-checkmark-outline" size={18} color="#22C55E" />

          <Text style={styles.sectionTitle}>Verification Status</Text>
        </View>

        <View style={styles.verificationContainer}>
          <GlassCard strong>
          <FlatList
            data={verificationData}
            scrollEnabled={false}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <VerificationItem item={item} />}
            ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
          />
          </GlassCard>
        </View>

        {/* SETTINGS */}

        <View style={styles.sectionHeader}>
          <Ionicons name="settings-outline" size={18} color="#919191" />
          <Text style={styles.sectionTitle}>Settings</Text>
        </View>

        <FlatList
          data={settingsData}
          scrollEnabled={false}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <SettingItem item={item} />}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />

        <View style={styles.logoutSection}>
          <CustomButton
            title="Logout"
            icon="logout"
            backgroundColor="#FEF2F2"
            textColor="#EF4444"
            borderColor="#FECACA"
            borderWidth={1}
            iconPosition="left"
            loading={loggingOut}
            onPress={handleLogout}
            style={styles.logoutButton}
            textStyle={styles.logoutText}
          />
          <Text style={styles.versionText}>TUTORLINK V1.1.0</Text>
        </View>
      </ScrollView>
    </GlassScreen>
  );
};

export default TutorProfileScreen;

const styles = StyleSheet.create({
  content: {
    padding: GLASS.space.lg,
    paddingBottom: 40,
  },
  headerText: {
    marginBottom: 18,
    paddingHorizontal: 5,
  },
  screenTitle: {
    color: GLASS.textPrimary,
    fontSize: 24,
    fontWeight: '600',
  },
  screenSubtitle: {
    color: GLASS.textSecondary,
  },

  profileCard: {
    borderRadius: GLASS.radius.xxl,
    padding: 18,
    ...GLASS.shadow.medium,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  imageWrapper: {
    position: 'relative',
  },

  profileImage: {
    width: 72,
    height: 72,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#fff',
  },

  verifyBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0EA5E9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },

  premiumBadge: {
    position: 'absolute',
    top: -6,
    left: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
  },

  infoContainer: {
    flex: 1,
    marginLeft: 14,
  },

  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 30,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },

  verifyText: {
    marginLeft: 6,
    color: '#E0E7FF',
    fontSize: 13,
    fontWeight: '600',
  },

  badgeText: {
    marginLeft: 6,
    color: '#FDE68A',
    fontSize: 13,
    fontWeight: '600',
  },

  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subjectList: {
    paddingBottom: 20,
  },
  description: {
    marginTop: 22,
    color: '#F8FAFC',
    fontSize: 14,
    lineHeight: 24,
    fontWeight: '500',
  },

  metaChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  metaChipText: {
    color: '#F5F3FF',
    fontSize: 12,
    fontWeight: '600',
    maxWidth: 180,
  },

  contact: {
    marginTop: 12,
    color: '#E9D5FF',
    fontSize: 14,
    fontWeight: '500',
  },

  /* STATS */

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },

  statCard: {
    width: '31%',
    height: 130,
    borderRadius: GLASS.radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: GLASS.cardBg,
    borderColor: GLASS.cardBorder,
    ...GLASS.shadow.soft,
  },

  iconCircle: {
    marginBottom: 10,
  },

  statValue: {
    color: GLASS.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },

  statLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  },

  /* SECTION */

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 14,
  },

  sectionTitle: {
    color: GLASS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },

  subjectCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  subjectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subjectIcon: {
    width: 48,
    height: 48,
    borderRadius: GLASS.radius.sm,
    backgroundColor: GLASS.primarySoft,
    borderWidth: 1,
    borderColor: GLASS.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  subjectName: {
    color: GLASS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },

  subjectLevel: {
    color: GLASS.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },

  classBadge: {
    backgroundColor: GLASS.primarySoft,
    borderWidth: 1,
    borderColor: GLASS.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: GLASS.radius.sm,
  },

  classBadgeText: {
    color: GLASS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  verificationContainer: {},

  verificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  verificationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  verificationIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(34,197,94,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  verificationTitle: {
    color: GLASS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },

  settingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  settingTitle: {
    color: GLASS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },

  settingSubtitle: {
    color: GLASS.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },

  logoutSection: {
    marginTop: 28,
    alignItems: 'center',
    paddingBottom: 8,
  },

  logoutButton: {
    width: '100%',
    elevation: 0,
    shadowOpacity: 0,
  },

  logoutText: {
    fontSize: 16,
    fontWeight: '700',
  },

  versionText: {
    marginTop: 16,
    color: GLASS.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
});
