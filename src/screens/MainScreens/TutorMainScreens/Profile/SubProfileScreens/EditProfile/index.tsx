import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { GlassScreen } from '../../../../../../components/Glass';
import { GLASS } from '../../../../../../theme/glass';
import { ProfileSubHeader } from '../../../../../../components/Profile';
import CustomInput from '../../../../../../components/CustomInput/CustomInput';
import AppToast from '../../../../../../components/AppToast/AppToast';
import useUi from '../../../../../../hooks/ui/useUi';
import Images from '../../../../../../assets/images';
import { ApiUser } from '../../../../../../types/api.types';
import { setUser } from '../../../../../../store/auth/authSlice';
import {
  loadTutorEditableProfile,
  saveTutorEditableProfile,
} from '../../../../../../services/profile/tutorProfileLocalStore';
import {
  dismissProfileSuggestion,
  clearProfileSuggestionNeeded,
} from '../../../../../../services/profile/profileSuggestionStore';
import { syncTutorBookingProfile } from '../../../../../../services/profile/tutorProfileSync';

const MAX_BIO = 500;

const FieldLabel = ({
  icon,
  label,
  hint,
}: {
  icon: string;
  label: string;
  hint?: string;
}) => (
  <View style={fieldStyles.labelBlock}>
    <View style={fieldStyles.labelRow}>
      <MaterialCommunityIcons
        name={icon}
        size={16}
        color={GLASS.primary}
        style={{ marginRight: 6 }}
      />
      <Text style={fieldStyles.labelText}>{label}</Text>
    </View>
    {hint ? <Text style={fieldStyles.hintText}>{hint}</Text> : null}
  </View>
);

