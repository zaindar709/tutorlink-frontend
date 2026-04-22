import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
} from 'react-native';
import { Icon, IconButton } from 'react-native-paper';

import useUi from '../../../ui/useUi';
import CustomButton from '../../../components/CustomButton';
import { useNavigation } from '@react-navigation/native';

const StudentLoginScreen = () => {
  const { colors, resp } = useUi();
  const styles = useMemo(() => createStyles(colors, resp), [colors, resp]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [secureEntry, setSecureEntry] = useState(true);
  const navigation = useNavigation<any>();

  const handleLogin = () => {
    console.log('Login tapped', { email, password, rememberMe });
  };

  const handleForgotPassword = () => {
    console.log('Forgot password tapped');
  };

  const handleContinueWithGoogle = () => {
    console.log('Continue with Google tapped');
  };

  const handleContinueWithApple = () => {
    console.log('Continue with Apple tapped');
  };

  const handleSignup = () => {
    console.log('Signup tapped');
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
          <Text style={styles.title}>Student Login</Text>
          <Text style={styles.subtitle}>
            Sign in to continue your learning journey
          </Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email Address</Text>
            <View style={styles.inputRow}>
              <View style={styles.iconWrapper}>
                <Icon
                  source="email-outline"
                  size={resp.df(18)}
                  color={colors.PLACEHOLDER_TEXTCOLOR as string}
                />
              </View>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="student@example.com"
                placeholderTextColor="#8C8C8C"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Password</Text>
            <View style={styles.inputRow}>
              <View style={styles.iconWrapper}>
                <Icon
                  source="lock-outline"
                  size={resp.df(18)}
                  color={colors.PLACEHOLDER_TEXTCOLOR as string}
                />
              </View>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#8C8C8C"
                secureTextEntry={secureEntry}
                autoCapitalize="none"
                style={styles.input}
              />
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setSecureEntry(prev => !prev)}
                style={styles.actionIcon}
              >
                <Icon
                  source={secureEntry ? 'eye-off-outline' : 'eye-outline'}
                  size={resp.df(18)}
                  color={colors.PLACEHOLDER_TEXTCOLOR as string}
                />
              </TouchableOpacity>
            </View>
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
          onPress={handleLogin}
          style={styles.loginButton}
        />

        <View style={styles.orContainer}>
          <View style={styles.orLine} />
          <Text style={styles.orLabel}>OR</Text>
          <View style={styles.orLine} />
        </View>

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

const createStyles = (colors: any, resp: any) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.BACKGROUND,
    },
    container: {
      paddingHorizontal: resp.dx(24),
      paddingTop: resp.dy(40),
      paddingBottom: resp.dy(30),
      backgroundColor:colors.BACKGROUND,
    },
    brandHeader: {
      marginBottom: resp.dy(32),
      marginTop: resp.dy(0),
    },
    brandTitle: {
      fontSize: resp.df(28),
      fontWeight: '700',
      color: colors.PRIMARY_COLOR,
    },
    brandAccent: {
      width: resp.dx(64),
      height: resp.dy(4),
      borderRadius: resp.dxy(4),
      marginTop: resp.dy(10),
      backgroundColor: colors.PRIMARY_COLOR,
    },
    headerContent: {
      marginBottom: resp.dy(28),
    },
    title: {
      fontSize: resp.df(24),
      fontWeight: '700',
      color: colors.BLACK_COLOR,
      marginTop: resp.dy(10),
    },
    subtitle: {
      fontSize: resp.df(15),
      lineHeight: resp.dy(22),
      color: colors.GRAY_COLOR,
    },
    formCard: {
      backgroundColor: colors.WHITE_COLOR,
      borderRadius: resp.dxy(24),
      padding: resp.dx(20),
      marginBottom: resp.dy(24),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.05,
      shadowRadius: 16,
      elevation: 4,
    },
    fieldGroup: {
      marginBottom: resp.dy(18),
    },
    fieldLabel: {
      marginBottom: resp.dy(10),
      fontSize: resp.df(14),
      color: colors.BLACK_COLOR,
      fontWeight: '600',
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: resp.dxy(16),
      borderWidth: 1,
      borderColor: '#E5E7EB',
      backgroundColor: '#fff',
      paddingHorizontal: resp.dx(14),
      height: resp.dy(52),
    },
    iconWrapper: {
      marginRight: resp.dx(12),
    },
    actionIcon: {
      marginLeft: resp.dx(12),
    },
    input: {
      flex: 1,
      height: '100%',
      color: colors.BLACK_COLOR,
      fontSize: resp.df(15),
    },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: resp.dy(4),
    },
    rememberRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    checkbox: {
      width: resp.dy(18),
      height: resp.dy(18),
      borderRadius: resp.dxy(6),
      borderWidth: 1,
      borderColor: '#CBD5E1',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: resp.dx(8),
    },
    checkboxSelected: {
      borderColor: colors.PRIMARY_COLOR,
      backgroundColor: colors.PRIMARY_COLOR,
    },
    checkboxDot: {
      width: resp.dy(8),
      height: resp.dy(8),
      borderRadius: resp.dxy(4),
      backgroundColor: colors.WHITE_COLOR,
    },
    rememberText: {
      fontSize: resp.df(13),
      color: colors.GRAY_COLOR,
    },
    forgotText: {
      fontSize: resp.df(13),
      color: colors.PRIMARY_COLOR,
      fontWeight: '600',
    },
    loginButton: {
      marginBottom: resp.dy(18),
    },
    orContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: resp.dy(18),
    },
    orLine: {
      flex: 1,
      height: 1,
      backgroundColor: '#E5E7EB',
    },
    orLabel: {
      color: colors.GRAY_COLOR,
      fontSize: resp.df(13),
      fontWeight: '600',
    },
    socialButton: {
      marginBottom: resp.dy(12),
    },
    appleButton: {
      backgroundColor: colors.BLACK_COLOR,
    },
    socialButtonText: {
      fontWeight: '600',
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: resp.dy(8),
    },
    footerText: {
      color: colors.GRAY_COLOR,
      fontSize: resp.df(13),
    },
    footerAction: {
      color: colors.PRIMARY_COLOR,
      fontSize: resp.df(13),
      fontWeight: '700',
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
  });
