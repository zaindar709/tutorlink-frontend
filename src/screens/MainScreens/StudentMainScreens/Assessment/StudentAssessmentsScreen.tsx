import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { GlassScreen } from '../../../../components/Glass';
import { GLASS } from '../../../../theme/glass';
import ProfileSubHeader from '../../../../components/Profile/ProfileSubHeader/ProfileSubHeader';
import {
  AssessmentCard,
  AssessmentEmptyState,
  AssessmentErrorState,
  AssessmentLoadingState,
} from '../../../../components/Assessment';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchStudentAssessmentsThunk } from '../../../../store/assessment/assessmentSlice';
import { Assessment, AssessmentType } from '../../../../types/assessment.types';
import { leaveHomeStackToTabs, navigateHomeStack } from '../../../../navigation/navigationRef';

const FILTERS: Array<{ id: 'all' | AssessmentType; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'quiz', label: 'Quizzes' },
  { id: 'test', label: 'Tests' },
  { id: 'assignment', label: 'Assignments' },
];

const StudentAssessmentsScreen = () => {
  const route = useRoute<any>();
  const dispatch = useAppDispatch();
  const initial = (route.params?.type as AssessmentType | 'all') || 'all';
  const [filter, setFilter] = useState<'all' | AssessmentType>(initial);
  const ids = useAppSelector(s => s.assessment.studentIds);
  const byId = useAppSelector(s => s.assessment.byId);
  const loading = useAppSelector(s => s.assessment.listLoading);
  const error = useAppSelector(s => s.assessment.lastError);
  const items = useMemo(
    () =>
      ids
        .map(id => byId[id])
        .filter((item): item is Assessment => Boolean(item))
        .filter(item => (filter === 'all' ? true : item.type === filter)),
    [ids, byId, filter]
  );

  const load = useCallback(
    (typeFilter: 'all' | AssessmentType = filter) => {
      void dispatch(
        fetchStudentAssessmentsThunk({
          type: typeFilter === 'all' ? undefined : typeFilter,
          page: 1,
          limit: 50,
        })
      );
    },
    [dispatch, filter]
  );

  useFocusEffect(
    useCallback(() => {
      const next = (route.params?.type as AssessmentType | 'all') || 'all';
      setFilter(next);
      load(next);
    }, [load, route.params?.type])
  );

  const title =
    filter === 'quiz'
      ? 'Quizzes'
      : filter === 'test'
        ? 'Tests'
        : filter === 'assignment'
          ? 'Assignments'
          : 'Assessments';

  return (
    <GlassScreen scroll={false} edges={['top', 'left', 'right']}>
      <ProfileSubHeader navigation={{ goBack: () => leaveHomeStackToTabs() }} title={title} />
      <View style={styles.filters}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.id}
            onPress={() => {
              setFilter(f.id);
              load(f.id);
            }}
            style={[styles.chip, filter === f.id && styles.chipOn]}
          >
            <Text style={[styles.chipText, filter === f.id && styles.chipTextOn]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading && items.length === 0 ? (
        <View style={styles.pad}>
          <AssessmentLoadingState />
        </View>
      ) : error && items.length === 0 ? (
        <View style={styles.pad}>
          <AssessmentErrorState message={error} onRetry={() => load()} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={load} tintColor={GLASS.primary} />
          }
          ListEmptyComponent={
            <AssessmentEmptyState
              title={`No ${title.toLowerCase()} yet`}
              subtitle="When your tutor assigns work, it will show up here."
            />
          }
          renderItem={({ item }) => (
            <AssessmentCard
              item={item}
              onPress={() =>
                navigateHomeStack('StudentAssessmentDetailScreen', {
                  assessmentId: item._id,
                })
              }
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
    </GlassScreen>
  );
};

const styles = StyleSheet.create({
  filters: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: 'rgba(117, 72, 245, 0.07)',
    borderWidth: 1,
    borderColor: GLASS.cardBorder,
  },
  chipOn: { backgroundColor: GLASS.primarySoft, borderColor: GLASS.primary },
  chipText: { color: GLASS.textSecondary, fontWeight: '700', fontSize: 12 },
  chipTextOn: { color: GLASS.primaryDeep },
  list: { padding: 16, paddingBottom: 40 },
  pad: { padding: 16 },
});

export default StudentAssessmentsScreen;
