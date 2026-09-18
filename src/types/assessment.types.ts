export type AssessmentType = 'quiz' | 'test' | 'assignment';

export type AssessmentStatus = 'draft' | 'published' | 'closed' | 'archived';

export type QuestionType = 'mcq' | 'true_false' | 'short_answer' | 'long_answer';

export type AttemptStatus =
  | 'in_progress'
  | 'submitted'
  | 'grading'
  | 'graded'
  | 'expired';

export type LatePolicy = 'reject' | 'allow' | 'allow_with_penalty';

export type ResultVisibility = 'immediate' | 'after_deadline' | 'manual';

export type AssessmentPerson = {
  _id: string;
  name: string;
  avatarUrl?: string;
};

export type AssessmentOption = {
  _id: string;
  text: string;
  /** Tutor-only. Never sent to students before grading/visibility rules. */
  isCorrect?: boolean;
};

export type AssessmentQuestion = {
  _id: string;
  type: QuestionType;
  prompt: string;
  marks: number;
  order: number;
  options?: AssessmentOption[];
  correctTrueFalse?: boolean;
  answerKey?: string;
  explanation?: string;
  rubric?: string;
};

export type Assessment = {
  _id: string;
  type: AssessmentType;
  title: string;
  description?: string;
  instructions?: string;
  subject: string;
  totalMarks: number;
  passingMarks: number;
  durationMinutes?: number;
  startAt?: string;
  dueAt?: string;
  attemptsAllowed: number;
  shuffleQuestions: boolean;
  showResultImmediately: boolean;
  showCorrectAnswers: boolean;
  resultVisibility?: ResultVisibility;
  latePolicy: LatePolicy;
  status: AssessmentStatus;
  tutor?: AssessmentPerson;
  assignedStudentIds?: string[];
  assignedCount?: number;
  questionCount?: number;
  questions?: AssessmentQuestion[];
  attemptsUsed?: number;
  remainingAttempts?: number;
  studentStatus?: AttemptStatus | 'not_started' | 'overdue';
  lastAttemptId?: string;
  pendingGradingCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type AssessmentDraftQuestion = {
  clientId: string;
  _id?: string;
  type: QuestionType;
  prompt: string;
  marks: number;
  options: { clientId: string; _id?: string; text: string; isCorrect: boolean }[];
  correctTrueFalse: boolean;
  answerKey: string;
  explanation: string;
  rubric: string;
};

export type AssessmentDraft = {
  _id?: string;
  type: AssessmentType;
  title: string;
  description: string;
  instructions: string;
  subject: string;
  totalMarks: string;
  passingMarks: string;
  durationMinutes: string;
  startDate: string;
  startTime: string;
  dueDate: string;
  dueTime: string;
  attemptsAllowed: string;
  shuffleQuestions: boolean;
  showResultImmediately: boolean;
  showCorrectAnswers: boolean;
  latePolicy: LatePolicy;
  questions: AssessmentDraftQuestion[];
  assignedStudentIds: string[];
};

export type EligibleStudent = {
  _id: string;
  name: string;
  avatarUrl?: string;
  subject?: string;
  bookingId?: string;
};

export type AttemptAnswer = {
  questionId: string;
  selectedOptionId?: string;
  trueFalse?: boolean;
  text?: string;
};

export type AttemptFile = {
  _id: string;
  name: string;
  url: string;
  mimeType?: string;
  size?: number;
};

export type AssessmentAttempt = {
  _id: string;
  assessmentId: string;
  studentId?: string;
  student?: AssessmentPerson;
  status: AttemptStatus;
  attemptNumber: number;
  startedAt?: string;
  expiresAt?: string;
  submittedAt?: string;
  answers: AttemptAnswer[];
  score?: number;
  percentage?: number;
  maxScore: number;
  needsManualGrading?: boolean;
  late?: boolean;
  feedback?: string;
  files?: AttemptFile[];
  questionResults?: AttemptQuestionResult[];
};

export type AttemptQuestionResult = {
  questionId: string;
  prompt: string;
  type: QuestionType;
  studentAnswer?: string;
  correctAnswer?: string;
  awardedMarks: number;
  maxMarks: number;
  explanation?: string;
};

export type SubmissionListItem = {
  _id: string;
  student: AssessmentPerson;
  status: AttemptStatus;
  submittedAt?: string;
  late?: boolean;
  score?: number;
  percentage?: number;
  gradingStatus: 'pending' | 'graded';
};

export type GradeQuestionPayload = {
  questionId: string;
  awardedMarks: number;
  feedback?: string;
};

export type CreateAssessmentPayload = {
  type: AssessmentType;
  title: string;
  description?: string;
  instructions?: string;
  subject: string;
  totalMarks: number;
  passingMarks: number;
  durationMinutes?: number;
  startAt?: string;
  dueAt?: string;
  attemptsAllowed: number;
  shuffleQuestions: boolean;
  showResultImmediately: boolean;
  showCorrectAnswers: boolean;
  latePolicy: LatePolicy;
  questions: Array<{
    _id?: string;
    type: QuestionType;
    prompt: string;
    marks: number;
    order: number;
    options?: Array<{ _id?: string; text: string; isCorrect: boolean }>;
    correctTrueFalse?: boolean;
    answerKey?: string;
    explanation?: string;
    rubric?: string;
  }>;
  assignedStudentIds?: string[];
  status?: 'draft' | 'published';
};

export type AssessmentListParams = {
  type?: AssessmentType | 'all';
  status?: string;
  page?: number;
  limit?: number;
};

export type AssessmentListResult = {
  items: Assessment[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
