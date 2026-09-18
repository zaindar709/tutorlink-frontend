import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { GlassScreen } from '../../../../../../components/Glass';
import {
  ProfileSubHeader,
  ProfileSectionCard,
  ProfileEmptyState,
  createProfileSubScreenStyles,
} from '../../../../../../components/Profile';
import useUi from '../../../../../../hooks/ui/useUi';
import { useStudentProgress } from '../../../../../../hooks/api/useStudentLearning';
import { GLASS } from '../../../../../../theme/glass';
import type { StudentProgressSubject } from '../../../../../../types/api.types';

const SUBJECT_COLOR: Record<string, string> = {
  Mathematics: '#3B82F6',
  Physics: '#8B5CF6',
  English: '#14B8A6',
  Science: '#F59E0B',
  Chemistry: '#F97316',
  Biology: '#10B981',
};

const fallbackColor = '#7548F5';

function SubjectCard({ item }: { item: StudentProgressSubject }) {
  const accent = SUBJECT_COLOR[item.subject] || fallbackColor;
  const covered = item.syllabusCovered ?? item.score;
  const bars = item.weeklyBars?.length ? item.weeklyBars : [0, 0, 0, 0, 0];
  const delta = item.trendDelta ?? 0;
  const isUp = delta >= 0;

  return (
    <ProfileSectionCard>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: '#0F172A' }}>
            {item.subject}
          </Text>
          <Text style={{ marginTop: 4, fontSize: 12, color: '#64748B' }}>
            Grade {item.grade || '—'} · {item.sessionsCompleted} session
            {item.sessionsCompleted === 1 ? '' : 's'}
          </Text>
        </View>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: accent,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons name="book-open-variant" size={20} color="#fff" />
        </View>
      </View>

      <View style={{ marginTop: 16 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 6,
          }}
        >
          <Text style={{ fontSize: 12, color: '#64748B' }}>Syllabus covered</Text>
          <Text style={{ fontSize: 12, fontWeight: '800', color: '#0F172A' }}>
            {covered}%
          </Text>
        </View>
        <View
          style={{
            height: 8,
            borderRadius: 99,
            backgroundColor: '#E2E8F0',
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              width: `${Math.max(0, Math.min(100, covered))}%`,
              height: '100%',
              backgroundColor: accent,
            }}
          />
        </View>
      </View>

      <View
        style={{
          marginTop: 16,
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>
          {bars.slice(0, 5).map((h, i) => (
            <View
              key={`${item.subject}-bar-${i}`}
              style={{
                width: 8,
                height: Math.max(8, Math.round((h / 100) * 36)),
                borderRadius: 4,
                backgroundColor: accent,
                opacity: i === 4 ? 1 : 0.35,
              }}
            />
          ))}
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 99,
            backgroundColor: isUp ? '#ECFDF5' : '#FEF2F2',
          }}
        >
          <MaterialCommunityIcons
            name={isUp ? 'trending-up' : 'trending-down'}
            size={14}
            color={isUp ? '#059669' : '#DC2626'}
          />
          <Text
            style={{
              fontSize: 12,
              fontWeight: '800',
              color: isUp ? '#059669' : '#DC2626',
            }}
          >
            {isUp ? '+' : ''}
            {delta}%
          </Text>
        </View>
      </View>
    </ProfileSectionCard>
  );
}

