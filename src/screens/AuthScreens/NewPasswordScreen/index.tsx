import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {
  validatePassword,
  validateConfirmPassword,
} from '../../../utils/validations/authValidation';
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
  const { email = '', role = 'student' } = route.params || {};
  const roleLabel = role === 'tutor' ? 'Tutor' : 'Student';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleNewPasswordChange = (text: string) => {
    setNewPassword(text);
    if (passwordError) setPasswordError('');
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (confirmError) setConfirmError('');
  };

  const handleResetPassword = () => {
    const newPasswordError = validatePassword(newPassword);
    if (newPasswordError) {
      setPasswordError(newPasswordError);
      return;
    }

    const confirmErr = validateConfirmPassword(newPassword, confirmPassword);
    if (confirmErr) {
      setConfirmError(confirmErr);
      return;
    }

    console.log('RESET PASSWORD:', { email, newPassword, role });
    navigation.navigate('SuccessScreen', { role });
  };

  const isPasswordValid = !validatePassword(newPassword);
  const isConfirmValid = !validateConfirmPassword(newPassword, confirmPassword);
  const isFormValid = isPasswordValid && isConfirmValid;

  const requirementStyle = useMemo(
    () => ({
      met: { color: '#86EFAC', fontWeight: '600' as const },
      base: { color: AUTH_GLASS.muted },
    }),
    []
  );

  return (
    <AuthGlassBackground>
      <AuthGlassHeader
        title="New Password"
        subtitle="Create a strong password for your account"
        onBack={() => navigation.goBack()}
      />

      <GlassCard>
        <GlassInput
          label="New Password"
          placeholder="Enter new password"
          value={newPassword}
          onChangeText={handleNewPasswordChange}
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
          onChangeText={handleConfirmPasswordChange}
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
          onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
        />

        <View style={styles.requirementsList}>
          <Text style={[styles.requirementText, requirementStyle.base]}>
            Must be at least 8 characters long
          </Text>
          <Text style={[styles.requirementText, requirementStyle.base]}>
            Include 1 uppercase letter (A-Z)
          </Text>
          <Text style={[styles.requirementText, requirementStyle.base]}>
            Include 1 lowercase letter (a-z)
          </Text>
          <Text style={[styles.requirementText, requirementStyle.base]}>
            Include 1 number (0-9)
          </Text>
          <Text style={[styles.requirementText, requirementStyle.base]}>
            Include one special character (@$!%*?&)
          </Text>
        </View>
      </GlassCard>

      <View style={{ marginTop: 20 }}>
        <GlassPrimaryButton
          title="Reset Password"
          onPress={handleResetPassword}
          disabled={!isFormValid}
        />
        <Text style={styles.roleText}>{roleLabel} password reset</Text>
      </View>
    </AuthGlassBackground>
  );
};

const styles = StyleSheet.create({
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
  },
  roleText: {
    marginTop: 20,
    textAlign: 'center',
    color: AUTH_GLASS.muted,
    fontSize: 13,
  },
});

export default NewPasswordScreen;
