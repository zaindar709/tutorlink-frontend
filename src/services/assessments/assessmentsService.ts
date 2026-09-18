import { AxiosError } from 'axios';
import {
  assignAssessmentAPI,
  createAssessmentAPI,
  deleteAssessmentAPI,
  getAssessmentByIdAPI,
  getAssessmentResultsAPI,
  getAssessmentSubmissionsAPI,
  getAttemptAPI,
  getEligibleStudentsAPI,
  getStudentAssessmentsAPI,
  getStudentAttemptResultAPI,
  getSubmissionAttemptAPI,
  getTutorAssessmentsAPI,
  gradeAttemptAPI,
  publishAssessmentAPI,
  saveAttemptAnswersAPI,
  startAttemptAPI,
  submitAttemptAPI,
  updateAssessmentAPI,
  uploadAttemptFileAPI,
} from '../../api/assessments.api';
import { getBookingsAPI } from '../../api/bookings.api';
import {
  Assessment,
  AssessmentAttempt,
  AssessmentListParams,
  AssessmentListResult,
  AssessmentQuestion,
  AssessmentType,
  AttemptAnswer,
  AttemptStatus,
  CreateAssessmentPayload,
  EligibleStudent,
  GradeQuestionPayload,
  LatePolicy,
  QuestionType,
  SubmissionListItem,
} from '../../types/assessment.types';
import { getUserId } from '../../utils/api/userId';
import { ApiUser } from '../../types/api.types';

const asRecord = (v: unknown): Record<string, unknown> | null =>
  v && typeof v === 'object' ? (v as Record<string, unknown>) : null;

const extractPayload = (payload: unknown): unknown => {
  const root = asRecord(payload);
  if (!root) return payload;
  if (root.data !== undefined) {
    const nested = asRecord(root.data);
    if (nested && nested.data !== undefined && !Array.isArray(nested.data)) {
      return nested.data;
    }
    return root.data;
  }
  return payload;
};

const asString = (v: unknown, fallback = '') =>
  v == null ? fallback : String(v).trim() || fallback;

