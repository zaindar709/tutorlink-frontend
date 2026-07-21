import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import CustomButton from '../../../../components/CustomButton';
import { logout } from '../../../../store/auth/authSlice';
import { logoutUser } from '../../../../services/auth/authService';

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
      style={styles.settingCard}
      onPress={() =>
        navigation.navigate('HomeNavigator', {
          screen: item.screen,
        })
      }
    >
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: item.color }]}>
          <Ionicons name={item.icon} size={20} color="#fff" />
        </View>

        <View>
          <Text style={styles.settingTitle}>{item.title}</Text>
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#64748B" />
    </TouchableOpacity>
  );
};
const SubjectCard = ({ item }: any) => {
  return (
    <View style={styles.subjectCard}>
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
    </View>
  );
};
const TutorProfileScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const [loggingOut, setLoggingOut] = useState(false);

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
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.headerText}>
          <Text style={{ color: '#000000', fontSize: 24, fontWeight: 600 }}>
            Profile
          </Text>
          <Text style={{ color: '#4a4a4a' }}>Your Professional Identity</Text>
        </View>
        {/* PROFILE CARD */}
        <LinearGradient
          colors={['#6a82fc', '#8f73fd']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          <View style={styles.topRow}>
            <View style={styles.imageWrapper}>
              <Image
                source={{
                  uri: 'https://i.pravatar.cc/300',
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
              <Text style={styles.name}>Prof. Ali Ahmed</Text>

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
            <TouchableOpacity style={styles.editBtn}>
              <Ionicons name="create-outline" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* DESCRIPTION */}
          <Text style={styles.description}>
            Experienced educator specializing in Mathematics and Physics for O &
            A Level students.
          </Text>

          {/* CONTACT */}
          <Text style={styles.contact}>ali.ahmed@tutorlink.com</Text>
          <Text style={styles.contact}>+92 300 1234567</Text>
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
          <FlatList
            data={verificationData}
            scrollEnabled={false}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <VerificationItem item={item} />}
            ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
          />
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
    </SafeAreaView>
  );
};

export default TutorProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  headerText: {
    marginBottom: 18,
    paddingHorizontal: 5,
  },

  /* PROFILE CARD */

  profileCard: {
    borderRadius: 24,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
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
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  iconCircle: {
    marginBottom: 10,
  },

  statValue: {
    color: '#111827',
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
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },

  /* SUBJECT CARD */

  subjectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  subjectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subjectIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f6f5fd',
    borderWidth: 1,
    borderColor: '#d5cbff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  subjectName: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },

  subjectLevel: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 4,
  },

  classBadge: {
    backgroundColor: '#f6f5fd',
    borderWidth: 1,
    borderColor: '#d5cbff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },

  classBadgeText: {
    color: '#8f73fd',
    fontSize: 12,
    fontWeight: '700',
  },
  verificationContainer: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },

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
    color: '#000',
    fontSize: 15,
    fontWeight: '600',
  },

  settingCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
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
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  },

  settingSubtitle: {
    color: '#8b8b8b',
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
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
  },
});
