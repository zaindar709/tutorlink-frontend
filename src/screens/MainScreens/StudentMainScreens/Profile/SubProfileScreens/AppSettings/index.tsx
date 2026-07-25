import React, { useMemo } from 'react';
import {
  View,
  ScrollView,
  Text,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ProfileSubHeader,
  ProfileSectionCard,
  ProfileSettingRow,
  createProfileSubScreenStyles,
} from '../../../../../../components/Profile';
import useUi from '../../../../../../hooks/ui/useUi';
import { useStudentAppSettings } from '../../../../../../hooks/api/useStudentSettings';

export default function StudentAppSettingsScreen({ navigation }: any) {
  const { colors } = useUi();
  const styles = useMemo(() => createProfileSubScreenStyles(colors), [colors]);
  const { settings, loading, error, update } = useStudentAppSettings();

  const patch = async (payload: Parameters<typeof update>[0]) => {
    const ok = await update(payload);
    if (!ok) {
      Alert.alert('Update failed', error || 'Could not save settings.');
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

  const languageLabel = settings.language === 'ur' ? 'Urdu' : 'English';
  const appearanceLabel =
    settings.appearance === 'dark'
      ? 'Dark'
      : settings.appearance === 'light'
        ? 'Light'
        : 'System default';

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
            description={languageLabel}
            showChevron
            onPress={() =>
              Alert.alert('Language', 'Choose app language', [
                {
                  text: 'English',
                  onPress: () => void patch({ language: 'en' }),
                },
                {
                  text: 'Urdu',
                  onPress: () => void patch({ language: 'ur' }),
                },
                { text: 'Cancel', style: 'cancel' },
              ])
            }
          />
          <ProfileSettingRow
            icon="theme-light-dark"
            title="Appearance"
            description={appearanceLabel}
            showChevron
            onPress={() =>
              Alert.alert('Appearance', 'Choose theme', [
                {
                  text: 'System',
                  onPress: () => void patch({ appearance: 'system' }),
                },
                {
                  text: 'Light',
                  onPress: () => void patch({ appearance: 'light' }),
                },
                {
                  text: 'Dark',
                  onPress: () => void patch({ appearance: 'dark' }),
                },
                { text: 'Cancel', style: 'cancel' },
              ])
            }
          />
        </ProfileSectionCard>

        <Text style={styles.sectionLabel}>Experience</Text>
        <ProfileSectionCard>
          <ProfileSettingRow
            icon="volume-high"
            title="Sound effects"
            description="Play sounds for messages and actions"
            value={settings.soundEnabled}
            onValueChange={value => void patch({ soundEnabled: value })}
          />
          <ProfileSettingRow
            icon="vibrate"
            title="Haptic feedback"
            description="Vibration on button taps"
            value={settings.hapticsEnabled}
            onValueChange={value => void patch({ hapticsEnabled: value })}
          />
          <ProfileSettingRow
            icon="play-circle-outline"
            title="Auto-play session previews"
            description="Preview tutor intro videos automatically"
            value={settings.autoPlayPreviews}
            onValueChange={value => void patch({ autoPlayPreviews: value })}
          />
        </ProfileSectionCard>
      </ScrollView>
    </SafeAreaView>
  );
}