const EditProfileScreen = ({ navigation }: any) => {
  const { resp } = useUi();
  const styles = useMemo(() => createStyles(resp), [resp]);
  const dispatch = useDispatch();
  const authUser = useSelector(
    (state: any) => state.auth.user as ApiUser | null
  );
  const authToken = useSelector(
    (state: any) => state.auth.token as string | null
  );
  const authRole = useSelector((state: any) => state.auth.role);
  const userId = String(
    authUser?.uid || authUser?.firebaseUid || authUser?.id || authUser?._id || ''
  );

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [experience, setExperience] = useState('');
  const [education, setEducation] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [address, setAddress] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('Saved successfully');
  const [goBackOnToastHide, setGoBackOnToastHide] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const local = await loadTutorEditableProfile(userId || null);
      if (!mounted) return;

      setFullName(
        local.fullName ||
          String(authUser?.name || authUser?.fullName || '').trim()
      );
      setEmail(local.email || String(authUser?.email || '').trim());
      setPhone(
        local.phone ||
          String(authUser?.phoneNumber || authUser?.phone || '').trim()
      );
      setExperience(local.experience || '');
      setEducation(local.education || '');
      setHourlyRate(local.hourlyRate || '');
      setAddress(local.address || '');
      setBio(local.bio || '');
    })();
    return () => {
      mounted = false;
    };
  }, [authUser, userId]);

  const handleToastHide = useCallback(() => {
    setToastVisible(false);
    if (goBackOnToastHide) {
      setGoBackOnToastHide(false);
      navigation.goBack();
    }
  }, [goBackOnToastHide, navigation]);

  const showToast = (message: string, goBackAfter = false) => {
    setToastMessage(message);
    setGoBackOnToastHide(goBackAfter);
    setToastVisible(true);
  };

  const onSave = async () => {
    if (saving) return;

    if (!fullName.trim()) {
      setFieldError('Please enter your full name');
      showToast('Please enter your full name');
      return;
    }

    const rateNum = Number(String(hourlyRate).replace(/[^\d.]/g, ''));
    if (!hourlyRate.trim() || !Number.isFinite(rateNum) || rateNum <= 0) {
      setFieldError('Hourly fee is required (e.g. 1500)');
      showToast('Set your hourly fee so students can book you');
      Alert.alert(
        'Hourly fee required',
        'Students cannot book you until an hourly rate is saved on the server (e.g. 1500).'
      );
      return;
    }

    setFieldError(null);
    setSaving(true);

    try {
      const payload = {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        experience: experience.trim(),
        education: education.trim(),
        hourlyRate: String(Math.round(rateNum)),
        address: address.trim(),
        bio: bio.trim(),
      };

      await saveTutorEditableProfile(payload, userId || null);

      const experienceYears = Number(
        String(payload.experience).replace(/[^\d.]/g, '')
      );

      const sync = await syncTutorBookingProfile({
        name: payload.fullName,
        phoneNumber: payload.phone || undefined,
        bio: payload.bio || undefined,
        hourlyRate: Math.round(rateNum),
        qualification: payload.education || undefined,
        experience: payload.experience || undefined,
        experienceYears: Number.isFinite(experienceYears)
          ? experienceYears
          : undefined,
        availability: true,
        userId: String(authUser?._id || authUser?.id || userId || ''),
        profileId: String(authUser?._id || authUser?.id || ''),
      });

      if (!sync.ok) {
        Alert.alert(
          'Could not sync fee to server',
          `${sync.message}\n\nLocal draft was saved on this phone only. Students still cannot book until the server stores your hourly rate.`
        );
        return;
      }

      if (
        payload.phone &&
        payload.bio &&
        payload.education &&
        payload.hourlyRate
      ) {
        void dismissProfileSuggestion('tutor', userId);
        void clearProfileSuggestionNeeded('tutor', userId);
      }

      if (authUser) {
        dispatch(
          setUser({
            user: {
              ...authUser,
              name: payload.fullName,
              fullName: payload.fullName,
              phoneNumber: payload.phone || authUser.phoneNumber,
              phone: payload.phone || authUser.phone,
            },
            token: authToken || '',
            role: authRole,
          })
        );
      }

      showToast('Saved — fee synced for bookings', true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <GlassScreen
      scroll={false}
      edges={['top', 'left', 'right']}
      contentStyle={styles.screen}
    >
      <ProfileSubHeader
        navigation={navigation}
        title="Edit Profile"
        showSaveButton
        onSave={() => void onSave()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.avatarBlock}>
          <View style={styles.avatarRing}>
            <Image
              source={
                authUser?.avatarUrl
                  ? { uri: authUser.avatarUrl }
                  : Images.OneOnOne
              }
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.cameraBtn} activeOpacity={0.85}>
              <MaterialCommunityIcons
                name="camera-plus"
                size={16}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.avatarHint}>Update your teaching profile</Text>
        </View>

        <View style={styles.secureRow}>
          <View style={styles.chip}>
            <MaterialCommunityIcons
              name="cash-check"
              size={14}
              color={GLASS.primary}
            />
            <Text style={[styles.chipText, { color: GLASS.primary }]}>
              Fee required for bookings
            </Text>
          </View>
          <View style={styles.chip}>
            <MaterialCommunityIcons
              name="cloud-sync-outline"
              size={14}
              color={GLASS.success}
            />
            <Text style={[styles.chipText, { color: GLASS.success }]}>
              Syncs to server
            </Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Basic info</Text>
        <View style={styles.card}>
          <FieldLabel icon="account-outline" label="Full Name" />
          <CustomInput value={fullName} onChangeText={setFullName} />

          <FieldLabel icon="email-outline" label="Email Address" />
          <CustomInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={false}
          />

          <FieldLabel icon="phone-outline" label="Phone Number" />
          <CustomInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="+92 300 0000000"
          />
        </View>

        <Text style={styles.sectionLabel}>Teaching details</Text>
        <View style={styles.card}>
          <FieldLabel
            icon="school-outline"
            label="Education"
            hint="Shown on your tutor profile (e.g. MSc Mathematics, LUMS)"
          />
          <CustomInput
            value={education}
            onChangeText={setEducation}
            placeholder="Degree / institution"
          />

          <FieldLabel
            icon="cash-multiple"
            label="Hourly Fee (PKR)"
            hint="Required to receive bookings. Saved to server (e.g. 1500)."
          />
          <CustomInput
            value={hourlyRate}
            onChangeText={setHourlyRate}
            keyboardType="numeric"
            placeholder="e.g. 1500"
          />

          <FieldLabel icon="briefcase-outline" label="Experience" />
          <CustomInput
            value={experience}
            onChangeText={setExperience}
            placeholder="e.g. 5 years"
          />

          <FieldLabel icon="map-marker-outline" label="Address" />
          <CustomInput
            value={address}
            onChangeText={setAddress}
            placeholder="City / area"
          />
        </View>

        <Text style={styles.sectionLabel}>About you</Text>
        <View style={styles.card}>
          <FieldLabel
            icon="file-document-edit-outline"
            label="Professional Bio"
          />
          <TextInput
            value={bio}
            onChangeText={t => setBio(t.slice(0, MAX_BIO))}
            placeholder="Write a short professional bio"
            placeholderTextColor={GLASS.placeholder}
            multiline
            style={styles.textarea}
          />
          <Text style={styles.charCount}>
            {bio.length}/{MAX_BIO}
          </Text>
        </View>

        {fieldError ? <Text style={styles.errorText}>{fieldError}</Text> : null}

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => void onSave()}
          disabled={saving}
          style={styles.saveWrap}
        >
          <LinearGradient
            colors={[...GLASS.buttonGradient]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          >
            <MaterialCommunityIcons
              name={saving ? 'loading' : 'content-save-outline'}
              size={18}
              color="#fff"
            />
            <Text style={styles.saveText}>
              {saving ? 'Saving…' : 'Save Changes'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      <AppToast
        visible={toastVisible}
        message={toastMessage}
        onHide={handleToastHide}
      />
    </GlassScreen>
  );
};

