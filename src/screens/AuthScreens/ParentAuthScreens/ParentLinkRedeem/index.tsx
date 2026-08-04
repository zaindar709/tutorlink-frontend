import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../../../../components/CustomButton';
import {
  AuthGlassBackground,
  AuthGlassHeader,
  GlassCard,
  GlassInput,
} from '../../../../components/AuthGlass';
import { redeemParentLinkCode } from '../../../../services/profile/profileService';
import { getApiErrorMessage } from '../../../../utils/api/errorHandler';

const ParentLinkRedeemScreen = () => {
  const navigation = useNavigation<any>();
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
    <AuthGlassBackground>
      <AuthGlassHeader
        title="Link Student Account"
        subtitle="Enter the 6-character code shared by your child to connect accounts."
        onBack={() => navigation.goBack()}
      />

      <GlassCard>
        <GlassInput
          label="Link Code"
          value={code}
          onChangeText={setCode}
          placeholder="ABC123"
          autoCapitalize="characters"
          maxLength={6}
        />

        <View style={styles.buttonWrap}>
          <CustomButton
            title={loading ? 'Linking...' : 'Redeem Code'}
            onPress={handleRedeem}
            disabled={loading}
          />
        </View>
      </GlassCard>
    </AuthGlassBackground>
  );
};

const styles = StyleSheet.create({
  buttonWrap: {
    marginTop: 8,
  },
});

export default ParentLinkRedeemScreen;
