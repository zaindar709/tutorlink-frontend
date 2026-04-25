import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { IconButton } from 'react-native-paper';
import useUi from '../../../../hooks/ui/useUi';
import useStudentSignUpForm from '../../../../hooks/forms/useStudentSignUpForm';
import CustomInput from '../../../../components/CustomInput/CustomInput';
import CustomButton from '../../../../components/CustomButton';

const StudentSignUpScreen = () => {
  const { colors, resp } = useUi();
  const navigation = useNavigation<any>();

  const styles = useMemo(() => createStyles(colors, resp), [colors, resp]);

  const {
   fullName,
    email,
    password,
    confirmPassword,
    errors,
    handleFullName,
    handleEmail,
    handlePassword,
    handleConfirmPassword,
    handleNext,
  } = useStudentSignUpForm();

  return (
    <KeyboardAvoidingView style={styles.screen} behavior="padding">
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* Back Button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <IconButton icon="arrow-left" size={18} iconColor={colors.BLACK_COLOR  as string} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.brandHeader}>
          <Text style={styles.brandTitle}>TutorLink</Text>
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join TutorLink and start your learning journey
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formCard}>
          <CustomInput
            label="Full Name"
            placeholder="John Doe"
            value={fullName}
            onChangeText={handleFullName}
            error={errors.fullName}
          />

          <CustomInput
            label="Email Address"
            placeholder="student@example.com"
            keyboardType="email-address"
            value={email}
            onChangeText={handleEmail}
            error={errors.email}
          />

          <CustomInput
            label="Password"
            placeholder="Enter password"
            secureTextEntry
            value={password}
            onChangeText={handlePassword}
            error={errors.password}
          />

          <CustomInput
            label="Confirm Password"
            placeholder="Confirm password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={handleConfirmPassword}
            error={errors.confirmPassword}
          />
        </View>

        {/* Button */}
        <CustomButton title="Next" onPress={handleNext} />

        {/* Login */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('StudentLoginScreen')}>
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
    nextButton: {
      marginBottom: resp.dy(24),
      width: resp.dx(380),
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: resp.dy(16),
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
