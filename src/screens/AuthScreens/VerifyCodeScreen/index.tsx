import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import { useVerifyCode } from '../../../hooks/auth/useVerifyCode';
import {
  AuthGlassBackground,
  AuthGlassHeader,
  GlassCard,
  GlassPrimaryButton,
  AUTH_GLASS,
} from '../../../components/AuthGlass';

const VerifyCodeScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { email = '', role = 'student' } = route.params || {};
  const {
    digits,
    timer,
    focusedIndex,
    inputRefs,
    handleChange,
    handleKeyPress,
    handleVerify,
    handleResend,
    isValid,
    setFocusedIndex,
  } = useVerifyCode(email, role);

  return (
    <AuthGlassBackground>
      <AuthGlassHeader
        title="Enter Code"
        subtitle={`We sent a 4-digit code to ${email || 'your email'}`}
        onBack={() => navigation.goBack()}
      />

      <GlassCard>
        <Text style={styles.label}>Verification Code</Text>

        <View style={styles.codeRow}>
          {digits.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => {
                inputRefs.current[index] = ref;
              }}
              value={digit}
              onChangeText={value => handleChange(value, index)}
              onKeyPress={event => handleKeyPress(event, index)}
              onFocus={() => setFocusedIndex(index)}
              keyboardType="number-pad"
              maxLength={1}
              style={[
                styles.codeInput,
                focusedIndex === index && styles.codeInputFocused,
              ]}
              placeholderTextColor={AUTH_GLASS.placeholder}
              cursorColor={AUTH_GLASS.primary as string}
              selectionColor={AUTH_GLASS.primary as string}
              textAlign="center"
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={handleResend}
          disabled={timer > 0}
          style={styles.resendRow}
        >
          <Text style={[styles.resendText, timer === 0 && styles.resendActive]}>
            {timer > 0 ? `Resend code in ${timer}s` : 'Resend code'}
          </Text>
        </TouchableOpacity>
      </GlassCard>

      <View style={{ marginTop: 20 }}>
        <GlassPrimaryButton
          title="Verify Code"
          onPress={handleVerify}
          disabled={!isValid}
        />
      </View>
    </AuthGlassBackground>
  );
};

const styles = StyleSheet.create({
  label: {
    marginBottom: 16,
    fontSize: 13,
    fontWeight: '600',
    color: AUTH_GLASS.label,
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  codeInput: {
    width: 64,
    height: 64,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AUTH_GLASS.inputBorder,
    backgroundColor: AUTH_GLASS.inputBg,
    fontSize: 22,
    color: AUTH_GLASS.title,
    fontWeight: '700',
  },
    codeInputFocused: {
    borderColor: AUTH_GLASS.inputBorderFocus,
    backgroundColor: AUTH_GLASS.inputBg,
  },
  resendRow: {
    alignItems: 'center',
  },
  resendText: {
    color: AUTH_GLASS.muted,
    fontSize: 13,
  },
  resendActive: {
    color: AUTH_GLASS.link,
    fontWeight: '700',
  },
});

export default VerifyCodeScreen;
