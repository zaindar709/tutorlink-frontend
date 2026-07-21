import React, { useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ProfileSubHeader,
  ProfileSectionCard,
  createProfileSubScreenStyles,
} from '../../../../../../components/Profile';
import useUi from '../../../../../../hooks/ui/useUi';

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
  const styles = useMemo(() => createProfileSubScreenStyles(colors), [colors]);
  const [expandedId, setExpandedId] = useState<string>('terms');

  return (
    <SafeAreaView style={styles.container}>
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
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: colors.LIGHT_PRIMARY,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12,
                    }}
                  >
                    <MaterialCommunityIcons
                      name={section.icon}
                      size={20}
                      color={colors.PRIMARY_COLOR}
                    />
                  </View>
                  <Text style={{ flex: 1, fontWeight: '700', color: '#0F172A', fontSize: 15 }}>
                    {section.title}
                  </Text>
                  <MaterialCommunityIcons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={22}
                    color="#94A3B8"
                  />
                </View>
                {expanded ? (
                  <Text style={{ marginTop: 12, color: '#64748B', lineHeight: 22, fontSize: 13 }}>
                    {section.content}
                  </Text>
                ) : null}
              </ProfileSectionCard>
            </TouchableOpacity>
          );
        })}

        <Text style={{ textAlign: 'center', color: '#94A3B8', fontSize: 12, marginTop: 8 }}>
          © 2026 TutorLink · All rights reserved
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
