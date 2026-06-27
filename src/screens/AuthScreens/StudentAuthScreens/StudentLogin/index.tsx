import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Platform,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { Icon, IconButton } from 'react-native-paper';

import useUi from '../../../../hooks/ui/useUi';
import CustomButton from '../../../../components/CustomButton';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuthForm } from '../../../../hooks/forms/useAuthForm';
import CustomInput from '../../../../components/CustomInput/CustomInput';
import { createStyles } from './styles';
import { OrDivider } from '../../../../components/OrDrivider/OrDivider';
import { useGoogleAuth } from '../../../../hooks/auth/useGoogleAuth';

const StudentLoginScreen = () => {
  const { colors, resp } = useUi();
  const styles = useMemo(() => createStyles(colors, resp), [colors, resp]);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { role = 'student' } = route.params || {};
  const authRole =
    role === 'tutor' ? 'tutor' : role === 'parent' ? 'parent' : 'student';
  const { form, errors, handleChange, submit, loading } = useAuthForm('login', authRole);
  const { signIn: handleContinueWithGoogle } = useGoogleAuth(authRole);
  const [rememberMe, setRememberMe] = useState(true);
  const [secureEntry, setSecureEntry] = useState(true);
  const roleLabel =
    role === 'tutor' ? 'Tutor' : role === 'parent' ? 'Parent' : 'Student';

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPasswordScreen', { role });
  };

  const handleContinueWithApple = () => {
    console.log('Continue with Apple tapped');
  };

  const handleSignup = () => {
    navigation.navigate('StudentSignUpScreen', { role });
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior="padding">
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <IconButton
            icon="arrow-left"
            size={resp.df(16)}
            onPress={() => navigation.goBack()}
            iconColor={colors.BLACK_COLOR as string}
          />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.brandHeader}>
          <Text style={styles.brandTitle}>TutorLink</Text>
          {/* <View style={styles.brandAccent} /> */}
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.title}>{roleLabel} Login</Text>
          <Text style={styles.subtitle}>
            Sign in to continue your learning journey
          </Text>
        </View>

        <View style={styles.formCard}>
          <CustomInput
            label="Email Address"
            value={form.email}
            onChangeText={(text: any) => handleChange('email', text)}
            placeholder={`${role}@example.com`}
            keyboardType="email-address"
            error={errors.email}
          />
          <View style={styles.fieldGroup}>
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
          </View>

          <View style={styles.metaRow}>
            <TouchableOpacity
              style={styles.rememberRow}
              onPress={() => setRememberMe(prev => !prev)}
            >
              <View
                style={[styles.checkbox, rememberMe && styles.checkboxSelected]}
              >
                {rememberMe ? <View style={styles.checkboxDot} /> : null}
              </View>
              <Text style={styles.rememberText}>Remember me</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
        </View>

        <CustomButton
          title="Login"
          onPress={submit}
          loading={loading}
          style={styles.loginButton}
        />
        <OrDivider />
        <CustomButton
          title="Continue with Google"
          onPress={handleContinueWithGoogle}
          backgroundColor={colors.WHITE_COLOR}
          textColor={colors.BLACK_COLOR}
          icon="google"
          iconPosition="left"
          style={styles.socialButton}
          textStyle={styles.socialButtonText}
        />

        {Platform.OS === 'ios' && (
          <CustomButton
            title="Continue with Apple"
            onPress={handleContinueWithApple}
            backgroundColor={colors.BLACK_COLOR}
            textColor={colors.WHITE_COLOR}
            icon="apple"
            iconPosition="left"
            style={{ ...styles.socialButton, ...styles.appleButton }}
            textStyle={styles.socialButtonText}
          />
        )}

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={handleSignup}>
            <Text style={styles.footerAction}> Sign up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default StudentLoginScreen;
