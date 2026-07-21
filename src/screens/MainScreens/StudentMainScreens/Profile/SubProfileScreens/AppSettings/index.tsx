import React, { useMemo, useState } from 'react';
import { ScrollView, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ProfileSubHeader,
  ProfileSectionCard,
  ProfileSettingRow,
  createProfileSubScreenStyles,
} from '../../../../../../components/Profile';
import useUi from '../../../../../../hooks/ui/useUi';

export default function StudentAppSettingsScreen({ navigation }: any) {
  const { colors } = useUi();
  const styles = useMemo(() => createProfileSubScreenStyles(colors), [colors]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [language] = useState('English');

  return (
    <SafeAreaView style={styles.container}>
      <ProfileSubHeader navigation={navigation} title="App Settings" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Preferences</Text>
          <Text style={styles.heroSubtitle}>
            Customize how TutorLink looks and feels on your device.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>General</Text>
        <ProfileSectionCard>
          <ProfileSettingRow
            icon="translate"
            title="Language"
            description={language}
            showChevron
            onPress={() => Alert.alert('Language', 'Urdu & English support coming soon.')}
          />
          <ProfileSettingRow
            icon="theme-light-dark"
            title="Appearance"
            description="System default (Light)"
            showChevron
            onPress={() => Alert.alert('Theme', 'Dark mode will be available in a future update.')}
          />
        </ProfileSectionCard>

        <Text style={styles.sectionLabel}>Experience</Text>
        <ProfileSectionCard>
          <ProfileSettingRow
            icon="volume-high"
            title="Sound effects"
            description="Play sounds for messages and actions"
            value={soundEnabled}
            onValueChange={setSoundEnabled}
          />
          <ProfileSettingRow
            icon="vibrate"
            title="Haptic feedback"
            description="Vibration on button taps"
            value={haptics}
            onValueChange={setHaptics}
          />
          <ProfileSettingRow
            icon="play-circle-outline"
            title="Auto-play session previews"
            description="Preview tutor intro videos automatically"
            value={autoPlay}
            onValueChange={setAutoPlay}
          />
        </ProfileSectionCard>

        <Text style={styles.sectionLabel}>Storage</Text>
        <ProfileSectionCard>
          <ProfileSettingRow
            icon="cached"
            title="Clear cache"
            description="Free up space from cached images"
            showChevron
            onPress={() => Alert.alert('Cache cleared', 'Mock — 24 MB freed.')}
          />
        </ProfileSectionCard>
      </ScrollView>
    </SafeAreaView>
  );
}
