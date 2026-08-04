import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

import AuthCard from '../../../components/AuthCard/AuthCard';
import Images from '../../../assets/images';
import {
  AuthGlassBackground,
  AuthGlassHeader,
  AuthGlassDivider,
  GlassCard,
  AUTH_GLASS,
} from '../../../components/AuthGlass';

export default function AuthSelectionScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const { role } = route.params || {};
  const roleLabel =
    role === 'tutor' ? 'Tutor' : role === 'parent' ? 'Parent' : 'Student';

  const authRoutes: Record<string, { login: string; signup: string }> = {
    student: {
      login: 'StudentLoginScreen',
      signup: 'StudentSignUpScreen',
    },
    tutor: {
      login: 'TutorLoginScreen',
      signup: 'TutorSignUpScreen',
    },
    parent: {
      login: 'StudentLoginScreen',
      signup: 'StudentSignUpScreen',
    },
  };

  const currentRoutes = authRoutes[role] || authRoutes.student;

  const goLogin = () => {
    if (!currentRoutes.login) return;
    navigation.navigate(currentRoutes.login, { role });
  };

  const goSignup = () => {
    if (!currentRoutes.signup) return;
    navigation.navigate(currentRoutes.signup, { role });
  };

  const getTrustContent = () => {
    switch (role) {
      case 'tutor':
        return {
          title: 'Secure & Verified:',
          text: 'All tutor accounts undergo a strict verification process.',
        };

      case 'parent':
        return {
          title: 'Safe & Trusted:',
          text: 'Parents can connect with verified tutors safely.',
        };

      case 'student':
        return {
          title: 'Learn with Confidence:',
          text: 'Find verified tutors and stay supported throughout your learning journey.',
        };

      default:
        return {
          title: 'Safe & Trusted:',
          text: 'Get started with a secure and trusted learning experience.',
        };
    }
  };

  const trust = getTrustContent();

  return (
    <AuthGlassBackground>
      <AuthGlassHeader
        title={`Welcome ${role === 'parent' ? 'Parent' : role || 'Student'}`}
        subtitle="Login or signup to continue"
        onBack={() => navigation.goBack()}
      />

      <View style={styles.body}>
        <AuthCard
          title={`Login as ${roleLabel}`}
          subtitle="Already registered"
          type="login"
          onPress={goLogin}
        />

        <AuthGlassDivider label="or" />

        <AuthCard
          title={`Signup as ${roleLabel}`}
          subtitle="Create new account"
          type="signup"
          onPress={goSignup}
        />
      </View>

      <GlassCard style={styles.trustWrap}>
        <View style={styles.trustRow}>
          <View style={styles.iconBox}>
            <Image
              source={Images.VerifiedIcon}
              style={styles.icon}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.trustTitle}>
            <Text style={{ fontWeight: '700', color: AUTH_GLASS.link }}>
              {trust.title}
            </Text>{' '}
            {trust.text}
          </Text>
        </View>
      </GlassCard>
    </AuthGlassBackground>
  );
}

const styles = StyleSheet.create({
  body: {
    marginTop: 8,
  },
  trustWrap: {
    marginTop: 28,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: AUTH_GLASS.orbPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: AUTH_GLASS.cardBorder,
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: AUTH_GLASS.link,
  },
  trustTitle: {
    flex: 1,
    fontSize: 13,
    color: AUTH_GLASS.subtitle,
    lineHeight: 19,
  },
});
