import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  assignAssessment,
  createAssessment,
  deleteAssessment,
  fetchAssessmentById,
  fetchAttempt,
  fetchEligibleStudents,
  fetchStudentAssessments,
  fetchStudentResult,
  fetchSubmissionAttempt,
  fetchSubmissions,
  fetchTutorAssessments,
  getAssessmentErrorMessage,
  gradeAttempt,
  publishAssessment,
  saveAttemptAnswers,
  startAttempt,
  submitAttempt,
  updateAssessment,
  uploadAttemptFile,
} from '../../services/assessments/assessmentsService';
import {
  Assessment,
  AssessmentAttempt,
  AssessmentDraft,
  AssessmentListParams,
  AttemptAnswer,
  CreateAssessmentPayload,
  EligibleStudent,
  GradeQuestionPayload,
  SubmissionListItem,
} from '../../types/assessment.types';

type AssessmentState = {
  tutorIds: string[];
  studentIds: string[];
  byId: Record<string, Assessment>;
  currentId: string | null;
  currentAttempt: AssessmentAttempt | null;
  submissions: SubmissionListItem[];
  eligibleStudents: EligibleStudent[];
  editor: AssessmentDraft | null;
  listLoading: boolean;
  detailLoading: boolean;
  mutating: boolean;
  lastError: string | null;
};

export const emptyDraft = (): AssessmentDraft => ({
  type: 'quiz',
  title: '',
  description: '',
  instructions: '',
  subject: '',
  totalMarks: '',
  passingMarks: '',
  durationMinutes: '30',
  startDate: '',
  startTime: '',
  dueDate: '',
  dueTime: '',
  attemptsAllowed: '1',
  shuffleQuestions: false,
  showResultImmediately: true,
  showCorrectAnswers: false,
  latePolicy: 'reject',
  questions: [],
  assignedStudentIds: [],
});

const pad = (n: number) => String(n).padStart(2, '0');

const splitLocal = (iso?: string) => {
  if (!iso) return { date: '', time: '' };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: '', time: '' };
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
};

export const assessmentToDraft = (item: Assessment): AssessmentDraft => {
  const start = splitLocal(item.startAt);
  const due = splitLocal(item.dueAt);
  return {
    _id: item._id,
    type: item.type,
    title: item.title,
    description: item.description || '',
    instructions: item.instructions || '',
    subject: item.subject || '',
    totalMarks: String(item.totalMarks ?? ''),
    passingMarks: String(item.passingMarks ?? ''),
    durationMinutes: String(item.durationMinutes ?? ''),
    startDate: start.date,
    startTime: start.time,
    dueDate: due.date,
    dueTime: due.time,
    attemptsAllowed: String(item.attemptsAllowed ?? 1),
    shuffleQuestions: item.shuffleQuestions,
    showResultImmediately: item.showResultImmediately,
    showCorrectAnswers: item.showCorrectAnswers,
    latePolicy: item.latePolicy,
    assignedStudentIds: item.assignedStudentIds || [],
    questions: (item.questions || []).map((q, i) => ({
      clientId: q._id || `q-${i}`,
      _id: q._id,
      type: q.type,
      prompt: q.prompt,
      marks: q.marks,
      options: (q.options || []).map((o, oi) => ({
        clientId: o._id || `o-${i}-${oi}`,
        _id: o._id,
        text: o.text,
        isCorrect: Boolean(o.isCorrect),
      })),
      correctTrueFalse: q.correctTrueFalse ?? true,
      answerKey: q.answerKey || '',
      explanation: q.explanation || '',
      rubric: q.rubric || '',
    })),
  };
};

const initialState: AssessmentState = {
  tutorIds: [],
  studentIds: [],
  byId: {},
  currentId: null,
  currentAttempt: null,
  submissions: [],
  eligibleStudents: [],
  editor: null,
  listLoading: false,
  detailLoading: false,
  mutating: false,
  lastError: null,
};

const upsert = (state: AssessmentState, item: Assessment) => {
  state.byId[item._id] = item;
};

