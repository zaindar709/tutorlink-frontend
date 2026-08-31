import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { useResetPassword } from '../../../hooks/auth/useResetPassword';
import {
  AuthGlassBackground,
  AuthGlassHeader,
  GlassCard,
  GlassInput,
  GlassPrimaryButton,
  AUTH_GLASS,
} from '../../../components/AuthGlass';

const NewPasswordScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {
    email: routeEmail = '',
    role: routeRole = 'student',
    oobCode: routeOobCode = '',
  } = route.params || {};

  const {
    email,
    role,
    newPassword,
    confirmPassword,
    passwordError,
    confirmError,
    formError,
    verifyingLink,
    submitting,
    showNewPassword,
    showConfirmPassword,
    setShowNewPassword,
    setShowConfirmPassword,
    onChangeNewPassword,
    onChangeConfirmPassword,
    submitNewPassword,
    isFormValid,
  } = useResetPassword({
    email: routeEmail,
    role: routeRole,
    oobCode: routeOobCode,
  });

  const roleLabel = role === 'tutor' ? 'Tutor' : 'Student';

  return (
    <AuthGlassBackground>
      <AuthGlassHeader
        title="New Password"
        subtitle={
          verifyingLink
            ? 'Verifying your Firebase reset link…'
            : email
              ? `Create a new password for ${email}`
              : 'Create a strong password for your account'
        }
        onBack={() => navigation.goBack()}
      />

      {verifyingLink ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={AUTH_GLASS.link} size="large" />
          <Text style={styles.loadingText}>Verifying email link…</Text>
        </View>
      ) : (
        <GlassCard>
          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          <GlassInput
            label="New Password"
            placeholder="Enter new password"
            value={newPassword}
            onChangeText={onChangeNewPassword}
            secureTextEntry={!showNewPassword}
            autoCapitalize="none"
            error={passwordError}
            leftIcon={
              <MaterialCommunityIcons
                name="lock-outline"
                size={20}
                color={AUTH_GLASS.placeholder}
              />
            }
            rightIcon={
              <MaterialCommunityIcons
                name={showNewPassword ? 'eye' : 'eye-off'}
                size={20}
                color={AUTH_GLASS.placeholder}
              />
            }
            onRightIconPress={() => setShowNewPassword(!showNewPassword)}
          />

          <GlassInput
            label="Confirm New Password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChangeText={onChangeConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            error={confirmError}
            leftIcon={
              <MaterialCommunityIcons
                name="lock-check-outline"
                size={20}
                color={AUTH_GLASS.placeholder}
              />
            }
            rightIcon={
              <MaterialCommunityIcons
                name={showConfirmPassword ? 'eye' : 'eye-off'}
                size={20}
                color={AUTH_GLASS.placeholder}
              />
            }
            onRightIconPress={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
          />

          <View style={styles.requirementsList}>
            <Text style={styles.requirementText}>
              Must be at least 8 characters long
            </Text>
            <Text style={styles.requirementText}>
              Include 1 uppercase letter (A-Z)
            </Text>
            <Text style={styles.requirementText}>
              Include 1 lowercase letter (a-z)
            </Text>
            <Text style={styles.requirementText}>Include 1 number (0-9)</Text>
            <Text style={styles.requirementText}>
              Include one special character (@$!%*?&)
            </Text>
          </View>
        </GlassCard>
      )}

      <View style={{ marginTop: 20 }}>
        <GlassPrimaryButton
          title={submitting ? 'Updating…' : 'Update'}
          onPress={() => void submitNewPassword()}
          disabled={!isFormValid}
          loading={submitting}
        />
        <Text style={styles.roleText}>{roleLabel} password reset</Text>
      </View>
    </AuthGlassBackground>
  );
};

const styles = StyleSheet.create({
  loadingWrap: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    color: AUTH_GLASS.subtitle,
    fontSize: 14,
  },
  formError: {
    color: '#FCA5A5',
    fontSize: 13,
    marginBottom: 10,
    lineHeight: 18,
  },
  requirementsList: {
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: 14,
    padding: 14,
    marginTop: 4,
    borderWidth: 1,
    borderColor: AUTH_GLASS.cardBorder,
  },
  requirementText: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 6,
    color: AUTH_GLASS.muted,
  },
  roleText: {
    marginTop: 20,
    textAlign: 'center',
    color: AUTH_GLASS.muted,
    fontSize: 13,
  },
});

export default NewPasswordScreen;
