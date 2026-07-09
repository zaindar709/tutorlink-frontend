import {
  getTutorOnboardingStatusAPI,
  scheduleTutorOnboardingInterviewAPI,
  submitTutorOnboardingStep1API,
  uploadTutorDocumentsAPI,
} from '../../api/tutorOnboarding.api';
import { TutorOnboardingStatusData } from '../../types/api.types';

export const getTutorOnboardingStatus =
  async (): Promise<TutorOnboardingStatusData> => {
    const response = await getTutorOnboardingStatusAPI();
    return response.data.data ?? {};
  };

export const submitTutorOnboardingStep1 = async (payload: {
  subject: string;
  grades: string[];
}): Promise<TutorOnboardingStatusData> => {
  const response = await submitTutorOnboardingStep1API(payload);
  return response.data.data ?? {};
};

export const uploadTutorDocuments = async (files: {
  cnicFrontUri: string;
  cnicBackUri: string;
  degreeUri: string;
  degreeName?: string;
  degreeType?: string;
}): Promise<TutorOnboardingStatusData> => {
  const formData = new FormData();

  formData.append('cnicFront', {
    uri: files.cnicFrontUri,
    type: 'image/jpeg',
    name: 'cnic-front.jpg',
  } as unknown as Blob);

  formData.append('cnicBack', {
    uri: files.cnicBackUri,
    type: 'image/jpeg',
    name: 'cnic-back.jpg',
  } as unknown as Blob);

  const isPdf = files.degreeType?.includes('pdf');
  formData.append('degree', {
    uri: files.degreeUri,
    type: files.degreeType || (isPdf ? 'application/pdf' : 'image/jpeg'),
    name: files.degreeName || (isPdf ? 'degree.pdf' : 'degree.jpg'),
  } as unknown as Blob);

  const response = await uploadTutorDocumentsAPI(formData);
  return response.data.data ?? {};
};

export const scheduleTutorOnboardingInterview = async (
  interviewDate: string
): Promise<TutorOnboardingStatusData> => {
  const response = await scheduleTutorOnboardingInterviewAPI({ interviewDate });
  return response.data.data ?? {};
};
