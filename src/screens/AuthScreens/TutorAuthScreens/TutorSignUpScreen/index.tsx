import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  Pressable,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useUi from '../../../../hooks/ui/useUi';
import { createStyles } from './styles';
import CustomInput from '../../../../components/CustomInput/CustomInput';
import CustomButton from '../../../../components/CustomButton';
import AuthHeader from '../../../../components/Tutor/AuthHeader';
import { useAuthForm } from '../../../../hooks/forms/useAuthForm';
import ExpertiseModal from '../../../../components/Tutor/ExpertiseForm';

const classesList = ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

const TutorSignupScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const role = route.params?.role;
  const [secureEntry, setSecureEntry] = useState(true);
  const [expertiseModal, setExpertiseModal] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const { colors, resp } = useUi();
  const styles = useMemo(() => createStyles(colors, resp), [colors, resp]);

  const { form, errors, handleChange, submit, loading } = useAuthForm(
    'signup',
    role || 'tutor',
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

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AuthHeader
          title="Become an Expert Tutor"
          subtitle="Share your knowledge and start earning"
        />
        <View style={styles.contentContainer}>
          <View style={styles.stepHeader}>
            <Text style={styles.stepText}>Step 1 of 3</Text>
            <Text style={styles.stepLabel}>Basic Information</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
          <View style={styles.formWrapper}>
            <View style={styles.formContainer}>
              <CustomInput
                label="Full Name"
                placeholder="John Doe"
                value={form.fullName}
                onChangeText={(text: any) => handleChange('fullName', text)}
                error={errors.fullName}
              />
              <CustomInput
                label="Email Address"
                placeholder="student@example.com"
                keyboardType="email-address"
                value={form.email}
                onChangeText={(text: any) => handleChange('email', text)}
                error={errors.email}
              />
              <CustomInput
                label="Phone Number"
                value={form.phone}
                onChangeText={(text: string) => handleChange('phone', text)}
                placeholder="+1 (555) 123-4567"
                keyboardType="phone-pad"
                // leftIcon={
                //   <MaterialCommunityIcons
                //     name="phone"
                //     size={20}
                //     color={colors.PLACEHOLDER_TEXTCOLOR as string}
                //   />
                // }
              />
              <CustomInput
                label="Password"
                value={form.password}
                onChangeText={(text: any) => handleChange('password', text)}
                placeholder="Enter your password"
                secureTextEntry={secureEntry}
                error={errors.password}
                rightIcon={
                <Icon
                  name={secureEntry ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.PLACEHOLDER_TEXTCOLOR as string}
                />
              }
              onRightIconPress={() => setSecureEntry(prev => !prev)}
            />
              <CustomInput
                label="Confirm Password"
                placeholder="Confirm password"
                secureTextEntry={secureEntry}
                value={form.confirmPassword}
                onChangeText={(text: any) =>
                  handleChange('confirmPassword', text)
                }
                error={errors.confirmPassword}
              />
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setExpertiseModal(true)}
              >
                <CustomInput
                  label="Select Expertise"
                  value={form.expertise}
                  placeholder="Choose subject"
                  editable={false}
                  pointerEvents="none"
                  rightIcon={
                    <Pressable onPress={() => setExpertiseModal(true)}>
                      <MaterialCommunityIcons
                        name={expertiseModal ? 'chevron-up' : 'chevron-down'}
                        size={22}
                        color={colors.PLACEHOLDER_TEXTCOLOR as string}
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
            </View>
            {/* CLASS SELECTION */}
            <View style={styles.classSection}>
              <Text style={styles.classTitle}>
                Which classes do you teach? (Max 2)
              </Text>

              {classesList.map(item => {
                const selected = selectedClasses.includes(item);

                return (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.classCard,
                      selected && styles.selectedClassCard,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => toggleClass(item)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        selected && styles.checkboxSelected,
                      ]}
                    >
                      {selected && <View style={styles.checkboxDot} />}
                    </View>

                    <Text
                      style={[
                        styles.classText,
                        selected && styles.selectedClassText,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <CustomButton
              title="Create Account"
              onPress={submit}
              loading={loading}
              disabled={!isFormValid}
              textStyle={{ fontSize: resp.df(16) }}
              style={StyleSheet.flatten([
                styles.continueButton,
                !isFormValid && styles.disabledButton,
              ])}
            />
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Already have an account?</Text>

              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('TutorLoginScreen', {
                    role: 'tutor',
                  })
                }
              >
                <Text style={styles.loginText}> Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default TutorSignupScreen;


