import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { GlassScreen } from '../../../../components/Glass';
import { GLASS } from '../../../../theme/glass';
import ProfileSubHeader from '../../../../components/Profile/ProfileSubHeader/ProfileSubHeader';
import CustomButton from '../../../../components/CustomButton';
import {
  AssessmentEmptyState,
  AssessmentErrorState,
  AssessmentLoadingState,
} from '../../../../components/Assessment';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  deleteAssessmentThunk,
  fetchAssessmentThunk,
  fetchSubmissionsThunk,
} from '../../../../store/assessment/assessmentSlice';
import { SubmissionListItem } from '../../../../types/assessment.types';

const fmt = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
};

const TutorSubmissionsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const assessmentId = String(route.params?.assessmentId || '');
  const dispatch = useAppDispatch();
  const assessment = useAppSelector(s => s.assessment.byId[assessmentId]);
  const submissions = useAppSelector(s => s.assessment.submissions);
  const loading = useAppSelector(s => s.assessment.listLoading);
  const error = useAppSelector(s => s.assessment.lastError);

  const load = useCallback(() => {
    if (!assessmentId) return;
    void dispatch(fetchAssessmentThunk(assessmentId));
    void dispatch(fetchSubmissionsThunk(assessmentId));
  }, [assessmentId, dispatch]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const confirmDelete = () => {
    Alert.alert(
      'Archive assessment?',
      'Students will no longer see this assessment.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: () => {
            void dispatch(deleteAssessmentThunk(assessmentId)).then(res => {
              if (deleteAssessmentThunk.fulfilled.match(res)) {
                navigation.goBack();
              }
            });
          },
        },
      ]
    );
  };

  return (
    <GlassScreen scroll={false} edges={['top', 'left', 'right']}>
      <ProfileSubHeader
        navigation={navigation}
        title={assessment?.title || 'Submissions'}
        rightIcon="pencil-outline"
        onRightPress={() =>
          navigation.navigate('TutorAssessmentEditorScreen', { assessmentId })
        }
      />
      {loading && submissions.length === 0 && !error ? (
        <View style={styles.pad}>
          <AssessmentLoadingState />
        </View>
      ) : error && submissions.length === 0 ? (
        <View style={styles.pad}>
          <AssessmentErrorState message={error} onRetry={load} />
        </View>
      ) : (
        <FlatList
          data={submissions}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={load} tintColor={GLASS.primary} />
          }
          ListHeaderComponent={
            <View style={styles.headerCard}>
              <Text style={styles.kicker}>
                {(assessment?.type || 'quiz').toUpperCase()}
                {assessment?.subject ? ` · ${assessment.subject}` : ''}
              </Text>
              <Text style={styles.meta}>
                {assessment?.status} · {submissions.length} submission
                {submissions.length === 1 ? '' : 's'}
                {assessment?.pendingGradingCount
                  ? ` · ${assessment.pendingGradingCount} to grade`
                  : ''}
              </Text>
            </View>
          }
          ListEmptyComponent={
            <AssessmentEmptyState
              title="No submissions yet"
              subtitle="When students submit, they will appear here for review."
            />
          }
          renderItem={({ item }) => <SubmissionRow item={item} assessmentId={assessmentId} />}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListFooterComponent={
            <View style={styles.footer}>
              <CustomButton
                title="Archive assessment"
                onPress={confirmDelete}
                backgroundColor="#FEE2E2"
                textColor={GLASS.error}
              />
            </View>
          }
        />
      )}
    </GlassScreen>
  );
};

const SubmissionRow = ({
  item,
  assessmentId,
}: {
  item: SubmissionListItem;
  assessmentId: string;
}) => {
  const navigation = useNavigation<any>();
  const score =
    item.score != null
      ? `${item.score}${item.percentage != null ? ` (${Math.round(item.percentage)}%)` : ''}`
      : '—';
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() =>
        navigation.navigate('TutorGradeAttemptScreen', {
          assessmentId,
          attemptId: item._id,
        })
      }
    >
      <Text style={styles.name}>{item.student.name}</Text>
      <Text style={styles.meta}>
        {item.status.replace('_', ' ')}
        {item.late ? ' · Late' : ''}
        {item.submittedAt ? ` · ${fmt(item.submittedAt)}` : ''}
      </Text>
      <View style={styles.row}>
        <Text style={styles.score}>{score}</Text>
        <Text style={styles.grade}>
          {item.gradingStatus === 'graded' ? 'Graded' : 'Needs grading'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pad: { padding: 16 },
  list: { padding: 16, paddingBottom: 40 },
  headerCard: { marginBottom: 12 },
  kicker: { color: GLASS.primary, fontWeight: '800', fontSize: 12 },
  meta: { color: GLASS.textSecondary, marginTop: 4, fontSize: 13 },
  card: {
    backgroundColor: GLASS.cardBgStrong,
    borderWidth: 1,
    borderColor: GLASS.cardBorder,
    borderRadius: 18,
    padding: 14,
  },
  name: { fontWeight: '800', color: GLASS.textPrimary, fontSize: 15 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    alignItems: 'center',
  },
  score: { color: GLASS.primaryDeep, fontWeight: '800' },
  grade: { color: GLASS.textMuted, fontWeight: '700', fontSize: 12, textTransform: 'capitalize' },
  footer: { marginTop: 16 },
});

export default TutorSubmissionsScreen;
