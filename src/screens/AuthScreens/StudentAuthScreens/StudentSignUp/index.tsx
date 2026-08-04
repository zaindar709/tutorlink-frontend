import React, { useState } from 'react';
import { View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAuthForm } from '../../../../hooks/forms/useAuthForm';
import {
  AuthGlassBackground,
  AuthGlassHeader,
  AuthGlassFooter,
  GlassCard,
  GlassInput,
  GlassPrimaryButton,
  AUTH_GLASS,
} from '../../../../components/AuthGlass';

const StudentSignUpScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const role = route.params?.role;
  const [secureEntry, setSecureEntry] = useState(true);

  const { form, errors, handleChange, submit, loading } = useAuthForm(
    'signup',
    role || 'student'
  );

  return (
    <AuthGlassBackground>
      <AuthGlassHeader
        title="Create Account"
        subtitle="Join TutorLink and start your learning journey"
        onBack={() => navigation.goBack()}
      />

      <GlassCard>
        <GlassInput
          label="Full Name"
          placeholder="John Doe"
          value={form.fullName}
          onChangeText={(text: string) => handleChange('fullName', text)}
          error={errors.fullName}
          leftIcon={
            <MaterialCommunityIcons
              name="account-outline"
              size={20}
              color={AUTH_GLASS.placeholder}
            />
          }
        />
        <GlassInput
          label="Email Address"
          placeholder="student@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.email}
          onChangeText={(text: string) => handleChange('email', text)}
          error={errors.email}
          leftIcon={
            <MaterialCommunityIcons
              name="email-outline"
              size={20}
              color={AUTH_GLASS.placeholder}
            />
          }
        />
        <GlassInput
          label="Password"
          value={form.password}
          onChangeText={(text: string) => handleChange('password', text)}
          placeholder="Enter your password"
          secureTextEntry={secureEntry}
          autoCapitalize="none"
          error={errors.password}
          leftIcon={
            <MaterialCommunityIcons
              name="lock-outline"
              size={20}
              color={AUTH_GLASS.placeholder}
            />
          }
          rightIcon={
            <MaterialCommunityIcons
              name={secureEntry ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={AUTH_GLASS.placeholder}
            />
          }
          onRightIconPress={() => setSecureEntry(prev => !prev)}
        />
        <GlassInput
          label="Confirm Password"
          placeholder="Confirm password"
          secureTextEntry={secureEntry}
          autoCapitalize="none"
          value={form.confirmPassword}
          onChangeText={(text: string) => handleChange('confirmPassword', text)}
          error={errors.confirmPassword}
          leftIcon={
            <MaterialCommunityIcons
              name="lock-check-outline"
              size={20}
              color={AUTH_GLASS.placeholder}
            />
          }
        />
      </GlassCard>

      <View style={{ marginTop: 20 }}>
        <GlassPrimaryButton
          title="Create Account"
          onPress={() => {
            void submit();
          }}
          loading={loading}
        />

        <AuthGlassFooter
          prompt="Already have an account?"
          actionLabel=" Log In"
          onAction={() => navigation.navigate('StudentLoginScreen')}
        />
      </View>
    </AuthGlassBackground>
  );
};

export default StudentSignUpScreen;
