import { TutorOnboardingStatusData } from '../../types/api.types';

export const isTutorApproved = (status: TutorOnboardingStatusData): boolean =>
  status.isVerified === true ||
  status.onboardingStatus === 'approved' ||
  status.verificationStatus === 'approved';

const resolveOnboardingStatus = (status: TutorOnboardingStatusData) =>
  status.onboardingStatus || status.verificationStatus;

export const isTutorAwaitingApproval = (
  status: TutorOnboardingStatusData
): boolean => {
  const value = resolveOnboardingStatus(status);
  return (
    value === 'under_review' ||
    value === 'documents_uploaded' ||
    value === 'interview_scheduled' ||
    value === 'pending'
  );
};

export const isTutorDocumentsPending = (
  status: TutorOnboardingStatusData
): boolean => {
  const step = status.onboardingStep ?? 1;
  const value = resolveOnboardingStatus(status);
  return (
    step < 2 ||
    value === 'basic_info' ||
    (!value && step < 3)
  );
};

export const getTutorResetRoute = (status: TutorOnboardingStatusData) => {
  if (isTutorApproved(status)) {
    return {
      index: 0,
      routes: [
        {
          name: 'MyTabs' as const,
          params: { role: 'tutor' as const, screen: 'Home' },
        },
      ],
    };
  }

  const onboardingStatus = resolveOnboardingStatus(status);

  if (onboardingStatus === 'rejected') {
    return {
      index: 0,
      routes: [
        {
          name: 'AuthNavigator' as const,
          state: {
            index: 0,
            routes: [
              {
                name: 'DocumentReviewScreen' as const,
                params: {
                  rejected: true,
                  reason: status.rejectionReason,
                },
              },
            ],
          },
        },
      ],
    };
  }

  if (isTutorAwaitingApproval(status)) {
    return {
      index: 0,
      routes: [
        {
          name: 'AuthNavigator' as const,
          state: {
            index: 0,
            routes: [
              {
                name: 'DocumentReviewScreen' as const,
                params: {
                  status: onboardingStatus || 'under_review',
                },
              },
            ],
          },
        },
      ],
    };
  }

  return {
    index: 0,
    routes: [
      {
        name: 'AuthNavigator' as const,
        state: {
          index: 0,
          routes: [{ name: 'DocumentUploadScreen' as const }],
        },
      },
    ],
  };
};