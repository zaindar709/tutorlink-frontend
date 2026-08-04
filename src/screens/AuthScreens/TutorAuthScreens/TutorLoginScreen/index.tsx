import React, { useState } from 'react';
import { View, Text, Platform, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { useAuthForm } from '../../../../hooks/forms/useAuthForm';
import { useGoogleAuth } from '../../../../hooks/auth/useGoogleAuth';
import {
  AuthGlassBackground,
  AuthGlassHeader,
  AuthGlassFooter,
  AuthGlassDivider,
  GlassCard,
  GlassInput,
  GlassPrimaryButton,
  GlassSocialButton,
  AUTH_GLASS,
} from '../../../../components/AuthGlass';

const TutorLoginScreen = () => {
  const { form, errors, handleChange, submit, loading } = useAuthForm(
    'login',
    'tutor'
  );
  const { signIn: handleContinueWithGoogle } = useGoogleAuth('tutor');

  const handleContinueWithApple = () => {
    console.log('Continue with Apple tapped');
  };

  const [rememberMe, setRememberMe] = useState(true);
  const [secureEntry, setSecureEntry] = useState(true);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { role = 'tutor' } = route.params || {};
  const roleLabel =
    role === 'tutor' ? 'Tutor' : role === 'parent' ? 'Parent' : 'Student';

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPasswordScreen', { role });
  };

  const handleSignup = () => {
    navigation.navigate('TutorSignUpScreen', { role });
  };

  return (
    <AuthGlassBackground>
      <AuthGlassHeader
        title={`${roleLabel} Login`}
        subtitle="Sign in to continue your teaching journey"
        onBack={() => navigation.goBack()}
      />

      <GlassCard>
        <GlassInput
          label="Email Address"
          value={form.email}
          onChangeText={(text: string) => handleChange('email', text)}
          placeholder={`${role}@example.com`}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
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
      </GlassCard>

      <View style={styles.ctaBlock}>
        <GlassPrimaryButton
          title="Login"
          onPress={() => {
            void submit();
          }}
          loading={loading}
        />

        <AuthGlassDivider />

        <GlassSocialButton
          title="Continue with Google"
          icon="google"
          onPress={handleContinueWithGoogle}
        />

        {Platform.OS === 'ios' && (
          <GlassSocialButton
            title="Continue with Apple"
            icon="apple"
            onPress={handleContinueWithApple}
          />
        )}

        <AuthGlassFooter
          prompt="Don't have an account?"
          actionLabel=" Sign up"
          onAction={handleSignup}
        />
      </View>
    </AuthGlassBackground>
  );
};

const styles = StyleSheet.create({
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: AUTH_GLASS.inputBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxSelected: {
    borderColor: AUTH_GLASS.primary as string,
    backgroundColor: AUTH_GLASS.primary as string,
  },
  checkboxDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  rememberText: {
    fontSize: 13,
    color: AUTH_GLASS.muted,
  },
  forgotText: {
    fontSize: 13,
    color: AUTH_GLASS.link,
    fontWeight: '600',
  },
  ctaBlock: {
    marginTop: 20,
  },
});

export default TutorLoginScreen;
