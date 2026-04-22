import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useUi from '../../../../ui/useUi';
import CustomInput from '../../../../components/CustomInput/CustomInput';
import CustomButton from '../../../../components/CustomButton';
import { IconButton } from 'react-native-paper';

const StudentSignUpScreen = () => {
  const { colors, resp } = useUi();
  const styles = useMemo(() => createStyles(colors, resp), [colors, resp]);
  const navigation = useNavigation<any>();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleNext = () => {
    navigation.navigate('StudentSubjectSelection');
  };

  const handleLogin = () => {
    navigation.navigate('StudentLoginScreen');
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join TutorLink and start your learning journey
          </Text>
        </View>

        <View style={styles.formCard}>
          <CustomInput
            label="Full Name"
            placeholder="John Doe"
            value={fullName}
            onChangeText={setFullName}
            style={styles.inputField}
          />

          <CustomInput
            label="Email Address"
            placeholder="student@example.com"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={styles.inputField}
          />

          <CustomInput
            label="Password"
            placeholder="Enter your password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.inputField}
          />

          <Text style={styles.passwordHint}>
            Must be at least 8 characters long
          </Text>
        </View>

        <CustomButton
          title="Next"
          onPress={handleNext}
          style={styles.nextButton}
        />

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={handleLogin}>
            <Text style={styles.footerLink}> Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default StudentSignUpScreen;

const createStyles = (colors: any, resp: any) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.CULTURED_GRAY,
    },
    container: {
      paddingTop: resp.dy(40),
      paddingHorizontal: resp.dx(24),
      paddingBottom: resp.dy(30),
      backgroundColor: colors.CULTURED_GRAY,
    },
    brandHeader: {
      marginBottom: resp.dy(30),
    },
    brandTitle: {
      fontSize: resp.df(28),
      fontWeight: '700',
      color: colors.PRIMARY_COLOR,
    },
    brandAccent: {
      width: resp.dx(60),
      height: resp.dy(4),
      borderRadius: resp.dxy(4),
      marginTop: resp.dy(10),
      backgroundColor: colors.PRIMARY_COLOR,
    },
    headerContent: {
      marginBottom: resp.dy(24),
    },
    title: {
      fontSize: resp.df(24),
      fontWeight: '700',
      color: colors.BLACK_COLOR,
      marginBottom: resp.dy(8),
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
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 4,
    },
    inputField: {
      marginBottom: resp.dy(16),
    },
    passwordHint: {
      color: colors.GRAY_COLOR,
      fontSize: resp.df(13),
      fontWeight: '400',
      marginTop: resp.dy(-8),
      paddingLeft: resp.dx(2),
    },
    nextButton: {
      marginBottom: resp.dy(24),
      width: resp.dx(380),
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    footerText: {
      color: colors.GRAY_COLOR,
      fontSize: resp.df(13),
    },
    footerLink: {
      color: colors.PRIMARY_COLOR,
      fontSize: resp.df(13),
      fontWeight: '700',
    },
    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: -15,
      marginTop: resp.dy(20),
    },

    backText: {
      fontSize: resp.df(14),
      color: colors.BLACK_COLOR as string,
      marginLeft: -8,
      fontWeight: '500',
    },
  });
