import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {
  AuthGlassBackground,
  AuthGlassHeader,
  GlassCard,
  GlassPrimaryButton,
  AUTH_GLASS,
} from '../../../components/AuthGlass';

const ResetEmailSentScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { email = '', role = 'student' } = route.params || {};
  const roleLabel = role === 'tutor' ? 'Tutor' : 'Student';
  const loginScreen =
    role === 'tutor' ? 'TutorLoginScreen' : 'StudentLoginScreen';

  return (
    <AuthGlassBackground>
      <AuthGlassHeader
        title="Check your email"
        subtitle="We sent a Firebase password reset link"
        onBack={() => navigation.goBack()}
      />

      <GlassCard>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons
            name="email-check-outline"
            size={42}
            color={AUTH_GLASS.link}
          />
        </View>
        <Text style={styles.title}>Link sent to</Text>
        <Text style={styles.email}>{email || 'your email'}</Text>
        <Text style={styles.body}>
          Open the email on this phone and tap the reset link. It should open
          TutorLink so you can set a new password. Check spam if you do not see
          it.
        </Text>
      </GlassCard>

      <View style={{ marginTop: 20 }}>
        <GlassPrimaryButton
          title="Back to login"
          onPress={() => navigation.navigate(loginScreen, { role })}
        />
        <View style={{ height: 12 }} />
        <GlassPrimaryButton
          title="Resend link"
          onPress={() =>
            navigation.navigate('ForgotPasswordScreen', { role, email })
          }
        />
        <Text style={styles.roleText}>{roleLabel} password reset</Text>
      </View>
    </AuthGlassBackground>
  );
};

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    textAlign: 'center',
    color: AUTH_GLASS.subtitle,
    fontSize: 14,
  },
  email: {
    textAlign: 'center',
    color: AUTH_GLASS.title,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 12,
  },
  body: {
    color: AUTH_GLASS.subtitle,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  roleText: {
    marginTop: 20,
    textAlign: 'center',
    color: AUTH_GLASS.muted,
    fontSize: 13,
  },
});

export default ResetEmailSentScreen;
