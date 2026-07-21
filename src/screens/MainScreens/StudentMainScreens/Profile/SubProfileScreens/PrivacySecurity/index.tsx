import React, { useMemo, useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity, Alert } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '../../../../../../components/CustomButton';
import {
  ProfileSubHeader,
  ProfileSectionCard,
  ProfileSettingRow,
  createProfileSubScreenStyles,
} from '../../../../../../components/Profile';
import useUi from '../../../../../../hooks/ui/useUi';

export default function StudentPrivacySecurityScreen({ navigation }: any) {
  const { colors } = useUi();
  const styles = useMemo(() => createProfileSubScreenStyles(colors), [colors]);
  const [twoFactor, setTwoFactor] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [profileVisible, setProfileVisible] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
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
            <MaterialCommunityIcons name="shield-check" size={16} color={colors.PRIMARY_COLOR} />
            <Text style={{ marginLeft: 6, color: colors.PRIMARY_COLOR, fontWeight: '700', fontSize: 12 }}>
              Account protected
            </Text>
          </View>
          <Text style={styles.heroTitle}>Keep your account secure</Text>
          <Text style={styles.heroSubtitle}>
            Manage security preferences and control who can see your profile information.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Security</Text>
        <ProfileSectionCard>
          <ProfileSettingRow
            icon="two-factor-authentication"
            title="Two-factor authentication"
            description="Extra verification when signing in"
            value={twoFactor}
            onValueChange={setTwoFactor}
          />
          <ProfileSettingRow
            icon="bell-alert-outline"
            title="Login alerts"
            description="Notify on new device sign-in"
            value={loginAlerts}
            onValueChange={setLoginAlerts}
          />
          <ProfileSettingRow
            icon="lock-reset"
            title="Change password"
            description="Update your account password"
            showChevron
            onPress={() => Alert.alert('Coming soon', 'Password change will connect to Firebase auth.')}
          />
        </ProfileSectionCard>

        <Text style={styles.sectionLabel}>Privacy</Text>
        <ProfileSectionCard>
          <ProfileSettingRow
            icon="eye-outline"
            title="Profile visibility"
            description="Allow tutors to see your grade & interests"
            value={profileVisible}
            onValueChange={setProfileVisible}
          />
          <ProfileSettingRow
            icon="download-outline"
            title="Download my data"
            description="Request a copy of your account data"
            showChevron
            onPress={() => Alert.alert('Request submitted', 'Mock — data export will be emailed when API is ready.')}
          />
        </ProfileSectionCard>

        <CustomButton
          title="Sign out all devices"
          icon="logout"
          backgroundColor="#FEF2F2"
          textColor="#DC2626"
          borderColor="#FECACA"
          borderWidth={1}
          onPress={() => Alert.alert('Mock action', 'Remote sign-out will be available with backend.')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
