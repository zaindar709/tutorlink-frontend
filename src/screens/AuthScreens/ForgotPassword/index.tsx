import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Icon, IconButton } from 'react-native-paper';

import useUi from '../../../hooks/ui/useUi';
import CustomInput from '../../../components/CustomInput/CustomInput';
import CustomButton from '../../../components/CustomButton';
import { validateEmail } from '../../../utils/validations/authValidation';
import BackButton from '../../../components/BackButton/BackButton';
import { createStyles } from './styles';

const ForgotPasswordScreen = () => {
  const { colors, resp } = useUi();
  const styles = useMemo(() => createStyles(colors, resp), [colors, resp]);
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
    <KeyboardAvoidingView style={styles.screen} behavior="padding">
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{marginLeft: resp.dy(-8)}}>
          <BackButton onPress={() => navigation.goBack()} />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter your email to receive a 4-digit reset code
          </Text>
        </View>

        <View style={styles.formCard}>
          <CustomInput
            label="Email Address"
            placeholder="your.email@example.com"
            value={email}
            onChangeText={(text: any) => {
              setEmail(text);
              if (error) setError('');
            }}
            keyboardType="email-address"
            error={error}
            leftIcon={
              <Icon
                source="email-outline"
                size={20}
                color={colors.PLACEHOLDER_TEXTCOLOR as string}
              />
            }
          />

          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Icon
                source="information-outline"
                size={18}
                color={colors.PRIMARY_COLOR as string}
              />
            </View>
            <Text style={styles.infoText}>
              We'll send a 4-digit verification code to your email address.
              Please check your inbox and spam folder.
            </Text>
          </View>
        </View>

        <CustomButton
          title="Send Code"
          onPress={handleSendCode}
          style={styles.sendButton}
          disabled={!email.trim()}
        />

        {codeSent && (
          <Text style={styles.successText}>
            A verification code has been sent to {email}.
          </Text>
        )}

        <Text style={styles.roleText}>{roleLabel} reset password</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ForgotPasswordScreen;
