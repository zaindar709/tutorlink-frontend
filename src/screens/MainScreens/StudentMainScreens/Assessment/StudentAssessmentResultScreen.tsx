import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { GlassScreen } from '../../../../components/Glass';
import { GLASS } from '../../../../theme/glass';
import ProfileSubHeader from '../../../../components/Profile/ProfileSubHeader/ProfileSubHeader';
import {
  AssessmentErrorState,
  AssessmentLoadingState,
} from '../../../../components/Assessment';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  fetchAssessmentThunk,
  fetchAttemptThunk,
} from '../../../../store/assessment/assessmentSlice';
import { leaveHomeStackToTabs } from '../../../../navigation/navigationRef';
import CustomButton from '../../../../components/CustomButton';

const StudentAssessmentResultScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const assessmentId = String(route.params?.assessmentId || '');
  const attemptId = String(route.params?.attemptId || '');
  const dispatch = useAppDispatch();
  const attempt = useAppSelector(s => s.assessment.currentAttempt);
  const assessment = useAppSelector(s => s.assessment.byId[assessmentId]);
  const error = useAppSelector(s => s.assessment.lastError);

  useFocusEffect(
    useCallback(() => {
      if (assessmentId && attemptId) {
        void dispatch(fetchAssessmentThunk(assessmentId));
        void dispatch(fetchAttemptThunk({ assessmentId, attemptId }));
      }
    }, [assessmentId, attemptId, dispatch])
  );

  const waitingForGrade = Boolean(
    attempt &&
      (attempt.status === 'grading' ||
        (attempt.needsManualGrading && attempt.status !== 'graded') ||
        attempt.status === 'submitted')
  );
  const showScore = Boolean(
    attempt &&
      attempt.status !== 'in_progress' &&
      (attempt.status === 'graded' ||
        (attempt.score != null &&
          assessment?.showResultImmediately &&
          !attempt.needsManualGrading &&
          attempt.status !== 'grading'))
  );
  const showCorrect = Boolean(
    attempt &&
      (attempt.correctAnswersVisible ||
        (assessment?.showCorrectAnswers && attempt.status === 'graded'))
  );

  const ready = Boolean(attempt && attempt._id === attemptId);

  return (
    <GlassScreen scroll={false} edges={['top', 'left', 'right']}>
      <ProfileSubHeader navigation={navigation} title="Result" />
      {!assessmentId || !attemptId ? (
        <View style={styles.pad}>
          <AssessmentErrorState message="This result link is incomplete." />
        </View>
      ) : !ready && error ? (
        <View style={styles.pad}>
          <AssessmentErrorState message={error} />
        </View>
      ) : !ready ? (
        <View style={styles.pad}>
          <AssessmentLoadingState />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.kicker}>{assessment?.title || 'Assessment'}</Text>
          {waitingForGrade || !showScore ? (
            <View style={styles.card}>
              <Text style={styles.title}>Submitted</Text>
              <Text style={styles.body}>
                Your tutor is reviewing written answers. You will be notified when
                the result is published.
              </Text>
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.score}>
                {attempt.score ?? '—'} / {attempt.maxScore}
              </Text>
              <Text style={styles.body}>
                {attempt.percentage != null
                  ? `${Math.round(attempt.percentage)}%`
                  : ''}
                {attempt.late ? ' · Late' : ''}
              </Text>
            </View>
          )}
          {attempt.feedback ? (
            <View style={styles.card}>
              <Text style={styles.section}>Feedback</Text>
              <Text style={styles.body}>{attempt.feedback}</Text>
            </View>
          ) : null}
          {(showScore ? attempt.questionResults || [] : []).map(qr => (
            <View key={qr.questionId} style={styles.card}>
              <Text style={styles.section}>{qr.prompt}</Text>
              <Text style={styles.body}>Your answer: {qr.studentAnswer || '—'}</Text>
              {showCorrect && qr.correctAnswer ? (
                <Text style={styles.body}>Correct: {qr.correctAnswer}</Text>
              ) : null}
              <Text style={styles.meta}>
                {qr.awardedMarks} / {qr.maxMarks}
              </Text>
              {showCorrect && qr.explanation ? (
                <Text style={styles.body}>{qr.explanation}</Text>
              ) : null}
            </View>
          ))}
          <CustomButton title="Done" onPress={() => leaveHomeStackToTabs()} />
        </ScrollView>
      )}
    </GlassScreen>
  );
};

const styles = StyleSheet.create({
  pad: { padding: 16 },
  content: { padding: 16, paddingBottom: 40, gap: 12 },
  kicker: { color: GLASS.primary, fontWeight: '800' },
  title: { fontWeight: '800', fontSize: 18, color: GLASS.textPrimary },
  score: { fontSize: 32, fontWeight: '900', color: GLASS.primaryDeep },
  body: { color: GLASS.textSecondary, lineHeight: 20, marginTop: 4 },
  meta: { color: GLASS.primary, fontWeight: '800', marginTop: 6 },
  section: { fontWeight: '800', color: GLASS.textPrimary },
  card: {
    backgroundColor: 'rgba(255,255,255,0.42)',
    borderWidth: 1,
    borderColor: GLASS.cardBorder,
    borderRadius: 18,
    padding: 14,
  },
});

export default StudentAssessmentResultScreen;
