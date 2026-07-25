import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ProfileSubHeader,
  ProfileSectionCard,
  ProfileEmptyState,
  createProfileSubScreenStyles,
} from '../../../../../../components/Profile';
import useUi from '../../../../../../hooks/ui/useUi';
import { useCertificates } from '../../../../../../hooks/api/useStudentLearning';

export default function StudentCertificatesScreen({ navigation }: any) {
  const { colors } = useUi();
  const styles = useMemo(() => createProfileSubScreenStyles(colors), [colors]);
  const [filter, setFilter] = useState<'all' | 'recent'>('all');
  const { certificates, loading, error, download } = useCertificates(filter);

  const onDownload = async (id: string) => {
    const url = await download(id);
    if (!url) {
      Alert.alert('Download failed', error || 'Could not get certificate URL.');
      return;
    }
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ProfileSubHeader navigation={navigation} title="Certificates" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Your achievements</Text>
          <Text style={styles.heroSubtitle}>
            Certificates earned from completed learning milestones with tutors.
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {(['all', 'recent'] as const).map(key => (
            <TouchableOpacity
              key={key}
              onPress={() => setFilter(key)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: filter === key ? colors.PRIMARY_COLOR : '#fff',
                borderWidth: 1,
                borderColor: filter === key ? colors.PRIMARY_COLOR : '#E2E8F0',
              }}
            >
              <Text
                style={{
                  color: filter === key ? '#fff' : '#64748B',
                  fontWeight: '600',
                  fontSize: 13,
                }}
              >
                {key === 'all' ? 'All' : 'Recent'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? (
          <Text style={{ color: '#DC2626', marginBottom: 12, fontSize: 12 }}>
            {error}
          </Text>
        ) : null}

        {loading ? (
          <ActivityIndicator color={colors.PRIMARY_COLOR} />
        ) : certificates.length === 0 ? (
          <ProfileEmptyState
            icon="certificate-outline"
            title="No certificates yet"
            message="Complete sessions and milestones to earn certificates from your tutors."
          />
        ) : (
          certificates.map(cert => (
            <TouchableOpacity
              key={cert.id}
              activeOpacity={0.85}
              onPress={() => void onDownload(cert.id)}
            >
              <ProfileSectionCard>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      backgroundColor: colors.LIGHT_PRIMARY,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="certificate"
                      size={24}
                      color={colors.PRIMARY_COLOR}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: '700',
                        color: '#0F172A',
                      }}
                    >
                      {cert.title}
                    </Text>
                    <Text
                      style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}
                    >
                      {cert.subject} · {cert.tutorName}
                    </Text>
                    <View
                      style={{ flexDirection: 'row', marginTop: 10, gap: 8 }}
                    >
                      <View
                        style={{
                          backgroundColor: '#ECFDF5',
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 8,
                        }}
                      >
                        <Text
                          style={{
                            color: '#059669',
                            fontSize: 11,
                            fontWeight: '700',
                          }}
                        >
                          Grade {cert.grade}
                        </Text>
                      </View>
                      <View
                        style={{
                          backgroundColor: '#F1F5F9',
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 8,
                        }}
                      >
                        <Text
                          style={{
                            color: '#64748B',
                            fontSize: 11,
                            fontWeight: '600',
                          }}
                        >
                          {cert.issuedAt}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <MaterialCommunityIcons
                    name="download-outline"
                    size={22}
                    color={colors.PRIMARY_COLOR}
                  />
                </View>
              </ProfileSectionCard>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
