import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { GlassScreen } from '../../../../../../components/Glass';
import { GLASS } from '../../../../../../theme/glass';

import CustomInput from '../../../../../../components/CustomInput/CustomInput';
import CustomButton from '../../../../../../components/CustomButton';
import CustomHeader from '../../../../../../components/Tutor/CustomHeader';
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
import { updateMyProfileAPI } from '../../../../../../api/profile.api';

const MAX_BIO = 500;

const FieldLabel = ({
  icon,
  label,
  colors,
  hint,
}: {
  icon: string;
  label: string;
  colors: any;
  hint?: string;
}) => (
  <View style={styles.labelBlock}>
    <View style={styles.labelRow}>
      <MaterialCommunityIcons
        name={icon}
        size={18}
        color={colors.PRIMARY_COLOR}
        style={{ marginRight: 6 }}
      />
      <Text style={[styles.labelText, { color: colors.BLACK_COLOR }]}>
        {label}
      </Text>
    </View>
    {hint ? <Text style={styles.hintText}>{hint}</Text> : null}
  </View>
);

const EditProfileScreen = ({ navigation }: any) => {
  const { colors } = useUi();
  const dispatch = useDispatch();
  const authUser = useSelector(
    (state: any) => state.auth.user as ApiUser | null
  );
  const authToken = useSelector((state: any) => state.auth.token as string | null);
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
    if (hourlyRate.trim() && (!Number.isFinite(rateNum) || rateNum <= 0)) {
      setFieldError('Enter a valid hourly fee (e.g. 1500)');
      showToast('Enter a valid hourly fee');
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
        hourlyRate: hourlyRate.trim()
          ? String(Math.round(rateNum))
          : '',
        address: address.trim(),
        bio: bio.trim(),
      };

      await saveTutorEditableProfile(payload, userId || null);

      try {
        await updateMyProfileAPI({
          name: payload.fullName,
          phoneNumber: payload.phone || undefined,
          bio: payload.bio || undefined,
          hourlyRate: payload.hourlyRate
            ? Number(payload.hourlyRate)
            : undefined,
          qualification: payload.education || undefined,
          experience: payload.experience || undefined,
        } as any);
      } catch {
        // Local save still succeeds for UI
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

      showToast('Saved successfully', true);
    } finally {
      setSaving(false);
    }
  };

  const screenStyles = useMemo(() => createStyles(colors), [colors]);

  return (
    <GlassScreen scroll={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <CustomHeader
          navigation={navigation}
          title="Edit Profile"
          showSaveButton
          onSave={onSave}
        />
        <View style={screenStyles.inner}>
          <View style={screenStyles.avatarWrap}>
            <View style={screenStyles.avatarContainer}>
              <Image
                source={
                  authUser?.avatarUrl
                    ? { uri: authUser.avatarUrl }
                    : Images.OneOnOne
                }
                style={screenStyles.avatar}
              />
              <TouchableOpacity style={screenStyles.cameraBtn}>
                <MaterialCommunityIcons
                  name="camera-plus"
                  size={18}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={screenStyles.form}>
            <FieldLabel
              icon="account-outline"
              label="Full Name"
              colors={colors}
            />
            <CustomInput value={fullName} onChangeText={setFullName} />

            <FieldLabel
              icon="email-outline"
              label="Email Address"
              colors={colors}
            />
            <CustomInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={false}
            />

            <FieldLabel
              icon="phone-outline"
              label="Phone Number"
              colors={colors}
            />
            <CustomInput
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <FieldLabel
              icon="school-outline"
              label="Education"
              colors={colors}
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
              colors={colors}
              hint="Students will see this rate when browsing tutors"
            />
            <CustomInput
              value={hourlyRate}
              onChangeText={setHourlyRate}
              keyboardType="numeric"
              placeholder="e.g. 1500"
            />

            <FieldLabel
              icon="briefcase-outline"
              label="Experience"
              colors={colors}
            />
            <CustomInput
              value={experience}
              onChangeText={setExperience}
              placeholder="e.g. 5 years"
            />

            <FieldLabel
              icon="map-marker-outline"
              label="Address"
              colors={colors}
            />
            <CustomInput value={address} onChangeText={setAddress} />

            <FieldLabel
              icon="file-document-edit-outline"
              label="Professional Bio"
              colors={colors}
            />
            <TextInput
              value={bio}
              onChangeText={t => setBio(t.slice(0, MAX_BIO))}
              placeholder="Write a short professional bio"
              placeholderTextColor="#999"
              multiline
              style={[
                screenStyles.textarea,
                {
                  borderColor: '#e6e6e6',
                  color: colors.BLACK_COLOR,
                  backgroundColor: GLASS.inputBg,
                },
              ]}
            />
            <Text style={screenStyles.charCount}>
              {bio.length}/{MAX_BIO}
            </Text>

            {fieldError ? (
              <Text style={screenStyles.errorText}>{fieldError}</Text>
            ) : null}

            <CustomButton
              title="Save Changes"
              onPress={onSave}
              loading={saving}
            />
          </View>
        </View>
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

const styles = StyleSheet.create({
  labelBlock: {
    marginTop: 10,
    marginBottom: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  hintText: {
    marginTop: 4,
    marginLeft: 24,
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
});

const createStyles = (colors: any) =>
  StyleSheet.create({
    inner: {
      paddingHorizontal: 20,
      paddingTop: 15,
      paddingBottom: 40,
    },
    avatarWrap: {
      alignItems: 'center',
      marginBottom: 20,
    },
    avatarContainer: {
      position: 'relative',
    },
    avatar: {
      width: 110,
      height: 110,
      borderRadius: 55,
      borderWidth: 3,
      borderColor: colors.PRIMARY_COLOR,
    },
    cameraBtn: {
      position: 'absolute',
      bottom: 6,
      right: 6,
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.PRIMARY_COLOR,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
    },
    form: {
      marginTop: 10,
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
    },
    charCount: {
      alignSelf: 'flex-end',
      fontSize: 12,
      color: GLASS.textMuted,
      marginBottom: 14,
    },
    errorText: {
      color: '#DC2626',
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 10,
    },
  });
