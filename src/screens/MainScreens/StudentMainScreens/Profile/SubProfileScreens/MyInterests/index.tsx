import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomInput from '../../../../../../components/CustomInput/CustomInput';
import CustomButton from '../../../../../../components/CustomButton';
import {
  ProfileSubHeader,
  createProfileSubScreenStyles,
} from '../../../../../../components/Profile';
import useUi from '../../../../../../hooks/ui/useUi';
import { useStudentProfileLocal } from '../../../../../../hooks/ui/useStudentProfileLocal';
import { subjectOptions } from '../../../../../../constants/SubjectSelection.data';

const classOptions = ['Class 9', 'Class 10', 'Class 11', 'Class 12'];

export default function StudentInterestsScreen({ navigation }: any) {
  const { colors, resp } = useUi();
  const styles = useMemo(() => createProfileSubScreenStyles(colors), [colors]);
  const { profile, loading, updateProfile } = useStudentProfileLocal();

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setSelectedSubjects(profile.interests || []);
    setSelectedClass(profile.grade || '');
  }, [profile]);

  const filteredSubjects = useMemo(
    () =>
      subjectOptions.filter(subject =>
        subject.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery]
  );

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subject)
        ? prev.filter(item => item !== subject)
        : [...prev, subject]
    );
  };

  const onSave = async () => {
    if (selectedSubjects.length === 0 || !selectedClass) {
      Alert.alert('Selection required', 'Pick at least one subject and your class.');
      return;
    }
    setSaving(true);
    await updateProfile({ interests: selectedSubjects, grade: selectedClass });
    setSaving(false);
    Alert.alert('Saved', 'Interests updated locally.');
    navigation.goBack();
  };

  if (loading && !profile) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.PRIMARY_COLOR} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ProfileSubHeader navigation={navigation} title="My Interests" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>What do you want to learn?</Text>
          <Text style={styles.heroSubtitle}>
            Update your subjects so we can recommend the best tutors for you.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Your class</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {classOptions.map(option => (
            <TouchableOpacity
              key={option}
              onPress={() => setSelectedClass(option)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 22,
                backgroundColor: selectedClass === option ? colors.PRIMARY_COLOR : '#fff',
                borderWidth: 1,
                borderColor: selectedClass === option ? colors.PRIMARY_COLOR : '#E2E8F0',
              }}
            >
              <Text
                style={{
                  color: selectedClass === option ? '#fff' : '#475569',
                  fontWeight: '600',
                }}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Search subjects</Text>
        <CustomInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search Physics, Math..."
        />

        <Text style={styles.sectionLabel}>
          {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? 's' : ''} selected
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: resp.dx(8), marginBottom: 16 }}>
          {filteredSubjects.map(subject => {
            const selected = selectedSubjects.includes(subject);
            return (
              <Chip
                key={subject}
                selected={selected}
                onPress={() => toggleSubject(subject)}
                style={{
                  backgroundColor: selected ? colors.LIGHT_PRIMARY : '#fff',
                  borderColor: selected ? colors.PRIMARY_COLOR : '#E2E8F0',
                  borderWidth: 1,
                }}
                textStyle={{ color: selected ? colors.PRIMARY_COLOR : '#475569' }}
              >
                {subject}
              </Chip>
            );
          })}
        </View>

        <CustomButton
          title={saving ? 'Saving...' : 'Save Interests'}
          onPress={() => void onSave()}
          disabled={saving || selectedSubjects.length === 0 || !selectedClass}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
