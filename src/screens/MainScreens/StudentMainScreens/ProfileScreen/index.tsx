import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import useUi from '../../../../hooks/ui/useUi';
import { GlassScreen } from '../../../../components/Glass';
import { GLASS } from '../../../../theme/glass';
import {
  MenuItemCard,
  ParentLinkCard,
  ProfileMenuSection,
  StudentProfileHero,
} from '../../../../components/Profile';
import { logout } from '../../../../store/auth/authSlice';
import { logoutUser } from '../../../../services/auth/authService';
import { useProfile } from '../../../../hooks/api/useProfile';
import { getDisplayName } from '../../../../utils/api/bookingHelpers';
import { navigateHomeStack } from '../../../../navigation/navigationRef';
import ConfirmLogoutModal from '../../../../components/ConfirmLogoutModal';
import { openParentDashboard } from '../../../../config/parentDashboard';

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
    title: 'Account',
    items: [
      {
        title: 'Edit Profile',
        description: 'Name, grade & photo',
        icon: 'account-edit-outline',
        iconColor: '#7548F5',
        screen: 'StudentEditProfileScreen',
      },
      {
        title: 'Wallet',
        description: 'Balance, deposits & escrow',
        icon: 'wallet-outline',
        iconColor: '#2456E8',
        screen: 'WalletScreen',
      },
    ],
  },
  {
    title: 'Learning',
    items: [
      {
        title: 'My Interests',
        description: 'Subjects and topics',
        icon: 'heart-outline',
        iconColor: '#EC4899',
        screen: 'StudentInterestsScreen',
      },
      {
        title: 'Certificates',
        description: 'Your achievements',
        icon: 'certificate-outline',
        iconColor: '#0EA5E9',
        screen: 'StudentCertificatesScreen',
      },
      {
        title: 'Session History',
        description: 'Past lessons',
        icon: 'history',
        iconColor: '#3B82F6',
        screen: 'StudentSessionHistoryScreen',
      },
      {
        title: 'Learning Summaries',
        description: 'AI notes reviewed by tutors',
        icon: 'notebook-outline',
        iconColor: '#F59E0B',
        screen: 'StudentSummariesScreen',
      },
    ],
  },
  {
    title: 'Alerts',
    items: [
      {
        title: 'Notification Center',
        description: 'Inbox & push test',
        icon: 'bell-ring-outline',
        iconColor: '#F59E0B',
        screen: 'StudentNotificationInboxScreen',
      },
      {
        title: 'Notification Settings',
        description: 'Choose what you get',
        icon: 'bell-outline',
        iconColor: '#FB923C',
        screen: 'StudentNotificationsScreen',
      },
    ],
  },
  {
    title: 'Preferences',
    items: [
      {
        title: 'Privacy & Security',
        description: 'Account protection',
        icon: 'shield-lock-outline',
        iconColor: '#10B981',
        screen: 'StudentPrivacySecurityScreen',
      },
      {
        title: 'App Settings',
        description: 'Preferences',
        icon: 'cog-outline',
        iconColor: '#8B5CF6',
        screen: 'StudentAppSettingsScreen',
      },
    ],
  },
  {
    title: 'Support',
    items: [
      {
        title: 'Help & Support',
        description: 'Get assistance',
        icon: 'help-circle-outline',
        iconColor: '#EF4444',
        screen: 'StudentHelpSupportScreen',
      },
      {
        title: 'Terms & Policies',
        description: 'Legal information',
        icon: 'file-document-outline',
        iconColor: '#06B6D4',
        screen: 'StudentTermsPoliciesScreen',
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

export default function ProfileScreen() {
  const { colors, resp } = useUi();
  const styles = createStyles(resp);
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const authUser = useSelector((state: any) => state.auth.user);
  const role = useSelector((state: any) => state.auth.role);
  const isParent = role === 'parent';
  const { profile, loading, refresh } = useProfile();

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  const [confirmVisible, setConfirmVisible] = React.useState(false);
  const [loggingOut, setLoggingOut] = React.useState(false);

  const performLogout = async () => {
    setLoggingOut(true);
    setConfirmVisible(false);
    try {
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

  const navigateTo = (screen: string) => {
    navigateHomeStack(screen);
  };

  if (loading && !profile) {
    return (
      <GlassScreen
        scroll={false}
        edges={['bottom']}
        contentStyle={[styles.container, styles.centered]}
      >
        <ActivityIndicator size="large" color={colors.PRIMARY_COLOR} />
      </GlassScreen>
    );
  }

  const authDisplayName = getDisplayName(authUser);
  const displayName =
    profile?.name ||
    (authUser?.name || authUser?.fullName
      ? authDisplayName
      : authDisplayName);
  const displayGrade =
    profile?.displayGrade || profile?.grade || authUser?.grade || 'Not set';
  const displayId =
    profile?.displayStudentId ||
    profile?.publicId ||
    authUser?.id ||
    authUser?._id ||
    '—';
  const displayAvatar = profile?.avatarUrl || authUser?.avatarUrl || null;

  return (
    <GlassScreen
      scroll={false}
      edges={['bottom']}
      contentStyle={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <StudentProfileHero
          name={displayName}
          grade={displayGrade}
          publicId={String(displayId)}
          avatarUri={displayAvatar}
        />

        {isParent ? (
          <TouchableOpacity
            style={styles.parentLinkCta}
            activeOpacity={0.88}
            onPress={() => {
              void openParentDashboard();
            }}
          >
            <MaterialCommunityIcons
              name="link-variant"
              size={22}
              color={GLASS.primary}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.parentLinkTitle}>Link student account</Text>
              <Text style={styles.parentLinkSub}>
                Opens the Parent web dashboard (auth is on the web)
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={GLASS.textMuted}
            />
          </TouchableOpacity>
        ) : (
          <ParentLinkCard
            studentName={displayName}
            onOpenDetails={() => navigateTo('StudentLinkParentScreen')}
          />
        )}

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
                  onPress={() => navigateTo(item.screen)}
                />
              ))}
            </ProfileMenuSection>
          ))}
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          activeOpacity={0.75}
          onPress={() => setConfirmVisible(true)}
        >
          <MaterialCommunityIcons name="logout" size={20} color="#DC2626" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        <ConfirmLogoutModal
          visible={confirmVisible}
          onCancel={() => setConfirmVisible(false)}
          onConfirm={() => void performLogout()}
          confirming={loggingOut}
        />
        <Text style={styles.version}>TutorLink v1.1.0 · 2026</Text>
      </ScrollView>
    </GlassScreen>
  );
}

const createStyles = (resp: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    centered: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollContent: {
      paddingBottom: resp.dy(24),
    },
    menuWrapper: {
      paddingHorizontal: resp.dx(16),
      marginTop: resp.dy(18),
    },
    parentLinkCta: {
      marginHorizontal: resp.dx(16),
      marginTop: resp.dy(-20),
      paddingVertical: 14,
      paddingHorizontal: 14,
      borderRadius: GLASS.radius.xl,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      backgroundColor: 'rgba(237,233,254,0.55)',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    parentLinkTitle: {
      color: GLASS.textPrimary,
      fontWeight: '800',
      fontSize: 15,
    },
    parentLinkSub: {
      color: GLASS.textSecondary,
      fontSize: 12,
      marginTop: 2,
      fontWeight: '600',
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
