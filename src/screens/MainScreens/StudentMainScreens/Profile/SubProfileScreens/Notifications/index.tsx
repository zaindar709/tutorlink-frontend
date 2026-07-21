import React, { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ProfileSubHeader,
  ProfileSectionCard,
  ProfileSettingRow,
  createProfileSubScreenStyles,
} from '../../../../../../components/Profile';
import useUi from '../../../../../../hooks/ui/useUi';
import { MOCK_NOTIFICATION_PREFS } from '../../../../../../constants/studentProfileMockData';

export default function StudentNotificationsScreen({ navigation }: any) {
  const { colors } = useUi();
  const styles = useMemo(() => createProfileSubScreenStyles(colors), [colors]);
  const [prefs, setPrefs] = useState(MOCK_NOTIFICATION_PREFS);

  const togglePref = (id: string, enabled: boolean) => {
    setPrefs(prev => prev.map(item => (item.id === id ? { ...item, enabled } : item)));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ProfileSubHeader navigation={navigation} title="Notifications" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Stay in the loop</Text>
          <Text style={styles.heroSubtitle}>
            Choose which alerts you want to receive. Changes are saved locally for now.
          </Text>
        </View>

        <ProfileSectionCard title="Push & in-app alerts">
          {prefs.map((pref, index) => (
            <View key={pref.id}>
              <ProfileSettingRow
                icon={pref.icon}
                title={pref.title}
                description={pref.description}
                value={pref.enabled}
                onValueChange={value => togglePref(pref.id, value)}
              />
              {index < prefs.length - 1 ? null : null}
            </View>
          ))}
        </ProfileSectionCard>

        <ProfileSectionCard title="Quiet hours">
          <ProfileSettingRow
            icon="moon-waning-crescent"
            iconColor="#6366F1"
            title="Do not disturb"
            description="Silence non-urgent alerts from 10 PM – 7 AM"
            value={false}
            onValueChange={() => {}}
          />
        </ProfileSectionCard>
      </ScrollView>
    </SafeAreaView>
  );
}
