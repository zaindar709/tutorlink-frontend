import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { GlassScreen } from '../../../../components/Glass';
import { GLASS } from '../../../../theme/glass';
import ProfileSubHeader from '../../../../components/Profile/ProfileSubHeader/ProfileSubHeader';
import CustomButton from '../../../../components/CustomButton';
import {
  AssessmentErrorState,
  AssessmentLoadingState,
} from '../../../../components/Assessment';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  fetchAssessmentThunk,
  fetchSubmissionAttemptThunk,
  gradeAttemptThunk,
} from '../../../../store/assessment/assessmentSlice';
import { GradeQuestionPayload } from '../../../../types/assessment.types';

const answerFor = (
  questionId: string,
  answers: Array<{
    questionId: string;
    selectedOptionId?: string;
    trueFalse?: boolean;
    text?: string;
  }>,
  options?: Array<{ _id: string; text: string }>
) => {
  const found = answers.find(a => a.questionId === questionId);
  if (!found) return '—';
  if (found.text) return found.text;
  if (typeof found.trueFalse === 'boolean') return found.trueFalse ? 'True' : 'False';
  if (found.selectedOptionId) {
    return options?.find(o => o._id === found.selectedOptionId)?.text || found.selectedOptionId;
  }
  return '—';
};

const TutorGradeAttemptScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const assessmentId = String(route.params?.assessmentId || '');
  const attemptId = String(route.params?.attemptId || '');
  const dispatch = useAppDispatch();
  const assessment = useAppSelector(s => s.assessment.byId[assessmentId]);
  const attempt = useAppSelector(s => s.assessment.currentAttempt);
  const loading = useAppSelector(s => s.assessment.detailLoading);
  const mutating = useAppSelector(s => s.assessment.mutating);
  const error = useAppSelector(s => s.assessment.lastError);
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState('');
  const [assignmentMarks, setAssignmentMarks] = useState('');

  const load = useCallback(() => {
    if (!assessmentId || !attemptId) return;
    void dispatch(fetchAssessmentThunk(assessmentId));
    void dispatch(fetchSubmissionAttemptThunk({ assessmentId, attemptId }));
  }, [assessmentId, attemptId, dispatch]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  useEffect(() => {
    if (!attempt) return;
    setFeedback(attempt.feedback || '');
    const next: Record<string, string> = {};
    (attempt.questionResults || []).forEach(qr => {
      next[qr.questionId] = String(qr.awardedMarks);
    });
    setMarks(next);
    if (attempt.score != null && !(assessment?.questions || []).length) {
      setAssignmentMarks(String(attempt.score));
    }
  }, [attempt, assessment?.questions]);

  const questions = useMemo(
    () => assessment?.questions || [],
    [assessment?.questions]
  );
  const isAssignment = assessment?.type === 'assignment' && questions.length === 0;

  const rows = useMemo(() => {
    if (attempt?.questionResults?.length) {
      return attempt.questionResults.map(qr => ({
        questionId: qr.questionId,
        prompt: qr.prompt,
        studentAnswer: qr.studentAnswer || '—',
        correctAnswer: qr.correctAnswer,
        maxMarks: qr.maxMarks,
        explanation: qr.explanation,
      }));
    }
    return questions.map(q => ({
      questionId: q._id,
      prompt: q.prompt,
      studentAnswer: answerFor(q._id, attempt?.answers || [], q.options),
      correctAnswer:
        q.type === 'true_false'
          ? q.correctTrueFalse
            ? 'True'
            : 'False'
          : q.options?.find(o => o.isCorrect)?.text || q.answerKey,
      maxMarks: q.marks,
      explanation: q.explanation,
    }));
  }, [attempt, questions]);

  const save = async (publish: boolean) => {
    const payloads: GradeQuestionPayload[] = [];
    for (const row of rows) {
      const awarded = Number(marks[row.questionId] ?? 0);
      if (!Number.isFinite(awarded) || awarded < 0 || awarded > row.maxMarks) {
        Alert.alert(
          'Invalid marks',
          `Awarded marks for a question must be between 0 and ${row.maxMarks}.`
        );
        return;
      }
      payloads.push({ questionId: row.questionId, awardedMarks: awarded });
    }
    const sum = payloads.reduce((s, p) => s + p.awardedMarks, 0);
    const cap = assessment?.totalMarks ?? attempt?.maxScore ?? sum;
    let assignmentTotal: number | undefined;
    if (isAssignment) {
      assignmentTotal = Number(assignmentMarks);
      if (!Number.isFinite(assignmentTotal) || assignmentTotal < 0 || assignmentTotal > cap) {
        Alert.alert('Invalid marks', `Assignment marks must be between 0 and ${cap}.`);
        return;
      }
    } else if (sum > cap) {
      Alert.alert('Invalid marks', `Total awarded marks cannot exceed ${cap}.`);
      return;
    }

    const result = await dispatch(
      gradeAttemptThunk({
        assessmentId,
        attemptId,
        questions: payloads.length ? payloads : undefined,
        awardedMarks: assignmentTotal,
        feedback: feedback.trim() || undefined,
        publish,
      })
    );
    if (!gradeAttemptThunk.fulfilled.match(result)) {
      Alert.alert('Could not save', String(result.payload || 'Try again.'));
      return;
    }
    Alert.alert(publish ? 'Result published' : 'Grades saved', '', [
      { text: 'OK', onPress: () => (publish ? navigation.goBack() : undefined) },
    ]);
  };

  const ready = attempt && attempt._id === attemptId;

  return (
    <GlassScreen scroll={false} edges={['top', 'left', 'right']}>
      <ProfileSubHeader navigation={navigation} title="Grade submission" />
      {!ready && error ? (
        <View style={styles.pad}>
          <AssessmentErrorState message={error} onRetry={load} />
        </View>
      ) : !ready || loading ? (
        <View style={styles.pad}>
          <AssessmentLoadingState />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.name}>{attempt.student?.name || 'Student'}</Text>
            <Text style={styles.meta}>
              {String(attempt.status || '').replace(/_/g, ' ')}
              {attempt.late ? ' · Late' : ''}
              {attempt.submittedAt
                ? ` · ${new Date(attempt.submittedAt).toLocaleString()}`
                : ''}
            </Text>
          </View>

          {isAssignment ? (
            <View style={styles.card}>
              <Text style={styles.section}>Submitted work</Text>
              <Text style={styles.body}>
                {attempt.answers.find(a => a.text)?.text || 'No written response.'}
              </Text>
              {(attempt.files || []).map(file => (
                <CustomButton
                  key={file._id}
                  title={file.name || 'Open file'}
                  onPress={() => file.url && void Linking.openURL(file.url)}
                  backgroundColor={GLASS.primarySoft}
                  textColor={GLASS.primaryDeep}
                />
              ))}
              <Text style={styles.label}>
                Marks (0–{assessment?.totalMarks ?? attempt.maxScore})
              </Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={assignmentMarks}
                onChangeText={setAssignmentMarks}
                placeholder="0"
                placeholderTextColor={GLASS.placeholder}
              />
            </View>
          ) : null}

          {rows.map(row => (
            <View key={row.questionId} style={styles.card}>
              <Text style={styles.section}>{row.prompt}</Text>
              <Text style={styles.body}>Student: {row.studentAnswer}</Text>
              {row.correctAnswer ? (
                <Text style={styles.body}>Correct: {row.correctAnswer}</Text>
              ) : null}
              {row.explanation ? (
                <Text style={styles.body}>{row.explanation}</Text>
              ) : null}
              <Text style={styles.label}>Awarded marks (max {row.maxMarks})</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={marks[row.questionId] ?? ''}
                onChangeText={v => setMarks(prev => ({ ...prev, [row.questionId]: v }))}
                placeholder="0"
                placeholderTextColor={GLASS.placeholder}
              />
            </View>
          ))}

          <View style={styles.card}>
            <Text style={styles.section}>Feedback</Text>
            <TextInput
              style={[styles.input, styles.feedback]}
              value={feedback}
              onChangeText={setFeedback}
              multiline
              placeholder="Optional comments for the student"
              placeholderTextColor={GLASS.placeholder}
            />
          </View>

          <CustomButton
            title="Save grades"
            onPress={() => void save(false)}
            loading={mutating}
            backgroundColor={GLASS.primarySoft}
            textColor={GLASS.primaryDeep}
          />
          <CustomButton
            title="Publish result"
            onPress={() => void save(true)}
            loading={mutating}
          />
        </ScrollView>
      )}
    </GlassScreen>
  );
};

const styles = StyleSheet.create({
  pad: { padding: 16 },
  content: { padding: 16, paddingBottom: 48, gap: 12 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.42)',
    borderWidth: 1,
    borderColor: GLASS.cardBorder,
    borderRadius: 18,
    padding: 14,
    gap: 8,
  },
  name: { fontWeight: '800', fontSize: 16, color: GLASS.textPrimary },
  meta: { color: GLASS.textSecondary },
  section: { fontWeight: '800', color: GLASS.textPrimary },
  body: { color: GLASS.textSecondary, lineHeight: 20 },
  label: { color: GLASS.textMuted, fontWeight: '700', fontSize: 12 },
  input: {
    borderWidth: 1,
    borderColor: GLASS.inputBorder,
    backgroundColor: GLASS.inputBg,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: GLASS.textPrimary,
  },
  feedback: { minHeight: 90, textAlignVertical: 'top' },
});

export default TutorGradeAttemptScreen;
