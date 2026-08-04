import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Linking,
  StyleSheet,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { GlassScreen } from '../../../../../../components/Glass';
import {
  ProfileSubHeader,
  ProfileSectionCard,
  createProfileSubScreenStyles,
} from '../../../../../../components/Profile';
import useUi from '../../../../../../hooks/ui/useUi';
import { GLASS } from '../../../../../../theme/glass';
import { MOCK_HELP_FAQS } from '../../../../../../constants/studentProfileMockData';

export default function StudentHelpSupportScreen({ navigation }: any) {
  const { colors } = useUi();
  const styles = useMemo(
    () => ({ ...createProfileSubScreenStyles(colors), ...localStyles }),
    [colors]
  );
  const [expandedId, setExpandedId] = useState<string | null>(
    MOCK_HELP_FAQS[0]?.id ?? null
  );

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
      action: () =>
        Alert.alert('WhatsApp', 'Mock — will open WhatsApp business chat.'),
    },
    {
      icon: 'phone-outline',
      label: 'Call helpline',
      sub: '+92 300 000 0000',
      action: () =>
        Alert.alert('Helpline', 'Mock — calling will be enabled later.'),
    },
  ];

  return (
    <GlassScreen scroll={false} contentStyle={{ flex: 1 }}>
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
          <TouchableOpacity
            key={option.label}
            onPress={option.action}
            activeOpacity={0.8}
          >
            <ProfileSectionCard>
              <View style={localStyles.row}>
                <View style={localStyles.contactIcon}>
                  <MaterialCommunityIcons
                    name={option.icon}
                    size={22}
                    color={colors.PRIMARY_COLOR}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={localStyles.contactLabel}>{option.label}</Text>
                  <Text style={localStyles.contactSub}>{option.sub}</Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={22}
                  color={GLASS.textMuted}
                />
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
                <View style={localStyles.row}>
                  <Text style={localStyles.faqQuestion}>{faq.question}</Text>
                  <MaterialCommunityIcons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={22}
                    color={GLASS.textMuted}
                  />
                </View>
                {expanded ? (
                  <Text style={localStyles.faqAnswer}>{faq.answer}</Text>
                ) : null}
              </ProfileSectionCard>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </GlassScreen>
  );
}

const localStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  contactIcon: {
    width: 42,
    height: 42,
    borderRadius: GLASS.radius.sm,
    backgroundColor: GLASS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: GLASS.space.md,
  },
  contactLabel: { fontWeight: '700', color: GLASS.textPrimary },
  contactSub: { fontSize: 12, color: GLASS.textSecondary, marginTop: 2 },
  faqQuestion: {
    flex: 1,
    fontWeight: '700',
    color: GLASS.textPrimary,
    fontSize: 14,
  },
  faqAnswer: {
    marginTop: 10,
    color: GLASS.textSecondary,
    lineHeight: 20,
    fontSize: 13,
  },
});
