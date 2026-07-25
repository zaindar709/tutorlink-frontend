import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomInput from '../../../../../../components/CustomInput/CustomInput';
import {
  ProfileSubHeader,
  createProfileSubScreenStyles,
} from '../../../../../../components/Profile';
import useUi from '../../../../../../hooks/ui/useUi';
import { useProfileImagePicker } from '../../../../../../hooks/ui/useProfileImagePicker';
import { useProfile } from '../../../../../../hooks/api/useProfile';

const classOptions = ['Class 9', 'Class 10', 'Class 11', 'Class 12'];
const boardOptions = [
  'Federal Board',
  'Punjab Board',
  'Sindh Board',
  'Cambridge',
];

const FieldLabel = ({
  icon,
  label,
  color,
}: {
  icon: string;
  label: string;
  color: string;
}) => (
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
      marginTop: 8,
    }}
  >
    <MaterialCommunityIcons
      name={icon}
      size={16}
      color={color}
      style={{ marginRight: 6 }}
    />
    <Text style={{ fontSize: 13, fontWeight: '600', color: '#334155' }}>
      {label}
    </Text>
  </View>
);

export default function StudentEditProfileScreen({ navigation }: any) {
  const { colors } = useUi();
  const styles = useMemo(() => createProfileSubScreenStyles(colors), [colors]);
  const { profile, loading, actionLoading, error, saveProfile, uploadAvatar } =
    useProfile();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [grade, setGrade] = useState('');
  const [board, setBoard] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUri, setLocalAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name || '');
    setEmail(profile.email || '');
    setPhone(profile.phoneNumber || '');
    setGrade(profile.grade || '');
    setBoard(profile.board || '');
    setBio(profile.bio || '');
    setLocalAvatar(profile.avatarUrl || null);
  }, [profile]);

  const { openPicker } = useProfileImagePicker(async file => {
    setLocalAvatar(file.uri);
    const url = await uploadAvatar(file);
    if (!url) {
      Alert.alert('Upload failed', error || 'Could not upload photo.');
    }
  });

  const onSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Name is required.');
      return;
    }
    const ok = await saveProfile({
      name: name.trim(),
      phoneNumber: phone.trim() || undefined,
      grade: grade || undefined,
      board: board || undefined,
      bio: bio.trim() || undefined,
      avatarUrl: avatarUri || undefined,
    });
    if (!ok) {
      Alert.alert('Update failed', error || 'Could not save profile.');
      return;
    }
    Alert.alert('Saved', 'Profile updated successfully.');
    navigation.goBack();
  };

  if (loading && !profile) {
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
      <ProfileSubHeader
        navigation={navigation}
        title="Edit Profile"
        showSaveButton
        onSave={() => void onSave()}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <TouchableOpacity onPress={openPicker} activeOpacity={0.85}>
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                backgroundColor: colors.LIGHT_PRIMARY,
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
              }}
            >
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <MaterialCommunityIcons
                  name="account"
                  size={44}
                  color={colors.PRIMARY_COLOR}
                />
              )}
            </View>
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: colors.PRIMARY_COLOR,
                width: 30,
                height: 30,
                borderRadius: 15,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: '#fff',
              }}
            >
              <MaterialCommunityIcons
                name="camera-plus"
                size={14}
                color="#fff"
              />
            </View>
          </TouchableOpacity>
          <Text
            style={{
              marginTop: 8,
              color: colors.PRIMARY_COLOR,
              fontWeight: '600',
              fontSize: 13,
            }}
          >
            Tap to change photo
          </Text>
        </View>

        <FieldLabel
          icon="account-outline"
          label="Full Name"
          color={colors.PRIMARY_COLOR as string}
        />
        <CustomInput
          value={name}
          onChangeText={setName}
          placeholder="Your name"
        />

        <FieldLabel
          icon="email-outline"
          label="Email"
          color={colors.PRIMARY_COLOR as string}
        />
        <CustomInput
          value={email}
          onChangeText={setEmail}
          placeholder="email@example.com"
          keyboardType="email-address"
          editable={false}
        />

        <FieldLabel
          icon="phone-outline"
          label="Phone"
          color={colors.PRIMARY_COLOR as string}
        />
        <CustomInput
          value={phone}
          onChangeText={setPhone}
          placeholder="+92 300 0000000"
        />

        <FieldLabel
          icon="school-outline"
          label="Class / Grade"
          color={colors.PRIMARY_COLOR as string}
        />
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 12,
          }}
        >
          {classOptions.map(option => (
            <TouchableOpacity
              key={option}
              onPress={() => setGrade(option)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor:
                  grade === option ? colors.PRIMARY_COLOR : '#fff',
                borderWidth: 1,
                borderColor:
                  grade === option ? colors.PRIMARY_COLOR : '#E2E8F0',
              }}
            >
              <Text
                style={{
                  color: grade === option ? '#fff' : '#475569',
                  fontWeight: '600',
                  fontSize: 12,
                }}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FieldLabel
          icon="book-outline"
          label="Board"
          color={colors.PRIMARY_COLOR as string}
        />
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 12,
          }}
        >
          {boardOptions.map(option => (
            <TouchableOpacity
              key={option}
              onPress={() => setBoard(option)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor:
                  board === option ? colors.PRIMARY_COLOR : '#fff',
                borderWidth: 1,
                borderColor:
                  board === option ? colors.PRIMARY_COLOR : '#E2E8F0',
              }}
            >
              <Text
                style={{
                  color: board === option ? '#fff' : '#475569',
                  fontWeight: '600',
                  fontSize: 12,
                }}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FieldLabel
          icon="text-box-outline"
          label="Bio"
          color={colors.PRIMARY_COLOR as string}
        />
        <CustomInput
          value={bio}
          onChangeText={setBio}
          placeholder="Tell tutors about your goals..."
          multiline
          style={{ minHeight: 100, textAlignVertical: 'top' }}
        />

        {actionLoading ? (
          <ActivityIndicator
            color={colors.PRIMARY_COLOR}
            style={{ marginTop: 12 }}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
