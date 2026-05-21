import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import useUi from '../../../hooks/ui/useUi';
import CustomButton from '../../../components/CustomButton';
import BackButton from '../../../components/BackButton/BackButton';
import { useVerifyCode } from '../../../hooks/auth/useVerifyCode';
import { createStyles } from './styles';

const PIN_LENGTH = 4;

const VerifyCodeScreen = () => {
  const { colors, resp } = useUi();
  const styles = useMemo(() => createStyles(colors, resp), [colors, resp]);
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
    <KeyboardAvoidingView style={styles.screen} behavior="padding">
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerRow}>
          <BackButton onPress={() => navigation.goBack()} />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.title}>Enter Code</Text>
          <Text style={styles.subtitle}>
            We sent a 4-digit code to {email || 'your email'}
          </Text>
        </View>

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
              placeholderTextColor={colors.PLACEHOLDER_TEXTCOLOR as string}
              cursorColor="black"
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

        <CustomButton
          title="Verify Code"
          onPress={handleVerify}
          disabled={!isValid}
          style={styles.verifyButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default VerifyCodeScreen;

