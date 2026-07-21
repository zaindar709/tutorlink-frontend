import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import useUi from '../../../../hooks/ui/useUi';
import {
  MenuItemCard,
  ParentLinkCard,
  StudentProfileHero,
} from '../../../../components/Profile';
import CustomButton from '../../../../components/CustomButton';
import { logout } from '../../../../store/auth/authSlice';
import { logoutUser } from '../../../../services/auth/authService';
import { useStudentProfileLocal } from '../../../../hooks/ui/useStudentProfileLocal';
import { useProfileImagePicker } from '../../../../hooks/ui/useProfileImagePicker';

type MenuItem = {
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  screen: string;
};

const MENU_ITEMS: MenuItem[] = [
  {
    title: 'Edit Profile',
    description: 'Update your personal info',
    icon: 'account-edit-outline',
    iconColor: '#7548F5',
    screen: 'StudentEditProfileScreen',
  },
  {
    title: 'My Interests',
    description: 'Subjects and topics',
    icon: 'heart-outline',
    iconColor: '#f457b8',
    screen: 'StudentInterestsScreen',
  },
  {
    title: 'Certificates',
    description: 'Your achievements',
    icon: 'certificate-outline',
    iconColor: '#3bbef6',
    screen: 'StudentCertificatesScreen',
  },
  {
    title: 'Link Parent Account',
    description: 'Share progress with parents',
    icon: 'link-variant',
    iconColor: '#10B981',
    screen: 'StudentLinkParentScreen',
  },
  {
    title: 'Session History',
    description: 'Your past sessions',
    icon: 'history',
    iconColor: '#3B82F6',
    screen: 'StudentSessionHistoryScreen',
  },
  {
    title: 'Notifications',
    description: 'Manage your alerts',
    icon: 'bell-outline',
    iconColor: '#F59E0B',
    screen: 'StudentNotificationsScreen',
  },
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
];

export default function ProfileScreen() {
  const { colors, resp } = useUi();
  const styles = createStyles({ colors, resp });
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const { profile, loading, refresh, setAvatarUri } = useStudentProfileLocal();

  useFocusEffect(
    React.useCallback(() => {
      void refresh();
    }, [refresh])
  );

  const { openPicker } = useProfileImagePicker(uri => {
    void setAvatarUri(uri);
  });

  const navigateTo = (screen: string) => {
    navigation.navigate('HomeNavigator', { screen });
  };

  if (loading && !profile) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.PRIMARY_COLOR} />
      </View>
    );
  }

  const displayName = profile?.name || 'Student';
  const displayGrade = profile?.grade || 'Not set';
  const displayId = profile?.publicId || '—';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StudentProfileHero
        name={displayName}
        grade={displayGrade}
        publicId={displayId}
        avatarUri={profile?.avatarUri}
        onAvatarPress={openPicker}
      />

      <ParentLinkCard onGenerateCode={() => navigateTo('StudentLinkParentScreen')} />

      <View style={styles.menuWrapper}>
        {MENU_ITEMS.map(item => (
          <MenuItemCard
            key={item.screen}
            title={item.title}
            description={item.description}
            icon={item.icon}
            iconColor={item.iconColor}
            onPress={() => navigateTo(item.screen)}
          />
        ))}
      </View>

      <View style={styles.logoutWrap}>
        <CustomButton
          title="Logout"
          icon="logout"
          backgroundColor="#faeeee"
          textColor="#f99595"
          borderColor="#f4adad"
          borderWidth={0.5}
          iconPosition="left"
          onPress={async () => {
            await logoutUser();
            dispatch(logout());
            navigation.reset({
              index: 0,
              routes: [{ name: 'AuthNavigator' }],
            });
          }}
        />
      </View>
      <Text style={styles.version}>TUTORLINK V1.1.0 @ 2026</Text>
    </ScrollView>
  );
}

const createStyles = ({ colors, resp }: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.WHITE_COLOR,
    },
    centered: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    menuWrapper: {
      paddingHorizontal: resp.dx(16),
      marginTop: resp.dy(10),
    },
    logoutWrap: {
      marginBottom: resp.dy(10),
      marginTop: resp.dy(10),
      paddingHorizontal: resp.dx(16),
    },
    version: {
      textAlign: 'center',
      color: '#94A3B8',
      fontSize: resp.df(12),
      marginBottom: resp.dy(30),
    },
  });
