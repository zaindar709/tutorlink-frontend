import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Icon, IconButton } from 'react-native-paper';
import useUi from '../../../../hooks/ui/useUi';
import CustomInput from '../../../../components/CustomInput/CustomInput';
import CustomButton from '../../../../components/CustomButton';
import { createStyles } from './styles';
import { useAuthForm } from '../../../../hooks/forms/useAuthForm';
import BackButton from '../../../../components/BackButton/BackButton';

const StudentSignUpScreen = () => {
  const { colors, resp } = useUi();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const role = route.params?.role;
  const [secureEntry, setSecureEntry] = useState(true);
  const styles = useMemo(() => createStyles(colors, resp), [colors, resp]);

  const { form, errors, handleChange, submit } = useAuthForm(
    'signup',
    role || 'student', 
  );
  return (
    <KeyboardAvoidingView style={styles.screen} behavior="padding">
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <BackButton onPress={() => navigation.goBack()} />
        <View style={styles.brandHeader}>
          <Text style={styles.brandTitle}>TutorLink</Text>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join TutorLink and start your learning journey
          </Text>
        </View>
        <View style={styles.formCard}>
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
            label="Password"
            value={form.password}
            onChangeText={(text: any) => handleChange('password', text)}
            placeholder="Enter your password"
            secureTextEntry={secureEntry}
            error={errors.password}
            leftIcon={
              <Icon
                source="lock-outline"
                size={20}
                color={colors.PLACEHOLDER_TEXTCOLOR as string}
              />
            }
            rightIcon={
              <Icon
                source={secureEntry ? 'eye-off-outline' : 'eye-outline'}
                size={20}
              />
            }
            onRightIconPress={() => setSecureEntry(prev => !prev)}
          />
          <CustomInput
            label="Confirm Password"
            placeholder="Confirm password"
            secureTextEntry={secureEntry}
            value={form.confirmPassword}
            onChangeText={(text: any) => handleChange('confirmPassword', text)}
            error={errors.confirmPassword}
          />
        </View>
        <CustomButton title="Create Account" onPress={()=>navigation.navigate('StudentSubjectSelection')} />
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('StudentLoginScreen')}
          >
            <Text style={styles.footerLink}> Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default StudentSignUpScreen;
