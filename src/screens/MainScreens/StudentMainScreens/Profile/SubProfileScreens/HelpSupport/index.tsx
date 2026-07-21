import React, { useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, Alert, Linking } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ProfileSubHeader,
  ProfileSectionCard,
  createProfileSubScreenStyles,
} from '../../../../../../components/Profile';
import useUi from '../../../../../../hooks/ui/useUi';
import { MOCK_HELP_FAQS } from '../../../../../../constants/studentProfileMockData';

export default function StudentHelpSupportScreen({ navigation }: any) {
  const { colors } = useUi();
  const styles = useMemo(() => createProfileSubScreenStyles(colors), [colors]);
  const [expandedId, setExpandedId] = useState<string | null>(MOCK_HELP_FAQS[0]?.id ?? null);

  const contactOptions = [
    {
      icon: 'email-outline',
      label: 'Email support',
      sub: 'support@tutorlink.com',
      action: () => void Linking.openURL('mailto:support@tutorlink.com'),
    },
    {
      icon: 'whatsapp',
      label: 'WhatsApp',
      sub: 'Chat with our team',
      action: () => Alert.alert('WhatsApp', 'Mock — will open WhatsApp business chat.'),
    },
    {
      icon: 'phone-outline',
      label: 'Call helpline',
      sub: '+92 300 000 0000',
      action: () => Alert.alert('Helpline', 'Mock — calling will be enabled later.'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ProfileSubHeader navigation={navigation} title="Help & Support" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>How can we help?</Text>
          <Text style={styles.heroSubtitle}>
            Browse FAQs or reach out to our support team.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Contact us</Text>
        {contactOptions.map(option => (
          <TouchableOpacity key={option.label} onPress={option.action} activeOpacity={0.8}>
            <ProfileSectionCard>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    backgroundColor: colors.LIGHT_PRIMARY,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                  }}
                >
                  <MaterialCommunityIcons name={option.icon} size={22} color={colors.PRIMARY_COLOR} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', color: '#0F172A' }}>{option.label}</Text>
                  <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{option.sub}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={22} color="#94A3B8" />
              </View>
            </ProfileSectionCard>
          </TouchableOpacity>
        ))}

        <Text style={[styles.sectionLabel, { marginTop: 8 }]}>FAQs</Text>
        {MOCK_HELP_FAQS.map(faq => {
          const expanded = expandedId === faq.id;
          return (
            <TouchableOpacity
              key={faq.id}
              onPress={() => setExpandedId(expanded ? null : faq.id)}
              activeOpacity={0.85}
            >
              <ProfileSectionCard>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ flex: 1, fontWeight: '700', color: '#0F172A', fontSize: 14 }}>
                    {faq.question}
                  </Text>
                  <MaterialCommunityIcons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={22}
                    color="#94A3B8"
                  />
                </View>
                {expanded ? (
                  <Text style={{ marginTop: 10, color: '#64748B', lineHeight: 20, fontSize: 13 }}>
                    {faq.answer}
                  </Text>
                ) : null}
              </ProfileSectionCard>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
