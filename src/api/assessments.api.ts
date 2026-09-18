import api from './client';
import { ApiSuccessResponse } from '../types/api.types';
import {
  Assessment,
  AssessmentAttempt,
  AssessmentListParams,
  AssessmentListResult,
  CreateAssessmentPayload,
  EligibleStudent,
  GradeQuestionPayload,
  SubmissionListItem,
} from '../types/assessment.types';

const BASE = '/api/assessments';

export const createAssessmentAPI = (data: CreateAssessmentPayload) =>
  api.post<ApiSuccessResponse<Assessment>>(BASE, data);

export const getTutorAssessmentsAPI = (params?: AssessmentListParams) =>
  api.get<ApiSuccessResponse<AssessmentListResult>>(`${BASE}/tutor`, {
    params,
  });

export const getStudentAssessmentsAPI = (params?: AssessmentListParams) =>
  api.get<ApiSuccessResponse<AssessmentListResult>>(`${BASE}/student`, {
    params,
  });

export const getEligibleStudentsAPI = () =>
  api.get<ApiSuccessResponse<EligibleStudent[]>>(`${BASE}/tutor/eligible-students`);

export const getAssessmentByIdAPI = (id: string) =>
  api.get<ApiSuccessResponse<Assessment>>(`${BASE}/${id}`);

export const updateAssessmentAPI = (id: string, data: Partial<CreateAssessmentPayload>) =>
  api.patch<ApiSuccessResponse<Assessment>>(`${BASE}/${id}`, data);

export const deleteAssessmentAPI = (id: string) =>
  api.delete<ApiSuccessResponse<{ deleted: boolean }>>(`${BASE}/${id}`);

export const publishAssessmentAPI = (id: string) =>
  api.post<ApiSuccessResponse<Assessment>>(`${BASE}/${id}/publish`);

export const assignAssessmentAPI = (id: string, studentIds: string[]) =>
  api.post<ApiSuccessResponse<Assessment>>(`${BASE}/${id}/assign`, {
    studentIds,
  });

export const getAssessmentSubmissionsAPI = (id: string) =>
  api.get<ApiSuccessResponse<SubmissionListItem[]>>(`${BASE}/${id}/submissions`);

export const getAssessmentResultsAPI = (id: string) =>
  api.get<ApiSuccessResponse<SubmissionListItem[]>>(`${BASE}/${id}/results`);

export const getSubmissionAttemptAPI = (id: string, attemptId: string) =>
  api.get<ApiSuccessResponse<AssessmentAttempt>>(
    `${BASE}/${id}/submissions/${attemptId}`
  );

export const gradeAttemptAPI = (
  id: string,
  attemptId: string,
  data: {
    questions?: GradeQuestionPayload[];
    awardedMarks?: number;
    feedback?: string;
    publish?: boolean;
  }
) =>
  api.patch<ApiSuccessResponse<AssessmentAttempt>>(
    `${BASE}/${id}/submissions/${attemptId}/grade`,
    data
  );

export const startAttemptAPI = (id: string) =>
  api.post<ApiSuccessResponse<AssessmentAttempt>>(`${BASE}/${id}/attempts`);

export const getAttemptAPI = (id: string, attemptId: string) =>
  api.get<ApiSuccessResponse<AssessmentAttempt>>(
    `${BASE}/${id}/attempts/${attemptId}`
  );

export const saveAttemptAnswersAPI = (
  id: string,
  attemptId: string,
  answers: AssessmentAttempt['answers']
) =>
  api.patch<ApiSuccessResponse<AssessmentAttempt>>(
    `${BASE}/${id}/attempts/${attemptId}`,
    { answers }
  );

export const submitAttemptAPI = (id: string, attemptId: string) =>
  api.post<ApiSuccessResponse<AssessmentAttempt>>(
    `${BASE}/${id}/attempts/${attemptId}/submit`
  );

export const uploadAttemptFileAPI = (
  id: string,
  attemptId: string,
  file: { uri: string; name?: string; type?: string }
) => {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    type: file.type || 'application/octet-stream',
    name: file.name || 'assignment',
  } as never);
  return api.post<ApiSuccessResponse<AssessmentAttempt>>(
    `${BASE}/${id}/attempts/${attemptId}/files`,
    formData,
    { timeout: 60000 }
  );
};

export const getStudentAttemptResultAPI = (id: string, attemptId: string) =>
  api.get<ApiSuccessResponse<AssessmentAttempt>>(
    `${BASE}/${id}/results/${attemptId}`
  );