const mergeAttempt = (
  prev: AssessmentAttempt | null,
  next: AssessmentAttempt
): AssessmentAttempt => ({
  ...prev,
  ...next,
  answers: next.answers?.length ? next.answers : prev?.answers || [],
  questions: next.questions?.length ? next.questions : prev?.questions,
  files: next.files?.length ? next.files : prev?.files,
});

const applyAttempt = (state: AssessmentState, attempt: AssessmentAttempt) => {
  state.currentAttempt = mergeAttempt(state.currentAttempt, attempt);
  const existing = attempt.assessmentId ? state.byId[attempt.assessmentId] : undefined;
  if (!existing) return;
  state.byId[existing._id] = {
    ...existing,
    lastAttemptId: attempt._id || existing.lastAttemptId,
    questions: attempt.questions?.length ? attempt.questions : existing.questions,
  };
};

export const fetchTutorAssessmentsThunk = createAsyncThunk(
  'assessment/tutorList',
  async (params: AssessmentListParams | undefined, { rejectWithValue }) => {
    try {
      return await fetchTutorAssessments(params);
    } catch (err) {
      return rejectWithValue(getAssessmentErrorMessage(err));
    }
  }
);

export const fetchStudentAssessmentsThunk = createAsyncThunk(
  'assessment/studentList',
  async (params: AssessmentListParams | undefined, { rejectWithValue }) => {
    try {
      return await fetchStudentAssessments(params);
    } catch (err) {
      return rejectWithValue(getAssessmentErrorMessage(err));
    }
  }
);

export const fetchAssessmentThunk = createAsyncThunk(
  'assessment/detail',
  async (id: string, { rejectWithValue }) => {
    try {
      return await fetchAssessmentById(id);
    } catch (err) {
      return rejectWithValue(getAssessmentErrorMessage(err));
    }
  }
);

export const saveAssessmentThunk = createAsyncThunk(
  'assessment/save',
  async (
    {
      id,
      data,
    }: { id?: string; data: CreateAssessmentPayload },
    { rejectWithValue }
  ) => {
    try {
      return id ? await updateAssessment(id, data) : await createAssessment(data);
    } catch (err) {
      return rejectWithValue(getAssessmentErrorMessage(err));
    }
  }
);

export const publishAssessmentThunk = createAsyncThunk(
  'assessment/publish',
  async (
    { id, studentIds }: { id: string; studentIds?: string[] },
    { rejectWithValue }
  ) => {
    try {
      if (studentIds?.length) await assignAssessment(id, studentIds);
      return await publishAssessment(id);
    } catch (err) {
      return rejectWithValue(getAssessmentErrorMessage(err));
    }
  }
);

export const deleteAssessmentThunk = createAsyncThunk(
  'assessment/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteAssessment(id);
      return id;
    } catch (err) {
      return rejectWithValue(getAssessmentErrorMessage(err));
    }
  }
);

export const fetchEligibleStudentsThunk = createAsyncThunk(
  'assessment/eligible',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchEligibleStudents();
    } catch (err) {
      return rejectWithValue(getAssessmentErrorMessage(err));
    }
  }
);

export const startAttemptThunk = createAsyncThunk(
  'assessment/startAttempt',
  async (assessmentId: string, { rejectWithValue }) => {
    try {
      return await startAttempt(assessmentId);
    } catch (err) {
      return rejectWithValue(getAssessmentErrorMessage(err));
    }
  }
);

export const fetchAttemptThunk = createAsyncThunk(
  'assessment/fetchAttempt',
  async (
    {
      assessmentId,
      attemptId,
      preferResult = true,
    }: { assessmentId: string; attemptId: string; preferResult?: boolean },
    { rejectWithValue }
  ) => {
    try {
      if (!preferResult) {
        return await fetchAttempt(assessmentId, attemptId);
      }
      return await fetchStudentResult(assessmentId, attemptId).catch(() =>
        fetchAttempt(assessmentId, attemptId)
      );
    } catch (err) {
      return rejectWithValue(getAssessmentErrorMessage(err));
    }
  }
);

export const saveAnswersThunk = createAsyncThunk(
  'assessment/saveAnswers',
  async (
    {
      assessmentId,
      attemptId,
      answers,
    }: {
      assessmentId: string;
      attemptId: string;
      answers: AttemptAnswer[];
    },
    { rejectWithValue }
  ) => {
    try {
      return await saveAttemptAnswers(assessmentId, attemptId, answers);
    } catch (err) {
      return rejectWithValue(getAssessmentErrorMessage(err));
    }
  }
);