export default EditProfileScreen;

const fieldStyles = StyleSheet.create({
  labelBlock: {
    marginTop: 8,
    marginBottom: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelText: {
    fontSize: 13,
    fontWeight: '700',
    color: GLASS.textPrimary,
  },
  hintText: {
    marginTop: 4,
    marginLeft: 22,
    fontSize: 11,
    color: GLASS.textMuted,
    lineHeight: 15,
  },
});

const createStyles = (resp: any) =>
  StyleSheet.create({
    screen: { flex: 1 },
    content: {
      paddingHorizontal: resp.dx(16),
      paddingTop: resp.dy(12),
      paddingBottom: resp.dy(40),
    },
    avatarBlock: {
      alignItems: 'center',
      marginBottom: 14,
    },
    avatarRing: {
      position: 'relative',
      padding: 3,
      borderRadius: 999,
      borderWidth: 2,
      borderColor: GLASS.cardBorderStrong,
      backgroundColor: GLASS.cardBgStrong,
    },
    avatar: {
      width: 96,
      height: 96,
      borderRadius: 48,
    },
    cameraBtn: {
      position: 'absolute',
      bottom: 4,
      right: 4,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: GLASS.primary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#fff',
      ...GLASS.shadow.soft,
    },
    avatarHint: {
      marginTop: 10,
      fontSize: 13,
      fontWeight: '600',
      color: GLASS.textSecondary,
    },
    secureRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 16,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: GLASS.cardBgStrong,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 7,
    },
    chipText: {
      fontSize: 11,
      fontWeight: '700',
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: GLASS.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginBottom: 10,
    },
    card: {
      borderRadius: GLASS.radius.xl,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      backgroundColor: GLASS.cardBgStrong,
      paddingHorizontal: 14,
      paddingTop: 6,
      paddingBottom: 14,
      marginBottom: 18,
      ...GLASS.shadow.soft,
    },
    textarea: {
      minHeight: 110,
      borderWidth: 1,
      borderRadius: GLASS.radius.sm,
      padding: 12,
      textAlignVertical: 'top',
      marginBottom: 6,
      borderColor: GLASS.inputBorder,
      backgroundColor: GLASS.inputBg,
      color: GLASS.textPrimary,
      fontSize: 14,
    },
    charCount: {
      alignSelf: 'flex-end',
      fontSize: 12,
      color: GLASS.textMuted,
    },
    errorText: {
      color: '#DC2626',
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 10,
    },
    saveWrap: {
      marginTop: 4,
      ...GLASS.shadow.medium,
    },
    saveBtn: {
      height: 52,
      borderRadius: GLASS.radius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    saveBtnDisabled: {
      opacity: 0.75,
    },
    saveText: {
      color: '#fff',
      fontWeight: '800',
      fontSize: 15,
    },
  });
