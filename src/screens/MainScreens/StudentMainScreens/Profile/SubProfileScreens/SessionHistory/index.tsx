import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ProfileSubHeader,
  ProfileSectionCard,
  ProfileEmptyState,
  createProfileSubScreenStyles,
} from '../../../../../../components/Profile';
import useUi from '../../../../../../hooks/ui/useUi';
import { MOCK_SESSION_HISTORY } from '../../../../../../constants/studentProfileMockData';

const filters = ['All', 'Completed', 'Cancelled'] as const;

const statusColors: Record<string, { bg: string; text: string }> = {
  completed: { bg: '#ECFDF5', text: '#059669' },
  cancelled: { bg: '#FEF2F2', text: '#DC2626' },
  missed: { bg: '#FFF7ED', text: '#EA580C' },
};

export default function StudentSessionHistoryScreen({ navigation }: any) {
  const { colors } = useUi();
  const styles = useMemo(() => createProfileSubScreenStyles(colors), [colors]);
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');

  const sessions = MOCK_SESSION_HISTORY.filter(item => {
    if (filter === 'All') return true;
    return item.status === filter.toLowerCase();
  });

  return (
    <SafeAreaView style={styles.container}>
      <ProfileSubHeader navigation={navigation} title="Session History" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Past sessions</Text>
          <Text style={styles.heroSubtitle}>
            Review completed and cancelled tutoring sessions.
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {filters.map(item => (
            <TouchableOpacity
              key={item}
              onPress={() => setFilter(item)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: filter === item ? colors.PRIMARY_COLOR : '#fff',
                borderWidth: 1,
                borderColor: filter === item ? colors.PRIMARY_COLOR : '#E2E8F0',
              }}
            >
              <Text
                style={{
                  color: filter === item ? '#fff' : '#64748B',
                  fontWeight: '600',
                  fontSize: 12,
                }}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {sessions.length === 0 ? (
          <ProfileEmptyState
            icon="history"
            title="No sessions found"
            message="Your session history will appear here after you book tutors."
          />
        ) : (
          sessions.map(session => {
            const badge = statusColors[session.status] || statusColors.completed;
            return (
              <ProfileSectionCard key={session.id}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#0F172A' }}>
                      {session.subject}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                      with {session.tutorName}
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: badge.bg,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 8,
                      alignSelf: 'flex-start',
                    }}
                  >
                    <Text style={{ color: badge.text, fontSize: 11, fontWeight: '700', textTransform: 'capitalize' }}>
                      {session.status}
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', marginTop: 12, gap: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="calendar-outline" size={16} color="#94A3B8" />
                    <Text style={{ marginLeft: 6, fontSize: 12, color: '#64748B' }}>{session.date}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="clock-outline" size={16} color="#94A3B8" />
                    <Text style={{ marginLeft: 6, fontSize: 12, color: '#64748B' }}>{session.duration}</Text>
                  </View>
                </View>

                <Text style={{ marginTop: 8, fontSize: 12, color: '#475569' }}>{session.time}</Text>

                {session.rating ? (
                  <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center' }}>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <MaterialCommunityIcons
                        key={index}
                        name={index < session.rating! ? 'star' : 'star-outline'}
                        size={16}
                        color="#F59E0B"
                      />
                    ))}
                    <Text style={{ marginLeft: 6, fontSize: 12, color: '#64748B' }}>Your rating</Text>
                  </View>
                ) : null}
              </ProfileSectionCard>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