const asNumber = (v: unknown, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const asBool = (v: unknown, fallback = false) =>
  typeof v === 'boolean' ? v : fallback;

const TYPES: AssessmentType[] = ['quiz', 'test', 'assignment'];
const QTYPES: QuestionType[] = [
  'mcq',
  'true_false',
  'short_answer',
  'long_answer',
];
const ATTEMPT: AttemptStatus[] = [
  'in_progress',
  'submitted',
  'grading',
  'graded',
  'expired',
];
const LATE: LatePolicy[] = ['reject', 'allow', 'allow_with_penalty'];

const asType = (v: unknown): AssessmentType => {
  const raw = asString(v).toLowerCase();
  return TYPES.includes(raw as AssessmentType)
    ? (raw as AssessmentType)
    : 'quiz';
};

const asQType = (v: unknown): QuestionType => {
  const raw = asString(v).toLowerCase().replace('-', '_');
  if (raw === 'truefalse' || raw === 'true/false') return 'true_false';
  if (raw === 'short' || raw === 'shortanswer') return 'short_answer';
  if (raw === 'long' || raw === 'essay') return 'long_answer';
  return QTYPES.includes(raw as QuestionType) ? (raw as QuestionType) : 'mcq';
};

const person = (raw: unknown): Assessment['tutor'] | undefined => {
  if (typeof raw === 'string' && raw.trim()) {
    return { _id: raw.trim(), name: 'User' };
  }
  const p = asRecord(raw);
  if (!p) return undefined;
  const id = asString(p._id || p.id);
  if (!id) return undefined;
  return {
    _id: id,
    name: asString(p.name || p.fullName, 'User'),
    avatarUrl: p.avatarUrl ? String(p.avatarUrl) : undefined,
  };
};

const normalizeQuestion = (
  raw: unknown,
  index: number
): AssessmentQuestion | null => {
  const q = asRecord(raw);
  if (!q) return null;
  const id = asString(q._id || q.id || `q-${index}`);
  const optionsRaw = Array.isArray(q.options) ? q.options : [];
  return {
    _id: id,
    type: asQType(q.type),
    prompt: asString(q.prompt || q.question || q.text),
    marks: asNumber(q.marks || q.maxMarks, 1),
    order: asNumber(q.order, index),
    options: optionsRaw.map((opt, i) => {
      if (typeof opt === 'string') {
        return { _id: `${id}-opt-${i}`, text: opt };
      }
      const o = asRecord(opt) || {};
      return {
        _id: asString(o._id || o.id, `${id}-opt-${i}`),
        text: asString(o.text || o.label),
        isCorrect: typeof o.isCorrect === 'boolean' ? o.isCorrect : undefined,
      };
    }),
    correctTrueFalse:
      typeof q.correctTrueFalse === 'boolean'
        ? q.correctTrueFalse
        : typeof q.correctAnswer === 'boolean'
          ? q.correctAnswer
          : undefined,
    answerKey: q.answerKey ? String(q.answerKey) : undefined,
    explanation: q.explanation ? String(q.explanation) : undefined,
    rubric: q.rubric ? String(q.rubric) : undefined,
  };
};

export const normalizeAssessment = (raw: unknown): Assessment | null => {
  const body = asRecord(extractPayload(raw)) || asRecord(raw);
  if (!body) return null;
  const id = asString(body._id || body.id);
  if (!id) return null;
  const questionsRaw = Array.isArray(body.questions) ? body.questions : [];
  const questions = questionsRaw
    .map((q, i) => normalizeQuestion(q, i))
    .filter(Boolean) as AssessmentQuestion[];
  const late = asString(body.latePolicy, 'reject');
  const statusRaw = asString(body.status, 'draft').toLowerCase();
  return {
    _id: id,
    type: asType(body.type),
    title: asString(body.title, 'Untitled'),
    description: asString(body.description),
    instructions: asString(body.instructions),
    subject: asString(body.subject),
    totalMarks: asNumber(body.totalMarks, questions.reduce((s, q) => s + q.marks, 0)),
    passingMarks: asNumber(body.passingMarks),
    durationMinutes: body.durationMinutes != null ? asNumber(body.durationMinutes) : undefined,
    startAt: body.startAt ? String(body.startAt) : undefined,
    dueAt: body.dueAt || body.deadline ? String(body.dueAt || body.deadline) : undefined,
    attemptsAllowed: asNumber(body.attemptsAllowed, 1),
    shuffleQuestions: asBool(body.shuffleQuestions),
    showResultImmediately: asBool(body.showResultImmediately, true),
    showCorrectAnswers: asBool(body.showCorrectAnswers),
    latePolicy: LATE.includes(late as LatePolicy) ? (late as LatePolicy) : 'reject',
    status:
      statusRaw === 'published' ||
      statusRaw === 'closed' ||
      statusRaw === 'archived'
        ? (statusRaw as Assessment['status'])
        : 'draft',
    tutor: person(body.tutor),
    assignedStudentIds: Array.isArray(body.assignedStudentIds)
      ? body.assignedStudentIds.map(String)
      : undefined,
    assignedCount: asNumber(body.assignedCount, Array.isArray(body.assignedStudentIds) ? body.assignedStudentIds.length : 0),
    questionCount: asNumber(body.questionCount, questions.length),
    questions: questions.length ? questions : undefined,
    attemptsUsed: body.attemptsUsed != null ? asNumber(body.attemptsUsed) : undefined,
    remainingAttempts:
      body.remainingAttempts != null ? asNumber(body.remainingAttempts) : undefined,
    studentStatus: body.studentStatus
      ? (asString(body.studentStatus) as Assessment['studentStatus'])
      : undefined,
    lastAttemptId: body.lastAttemptId ? String(body.lastAttemptId) : undefined,
    pendingGradingCount:
      body.pendingGradingCount != null
        ? asNumber(body.pendingGradingCount)
        : undefined,
    createdAt: body.createdAt ? String(body.createdAt) : undefined,
    updatedAt: body.updatedAt ? String(body.updatedAt) : undefined,
  };
};

const normalizeAnswer = (raw: unknown): AttemptAnswer | null => {
  const a = asRecord(raw);
  if (!a) return null;
  const questionId = asString(a.questionId || a._id);
  if (!questionId) return null;
  return {
    questionId,
    selectedOptionId: a.selectedOptionId ? String(a.selectedOptionId) : undefined,
    trueFalse: typeof a.trueFalse === 'boolean' ? a.trueFalse : undefined,
    text: a.text != null ? String(a.text) : undefined,
  };
};

export const normalizeAttempt = (raw: unknown): AssessmentAttempt | null => {
  const body = asRecord(extractPayload(raw)) || asRecord(raw);
  if (!body) return null;
  const id = asString(body._id || body.id);
  if (!id) return null;
  const statusRaw = asString(body.status, 'in_progress');
  const answersRaw = Array.isArray(body.answers) ? body.answers : [];
  return {
    _id: id,
    assessmentId: asString(body.assessmentId || body.assessment),
    studentId: asString(body.studentId) || person(body.student)?._id,
    student: person(body.student),
    status: ATTEMPT.includes(statusRaw as AttemptStatus)
      ? (statusRaw as AttemptStatus)
      : 'in_progress',
    attemptNumber: asNumber(body.attemptNumber, 1),
    startedAt: body.startedAt ? String(body.startedAt) : undefined,
    expiresAt: body.expiresAt ? String(body.expiresAt) : undefined,
    submittedAt: body.submittedAt ? String(body.submittedAt) : undefined,
    answers: answersRaw.map(normalizeAnswer).filter(Boolean) as AttemptAnswer[],
    score: body.score != null ? asNumber(body.score) : undefined,
    percentage: body.percentage != null ? asNumber(body.percentage) : undefined,
    maxScore: asNumber(body.maxScore || body.totalMarks),
    needsManualGrading: asBool(body.needsManualGrading),
    late: asBool(body.late),
    feedback: body.feedback ? String(body.feedback) : undefined,
    files: Array.isArray(body.files)
      ? body.files.map((f, i) => {
          const file = asRecord(f) || {};
          return {
            _id: asString(file._id || file.id, `file-${i}`),
            name: asString(file.name || file.originalName, 'file'),
            url: asString(file.url || file.path),
            mimeType: file.mimeType ? String(file.mimeType) : undefined,
            size: file.size != null ? asNumber(file.size) : undefined,
          };
        })
      : undefined,
    questionResults: Array.isArray(body.questionResults)
      ? body.questionResults.map(qr => {
          const r = asRecord(qr) || {};
          return {
            questionId: asString(r.questionId),
            prompt: asString(r.prompt),
            type: asQType(r.type),
            studentAnswer: r.studentAnswer != null ? String(r.studentAnswer) : undefined,
            correctAnswer: r.correctAnswer != null ? String(r.correctAnswer) : undefined,
            awardedMarks: asNumber(r.awardedMarks),
            maxMarks: asNumber(r.maxMarks || r.marks),
            explanation: r.explanation ? String(r.explanation) : undefined,
          };
        })
      : undefined,
  };
};

const unwrapList = (payload: unknown): unknown[] => {
  const extracted = extractPayload(payload);
  if (Array.isArray(extracted)) return extracted;
  const rec = asRecord(extracted);
  if (!rec) return [];
  if (Array.isArray(rec.items)) return rec.items;
  if (Array.isArray(rec.assessments)) return rec.assessments;
  if (Array.isArray(rec.results)) return rec.results;
  return [];
};

export const getAssessmentErrorMessage = (error: unknown): string => {
  if (typeof error === 'string' && error.trim()) return error;
  if (error instanceof AxiosError) {
    const data = error.response?.data as
      | { message?: string; code?: string }
      | undefined;
    const code = String(data?.code || '');
    const msg = asString(data?.message);
    switch (code) {
      case 'UNAUTHORIZED':
        return 'Please sign in again.';
      case 'FORBIDDEN':
        return 'You do not have access to this assessment.';
      case 'NOT_ASSIGNED':
        return 'This assessment is not assigned to you.';
      case 'NOT_ACTIVE':
        return 'This assessment is not open yet.';
      case 'DEADLINE_PASSED':
        return 'The deadline has passed.';
      case 'NO_ATTEMPTS_LEFT':
        return 'You have no attempts remaining.';
      case 'ALREADY_SUBMITTED':
        return 'This attempt is already submitted.';
      case 'ATTEMPT_LOCKED':
        return 'This attempt is locked and cannot be changed.';
      case 'INVALID_MARKS':
        return 'Awarded marks must be between 0 and the question marks.';
      case 'VALIDATION_ERROR':
        return msg || 'Please check the fields and try again.';
      case 'ASSESSMENT_NOT_FOUND':
        return 'Assessment not found.';
      default:
        if (error.response?.status === 404) {
          return 'Assessments are not available on the server yet.';
        }
        return msg || error.message || 'Something went wrong.';
    }
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong.';
};

export const createAssessment = async (data: CreateAssessmentPayload) => {
  const res = await createAssessmentAPI(data);
  const item = normalizeAssessment(res.data);
  if (!item) throw new Error('Could not create assessment.');
  return item;
};

export const updateAssessment = async (
  id: string,
  data: Partial<CreateAssessmentPayload>
) => {
  const res = await updateAssessmentAPI(id, data);
  const item = normalizeAssessment(res.data);
  if (!item) throw new Error('Could not update assessment.');
  return item;
};

export const fetchTutorAssessments = async (
  params?: AssessmentListParams
): Promise<AssessmentListResult> => {
  const res = await getTutorAssessmentsAPI(params);
  const items = unwrapList(res.data)
    .map(normalizeAssessment)
    .filter(Boolean) as Assessment[];
  const rec = asRecord(extractPayload(res.data));
  return {
    items,
    pagination: rec?.pagination as AssessmentListResult['pagination'],
  };
};

export const fetchStudentAssessments = async (
  params?: AssessmentListParams
): Promise<AssessmentListResult> => {
  const res = await getStudentAssessmentsAPI(params);
  const items = unwrapList(res.data)
    .map(normalizeAssessment)
    .filter(Boolean) as Assessment[];
  const rec = asRecord(extractPayload(res.data));
  return {
    items,
    pagination: rec?.pagination as AssessmentListResult['pagination'],
  };
};

export const fetchAssessmentById = async (id: string) => {
  const res = await getAssessmentByIdAPI(id);
  const item = normalizeAssessment(res.data);
  if (!item) throw new Error('Assessment not found.');
  return item;
};

export const publishAssessment = async (id: string) => {
  const res = await publishAssessmentAPI(id);
  const item = normalizeAssessment(res.data);
  if (!item) throw new Error('Could not publish assessment.');
  return item;
};

export const assignAssessment = async (id: string, studentIds: string[]) => {
  const res = await assignAssessmentAPI(id, studentIds);
  const item = normalizeAssessment(res.data);
  if (!item) throw new Error('Could not assign assessment.');
  return item;
};

export const deleteAssessment = async (id: string) => {
  await deleteAssessmentAPI(id);
  return id;
};

export const fetchEligibleStudents = async (): Promise<EligibleStudent[]> => {
  try {
    const res = await getEligibleStudentsAPI();
    const list = unwrapList(res.data);
    return list
      .map(item => {
        const p = person(item);
        const rec = asRecord(item) || {};
        if (!p) return null;
        return {
          ...p,
          subject: rec.subject ? String(rec.subject) : undefined,
          bookingId: rec.bookingId ? String(rec.bookingId) : undefined,
        };
      })
      .filter(Boolean) as EligibleStudent[];
  } catch {
    const res = await getBookingsAPI(undefined, 'active');
    const bookings = unwrapList(res.data);
    const map = new Map<string, EligibleStudent>();
    bookings.forEach(item => {
      const rec = asRecord(item) || {};
      const student = person(rec.student);
      if (!student) return;
      if (!map.has(student._id)) {
        map.set(student._id, {
          ...student,
          subject: rec.subject ? String(rec.subject) : undefined,
          bookingId: asString(rec._id || rec.id) || undefined,
        });
      }
    });
    return Array.from(map.values());
  }
};

export const startAttempt = async (assessmentId: string) => {
  const res = await startAttemptAPI(assessmentId);
  const item = normalizeAttempt(res.data);
  if (!item) throw new Error('Could not start attempt.');
  return item;
};

export const fetchAttempt = async (assessmentId: string, attemptId: string) => {
  const res = await getAttemptAPI(assessmentId, attemptId);
  const item = normalizeAttempt(res.data);
  if (!item) throw new Error('Attempt not found.');
  return item;
};

export const saveAttemptAnswers = async (
  assessmentId: string,
  attemptId: string,
  answers: AttemptAnswer[]
) => {
  const res = await saveAttemptAnswersAPI(assessmentId, attemptId, answers);
  const item = normalizeAttempt(res.data);
  return item;
};

export const submitAttempt = async (assessmentId: string, attemptId: string) => {
  const res = await submitAttemptAPI(assessmentId, attemptId);
  const item = normalizeAttempt(res.data);
  if (!item) throw new Error('Could not submit.');
  return item;
};

export const uploadAttemptFile = async (
  assessmentId: string,
  attemptId: string,
  file: { uri: string; name?: string; type?: string }
) => {
  const res = await uploadAttemptFileAPI(assessmentId, attemptId, file);
  const item = normalizeAttempt(res.data);
  if (!item) throw new Error('Could not upload file.');
  return item;
};

export const fetchStudentResult = async (
  assessmentId: string,
  attemptId: string
) => {
  const res = await getStudentAttemptResultAPI(assessmentId, attemptId);
  const item = normalizeAttempt(res.data);
  if (!item) throw new Error('Result not found.');
  return item;
};

export const fetchSubmissions = async (assessmentId: string) => {
  const res = await getAssessmentSubmissionsAPI(assessmentId);
  return unwrapList(res.data)
    .map(item => {
      const rec = asRecord(item) || {};
      const student = person(rec.student);
      if (!student) return null;
      const statusRaw = asString(rec.status, 'submitted');
      return {
        _id: asString(rec._id || rec.id || rec.attemptId),
        student,
        status: ATTEMPT.includes(statusRaw as AttemptStatus)
          ? (statusRaw as AttemptStatus)
          : 'submitted',
        submittedAt: rec.submittedAt ? String(rec.submittedAt) : undefined,
        late: asBool(rec.late),
        score: rec.score != null ? asNumber(rec.score) : undefined,
        percentage: rec.percentage != null ? asNumber(rec.percentage) : undefined,
        gradingStatus:
          rec.gradingStatus === 'graded' || statusRaw === 'graded'
            ? 'graded'
            : 'pending',
      } as SubmissionListItem;
    })
    .filter(Boolean) as SubmissionListItem[];
};

export const fetchResults = async (assessmentId: string) => {
  try {
    const res = await getAssessmentResultsAPI(assessmentId);
    return unwrapList(res.data).length
      ? (unwrapList(res.data)
          .map(item => {
            const rec = asRecord(item) || {};
            const student = person(rec.student);
            if (!student) return null;
            return {
              _id: asString(rec._id || rec.id),
              student,
              status: 'graded' as AttemptStatus,
              submittedAt: rec.submittedAt ? String(rec.submittedAt) : undefined,
              late: asBool(rec.late),
              score: rec.score != null ? asNumber(rec.score) : undefined,
              percentage:
                rec.percentage != null ? asNumber(rec.percentage) : undefined,
              gradingStatus: 'graded' as const,
            };
          })
          .filter(Boolean) as SubmissionListItem[])
      : fetchSubmissions(assessmentId);
  } catch {
    return fetchSubmissions(assessmentId);
  }
};

export const fetchSubmissionAttempt = async (
  assessmentId: string,
  attemptId: string
) => {
  const res = await getSubmissionAttemptAPI(assessmentId, attemptId);
  const item = normalizeAttempt(res.data);
  if (!item) throw new Error('Submission not found.');
  return item;
};

export const gradeAttempt = async (
  assessmentId: string,
  attemptId: string,
  data: {
    questions?: GradeQuestionPayload[];
    awardedMarks?: number;
    feedback?: string;
    publish?: boolean;
  }
) => {
  const res = await gradeAttemptAPI(assessmentId, attemptId, data);
  const item = normalizeAttempt(res.data);
  if (!item) throw new Error('Could not save grades.');
  return item;
};

export const studentIdFromUser = (user?: ApiUser | null) => getUserId(user);
