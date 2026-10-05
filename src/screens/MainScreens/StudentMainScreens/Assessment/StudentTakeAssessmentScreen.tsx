import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { pick, types } from '@react-native-documents/picker';
import { GlassScreen } from '../../../../components/Glass';
import { GLASS } from '../../../../theme/glass';
import ProfileSubHeader from '../../../../components/Profile/ProfileSubHeader/ProfileSubHeader';
import CustomButton from '../../../../components/CustomButton';
import { AssessmentErrorState, AssessmentLoadingState } from '../../../../components/Assessment';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  fetchAssessmentThunk,
  fetchAttemptThunk,
  saveAnswersThunk,
  setCurrentAttemptAnswers,
  submitAttemptThunk,
  uploadAttemptFileThunk,
} from '../../../../store/assessment/assessmentSlice';
import { AttemptAnswer } from '../../../../types/assessment.types';
import {
  clearLocalAnswers,
  loadLocalAnswers,
  saveLocalAnswers,
} from '../../../../services/assessments/attemptDraftStore';

const StudentTakeAssessmentScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const assessmentId = String(route.params?.assessmentId || '');
  const attemptId = String(route.params?.attemptId || '');
  const dispatch = useAppDispatch();
  const assessment = useAppSelector(s => s.assessment.byId[assessmentId]);
  const attempt = useAppSelector(s => s.assessment.currentAttempt);
  const mutating = useAppSelector(s => s.assessment.mutating);
  const error = useAppSelector(s => s.assessment.lastError);
  const [index, setIndex] = useState(0);
  const [review, setReview] = useState(false);
  const [now, setNow] = useState(Date.now());
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const questions = attempt?.questions?.length
    ? attempt.questions
    : assessment?.questions || [];
  const answers = attempt?.answers || [];
  const expiredHandled = useRef(false);

  useEffect(() => {
    if (!assessmentId || !attemptId) return;
    void dispatch(fetchAssessmentThunk(assessmentId));
    void dispatch(
      fetchAttemptThunk({ assessmentId, attemptId, preferResult: false })
    );
  }, [assessmentId, attemptId, dispatch]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    void loadLocalAnswers(attemptId).then(local => {
      if (local?.length && (!attempt?.answers || attempt.answers.length === 0)) {
        dispatch(setCurrentAttemptAnswers(local));
      }
    });
  }, [attemptId, attempt?.answers, dispatch]);

  const remainingMs = useMemo(() => {
    if (!attempt?.expiresAt) return null;
    const t = new Date(attempt.expiresAt).getTime();
    if (Number.isNaN(t)) return null;
    return t - now;
  }, [attempt?.expiresAt, now]);

  const goToResults = useCallback(() => {
    void clearLocalAnswers(attemptId);
    navigation.replace('StudentAssessmentResultScreen', {
      assessmentId,
      attemptId,
    });
  }, [assessmentId, attemptId, navigation]);

  useEffect(() => {
    if (!attempt || attempt._id !== attemptId) return;
    if (attempt.status === 'in_progress') return;
    goToResults();
  }, [attempt, attemptId, goToResults]);

  useEffect(() => {
    if (
      remainingMs == null ||
      remainingMs > 0 ||
      expiredHandled.current ||
      attempt?.status !== 'in_progress'
    ) {
      return;
    }
    expiredHandled.current = true;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    void dispatch(submitAttemptThunk({ assessmentId, attemptId })).finally(() => {
      goToResults();
    });
  }, [remainingMs, attempt?.status, assessmentId, attemptId, dispatch, goToResults]);

  const persist = useCallback(
    (next: AttemptAnswer[], syncRemote = true) => {
      dispatch(setCurrentAttemptAnswers(next));
      void saveLocalAnswers(attemptId, next);
      if (!syncRemote) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        void dispatch(saveAnswersThunk({ assessmentId, attemptId, answers: next }));
      }, 1200);
    },
    [assessmentId, attemptId, dispatch]
  );

  const findAnswer = (qid: string) => answers.find(a => a.questionId === qid);

  const setAnswer = (patch: Partial<AttemptAnswer>) => {
    const q = questions[Math.min(index, Math.max(0, questions.length - 1))];
    if (!q || attempt?.locked || attempt?.status !== 'in_progress') return;
    const rest = answers.filter(a => a.questionId !== q._id);
    persist([...rest, { questionId: q._id, ...findAnswer(q._id), ...patch }]);
  };

  const submit = () => {
    Alert.alert('Submit?', 'You cannot change answers after submitting.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Submit',
        onPress: () => {
          if (saveTimer.current) clearTimeout(saveTimer.current);
          void dispatch(
            saveAnswersThunk({ assessmentId, attemptId, answers })
          ).finally(() => {
            void dispatch(submitAttemptThunk({ assessmentId, attemptId })).then(res => {
              if (submitAttemptThunk.fulfilled.match(res)) {
                void clearLocalAnswers(attemptId);
                navigation.replace('StudentAssessmentResultScreen', {
                  assessmentId,
                  attemptId,
                });
              } else if (
                String(res.payload || '').toLowerCase().includes('already submitted') ||
                String(res.payload || '').toLowerCase().includes('locked')
              ) {
                goToResults();
              } else {
                Alert.alert('Submit failed', String(res.payload || 'Try again.'));
              }
            });
          });
        },
      },
    ]);
  };

  const attach = async () => {
    try {
      const [file] = await pick({
        type: [types.pdf, types.images],
        allowMultiSelection: false,
      });
      const mime = String(file.type || '').toLowerCase();
      const allowed = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'application/pdf',
      ];
      if (mime && !allowed.includes(mime)) {
        Alert.alert('File not allowed', 'Use a JPEG, PNG, WebP, or PDF file.');
        return;
      }
      const size = Number((file as { size?: number }).size || 0);
      if (size > 10 * 1024 * 1024) {
        Alert.alert('File too large', 'Files must be 10MB or smaller.');
        return;
      }
      const result = await dispatch(
        uploadAttemptFileThunk({
          assessmentId,
          attemptId,
          file: {
            uri: file.uri,
            name: file.name ?? 'file',
            type: file.type ?? undefined,
            size,
          },
        })
      );
      if (uploadAttemptFileThunk.rejected.match(result)) {
        Alert.alert('Upload failed', String(result.payload || 'Try again.'));
      }
    } catch {
      /* cancelled */
    }
  };

  if (!attempt && error) {
    return (
      <GlassScreen scroll={false} edges={['top', 'left', 'right']}>
        <ProfileSubHeader navigation={navigation} title="Attempt" />
        <View style={{ padding: 16 }}>
          <AssessmentErrorState message={error} />
        </View>
      </GlassScreen>
    );
  }

  if (!attempt || attempt._id !== attemptId) {
    return (
      <GlassScreen scroll={false} edges={['top', 'left', 'right']}>
        <ProfileSubHeader navigation={navigation} title="Attempt" />
        <View style={{ padding: 16 }}>
          <AssessmentLoadingState />
        </View>
      </GlassScreen>
    );
  }

  const q = questions[Math.min(index, Math.max(0, questions.length - 1))];
  const current = q ? findAnswer(q._id) : undefined;
  const timedOut = remainingMs != null && remainingMs <= 0;
  const clock =
    remainingMs == null
      ? null
      : `${Math.max(0, Math.floor(remainingMs / 60000))}:${String(
          Math.max(0, Math.floor((remainingMs / 1000) % 60))
        ).padStart(2, '0')}`;

  return (
    <GlassScreen scroll={false} edges={['top', 'left', 'right']}>
      <ProfileSubHeader
        navigation={navigation}
        title={review ? 'Review' : assessment?.title || 'Attempt'}
      />
      {clock ? (
        <Text style={[styles.timer, timedOut && { color: GLASS.error }]}>
          Time left {clock}
        </Text>
      ) : null}
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {review || assessment?.type === 'assignment' ? (
          <>
            {assessment?.type === 'assignment' ? (
              <View style={styles.card}>
                <Text style={styles.prompt}>{assessment.instructions || assessment.description}</Text>
                <TextInput
                  style={styles.input}
                  multiline
                  placeholder="Write your response"
                  placeholderTextColor={GLASS.placeholder}
                  value={current?.text || findAnswer(questions[0]?._id || '')?.text || ''}
                  onChangeText={text => {
                    const qid = questions[0]?._id;
                    if (!qid) return;
                    const rest = answers.filter(a => a.questionId !== qid);
                    persist([...rest, { questionId: qid, text }]);
                  }}
                />
                <CustomButton
                  title="Attach file"
                  onPress={() => void attach()}
                  backgroundColor={GLASS.primarySoft}
                  textColor={GLASS.primaryDeep}
                />
                {(attempt.files || []).map(f => (
                  <Text key={f._id} style={styles.file}>
                    {f.name}
                  </Text>
                ))}
              </View>
            ) : (
              questions.map((item, i) => {
                const a = findAnswer(item._id);
                return (
                  <TouchableOpacity
                    key={item._id}
                    style={styles.card}
                    onPress={() => {
                      setReview(false);
                      setIndex(i);
                    }}
                  >
                    <Text style={styles.kicker}>Q{i + 1}</Text>
                    <Text style={styles.prompt}>{item.prompt}</Text>
                    <Text style={styles.meta}>
                      {a?.selectedOptionId || a?.trueFalse != null || a?.text
                        ? 'Answered'
                        : 'Not answered'}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
            <CustomButton
              title="Submit"
              onPress={submit}
              loading={mutating}
              disabled={timedOut && assessment?.latePolicy === 'reject'}
            />
          </>
        ) : q ? (
          <>
            <Text style={styles.kicker}>
              Question {index + 1} of {questions.length} · {q.marks} marks
            </Text>
            <Text style={styles.prompt}>{q.prompt}</Text>
            {q.type === 'mcq'
              ? (q.options || []).map(opt => {
                  const on = current?.selectedOptionId === opt._id;
                  return (
                    <TouchableOpacity
                      key={opt._id}
                      style={[styles.option, on && styles.optionOn]}
                      onPress={() => setAnswer({ selectedOptionId: opt._id })}
                    >
                      <Text style={[styles.optionText, on && styles.optionTextOn]}>
                        {opt.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              : null}
            {q.type === 'true_false' ? (
              <>
                {['True', 'False'].map(label => {
                  const val = label === 'True';
                  const on = current?.trueFalse === val;
                  return (
                    <TouchableOpacity
                      key={label}
                      style={[styles.option, on && styles.optionOn]}
                      onPress={() => setAnswer({ trueFalse: val })}
                    >
                      <Text style={[styles.optionText, on && styles.optionTextOn]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </>
            ) : null}
            {q.type === 'short_answer' || q.type === 'long_answer' ? (
              <TextInput
                style={[styles.input, q.type === 'long_answer' && { minHeight: 140 }]}
                multiline
                placeholder="Your answer"
                placeholderTextColor={GLASS.placeholder}
                value={current?.text || ''}
                onChangeText={text => setAnswer({ text })}
              />
            ) : null}
            <View style={styles.navRow}>
              <CustomButton
                title="Previous"
                onPress={() => setIndex(i => Math.max(0, i - 1))}
                disabled={index === 0}
                backgroundColor={GLASS.primarySoft}
                textColor={GLASS.primaryDeep}
                style={{ flex: 1 }}
              />
              {index < questions.length - 1 ? (
                <CustomButton
                  title="Next"
                  onPress={() => setIndex(i => i + 1)}
                  style={{ flex: 1 }}
                />
              ) : (
                <CustomButton
                  title="Review"
                  onPress={() => setReview(true)}
                  style={{ flex: 1 }}
                />
              )}
            </View>
          </>
        ) : (
          <Text style={styles.meta}>No questions on this assessment yet.</Text>
        )}
      </ScrollView>
    </GlassScreen>
  );
};

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40, gap: 10 },
  timer: {
    textAlign: 'center',
    color: GLASS.primaryDeep,
    fontWeight: '800',
    paddingBottom: 4,
  },
  kicker: { color: GLASS.primary, fontWeight: '800', fontSize: 12 },
  prompt: { color: GLASS.textPrimary, fontWeight: '800', fontSize: 16, lineHeight: 22 },
  meta: { color: GLASS.textSecondary, fontSize: 13 },
  option: {
    borderWidth: 1,
    borderColor: GLASS.cardBorder,
    backgroundColor: 'rgba(117, 72, 245, 0.06)',
    borderRadius: 14,
    padding: 14,
  },
  optionOn: { borderColor: GLASS.primary, backgroundColor: GLASS.primarySoft },
  optionText: { color: GLASS.textPrimary, fontWeight: '700' },
  optionTextOn: { color: GLASS.primaryDeep },
  input: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: GLASS.inputBorder,
    backgroundColor: GLASS.inputBg,
    borderRadius: 14,
    padding: 12,
    color: GLASS.textPrimary,
    textAlignVertical: 'top',
  },
  navRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.42)',
    borderWidth: 1,
    borderColor: GLASS.cardBorder,
    borderRadius: 16,
    padding: 12,
    gap: 8,
  },
  file: { color: GLASS.primaryDeep, fontWeight: '700' },
});

export default StudentTakeAssessmentScreen;
