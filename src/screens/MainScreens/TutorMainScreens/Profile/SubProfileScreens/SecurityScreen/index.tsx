import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Switch,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { GlassScreen } from '../../../../../../components/Glass';
import { GLASS } from '../../../../../../theme/glass';
import { ProfileSubHeader } from '../../../../../../components/Profile';
import useUi from '../../../../../../hooks/ui/useUi';

const POLICY_SECTIONS = [
  {
    id: 'privacy',
    title: 'Privacy Policy',
    icon: 'shield-account-outline' as const,
    accent: GLASS.primary,
    tint: GLASS.primarySoft,
    content:
      'We collect account information, teaching preferences, and session data to run TutorLink. Profile photos and documents are stored securely for verification. We do not sell personal data. You may request data export or deletion from support.',
  },
  {
    id: 'data',
    title: 'How we use your data',
    icon: 'database-outline' as const,
    accent: '#0EA5E9',
    tint: '#E0F2FE',
    content:
      'Your profile, subjects, and availability help students find you. Booking and payout details are shared only as needed to complete sessions and withdrawals. Analytics are aggregated and anonymized where possible.',
  },
  {
    id: 'payments',
    title: 'Payments & payouts',
    icon: 'cash-check' as const,
    accent: '#16A34A',
    tint: '#DCFCE7',
    content:
      'Earnings and withdrawals use encrypted payment partners. Escrow holds student funds until session completion. Platform fees and payout timelines are shown in Earnings. Never share OTP or PIN with anyone claiming to be TutorLink.',
  },
];

const SECURITY_TIPS = [
  'Use a strong password with at least 8 characters',
  'Never share your password or OTP with anyone',
  'Keep two-factor authentication enabled',
  'Review active sessions regularly',
];

