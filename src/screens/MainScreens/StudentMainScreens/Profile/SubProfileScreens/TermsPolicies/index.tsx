import React, { useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { GlassScreen } from '../../../../../../components/Glass';
import {
  ProfileSubHeader,
  ProfileSectionCard,
  createProfileSubScreenStyles,
} from '../../../../../../components/Profile';
import useUi from '../../../../../../hooks/ui/useUi';
import { GLASS } from '../../../../../../theme/glass';

const POLICY_SECTIONS = [
  {
    id: 'terms',
    title: 'Terms of Service',
    icon: 'file-document-outline',
    content:
      'By using TutorLink, you agree to use the platform responsibly, respect tutors and students, and comply with local education regulations. Sessions booked through the app are subject to our cancellation and refund policies. TutorLink acts as a marketplace connecting students with independent tutors.',
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    icon: 'shield-account-outline',
    content:
      'We collect account information, learning preferences, and session data to provide our services. Profile photos and documents are stored securely and used only for verification and personalization. We do not sell personal data to third parties. You may request data export or deletion through Profile settings.',
  },
  {
    id: 'payments',
    title: 'Payments & Refunds',
    icon: 'cash-refund',
    content:
      'Wallet deposits and session payments are processed through approved payment partners. Escrow holds funds until session completion. Refunds for cancelled sessions follow the policy shown at booking time. Disputes may be reviewed by TutorLink support.',
  },
  {
    id: 'community',
    title: 'Community Guidelines',
    icon: 'account-group-outline',
    content:
      'Harassment, sharing inappropriate content, or circumventing platform payments is prohibited. Tutors must maintain professional conduct. Students should provide accurate grade and subject information. Violations may result in account suspension.',
  },
];

export default function StudentTermsPoliciesScreen({ navigation }: any) {
  const { colors } = useUi();
  const styles = useMemo(
    () => ({ ...createProfileSubScreenStyles(colors), ...policyStyles }),
    [colors]
  );
  const [expandedId, setExpandedId] = useState<string>('terms');

  return (
    <GlassScreen scroll={false} contentStyle={{ flex: 1 }}>
      <ProfileSubHeader navigation={navigation} title="Terms & Policies" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Legal information</Text>
          <Text style={styles.heroSubtitle}>
            Last updated: July 2026 · TutorLink Platform Policies
          </Text>
        </View>

        {POLICY_SECTIONS.map(section => {
          const expanded = expandedId === section.id;
          return (
            <TouchableOpacity
              key={section.id}
              onPress={() => setExpandedId(expanded ? '' : section.id)}
              activeOpacity={0.85}
            >
              <ProfileSectionCard>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.policyIcon}>
                    <MaterialCommunityIcons
                      name={section.icon}
                      size={20}
                      color={colors.PRIMARY_COLOR}
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
              </ProfileSectionCard>
            </TouchableOpacity>
          );
        })}

        <Text style={styles.footer}>© 2026 TutorLink · All rights reserved</Text>
      </ScrollView>
    </GlassScreen>
  );
}

const policyStyles = StyleSheet.create({
  policyIcon: {
    width: 40,
    height: 40,
    borderRadius: GLASS.radius.sm,
    backgroundColor: GLASS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: GLASS.space.md,
  },
  policyTitle: {
    flex: 1,
    fontWeight: '700',
    color: GLASS.textPrimary,
    fontSize: 15,
  },
  policyBody: {
    marginTop: 12,
    color: GLASS.textSecondary,
    lineHeight: 22,
    fontSize: 13,
  },
  footer: {
    textAlign: 'center',
    color: GLASS.textMuted,
    fontSize: 12,
    marginTop: 8,
  },
});
