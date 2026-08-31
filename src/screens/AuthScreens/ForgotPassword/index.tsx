import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { useForgotPassword } from '../../../hooks/auth/useForgotPassword';
import {
  AuthGlassBackground,
  AuthGlassHeader,
  GlassCard,
  GlassInput,
  GlassPrimaryButton,
  AUTH_GLASS,
} from '../../../components/AuthGlass';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { role = 'student', email: presetEmail } = route.params || {};
  const roleLabel = role === 'tutor' ? 'Tutor' : 'Student';
  const resetRole = role === 'tutor' ? 'tutor' : 'student';

  const {
    email,
    error,
    loading,
    onChangeEmail,
    sendResetLink,
    canSubmit,
  } = useForgotPassword(resetRole);

  useEffect(() => {
    if (presetEmail) onChangeEmail(String(presetEmail));
  }, [presetEmail, onChangeEmail]);

  return (
    <AuthGlassBackground>
      <AuthGlassHeader
        title="Forgot Password?"
        subtitle="We'll email you a secure Firebase reset link"
        onBack={() => navigation.goBack()}
      />

      <GlassCard>
        <GlassInput
          label="Email Address"
          placeholder="your.email@example.com"
          value={email}
          onChangeText={onChangeEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          error={error}
          leftIcon={
            <MaterialCommunityIcons
              name="email-outline"
              size={20}
              color={AUTH_GLASS.placeholder}
            />
          }
        />

        <View style={styles.infoCard}>
          <MaterialCommunityIcons
            name="information-outline"
            size={18}
            color={AUTH_GLASS.link}
            style={{ marginRight: 10, marginTop: 2 }}
          />
          <Text style={styles.infoText}>
            Tap the link in your email. Firebase verifies it, then you create a
            new password in the app. No OTP code is used.
          </Text>
        </View>
      </GlassCard>

      <View style={{ marginTop: 20 }}>
        <GlassPrimaryButton
          title={loading ? 'Sending…' : 'Send reset link'}
          onPress={() => void sendResetLink()}
          disabled={!canSubmit}
          loading={loading}
        />
        <Text style={styles.roleText}>{roleLabel} reset password</Text>
      </View>
    </AuthGlassBackground>
  );
};

const styles = StyleSheet.create({
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(117,72,245,0.18)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: AUTH_GLASS.cardBorder,
    marginTop: 4,
  },
  infoText: {
    flex: 1,
    color: AUTH_GLASS.subtitle,
    fontSize: 13,
    lineHeight: 19,
  },
  roleText: {
    marginTop: 20,
    textAlign: 'center',
    color: AUTH_GLASS.muted,
    fontSize: 13,
  },
});

export default ForgotPasswordScreen;
