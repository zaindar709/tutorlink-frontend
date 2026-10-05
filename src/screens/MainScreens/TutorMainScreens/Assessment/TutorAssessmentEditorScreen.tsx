import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { GlassScreen } from '../../../../components/Glass';
import { GLASS } from '../../../../theme/glass';
import ProfileSubHeader from '../../../../components/Profile/ProfileSubHeader/ProfileSubHeader';
import CustomButton from '../../../../components/CustomButton';
import { subjectOptions } from '../../../../constants/SubjectSelection.data';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  assessmentToDraft,
  emptyDraft,
  fetchAssessmentThunk,
  fetchEligibleStudentsThunk,
  patchEditor,
  publishAssessmentThunk,
  saveAssessmentThunk,
  setEditor,
} from '../../../../store/assessment/assessmentSlice';
import {
  AssessmentDraft,
  AssessmentDraftQuestion,
  AssessmentType,
  CreateAssessmentPayload,
  LatePolicy,
  QuestionType,
} from '../../../../types/assessment.types';

const STEPS = ['Basics', 'Questions', 'Settings', 'Students', 'Review'];
const TYPES: AssessmentType[] = ['quiz', 'test', 'assignment'];
const QTYPES: QuestionType[] = ['mcq', 'true_false', 'short_answer', 'long_answer'];

