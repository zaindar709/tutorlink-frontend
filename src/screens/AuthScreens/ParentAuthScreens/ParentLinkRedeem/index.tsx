import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomInput from '../../../../components/CustomInput/CustomInput';
import CustomButton from '../../../../components/CustomButton';
import BackButton from '../../../../components/BackButton/BackButton';
import useUi from '../../../../hooks/ui/useUi';
import { redeemParentLinkCode } from '../../../../services/profile/profileService';
import { getApiErrorMessage } from '../../../../utils/api/errorHandler';

const ParentLinkRedeemScreen = () => {
  const navigation = useNavigation<any>();
  const { colors, resp } = useUi();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRedeem = async () => {
    const normalizedCode = code.trim().toUpperCase();
    if (normalizedCode.length !== 6) {
      Alert.alert('Invalid code', 'Please enter the 6-character link code.');
      return;
    }

    setLoading(true);
    try {
      await redeemParentLinkCode({ code: normalizedCode });
      Alert.alert('Success', 'Student account linked successfully.');
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'MyTabs',
            params: { role: 'parent', screen: 'Home' },
          },
        ],
      });
    } catch (error) {
      Alert.alert('Link failed', getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <BackButton onPress={() => navigation.goBack()} />
      <Text style={[styles.title, { color: colors.BLACK_COLOR }]}>
        Link Student Account
      </Text>
      <Text style={styles.subtitle}>
        Enter the 6-character code shared by your child to connect accounts.
      </Text>

      <CustomInput
        label="Link Code"
        value={code}
        onChangeText={setCode}
        placeholder="ABC123"
        autoCapitalize="characters"
        maxLength={6}
      />

      <CustomButton
        title={loading ? 'Linking...' : 'Redeem Code'}
        onPress={handleRedeem}
        disabled={loading}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    padding: 20,
    paddingTop: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    color: '#64748B',
    marginBottom: 24,
    lineHeight: 22,
  },
});

export default ParentLinkRedeemScreen;