export const submitAttemptThunk = createAsyncThunk(
  'assessment/submit',
  async (
    { assessmentId, attemptId }: { assessmentId: string; attemptId: string },
    { rejectWithValue }
  ) => {
    try {
      return await submitAttempt(assessmentId, attemptId);
    } catch (err) {
      return rejectWithValue(getAssessmentErrorMessage(err));
    }
  }
);

export const uploadAttemptFileThunk = createAsyncThunk(
  'assessment/uploadFile',
  async (
    {
      assessmentId,
      attemptId,
      file,
    }: {
      assessmentId: string;
      attemptId: string;
      file: { uri: string; name?: string; type?: string; size?: number };
    },
    { rejectWithValue }
  ) => {
    try {
      return await uploadAttemptFile(assessmentId, attemptId, file);
    } catch (err) {
      return rejectWithValue(getAssessmentErrorMessage(err));
    }
  }
);

export const fetchSubmissionsThunk = createAsyncThunk(
  'assessment/submissions',
  async (assessmentId: string, { rejectWithValue }) => {
    try {
      return await fetchSubmissions(assessmentId);
    } catch (err) {
      return rejectWithValue(getAssessmentErrorMessage(err));
    }
  }
);

export const fetchSubmissionAttemptThunk = createAsyncThunk(
  'assessment/submissionAttempt',
  async (
    { assessmentId, attemptId }: { assessmentId: string; attemptId: string },
    { rejectWithValue }
  ) => {
    try {
      return await fetchSubmissionAttempt(assessmentId, attemptId);
    } catch (err) {
      return rejectWithValue(getAssessmentErrorMessage(err));
    }
  }
);

export const gradeAttemptThunk = createAsyncThunk(
  'assessment/grade',
  async (
    {
      assessmentId,
      attemptId,
      questions,
      awardedMarks,
      feedback,
      publish,
    }: {
      assessmentId: string;
      attemptId: string;
      questions?: GradeQuestionPayload[];
      awardedMarks?: number;
      feedback?: string;
      publish?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      return await gradeAttempt(assessmentId, attemptId, {
        questions,
        awardedMarks,
        feedback,
        publish,
      });
    } catch (err) {
      return rejectWithValue(getAssessmentErrorMessage(err));
    }
  }
);

