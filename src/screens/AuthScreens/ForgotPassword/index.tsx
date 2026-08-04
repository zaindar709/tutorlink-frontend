import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { validateEmail } from '../../../utils/validations/authValidation';
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
  const { role = 'student' } = route.params || {};
  const roleLabel = role === 'tutor' ? 'Tutor' : 'Student';

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  const handleSendCode = () => {
    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      setCodeSent(false);
      return;
    }

    setError('');
    setCodeSent(true);
    navigation.navigate('VerifyCodeScreen', { role, email });
  };

  return (
    <AuthGlassBackground>
      <AuthGlassHeader
        title="Forgot Password?"
        subtitle="Enter your email to receive a 4-digit reset code"
        onBack={() => navigation.goBack()}
      />

      <GlassCard>
        <GlassInput
          label="Email Address"
          placeholder="your.email@example.com"
          value={email}
          onChangeText={(text: string) => {
            setEmail(text);
            if (error) setError('');
          }}
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
            We'll send a 4-digit verification code to your email address. Please
            check your inbox and spam folder.
          </Text>
        </View>
      </GlassCard>

      <View style={{ marginTop: 20 }}>
        <GlassPrimaryButton
          title="Send Code"
          onPress={handleSendCode}
          disabled={!email.trim()}
        />

        {codeSent ? (
          <Text style={styles.successText}>
            A verification code has been sent to {email}.
          </Text>
        ) : null}

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
  successText: {
    marginTop: 14,
    textAlign: 'center',
    color: '#BBF7D0',
    fontSize: 13,
  },
  roleText: {
    marginTop: 20,
    textAlign: 'center',
    color: AUTH_GLASS.muted,
    fontSize: 13,
  },
});

export default ForgotPasswordScreen;
