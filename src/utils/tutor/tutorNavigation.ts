import { TutorOnboardingStatusData } from '../../types/api.types';

export const isTutorApproved = (status: TutorOnboardingStatusData): boolean =>
  status.isVerified === true || status.onboardingStatus === 'approved';

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

  if (status.onboardingStatus === 'rejected') {
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

  if (
    status.onboardingStatus === 'under_review' ||
    status.onboardingStatus === 'interview_scheduled'
  ) {
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
                params: { status: status.onboardingStatus },
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