const SecurityPrivacyScreen = () => {
  const { resp } = useUi();
  const styles = useMemo(() => createStyles(resp), [resp]);
  const navigation = useNavigation<any>();

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [loginAlertsEnabled, setLoginAlertsEnabled] = useState(true);
  const [expandedId, setExpandedId] = useState('privacy');

  return (
    <GlassScreen
      scroll={false}
      edges={['top', 'left', 'right']}
      contentStyle={styles.screen}
    >
      <ProfileSubHeader navigation={navigation} title="Security & Privacy" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.intro}>
          Control sign-in protection and review how TutorLink handles your
          tutor data.
        </Text>

        <View style={styles.secureRow}>
          <View style={styles.securePill}>
            <MaterialCommunityIcons
              name="shield-check"
              size={14}
              color={GLASS.success}
            />
            <Text style={[styles.secureText, { color: GLASS.success }]}>
              Account protected
            </Text>
          </View>
          <View style={styles.securePill}>
            <MaterialCommunityIcons
              name="lock-outline"
              size={14}
              color={GLASS.primary}
            />
            <Text style={[styles.secureText, { color: GLASS.primary }]}>
              Encrypted sessions
            </Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Security features</Text>

        <View style={styles.toggleCard}>
          <View style={[styles.featureIcon, { backgroundColor: '#DBF4FF' }]}>
            <MaterialCommunityIcons
              name="shield-lock-outline"
              size={22}
              color={GLASS.primary}
            />
          </View>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Two-factor authentication</Text>
            <Text style={styles.featureSubtitle}>
              Extra security when signing in
            </Text>
          </View>
          <Switch
            value={twoFactorEnabled}
            onValueChange={setTwoFactorEnabled}
            trackColor={{ false: '#E5E7EB', true: GLASS.primary }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.toggleCard}>
          <View style={[styles.featureIcon, { backgroundColor: '#FEE2E2' }]}>
            <MaterialCommunityIcons
              name="bell-ring-outline"
              size={22}
              color="#DC2626"
            />
          </View>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Login notifications</Text>
            <Text style={styles.featureSubtitle}>
              Alerts for new device sign-ins
            </Text>
          </View>
          <Switch
            value={loginAlertsEnabled}
            onValueChange={setLoginAlertsEnabled}
            trackColor={{ false: '#E5E7EB', true: GLASS.primary }}
            thumbColor="#fff"
          />
        </View>

        <Text style={styles.sectionLabel}>Account actions</Text>

        <TouchableOpacity activeOpacity={0.88} style={styles.actionCard}>
          <View style={[styles.featureIcon, { backgroundColor: '#FEEBC8' }]}>
            <MaterialCommunityIcons
              name="key-outline"
              size={22}
              color="#D97706"
            />
          </View>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Change password</Text>
            <Text style={styles.featureSubtitle}>Update your sign-in password</Text>
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={22}
            color={GLASS.textMuted}
          />
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.88} style={styles.actionCard}>
          <View style={[styles.featureIcon, { backgroundColor: '#DCFCE7' }]}>
            <MaterialCommunityIcons
              name="devices"
              size={22}
              color={GLASS.success}
            />
          </View>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Active sessions</Text>
            <Text style={styles.featureSubtitle}>
              View and manage signed-in devices
            </Text>
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={22}
            color={GLASS.textMuted}
          />
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>Privacy policy</Text>

        {POLICY_SECTIONS.map(section => {
          const expanded = expandedId === section.id;
          return (
            <TouchableOpacity
              key={section.id}
              activeOpacity={0.88}
              onPress={() => setExpandedId(expanded ? '' : section.id)}
              style={[
                styles.policyCard,
                expanded && styles.policyCardExpanded,
              ]}
            >
              <View style={styles.policyHeader}>
                <View
                  style={[styles.featureIcon, { backgroundColor: section.tint }]}
                >
                  <MaterialCommunityIcons
                    name={section.icon}
                    size={22}
                    color={section.accent}
                  />
                </View>
                <Text style={styles.policyTitle}>{section.title}</Text>
                <MaterialCommunityIcons
                  name={expanded ? 'chevron-up' : 'chevron-down'}
                  size={22}
                  color={GLASS.textMuted}
                />
              </View>
              {expanded ? (
                <Text style={styles.policyBody}>{section.content}</Text>
              ) : null}
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity activeOpacity={0.9} style={styles.ctaWrap}>
          <LinearGradient
            colors={[...GLASS.buttonGradient]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaBtn}
          >
            <MaterialCommunityIcons
              name="shield-check-outline"
              size={18}
              color="#fff"
            />
            <Text style={styles.ctaText}>Review security settings</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>Security tips</Text>
        <View style={styles.tipCard}>
          {SECURITY_TIPS.map((tip, index) => (
            <View
              key={tip}
              style={[
                styles.tipRow,
                index < SECURITY_TIPS.length - 1 && styles.tipDivider,
              ]}
            >
              <View style={styles.tipBullet}>
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={16}
                  color={GLASS.primary}
                />
              </View>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>© 2026 TutorLink · All rights reserved</Text>
      </ScrollView>
    </GlassScreen>
  );
};

export default SecurityPrivacyScreen;

const createStyles = (resp: any) =>
  StyleSheet.create({
    screen: { flex: 1 },
    content: {
      paddingHorizontal: resp.dx(16),
      paddingTop: resp.dy(12),
      paddingBottom: resp.dy(40),
    },
    intro: {
      color: GLASS.textSecondary,
      fontSize: 13,
      lineHeight: 19,
      marginBottom: 12,
    },
    secureRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 18,
    },
    securePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: GLASS.cardBgStrong,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 7,
    },
    secureText: {
      fontSize: 11,
      fontWeight: '700',
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: GLASS.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginBottom: 10,
      marginTop: 4,
    },
    toggleCard: {
      borderRadius: GLASS.radius.xl,
      padding: 14,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: GLASS.cardBgStrong,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      marginBottom: 10,
      ...GLASS.shadow.soft,
    },
    actionCard: {
      borderRadius: GLASS.radius.xl,
      padding: 14,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: GLASS.cardBgStrong,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      marginBottom: 10,
      ...GLASS.shadow.soft,
    },
    featureIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
    },
    featureText: {
      flex: 1,
      marginLeft: 12,
      marginRight: 8,
      minWidth: 0,
    },
    featureTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: GLASS.textPrimary,
      marginBottom: 2,
    },
    featureSubtitle: {
      fontSize: 12,
      lineHeight: 17,
      color: GLASS.textSecondary,
      fontWeight: '600',
    },
    policyCard: {
      borderRadius: GLASS.radius.xl,
      padding: 14,
      backgroundColor: GLASS.cardBgStrong,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      marginBottom: 10,
      ...GLASS.shadow.soft,
    },
    policyCardExpanded: {
      borderColor: GLASS.cardBorderStrong,
      backgroundColor: GLASS.primarySoft,
    },
    policyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    policyTitle: {
      flex: 1,
      marginLeft: 12,
      fontSize: 15,
      fontWeight: '800',
      color: GLASS.textPrimary,
    },
    policyBody: {
      marginTop: 12,
      marginLeft: 56,
      fontSize: 13,
      lineHeight: 20,
      color: GLASS.textSecondary,
      fontWeight: '500',
    },
    ctaWrap: {
      marginTop: 8,
      marginBottom: 18,
      ...GLASS.shadow.medium,
    },
    ctaBtn: {
      height: 52,
      borderRadius: GLASS.radius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    ctaText: {
      color: '#fff',
      fontWeight: '800',
      fontSize: 15,
    },
    tipCard: {
      borderRadius: GLASS.radius.xl,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      backgroundColor: GLASS.cardBgStrong,
      overflow: 'hidden',
      ...GLASS.shadow.soft,
    },
    tipRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    tipDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: GLASS.cardBorder,
    },
    tipBullet: {
      width: 28,
      height: 28,
      borderRadius: 10,
      backgroundColor: GLASS.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 1,
    },
    tipText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 19,
      color: GLASS.textSecondary,
      fontWeight: '600',
    },
    footer: {
      textAlign: 'center',
      color: GLASS.textMuted,
      fontSize: 12,
      marginTop: 20,
    },
  });