export default function StudentProgressScreen({ navigation }: any) {
  const { colors } = useUi();
  const styles = useMemo(() => createProfileSubScreenStyles(colors), [colors]);
  const { data, loading, error, refresh } = useStudentProgress();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  const hasAnySignal =
    (data?.completedSessions || 0) > 0 ||
    (data?.upcomingSessions || 0) > 0 ||
    (data?.subjects.length || 0) > 0;

  return (
    <GlassScreen scroll={false} contentStyle={{ flex: 1 }}>
      <ProfileSubHeader navigation={navigation} title="My Progress" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void onRefresh()}
            tintColor={GLASS.primary}
          />
        }
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Your learning analytics</Text>
          <Text style={styles.heroSubtitle}>
            See how your subjects, attendance, and weekly scores are moving
            after booked sessions.
          </Text>
        </View>

        {error ? (
          <Text style={{ color: '#DC2626', marginBottom: 12, fontSize: 12 }}>
            {error}
          </Text>
        ) : null}

        {loading && !data ? (
          <ActivityIndicator color={colors.PRIMARY_COLOR} />
        ) : !hasAnySignal ? (
          <ProfileEmptyState
            icon="chart-line"
            title="No progress yet"
            message="Once you book and complete a class, your scores, attendance, and weekly chart will show up here."
          />
        ) : (
          <>
            <View
              style={{
                backgroundColor: GLASS.primary,
                borderRadius: 20,
                padding: 20,
                marginBottom: 16,
              }}
            >
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
                Overall progress
              </Text>
              <Text
                style={{
                  color: '#fff',
                  fontSize: 40,
                  fontWeight: '800',
                  marginTop: 4,
                }}
              >
                {data?.overallProgress ?? 0}%
              </Text>
              <Text
                style={{
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: 13,
                  marginTop: 8,
                  lineHeight: 18,
                }}
              >
                {data?.summary}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              {[
                {
                  label: 'Attendance',
                  value: `${data?.attendanceRate ?? 0}%`,
                  icon: 'account-check-outline',
                },
                {
                  label: 'This month',
                  value: String(data?.sessionsThisMonth ?? 0),
                  icon: 'calendar-month-outline',
                },
                {
                  label: 'Completed',
                  value: String(data?.completedSessions ?? 0),
                  icon: 'check-circle-outline',
                },
              ].map(stat => (
                <View
                  key={stat.label}
                  style={{
                    flex: 1,
                    backgroundColor: GLASS.cardBg,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: GLASS.cardBorder,
                    padding: 12,
                    alignItems: 'center',
                  }}
                >
                  <MaterialCommunityIcons
                    name={stat.icon as never}
                    size={18}
                    color={GLASS.primary}
                  />
                  <Text
                    style={{
                      marginTop: 8,
                      fontSize: 18,
                      fontWeight: '800',
                      color: '#0F172A',
                    }}
                  >
                    {stat.value}
                  </Text>
                  <Text style={{ marginTop: 2, fontSize: 10, color: '#64748B' }}>
                    {stat.label}
                  </Text>
                </View>
              ))}
            </View>

            {data?.weeklyProgress && data.weeklyProgress.length > 0 ? (
              <ProfileSectionCard title="Weekly trend">
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    height: 120,
                    paddingTop: 8,
                  }}
                >
                  {data.weeklyProgress.map(week => (
                    <View
                      key={week.label}
                      style={{ flex: 1, alignItems: 'center' }}
                    >
                      <View
                        style={{
                          width: 18,
                          height: Math.max(
                            6,
                            Math.round((week.score / 100) * 88)
                          ),
                          borderRadius: 8,
                          backgroundColor: GLASS.primary,
                        }}
                      />
                      <Text
                        style={{
                          marginTop: 8,
                          fontSize: 10,
                          color: '#64748B',
                          fontWeight: '700',
                        }}
                      >
                        {week.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </ProfileSectionCard>
            ) : null}

            <Text style={styles.sectionLabel}>Subjects</Text>
            {data?.subjects.length ? (
              data.subjects.map(item => (
                <SubjectCard key={item.subject} item={item} />
              ))
            ) : (
              <ProfileEmptyState
                icon="book-open-variant"
                title="No subject scores yet"
                message="Subject cards appear after completed sessions."
              />
            )}

            {data?.tips?.length ? (
              <ProfileSectionCard title="Tips">
                {data.tips.map(tip => (
                  <View
                    key={tip}
                    style={{
                      flexDirection: 'row',
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="lightbulb-on-outline"
                      size={16}
                      color={GLASS.primary}
                    />
                    <Text style={{ flex: 1, fontSize: 13, color: '#475569' }}>
                      {tip}
                    </Text>
                  </View>
                ))}
              </ProfileSectionCard>
            ) : null}
          </>
        )}
      </ScrollView>
    </GlassScreen>
  );
}
