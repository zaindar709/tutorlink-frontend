import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
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
import {
  emptyDraft,
  fetchTutorAssessmentsThunk,
  setEditor,
} from '../../../../store/assessment/assessmentSlice';
import { Assessment, AssessmentType } from '../../../../types/assessment.types';
import { leaveHomeStackToTabs } from '../../../../navigation/navigationRef';

const FILTERS: Array<{ id: 'all' | AssessmentType; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'quiz', label: 'Quizzes' },
  { id: 'test', label: 'Tests' },
  { id: 'assignment', label: 'Assignments' },
];

const TutorAssessmentsScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const [filter, setFilter] = useState<'all' | AssessmentType>('all');
  const ids = useAppSelector(s => s.assessment.tutorIds);
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

  const load = useCallback(() => {
    void dispatch(
      fetchTutorAssessmentsThunk({
        type: filter === 'all' ? undefined : filter,
        page: 1,
        limit: 50,
      })
    );
  }, [dispatch, filter]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <GlassScreen scroll={false} edges={['top', 'left', 'right']}>
      <ProfileSubHeader
        navigation={{ goBack: () => leaveHomeStackToTabs() }}
        title="Assessments"
        rightIcon="plus"
        onRightPress={() => {
          dispatch(setEditor(emptyDraft()));
          navigation.navigate('TutorAssessmentEditorScreen');
        }}
      />
      <View style={styles.filters}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.id}
            onPress={() => {
              setFilter(f.id);
              void dispatch(
                fetchTutorAssessmentsThunk({
                  type: f.id === 'all' ? undefined : f.id,
                  page: 1,
                  limit: 50,
                })
              );
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
              title="No assessments yet"
              subtitle="Create a quiz, test or assignment for students you already teach."
            />
          }
          renderItem={({ item }) => (
            <AssessmentCard
              item={item}
              rightLabel={item.status}
              onPress={() =>
                item.status === 'draft'
                  ? navigation.navigate('TutorAssessmentEditorScreen', {
                      assessmentId: item._id,
                    })
                  : navigation.navigate('TutorSubmissionsScreen', {
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
  filters: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 8 },
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

export default TutorAssessmentsScreen;