const newQuestion = (type: QuestionType): AssessmentDraftQuestion => ({
  clientId: `q-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  type,
  prompt: '',
  marks: 1,
  options:
    type === 'mcq'
      ? [0, 1, 2, 3].map(i => ({
          clientId: `o-${Date.now()}-${i}`,
          text: '',
          isCorrect: i === 0,
        }))
      : [],
  correctTrueFalse: true,
  answerKey: '',
  explanation: '',
  rubric: '',
});

const combineIso = (date: string, time: string) => {
  if (!date) return undefined;
  const t = time && time.includes(':') ? time : '00:00';
  const d = new Date(`${date}T${t}`);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
};

export const draftToPayload = (
  draft: AssessmentDraft
): CreateAssessmentPayload => {
  const questions = draft.questions.map((q, order) => ({
    _id: q._id,
    type: q.type,
    prompt: q.prompt.trim(),
    marks: Number(q.marks) || 0,
    order,
    options:
      q.type === 'mcq'
        ? q.options.map(o => ({ _id: o._id, text: o.text.trim(), isCorrect: o.isCorrect }))
        : undefined,
    correctTrueFalse: q.type === 'true_false' ? q.correctTrueFalse : undefined,
    answerKey: q.answerKey.trim() || undefined,
    explanation: q.explanation.trim() || undefined,
    rubric: q.rubric.trim() || undefined,
  }));
  const fromQuestions = questions.reduce((s, q) => s + q.marks, 0);
  return {
    type: draft.type,
    title: draft.title.trim(),
    description: draft.description.trim() || undefined,
    instructions: draft.instructions.trim() || undefined,
    subject: draft.subject.trim(),
    totalMarks: Number(draft.totalMarks) || fromQuestions,
    passingMarks: Number(draft.passingMarks) || 0,
    durationMinutes:
      draft.type === 'assignment' ? undefined : Number(draft.durationMinutes) || undefined,
    startAt: combineIso(draft.startDate, draft.startTime),
    dueAt: combineIso(draft.dueDate, draft.dueTime),
    attemptsAllowed: Number(draft.attemptsAllowed) || 1,
    shuffleQuestions: draft.shuffleQuestions,
    showResultImmediately: draft.showResultImmediately,
    showCorrectAnswers: draft.showCorrectAnswers,
    latePolicy: draft.latePolicy,
    questions,
    assignedStudentIds: draft.assignedStudentIds,
  };
};

const validateDraft = (draft: AssessmentDraft, step: number): string | null => {
  if (step >= 0) {
    if (!draft.title.trim()) return 'Add a title.';
    if (!draft.subject.trim()) return 'Select a subject.';
    if (!draft.dueDate) return 'Set a due date.';
    if (draft.type !== 'assignment' && !(Number(draft.durationMinutes) > 0)) {
      return 'Set a duration in minutes.';
    }
  }
  if (step >= 1 && draft.type !== 'assignment') {
    if (!draft.questions.length) return 'Add at least one question.';
    for (const q of draft.questions) {
      if (!q.prompt.trim()) return 'Every question needs a prompt.';
      if (q.marks < 0) return 'Marks cannot be negative.';
      if (q.type === 'mcq') {
        const filled = q.options.filter(o => o.text.trim());
        if (filled.length < 2) return 'MCQs need at least two options.';
        if (!q.options.some(o => o.isCorrect && o.text.trim())) {
          return 'Mark a correct MCQ option.';
        }
      }
    }
  }
  if (step >= 3 && !draft.assignedStudentIds.length) {
    return 'Select at least one student.';
  }
  return null;
};

const TutorAssessmentEditorScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const assessmentId = String(route.params?.assessmentId || '');
  const dispatch = useAppDispatch();
  const editor = useAppSelector(s => s.assessment.editor) || emptyDraft();
  const eligible = useAppSelector(s => s.assessment.eligibleStudents);
  const mutating = useAppSelector(s => s.assessment.mutating);
  const [step, setStep] = useState(0);

  useEffect(() => {
    void dispatch(fetchEligibleStudentsThunk());
    if (assessmentId) {
      void dispatch(fetchAssessmentThunk(assessmentId)).then(res => {
        if (fetchAssessmentThunk.fulfilled.match(res)) {
          dispatch(setEditor(assessmentToDraft(res.payload)));
        }
      });
      return;
    }
    if (!editor._id) dispatch(setEditor(emptyDraft()));
    // Intentionally omit editor so FAB draft is not reset while typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentId, dispatch]);

  const patch = (partial: Partial<AssessmentDraft>) => dispatch(patchEditor(partial));

  const next = () => {
    const err = validateDraft(editor, step);
    if (err) {
      Alert.alert('Check fields', err);
      return;
    }
    setStep(s => Math.min(STEPS.length - 1, s + 1));
  };

  const save = async (status: 'draft' | 'published') => {
    const err = validateDraft(editor, status === 'published' ? 3 : 0);
    if (err) {
      Alert.alert('Check fields', err);
      return;
    }
    const payload = draftToPayload(editor);
    const saved = await dispatch(
      saveAssessmentThunk({ id: editor._id, data: payload })
    );
    if (!saveAssessmentThunk.fulfilled.match(saved)) {
      Alert.alert('Save failed', String(saved.payload || 'Try again.'));
      return;
    }
    dispatch(patchEditor({ _id: saved.payload._id }));
    if (status === 'published') {
      const pub = await dispatch(
        publishAssessmentThunk({
          id: saved.payload._id,
          studentIds: editor.assignedStudentIds,
        })
      );
      if (!publishAssessmentThunk.fulfilled.match(pub)) {
        Alert.alert('Publish failed', String(pub.payload || 'Draft was saved.'));
        return;
      }
    }
    Alert.alert(status === 'published' ? 'Assigned' : 'Draft saved', '', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const questionsTotal = useMemo(
    () => editor.questions.reduce((s, q) => s + (Number(q.marks) || 0), 0),
    [editor.questions]
  );

  return (
    <GlassScreen scroll={false} edges={['top', 'left', 'right']}>
      <ProfileSubHeader
        navigation={navigation}
        title={editor._id ? 'Edit assessment' : 'Create assessment'}
      />
      <View style={styles.steps}>
        {STEPS.map((label, i) => (
          <Text key={label} style={[styles.step, i === step && styles.stepOn]}>
            {i + 1}. {label}
          </Text>
        ))}
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {step === 0 ? (
          <>
            <Text style={styles.label}>Type</Text>
            <View style={styles.row}>
              {TYPES.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, editor.type === t && styles.chipOn]}
                  onPress={() => patch({ type: t })}
                >
                  <Text style={[styles.chipText, editor.type === t && styles.chipTextOn]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Field label="Title" value={editor.title} onChange={title => patch({ title })} />
            <Field
              label="Description"
              value={editor.description}
              onChange={description => patch({ description })}
              multiline
            />
            <Field
              label="Instructions"
              value={editor.instructions}
              onChange={instructions => patch({ instructions })}
              multiline
            />
            <Text style={styles.label}>Subject</Text>
            <View style={styles.wrap}>
              {subjectOptions.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip, editor.subject === s && styles.chipOn]}
                  onPress={() => patch({ subject: s })}
                >
                  <Text style={[styles.chipText, editor.subject === s && styles.chipTextOn]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Field
              label="Total marks"
              value={editor.totalMarks}
              onChange={totalMarks => patch({ totalMarks })}
              keyboard="numeric"
            />
            <Field
              label="Passing marks"
              value={editor.passingMarks}
              onChange={passingMarks => patch({ passingMarks })}
              keyboard="numeric"
            />
            {editor.type !== 'assignment' ? (
              <Field
                label="Duration (minutes)"
                value={editor.durationMinutes}
                onChange={durationMinutes => patch({ durationMinutes })}
                keyboard="numeric"
              />
            ) : null}
            <Field label="Start date (YYYY-MM-DD)" value={editor.startDate} onChange={startDate => patch({ startDate })} />
            <Field label="Start time (HH:mm)" value={editor.startTime} onChange={startTime => patch({ startTime })} />
            <Field label="Due date (YYYY-MM-DD)" value={editor.dueDate} onChange={dueDate => patch({ dueDate })} />
            <Field label="Due time (HH:mm)" value={editor.dueTime} onChange={dueTime => patch({ dueTime })} />
            <Field
              label="Attempts allowed"
              value={editor.attemptsAllowed}
              onChange={attemptsAllowed => patch({ attemptsAllowed })}
              keyboard="numeric"
            />
          </>
        ) : null}

        {step === 1 ? (
          editor.type === 'assignment' ? (
            <Text style={styles.hint}>
              Assignments use the instructions from step 1. Students submit text and files.
              Question marks total: {questionsTotal || editor.totalMarks || 0}
            </Text>
          ) : (
            <>
              {editor.questions.map((q, qi) => (
                <View key={q.clientId} style={styles.qCard}>
                  <View style={styles.row}>
                    {QTYPES.map(t => (
                      <TouchableOpacity
                        key={t}
                        style={[styles.chip, q.type === t && styles.chipOn]}
                        onPress={() => {
                          const questions = editor.questions.map((item, i) =>
                            i === qi ? { ...item, type: t, options: t === 'mcq' ? item.options.length ? item.options : newQuestion('mcq').options : [] } : item
                          );
                          patch({ questions });
                        }}
                      >
                        <Text style={[styles.chipText, q.type === t && styles.chipTextOn]}>
                          {t.replace('_', ' ')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Field
                    label={`Question ${qi + 1}`}
                    value={q.prompt}
                    onChange={prompt => {
                      const questions = editor.questions.map((item, i) =>
                        i === qi ? { ...item, prompt } : item
                      );
                      patch({ questions });
                    }}
                    multiline
                  />
                  <Field
                    label="Marks"
                    value={String(q.marks)}
                    keyboard="numeric"
                    onChange={v => {
                      const questions = editor.questions.map((item, i) =>
                        i === qi ? { ...item, marks: Number(v) || 0 } : item
                      );
                      patch({ questions });
                    }}
                  />
                  {q.type === 'mcq'
                    ? q.options.map((opt, oi) => (
                        <View key={opt.clientId} style={styles.optRow}>
                          <TouchableOpacity
                            onPress={() => {
                              const questions = editor.questions.map((item, i) =>
                                i === qi
                                  ? {
                                      ...item,
                                      options: item.options.map((o, j) => ({
                                        ...o,
                                        isCorrect: j === oi,
                                      })),
                                    }
                                  : item
                              );
                              patch({ questions });
                            }}
                            style={[styles.radio, opt.isCorrect && styles.radioOn]}
                          />
                          <TextInput
                            style={[styles.input, { flex: 1 }]}
                            placeholder={`Option ${oi + 1}`}
                            placeholderTextColor={GLASS.placeholder}
                            value={opt.text}
                            onChangeText={text => {
                              const questions = editor.questions.map((item, i) =>
                                i === qi
                                  ? {
                                      ...item,
                                      options: item.options.map((o, j) =>
                                        j === oi ? { ...o, text } : o
                                      ),
                                    }
                                  : item
                              );
                              patch({ questions });
                            }}
                          />
                        </View>
                      ))
                    : null}
                  {q.type === 'true_false' ? (
                    <View style={styles.row}>
                      {['True', 'False'].map(label => {
                        const val = label === 'True';
                        return (
                          <TouchableOpacity
                            key={label}
                            style={[styles.chip, q.correctTrueFalse === val && styles.chipOn]}
                            onPress={() => {
                              const questions = editor.questions.map((item, i) =>
                                i === qi ? { ...item, correctTrueFalse: val } : item
                              );
                              patch({ questions });
                            }}
                          >
                            <Text style={styles.chipText}>{label}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ) : null}
                  {q.type === 'short_answer' ? (
                    <Field
                      label="Answer key (optional)"
                      value={q.answerKey}
                      onChange={answerKey => {
                        const questions = editor.questions.map((item, i) =>
                          i === qi ? { ...item, answerKey } : item
                        );
                        patch({ questions });
                      }}
                    />
                  ) : null}
                  {q.type === 'long_answer' ? (
                    <Field
                      label="Rubric / instructions"
                      value={q.rubric}
                      onChange={rubric => {
                        const questions = editor.questions.map((item, i) =>
                          i === qi ? { ...item, rubric } : item
                        );
                        patch({ questions });
                      }}
                      multiline
                    />
                  ) : null}
                  <Field
                    label="Explanation (optional)"
                    value={q.explanation}
                    onChange={explanation => {
                      const questions = editor.questions.map((item, i) =>
                        i === qi ? { ...item, explanation } : item
                      );
                      patch({ questions });
                    }}
                  />
                  <View style={styles.row}>
                    <CustomButton
                      title="Up"
                      onPress={() => {
                        if (qi === 0) return;
                        const questions = [...editor.questions];
                        [questions[qi - 1], questions[qi]] = [questions[qi], questions[qi - 1]];
                        patch({ questions });
                      }}
                      backgroundColor={GLASS.primarySoft}
                      textColor={GLASS.primaryDeep}
                      style={{ flex: 1 }}
                    />
                    <CustomButton
                      title="Down"
                      onPress={() => {
                        if (qi >= editor.questions.length - 1) return;
                        const questions = [...editor.questions];
                        [questions[qi + 1], questions[qi]] = [questions[qi], questions[qi + 1]];
                        patch({ questions });
                      }}
                      backgroundColor={GLASS.primarySoft}
                      textColor={GLASS.primaryDeep}
                      style={{ flex: 1 }}
                    />
                    <CustomButton
                      title="Delete"
                      onPress={() =>
                        patch({
                          questions: editor.questions.filter((_, i) => i !== qi),
                        })
                      }
                      backgroundColor="#FEE2E2"
                      textColor={GLASS.error}
                      style={{ flex: 1 }}
                    />
                  </View>
                </View>
              ))}
              <CustomButton
                title="Add question"
                onPress={() => patch({ questions: [...editor.questions, newQuestion('mcq')] })}
                backgroundColor={GLASS.primarySoft}
                textColor={GLASS.primaryDeep}
              />
            </>
          )
        ) : null}

        {step === 2 ? (
          <>
            <Toggle
              label="Shuffle questions"
              value={editor.shuffleQuestions}
              onValueChange={shuffleQuestions => patch({ shuffleQuestions })}
            />
            <Toggle
              label="Show result immediately"
              value={editor.showResultImmediately}
              onValueChange={showResultImmediately => patch({ showResultImmediately })}
            />
            <Toggle
              label="Show correct answers after grading"
              value={editor.showCorrectAnswers}
              onValueChange={showCorrectAnswers => patch({ showCorrectAnswers })}
            />
            <Text style={styles.label}>Late submissions</Text>
            <View style={styles.row}>
              {(['reject', 'allow', 'allow_with_penalty'] as LatePolicy[]).map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.chip, editor.latePolicy === p && styles.chipOn]}
                  onPress={() => patch({ latePolicy: p })}
                >
                  <Text style={styles.chipText}>{p.replace(/_/g, ' ')}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <Text style={styles.hint}>
              Only students with an active booking can be assigned.
            </Text>
            {eligible.length === 0 ? (
              <Text style={styles.hint}>No eligible students found yet.</Text>
            ) : (
              eligible.map(s => {
                const on = editor.assignedStudentIds.includes(s._id);
                return (
                  <TouchableOpacity
                    key={s._id}
                    style={[styles.student, on && styles.chipOn]}
                    onPress={() => {
                      const assignedStudentIds = on
                        ? editor.assignedStudentIds.filter(id => id !== s._id)
                        : [...editor.assignedStudentIds, s._id];
                      patch({ assignedStudentIds });
                    }}
                  >
                    <Text style={styles.chipText}>
                      {s.name}
                      {s.subject ? ` · ${s.subject}` : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </>
        ) : null}

        {step === 4 ? (
          <View style={styles.qCard}>
            <Text style={styles.prompt}>{editor.title || 'Untitled'}</Text>
            <Text style={styles.hint}>
              {editor.type} · {editor.subject} · {editor.questions.length} questions ·{' '}
              {editor.assignedStudentIds.length} students
            </Text>
            <Text style={styles.hint}>Due {editor.dueDate} {editor.dueTime}</Text>
          </View>
        ) : null}

        <View style={styles.row}>
          {step > 0 ? (
            <CustomButton
              title="Back"
              onPress={() => setStep(s => s - 1)}
              backgroundColor={GLASS.primarySoft}
              textColor={GLASS.primaryDeep}
              style={{ flex: 1 }}
            />
          ) : null}
          {step < STEPS.length - 1 ? (
            <CustomButton title="Next" onPress={next} style={{ flex: 1 }} />
          ) : null}
        </View>
        <CustomButton
          title="Save draft"
          onPress={() => void save('draft')}
          loading={mutating}
          backgroundColor={GLASS.primarySoft}
          textColor={GLASS.primaryDeep}
        />
        {step === STEPS.length - 1 ? (
          <CustomButton
            title="Assign / publish"
            onPress={() => void save('published')}
            loading={mutating}
          />
        ) : null}
      </ScrollView>
    </GlassScreen>
  );
};

const Field = ({
  label,
  value,
  onChange,
  multiline,
  keyboard,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  keyboard?: 'numeric';
}) => (
  <View>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && { minHeight: 80, textAlignVertical: 'top' }]}
      value={value}
      onChangeText={onChange}
      placeholder={label}
      placeholderTextColor={GLASS.placeholder}
      multiline={multiline}
      keyboardType={keyboard}
    />
  </View>
);

const Toggle = ({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) => (
  <View style={styles.toggle}>
    <Text style={styles.chipText}>{label}</Text>
    <Switch value={value} onValueChange={onValueChange} trackColor={{ true: GLASS.primary }} />
  </View>
);

const styles = StyleSheet.create({
  steps: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 16, paddingBottom: 8 },
  step: { fontSize: 11, color: GLASS.textMuted, fontWeight: '700' },
  stepOn: { color: GLASS.primaryDeep },
  content: { padding: 16, paddingBottom: 48, gap: 10 },
  label: { color: GLASS.textSecondary, fontWeight: '700', fontSize: 12, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: GLASS.inputBorder,
    backgroundColor: GLASS.inputBg,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: GLASS.textPrimary,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GLASS.cardBorder,
    backgroundColor: 'rgba(117, 72, 245, 0.07)',
  },
  chipOn: { backgroundColor: GLASS.primarySoft, borderColor: GLASS.primary },
  chipText: { color: GLASS.textPrimary, fontWeight: '700', fontSize: 12, textTransform: 'capitalize' },
  chipTextOn: { color: GLASS.primaryDeep },
  qCard: {
    borderWidth: 1,
    borderColor: GLASS.cardBorder,
    backgroundColor: 'rgba(255,255,255,0.42)',
    borderRadius: 16,
    padding: 12,
    gap: 8,
  },
  optRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: GLASS.primary,
  },
  radioOn: { backgroundColor: GLASS.primary },
  hint: { color: GLASS.textSecondary, lineHeight: 20 },
  prompt: { fontWeight: '800', fontSize: 16, color: GLASS.textPrimary },
  student: {
    borderWidth: 1,
    borderColor: GLASS.cardBorder,
    borderRadius: 14,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.42)',
  },
  toggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.42)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: GLASS.cardBorder,
  },
});

export default TutorAssessmentEditorScreen;
