import React, { useMemo } from 'react';
import {
  ScrollView,
  Text,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ProfileSubHeader,
  ProfileSectionCard,
  ProfileSettingRow,
  createProfileSubScreenStyles,
} from '../../../../../../components/Profile';
import useUi from '../../../../../../hooks/ui/useUi';
import { useStudentNotificationSettings } from '../../../../../../hooks/api/useStudentSettings';

const PREF_META = [
  {
    id: 'booking' as const,
    title: 'Booking reminders',
    description: 'Alerts before upcoming sessions',
    icon: 'calendar-clock',
  },
  {
    id: 'messages' as const,
    title: 'New messages',
    description: 'When a tutor sends you a message',
    icon: 'message-text-outline',
  },
  {
    id: 'promotions' as const,
    title: 'Offers & promotions',
    description: 'Discounts and platform updates',
    icon: 'tag-outline',
  },
  {
    id: 'parent' as const,
    title: 'Parent link updates',
    description: 'When a parent links your account',
    icon: 'account-group-outline',
  },
];

export default function StudentNotificationsScreen({ navigation }: any) {
  const { colors } = useUi();
  const styles = useMemo(() => createProfileSubScreenStyles(colors), [colors]);
  const { settings, loading, error, update } = useStudentNotificationSettings();

  const toggle = async (key: keyof typeof settings, value: boolean) => {
    const ok = await update({ [key]: value });
    if (!ok) {
      Alert.alert('Update failed', error || 'Could not save preference.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color={colors.PRIMARY_COLOR} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ProfileSubHeader navigation={navigation} title="Notifications" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Stay in the loop</Text>
          <Text style={styles.heroSubtitle}>
            Choose which alerts you want to receive. Changes sync to your
            account.
          </Text>
        </View>

        <ProfileSectionCard title="Push & in-app alerts">
          {PREF_META.map(pref => (
            <ProfileSettingRow
              key={pref.id}
              icon={pref.icon}
              title={pref.title}
              description={pref.description}
              value={Boolean(settings[pref.id])}
              onValueChange={value => void toggle(pref.id, value)}
            />
          ))}
        </ProfileSectionCard>

        <ProfileSectionCard title="Quiet hours">
          <ProfileSettingRow
            icon="moon-waning-crescent"
            iconColor="#6366F1"
            title="Do not disturb"
            description={`Silence non-urgent alerts from ${settings.quietHoursStart || '22:00'} – ${settings.quietHoursEnd || '07:00'}`}
            value={Boolean(settings.quietHoursEnabled)}
            onValueChange={value =>
              void toggle('quietHoursEnabled', value)
            }
          />
        </ProfileSectionCard>
      </ScrollView>
    </SafeAreaView>
  );
}
