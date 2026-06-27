import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Switch,
  TouchableOpacity,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import useUi from '../../../../../../hooks/ui/useUi';
import CustomButton from '../../../../../../components/CustomButton';
import CustomHeader from '../../../../../../components/Tutor/CustomHeader';

const SecurityPrivacyScreen = () => {
  const { colors, resp } = useUi();
  const navigation = useNavigation<any>();

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [loginAlertsEnabled, setLoginAlertsEnabled] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader navigation={navigation} title="Security & Privacy" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <View
          style={[
            styles.heroCard,
            { backgroundColor: colors.WHITE_COLOR },
          ]}>
          <View
            style={[
              styles.heroBadge,
              {
                backgroundColor: '#E6F8F0',
              },
            ]}>
            <MaterialCommunityIcons
              name="shield-check"
              size={resp.df(18)}
              color={colors.PRIMARY_COLOR}
            />

            <Text
              style={[
                styles.heroBadgeText,
                { color: colors.PRIMARY_COLOR },
              ]}>
              Account Protected
            </Text>
          </View>

          <Text
            style={[
              styles.heroTitle,
              { color: colors.BLACK_COLOR },
            ]}>
            Keep your account secure
          </Text>

          <Text
            style={[
              styles.heroSubtitle,
              { color: colors.SECONDARY_COLOR },
            ]}>
            Your account has strong security enabled. Keep it that way by
            maintaining 2FA and using a strong password.
          </Text>
        </View>

        <Text
          style={[
            styles.sectionHeading,
            { color: colors.BLACK_COLOR },
          ]}>
          Security Features
        </Text>

        <View
          style={[
            styles.featureCard,
            { backgroundColor: colors.WHITE_COLOR },
          ]}>
          <View style={styles.featureLeft}>
            <View
              style={[
                styles.featureIcon,
                { backgroundColor: '#DBF4FF' },
              ]}>
              <MaterialCommunityIcons
                name="shield-lock-outline"
                size={resp.df(22)}
                color={colors.PRIMARY_COLOR}
              />
            </View>

            <View style={styles.featureText}>
              <Text
                style={[
                  styles.featureTitle,
                  { color: colors.BLACK_COLOR },
                ]}>
                Two-Factor Authentication
              </Text>

              <Text
                style={[
                  styles.featureSubtitle,
                  { color: colors.SECONDARY_COLOR },
                ]}>
                Extra security for your account
              </Text>
            </View>
          </View>

          <Switch
            value={twoFactorEnabled}
            onValueChange={setTwoFactorEnabled}
            trackColor={{
              false: '#E5E7EB',
              true: colors.PRIMARY_COLOR,
            }}
            thumbColor={
              twoFactorEnabled
                ? colors.WHITE_COLOR
                : '#F3F4F6'
            }
          />
        </View>

        <View
          style={[
            styles.featureCard,
            { backgroundColor: colors.WHITE_COLOR },
          ]}>
          <View style={styles.featureLeft}>
            <View
              style={[
                styles.featureIcon,
                { backgroundColor: '#FEE2E2' },
              ]}>
              <MaterialCommunityIcons
                name="bell-ring-outline"
                size={resp.df(22)}
                color={colors.RED}
              />
            </View>

            <View style={styles.featureText}>
              <Text
                style={[
                  styles.featureTitle,
                  { color: colors.BLACK_COLOR },
                ]}>
                Login Notifications
              </Text>

              <Text
                style={[
                  styles.featureSubtitle,
                  { color: colors.SECONDARY_COLOR },
                ]}>
                Get alerts for new sign-ins
              </Text>
            </View>
          </View>

          <Switch
            value={loginAlertsEnabled}
            onValueChange={setLoginAlertsEnabled}
            trackColor={{
              false: '#E5E7EB',
              true: colors.PRIMARY_COLOR,
            }}
            thumbColor={
              loginAlertsEnabled
                ? colors.WHITE_COLOR
                : '#F3F4F6'
            }
          />
        </View>

        <Text
          style={[
            styles.sectionHeading,
            { color: colors.BLACK_COLOR },
          ]}>
          Account Actions
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.actionCard,
            { backgroundColor: colors.WHITE_COLOR },
          ]}>
          <View style={styles.actionLeft}>
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: '#FEEBC8' },
              ]}>
              <MaterialCommunityIcons
                name="key-outline"
                size={resp.df(22)}
                color={colors.ORANGE_COLOR}
              />
            </View>

            <View>
              <Text
                style={[
                  styles.actionTitle,
                  { color: colors.BLACK_COLOR },
                ]}>
                Change Password
              </Text>

              <Text
                style={[
                  styles.actionSubtitle,
                  { color: colors.SECONDARY_COLOR },
                ]}>
                Update your password
              </Text>
            </View>
          </View>

          <MaterialCommunityIcons
            name="chevron-right"
            size={resp.df(22)}
            color={colors.GRAY_COLOR}
          />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.actionCard,
            { backgroundColor: colors.WHITE_COLOR },
          ]}>
          <View style={styles.actionLeft}>
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: '#DCFCE7' },
              ]}>
              <MaterialCommunityIcons
                name="devices"
                size={resp.df(22)}
                color={colors.PRIMARY_COLOR}
              />
            </View>

            <View>
              <Text
                style={[
                  styles.actionTitle,
                  { color: colors.BLACK_COLOR },
                ]}>
                Active Sessions
              </Text>

              <Text
                style={[
                  styles.actionSubtitle,
                  { color: colors.SECONDARY_COLOR },
                ]}>
                View and manage active devices
              </Text>
            </View>
          </View>

          <MaterialCommunityIcons
            name="chevron-right"
            size={resp.df(22)}
            color={colors.GRAY_COLOR}
          />
        </TouchableOpacity>

        <CustomButton
          title="Review Security Settings"
          onPress={() => {}}
          style={styles.button}
        />

        <View
          style={[
            styles.tipCard,
            {
              backgroundColor: '#FFFBEB',
              borderColor: '#FCD34D',
            },
          ]}>
          <Text
            style={[
              styles.tipTitle,
              { color: colors.BLACK_COLOR },
            ]}>
            Security Tips
          </Text>

          <Text
            style={[
              styles.tipText,
              { color: colors.SECONDARY_COLOR },
            ]}>
            • Use a strong password with at least 8 characters
          </Text>

          <Text
            style={[
              styles.tipText,
              { color: colors.SECONDARY_COLOR },
            ]}>
            • Never share your password with anyone
          </Text>

          <Text
            style={[
              styles.tipText,
              { color: colors.SECONDARY_COLOR },
            ]}>
            • Enable two-factor authentication for maximum security
          </Text>

          <Text
            style={[
              styles.tipText,
              { color: colors.SECONDARY_COLOR },
            ]}>
            • Review active sessions regularly
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SecurityPrivacyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 18,
  },

  heroCard: {
    marginTop: 20,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowRadius: 18,
    elevation: 6,
  },

  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 14,
  },

  heroBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 10,
  },

  heroSubtitle: {
    fontSize: 14,
    lineHeight: 22,
  },

  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
  },

  featureCard: {
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowRadius: 14,
    elevation: 3,
  },

  featureLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },

  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  featureText: {
    flex: 1,
  },

  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },

  featureSubtitle: {
    fontSize: 13,
    lineHeight: 20,
  },

  actionCard: {
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowRadius: 14,
    elevation: 3,
  },

  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },

  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },

  actionSubtitle: {
    fontSize: 13,
    lineHeight: 20,
  },

  button: {
    borderRadius: 20,
  },

  tipCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
  },

  tipTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },

  tipText: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
  },
});