import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Icon } from 'react-native-paper';

import useUi from '../../../hooks/ui/useUi';
import CustomInput from '../../../components/CustomInput/CustomInput';
import CustomButton from '../../../components/CustomButton';
import BackButton from '../../../components/BackButton/BackButton';
import { validatePassword, validateConfirmPassword } from '../../../utils/validations/authValidation';
import { createStyles } from './styles';

const NewPasswordScreen = () => {
  const { colors, resp } = useUi();
  const styles = useMemo(() => createStyles(colors, resp), [colors, resp]);
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

    const confirmError = validateConfirmPassword(newPassword, confirmPassword);
    if (confirmError) {
      setConfirmError(confirmError);
      return;
    }

    // Reset password successful
    console.log('RESET PASSWORD:', { email, newPassword, role });
    
    // Navigate to SuccessScreen
    navigation.navigate('SuccessScreen', { role });
  };

  const isPasswordValid = !validatePassword(newPassword);
  const isConfirmValid = !validateConfirmPassword(newPassword, confirmPassword);
  const isFormValid = isPasswordValid && isConfirmValid;

  const buttonStyle = useMemo(() => {
    return {
      ...styles.resetButton,
      ...(isFormValid ? {} : styles.disabledButton),
    };
  }, [isFormValid, styles.resetButton, styles.disabledButton]);

  return (
    <KeyboardAvoidingView style={styles.screen} behavior="padding">
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerRow}>
          <BackButton onPress={() => navigation.goBack()} />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.title}>New Password</Text>
          <Text style={styles.subtitle}>
            Create a strong password for your account
          </Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.passwordInputContainer}>
            <Text style={styles.label}>New Password</Text>
            <CustomInput
              placeholder="Enter new password"
              value={newPassword}
              onChangeText={handleNewPasswordChange}
              secureTextEntry={!showNewPassword}
              error={passwordError}
              leftIcon={
                <Icon
                  source="lock-outline"
                  size={20}
                  color={colors.PLACEHOLDER_TEXTCOLOR as string}
                />
              }
              rightIcon={
                <Icon
                  source={showNewPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color={colors.PLACEHOLDER_TEXTCOLOR as string}
                />
              }
              onRightIconPress={() => setShowNewPassword(!showNewPassword)}
            />
          </View>

          <View style={styles.passwordInputContainer}>
            <Text style={styles.label}>Confirm New Password</Text>
            <CustomInput
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              secureTextEntry={!showConfirmPassword}
              error={confirmError}
              leftIcon={
                <Icon
                  source="lock-outline"
                  size={20}
                  color={colors.PLACEHOLDER_TEXTCOLOR as string}
                />
              }
              rightIcon={
                <Icon
                  source={showConfirmPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color={colors.PLACEHOLDER_TEXTCOLOR as string}
                />
              }
              onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
            />
          </View>

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
            <Text style={styles.requirementText}>
              Include 1 number (0-9)
            </Text>
            <Text style={styles.requirementText}>
              Include one special character (@$!%*?&)
            </Text>
          </View>
        </View>

        <CustomButton
          title="Reset Password"
          onPress={handleResetPassword}
          style={buttonStyle}
          disabled={!isFormValid}
        />

        <Text style={styles.roleText}>{roleLabel} password reset</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default NewPasswordScreen;