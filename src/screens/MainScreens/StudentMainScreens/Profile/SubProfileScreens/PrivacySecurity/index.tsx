import React, { useMemo } from 'react';
import {
  ScrollView,
  Text,
  View,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { GlassScreen } from '../../../../../../components/Glass';
import {
  ProfileSubHeader,
  ProfileSectionCard,
  ProfileSettingRow,
  createProfileSubScreenStyles,
} from '../../../../../../components/Profile';
import useUi from '../../../../../../hooks/ui/useUi';
import { useStudentPrivacySettings } from '../../../../../../hooks/api/useStudentSettings';

export default function StudentPrivacySecurityScreen({ navigation }: any) {
  const { colors } = useUi();
  const styles = useMemo(() => createProfileSubScreenStyles(colors), [colors]);
  const { settings, loading, error, update } = useStudentPrivacySettings();

  const patch = async (payload: Parameters<typeof update>[0]) => {
    const ok = await update(payload);
    if (!ok) {
      Alert.alert('Update failed', error || 'Could not save privacy settings.');
    }
  };

  if (loading) {
    return (
      <GlassScreen
        scroll={false}
        contentStyle={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color={colors.PRIMARY_COLOR} />
      </GlassScreen>
    );
  }

  return (
    <GlassScreen scroll={false} contentStyle={{ flex: 1 }}>
      <ProfileSubHeader navigation={navigation} title="Privacy & Security" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.LIGHT_PRIMARY,
              alignSelf: 'flex-start',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              marginBottom: 10,
            }}
          >
            <MaterialCommunityIcons
              name="shield-check"
              size={16}
              color={colors.PRIMARY_COLOR}
            />
            <Text
              style={{
                marginLeft: 6,
                color: colors.PRIMARY_COLOR,
                fontWeight: '700',
                fontSize: 12,
              }}
            >
              Account protected
            </Text>
          </View>
          <Text style={styles.heroTitle}>Keep your account secure</Text>
          <Text style={styles.heroSubtitle}>
            Manage security preferences and control who can see your profile
            information.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Security</Text>
        <ProfileSectionCard>
          <ProfileSettingRow
            icon="two-factor-authentication"
            title="Two-factor authentication"
            description="Extra verification when signing in"
            value={settings.twoFactorEnabled}
            onValueChange={value => void patch({ twoFactorEnabled: value })}
          />
          <ProfileSettingRow
            icon="bell-alert-outline"
            title="Login alerts"
            description="Notify on new device sign-in"
            value={settings.loginAlerts}
            onValueChange={value => void patch({ loginAlerts: value })}
          />
          <ProfileSettingRow
            icon="lock-reset"
            title="Change password"
            description="Update your account password"
            showChevron
            onPress={() =>
              Alert.alert(
                'Coming soon',
                'Password change will connect to Firebase auth.'
              )
            }
          />
        </ProfileSectionCard>

        <Text style={styles.sectionLabel}>Privacy</Text>
        <ProfileSectionCard>
          <ProfileSettingRow
            icon="eye-outline"
            title="Profile visibility"
            description="Allow tutors to see your grade & interests"
            value={settings.profileVisibleToTutors}
            onValueChange={value =>
              void patch({ profileVisibleToTutors: value })
            }
          />
        </ProfileSectionCard>
      </ScrollView>
    </GlassScreen>
  );
}