const assessmentSlice = createSlice({
  name: 'assessment',
  initialState,
  reducers: {
    clearAssessmentError: state => {
      state.lastError = null;
    },
    setEditor: (state, action: PayloadAction<AssessmentDraft | null>) => {
      state.editor = action.payload;
    },
    patchEditor: (state, action: PayloadAction<Partial<AssessmentDraft>>) => {
      state.editor = { ...(state.editor || emptyDraft()), ...action.payload };
    },
    setCurrentAttemptAnswers: (state, action: PayloadAction<AttemptAnswer[]>) => {
      if (state.currentAttempt) {
        state.currentAttempt.answers = action.payload;
      }
    },
    resetCurrentAttempt: state => {
      state.currentAttempt = null;
    },
  },
  extraReducers: builder => {
    const pending = (state: AssessmentState) => {
      state.lastError = null;
    };
    const failed = (state: AssessmentState, action: { payload?: unknown }) => {
      state.listLoading = false;
      state.detailLoading = false;
      state.mutating = false;
      state.lastError = String(action.payload || 'Request failed');
    };

    builder
      .addCase(fetchTutorAssessmentsThunk.pending, state => {
        pending(state);
        state.listLoading = true;
      })
      .addCase(fetchTutorAssessmentsThunk.fulfilled, (state, action) => {
        state.listLoading = false;
        action.payload.items.forEach(item => upsert(state, item));
        state.tutorIds = action.payload.items.map(i => i._id);
      })
      .addCase(fetchTutorAssessmentsThunk.rejected, failed)
      .addCase(fetchStudentAssessmentsThunk.pending, state => {
        pending(state);
        state.listLoading = true;
      })
      .addCase(fetchStudentAssessmentsThunk.fulfilled, (state, action) => {
        state.listLoading = false;
        action.payload.items.forEach(item => upsert(state, item));
        state.studentIds = action.payload.items.map(i => i._id);
      })
      .addCase(fetchStudentAssessmentsThunk.rejected, failed)
      .addCase(fetchAssessmentThunk.pending, state => {
        pending(state);
        state.detailLoading = true;
      })
      .addCase(fetchAssessmentThunk.fulfilled, (state, action) => {
        state.detailLoading = false;
        upsert(state, action.payload);
        state.currentId = action.payload._id;
      })
      .addCase(fetchAssessmentThunk.rejected, failed)
      .addCase(saveAssessmentThunk.pending, state => {
        pending(state);
        state.mutating = true;
      })
      .addCase(saveAssessmentThunk.fulfilled, (state, action) => {
        state.mutating = false;
        upsert(state, action.payload);
        state.currentId = action.payload._id;
        if (!state.tutorIds.includes(action.payload._id)) {
          state.tutorIds.unshift(action.payload._id);
        }
      })
      .addCase(saveAssessmentThunk.rejected, failed)
      .addCase(publishAssessmentThunk.pending, state => {
        pending(state);
        state.mutating = true;
      })
      .addCase(publishAssessmentThunk.fulfilled, (state, action) => {
        state.mutating = false;
        upsert(state, action.payload);
      })
      .addCase(publishAssessmentThunk.rejected, failed)
      .addCase(deleteAssessmentThunk.fulfilled, (state, action) => {
        delete state.byId[action.payload];
        state.tutorIds = state.tutorIds.filter(id => id !== action.payload);
      })
      .addCase(fetchEligibleStudentsThunk.fulfilled, (state, action) => {
        state.eligibleStudents = action.payload;
      })
      .addCase(startAttemptThunk.pending, state => {
        pending(state);
        state.mutating = true;
      })
      .addCase(startAttemptThunk.fulfilled, (state, action) => {
        state.mutating = false;
        applyAttempt(state, action.payload);
      })
      .addCase(startAttemptThunk.rejected, failed)
      .addCase(fetchAttemptThunk.fulfilled, (state, action) => {
        applyAttempt(state, action.payload);
        state.detailLoading = false;
      })
      .addCase(saveAnswersThunk.fulfilled, (state, action) => {
        if (action.payload) applyAttempt(state, action.payload);
      })
      .addCase(submitAttemptThunk.pending, (state) => {
        state.mutating = true;
        pending(state);
      })
      .addCase(submitAttemptThunk.fulfilled, (state, action) => {
        state.mutating = false;
        applyAttempt(state, action.payload);
      })
      .addCase(submitAttemptThunk.rejected, failed)
      .addCase(uploadAttemptFileThunk.fulfilled, (state, action) => {
        applyAttempt(state, action.payload);
      })
      .addCase(fetchSubmissionsThunk.fulfilled, (state, action) => {
        state.submissions = action.payload;
        state.listLoading = false;
      })
      .addCase(fetchSubmissionsThunk.pending, state => {
        state.listLoading = true;
        pending(state);
      })
      .addCase(fetchSubmissionsThunk.rejected, failed)
      .addCase(fetchSubmissionAttemptThunk.pending, state => {
        pending(state);
        state.detailLoading = true;
      })
      .addCase(fetchSubmissionAttemptThunk.fulfilled, (state, action) => {
        applyAttempt(state, action.payload);
        state.detailLoading = false;
      })
      .addCase(fetchSubmissionAttemptThunk.rejected, failed)
      .addCase(gradeAttemptThunk.pending, state => {
        state.mutating = true;
        pending(state);
      })
      .addCase(gradeAttemptThunk.fulfilled, (state, action) => {
        state.mutating = false;
        applyAttempt(state, action.payload);
      })
      .addCase(gradeAttemptThunk.rejected, failed);
  },
});

export const {
  clearAssessmentError,
  setEditor,
  patchEditor,
  setCurrentAttemptAnswers,
  resetCurrentAttempt,
} = assessmentSlice.actions;

export default assessmentSlice.reducer;
