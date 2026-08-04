import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAuthForm } from '../../../../hooks/forms/useAuthForm';
import ExpertiseModal from '../../../../components/Tutor/ExpertiseForm';
import {
  AuthGlassBackground,
  AuthGlassHeader,
  AuthGlassFooter,
  GlassInput,
  GlassPrimaryButton,
  AUTH_GLASS,
} from '../../../../components/AuthGlass';

const classesList = ['Grade 9', 'Grade 10', 'O-Levels', 'A-Levels'];

const TutorSignupScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const role = route.params?.role;
  const [secureEntry, setSecureEntry] = useState(true);
  const [expertiseModal, setExpertiseModal] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  const { form, errors, handleChange, submit, loading } = useAuthForm(
    'signup',
    'tutor'
  );

  const isFormValid =
    form.fullName?.trim() &&
    form.email?.trim() &&
    form.phone?.trim() &&
    form.password?.trim() &&
    form.confirmPassword?.trim() &&
    form.expertise?.trim() &&
    selectedClasses.length > 0;

  const toggleClass = (item: string) => {
    const alreadySelected = selectedClasses.includes(item);

    if (alreadySelected) {
      setSelectedClasses(prev => prev.filter(i => i !== item));
    } else {
      if (selectedClasses.length < 2) {
        setSelectedClasses(prev => [...prev, item]);
      }
    }
  };

  const styles = useMemo(() => createLocalStyles(), []);

  return (
    <AuthGlassBackground>
      <AuthGlassHeader
        title="Become an Expert Tutor"
        subtitle="Share your knowledge and start earning"
        onBack={() => navigation.goBack()}
      />

      <View style={styles.stepHeader}>
        <Text style={styles.stepText}>Step 1 of 3</Text>
        <Text style={styles.stepLabel}>Basic Information</Text>
      </View>
      <View style={styles.progressBar}>
        <View style={styles.progressFill} />
      </View>

      <View style={styles.formPanel}>
        <GlassInput
          label="Full Name"
          placeholder="John Doe"
          value={form.fullName}
          onChangeText={(text: string) => handleChange('fullName', text)}
          error={errors.fullName}
          leftIcon={
            <MaterialCommunityIcons
              name="account-outline"
              size={20}
              color={AUTH_GLASS.placeholder}
            />
          }
        />
        <GlassInput
          label="Email Address"
          placeholder="tutor@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={form.email}
          onChangeText={(text: string) => handleChange('email', text)}
          error={errors.email}
          leftIcon={
            <MaterialCommunityIcons
              name="email-outline"
              size={20}
              color={AUTH_GLASS.placeholder}
            />
          }
        />
        <GlassInput
          label="Phone Number"
          value={form.phone}
          onChangeText={(text: string) => handleChange('phone', text)}
          placeholder="+1 (555) 123-4567"
          keyboardType="phone-pad"
          leftIcon={
            <MaterialCommunityIcons
              name="phone-outline"
              size={20}
              color={AUTH_GLASS.placeholder}
            />
          }
        />
        <GlassInput
          label="Password"
          value={form.password}
          onChangeText={(text: string) => handleChange('password', text)}
          placeholder="Enter your password"
          secureTextEntry={secureEntry}
          autoCapitalize="none"
          error={errors.password}
          leftIcon={
            <MaterialCommunityIcons
              name="lock-outline"
              size={20}
              color={AUTH_GLASS.placeholder}
            />
          }
          rightIcon={
            <MaterialCommunityIcons
              name={secureEntry ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={AUTH_GLASS.placeholder}
            />
          }
          onRightIconPress={() => setSecureEntry(prev => !prev)}
        />
        <GlassInput
          label="Confirm Password"
          placeholder="Confirm password"
          secureTextEntry={secureEntry}
          autoCapitalize="none"
          value={form.confirmPassword}
          onChangeText={(text: string) => handleChange('confirmPassword', text)}
          error={errors.confirmPassword}
          leftIcon={
            <MaterialCommunityIcons
              name="lock-check-outline"
              size={20}
              color={AUTH_GLASS.placeholder}
            />
          }
        />

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setExpertiseModal(true)}
        >
          <GlassInput
            label="Select Expertise"
            value={form.expertise}
            placeholder="Choose subject"
            editable={false}
            pointerEvents="none"
            leftIcon={
              <MaterialCommunityIcons
                name="book-open-outline"
                size={20}
                color={AUTH_GLASS.placeholder}
              />
            }
            rightIcon={
              <Pressable onPress={() => setExpertiseModal(true)}>
                <MaterialCommunityIcons
                  name={expertiseModal ? 'chevron-up' : 'chevron-down'}
                  size={22}
                  color={AUTH_GLASS.placeholder}
                />
              </Pressable>
            }
          />
        </TouchableOpacity>

        <ExpertiseModal
          visible={expertiseModal}
          onDismiss={() => setExpertiseModal(false)}
          selectedValue={form.expertise}
          onSelect={(value: string) => handleChange('expertise', value)}
        />

        <Text style={styles.classTitle}>
          Which classes do you teach? (Max 2)
        </Text>

        {classesList.map(item => {
          const selected = selectedClasses.includes(item);
          return (
            <TouchableOpacity
              key={item}
              style={[styles.classCard, selected && styles.selectedClassCard]}
              activeOpacity={0.8}
              onPress={() => toggleClass(item)}
            >
              <View
                style={[styles.checkbox, selected && styles.checkboxSelected]}
              >
                {selected ? (
                  <MaterialCommunityIcons name="check" size={12} color="#fff" />
                ) : null}
              </View>
              <Text
                style={[styles.classText, selected && styles.selectedClassText]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ marginTop: 18 }}>
        <GlassPrimaryButton
          title="Create Account"
          onPress={() =>
            void submit({
              tutorSubject: form.expertise,
              tutorGrades: selectedClasses,
            })
          }
          loading={loading}
          disabled={!isFormValid}
        />

        <AuthGlassFooter
          prompt="Already have an account?"
          actionLabel=" Login"
          onAction={() =>
            navigation.navigate('TutorLoginScreen', {
              role: role || 'tutor',
            })
          }
        />
      </View>
    </AuthGlassBackground>
  );
};

const createLocalStyles = () =>
  StyleSheet.create({
    stepHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    stepText: {
      fontSize: 14,
      fontWeight: '700',
      color: AUTH_GLASS.title,
    },
    stepLabel: {
      fontSize: 12,
      color: AUTH_GLASS.muted,
    },
    progressBar: {
      width: '100%',
      height: 6,
      backgroundColor: 'rgba(117, 72, 245, 0.12)',
      borderRadius: 8,
      marginBottom: 14,
      overflow: 'hidden',
    },
    progressFill: {
      width: '33%',
      height: '100%',
      backgroundColor: AUTH_GLASS.primary as string,
    },
    /** Clean form panel — light frost */
    formPanel: {
      borderRadius: 22,
      borderWidth: 1,
      borderColor: AUTH_GLASS.cardBorder,
      backgroundColor: AUTH_GLASS.cardBg,
      padding: 16,
    },
    classTitle: {
      fontSize: 14,
      fontWeight: '600',
      marginTop: 6,
      marginBottom: 10,
      color: AUTH_GLASS.label,
    },
    classCard: {
      borderWidth: 1,
      borderColor: AUTH_GLASS.cardBorder,
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      backgroundColor: 'rgba(255, 255, 255, 0.28)',
    },
    selectedClassCard: {
      borderColor: AUTH_GLASS.primary as string,
      borderWidth: 2,
      backgroundColor: 'rgba(117,72,245,0.12)',
    },
    checkbox: {
      width: 22,
      height: 22,
      borderWidth: 2,
      borderColor: AUTH_GLASS.inputBorder,
      marginRight: 12,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 11,
      backgroundColor: 'transparent',
    },
    checkboxSelected: {
      backgroundColor: AUTH_GLASS.primary as string,
      borderColor: AUTH_GLASS.primary as string,
    },
    classText: {
      fontSize: 14,
      color: AUTH_GLASS.title,
      fontWeight: '500',
    },
    selectedClassText: {
      color: AUTH_GLASS.title,
      fontWeight: '700',
    },
  });

export default TutorSignupScreen;
