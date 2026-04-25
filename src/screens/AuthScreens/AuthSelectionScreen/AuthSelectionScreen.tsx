import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import useUi from '../../../hooks/ui/useUi';
import AuthCard from '../../../components/AuthCard/AuthCard';
import { IconButton } from 'react-native-paper';
import { OrDivider } from '../../../components/OrDrivider/OrDivider';
import Images from '../../../assets/images';

export default function AuthSelectionScreen() {
  const { colors, resp } = useUi();
  const styles = createStyles(colors, resp);

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
      login: 'null',
      signup: 'null',
    },
    parent: {
      login: 'StudentLoginScreen',
      signup: 'StudentSignUpScreen',
    },
  };

  const currentRoutes = authRoutes[role] || authRoutes.student;

  const goLogin = () => {
    navigation.navigate(currentRoutes.login, { role });
  };

  const goSignup = () => {
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
    <View style={styles.container}>
      <View style={styles.header}>
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

        <Text style={styles.logo}>TutorLink</Text>

        <Text style={styles.title}>
          Welcome {role === 'parent' ? 'Parent' : role || 'Student'}
        </Text>

        <Text style={styles.subtitle}>
          Login or signup to continue
        </Text>
      </View>

      {/* BODY */}
      <View style={styles.body}>
        <AuthCard
          title={`Login as ${roleLabel}`}
          subtitle="Already registered"
          type="login"
          onPress={goLogin}
        />

        <OrDivider />

        <AuthCard
          title={`Signup as ${roleLabel}`}
          subtitle="Create new account"
          type="signup"
          onPress={goSignup}
        />
      </View>

      {/* TRUST SECTION */}
      <View style={styles.trustCard}>
        <View style={styles.iconBox}>
          <Image
            source={Images.VerifiedIcon}
            style={styles.icon}
            resizeMode="contain"
          />
        </View>

        <View style={styles.textBox}>
          <Text style={styles.trustTitle}>
            <Text style={{ fontWeight: '700' }}>
              {trust.title}
            </Text>{' '}
            {trust.text}
          </Text>
        </View>
      </View>
    </View>
  );
}
const createStyles = (colors: any, resp: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.WHITE_COLOR,
      padding: resp.dx(20),
    },

    header: {
      marginTop: resp.dy(40),
    },

    logo: {
      fontSize: resp.df(26),
      color: colors.PRIMARY_COLOR,
      fontWeight: '700',
    },

    title: {
      fontSize: resp.df(20),
      marginTop: resp.dy(40),
      fontWeight: '600',
    },

    subtitle: {
      marginTop: resp.dy(5),
      color: colors.TEXT_SECONDARY || '#666',
    },

    body: {
      gap: resp.dy(15),
      marginTop: resp.dy(30),
    },

    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: -15,
    },

    backText: {
      fontSize: resp.df(14),
      color: colors.BLACK_COLOR as string,
      marginLeft: -8,
      fontWeight: '500',
    },

    trustCard: {
      flexDirection: 'row',
      marginTop: resp.dx(60),
      padding: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: '#E6EAF2',
      elevation: 5,
      backgroundColor: '#fff',
      alignItems: 'flex-start',
    },

    iconBox: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: '#EEF4FF',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },

    icon: {
      width: 20,
      height: 20,
      tintColor: '#3B82F6',
    },

    textBox: {
      flex: 1,
    },

    trustTitle: {
      fontSize: 13,
      color: '#4B5563',
      lineHeight: 18,
    },
  });