import React, { useEffect, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import useUi from '../../../../hooks/ui/useUi';
import ReviewHeader from '../../../../components/Tutor/ReviewHeader';
import InterviewInfoCard from '../../../../components/Tutor/InterviewInfoCard';
import ActionCards from '../../../../components/Tutor/ActionCard';
import { AuthGlassBackground, GlassPrimaryButton } from '../../../../components/AuthGlass';
import { AUTH_GLASS } from '../../../../components/AuthGlass/authGlassTheme';
import { useTutorOnboarding } from '../../../../hooks/tutor/useTutorOnboarding';
import { isTutorApproved } from '../../../../utils/tutor/tutorNavigation';

const DocumentReviewScreen = () => {
  const { colors, resp } = useUi();

  const styles = useMemo(
    () => createStyles(colors, resp),
    [colors, resp],
  );

  const navigation = useNavigation();
  const route = useRoute();

  const {
    status,
    loading,
    refreshStatus,
    scheduleInterview,
  } = useTutorOnboarding();

  const rejected = route.params?.rejected;

  const rejectionReason =
    route.params?.reason || status?.rejectionReason;

  // --------------------------------------------------
  // Refresh onboarding status
  // --------------------------------------------------

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  // --------------------------------------------------
  // Current status
  // --------------------------------------------------

  const currentStatus =
    status?.onboardingStatus ||
    status?.verificationStatus ||
    route.params?.status;

  const approved = status
    ? isTutorApproved(status)
    : false;

  const underReview =
    currentStatus === 'under_review' ||
    currentStatus === 'documents_uploaded' ||
    currentStatus === 'pending';

  const interviewScheduled =
    currentStatus === 'interview_scheduled';

  // --------------------------------------------------
  // Navigation
  // --------------------------------------------------

  const handleCheckApproval = () => {
    navigation.navigate('TutorApprovalStatusScreen');
  };

  const handleGoToDashboard = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'MyTabs',
          params: {
            role: 'tutor',
            screen: 'Home',
          },
        },
      ],
    });
  };

  // --------------------------------------------------
  // Schedule Interview
  // --------------------------------------------------

  const handleScheduleInterview = async () => {
    const interviewDate = new Date(
      Date.now() + 3 * 24 * 60 * 60 * 1000,
    ).toISOString();

    const result = await scheduleInterview(interviewDate);

    if (result) {
      Alert.alert(
        'Interview Scheduled',
        'Your interview has been scheduled. You will be notified with details.',
      );

      await refreshStatus();
    }
  };

  // --------------------------------------------------
  // Waiting actions
  // --------------------------------------------------

  const showWaitingActions =
    !approved &&
    !rejected &&
    currentStatus !== 'rejected';

  return (
    <AuthGlassBackground scroll={false} contentStyle={styles.shell}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ==========================================
            HEADER
        ========================================== */}

        <ReviewHeader />

        {/* ==========================================
            LOADING
        ========================================== */}

        {loading && !status ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator
              size="small"
              color={colors.PRIMARY_COLOR}
            />
          </View>
        ) : (
          <>
            {/* ==========================================
                STATUS CARD
            ========================================== */}

            {rejected || currentStatus === 'rejected' ? (
              <View style={styles.statusCard}>
                <Text style={styles.statusTitle}>
                  Application Rejected
                </Text>

                <Text style={styles.statusBody}>
                  {rejectionReason ||
                    'Your application was not approved. Please contact support or re-apply.'}
                </Text>
              </View>
            ) : approved ? (
              <View
                style={[
                  styles.statusCard,
                  styles.approvedCard,
                ]}
              >
                <Text style={styles.statusTitle}>
                  You are approved!
                </Text>

                <Text style={styles.statusBody}>
                  Your profile is live. Students can now find and book
                  you.
                </Text>

                <View style={styles.ctaWrap}>
                  <GlassPrimaryButton
                    title="Open Tutor Dashboard"
                    onPress={handleGoToDashboard}
                  />
                </View>
              </View>
            ) : underReview ? (
              <View style={styles.statusCard}>
                <Text style={styles.statusTitle}>
                  Under Admin Review
                </Text>

                <Text style={styles.statusBody}>
                  Your documents have been submitted. An admin will
                  review your application shortly. You will get access
                  to the tutor dashboard once approved.
                </Text>
              </View>
            ) : interviewScheduled ? (
              <View style={styles.statusCard}>
                <Text style={styles.statusTitle}>
                  Interview Scheduled
                </Text>

                <Text style={styles.statusBody}>
                  Your interview is scheduled
                  {status?.interviewScheduledAt
                    ? ` for ${new Date(
                        status.interviewScheduledAt,
                      ).toLocaleString()}`
                    : ''}
                  . Final approval will happen after the interview.
                </Text>
              </View>
            ) : null}

            {/* ==========================================
                INTERVIEW INFO
            ========================================== */}

            <View style={styles.section}>
              <InterviewInfoCard />
            </View>

            {/* ==========================================
                ACTION CARDS

                This already contains:
                1. Schedule Interview
                2. Video Call

                So DO NOT render another Schedule
                Interview CustomButton here.
            ========================================== */}

            <View style={styles.section}>
              <ActionCards />
            </View>

            <Text style={styles.infoText}>
              Approved tutors appear in student search automatically.
            </Text>
          </>
        )}
      </ScrollView>

      {showWaitingActions ? (
        <View style={styles.ctaWrap}>
          <GlassPrimaryButton
            title="Check Approval Status"
            onPress={handleCheckApproval}
          />
        </View>
      ) : null}
    </AuthGlassBackground>
  );
};

export default DocumentReviewScreen;

// =====================================================
// STYLES
// =====================================================

const createStyles = (colors:any, resp:any) =>
  StyleSheet.create({
    shell: {
      flex: 1,
      paddingHorizontal: 22,
      paddingTop: 8,
      paddingBottom: 12,
    },
    scrollView: {
      flex: 1,
      width: '100%',
    },

    content: {
      width: '100%',
      paddingBottom: resp.dy(16),
    },

    loaderContainer: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: resp.dy(30),
    },

    section: {
      width: '100%',
      marginTop: resp.dy(16),
    },

    // -------------------------------------------------
    // STATUS CARD
    // -------------------------------------------------

    statusCard: {
      width: '100%',
      marginTop: resp.dy(16),
      padding: resp.dx(16),

      backgroundColor: '#FFF7ED',

      borderRadius: resp.dx(16),
      borderWidth: 1,
      borderColor: '#FED7AA',
    },

    approvedCard: {
      backgroundColor: '#ECFDF5',
      borderColor: '#BBF7D0',
    },

    statusTitle: {
      fontSize: resp.df(16),
      fontWeight: '700',
      color: AUTH_GLASS.title,
      marginBottom: resp.dy(6),
    },

    statusBody: {
      width: '100%',
      fontSize: resp.df(13),
      color: AUTH_GLASS.subtitle,
      lineHeight: resp.dy(20),
    },

    // -------------------------------------------------
    // APPROVED DASHBOARD BUTTON
    // -------------------------------------------------

    ctaWrap: {
      width: '100%',
      marginTop: resp.dy(16),
      flexGrow: 0,
    },

    infoText: {
      width: '100%',

      color: AUTH_GLASS.muted,

      fontSize: resp.df(12),

      lineHeight: resp.dy(18),

      textAlign: 'center',

      marginTop: resp.dy(20),

      paddingHorizontal: resp.dx(8),
    },
  });