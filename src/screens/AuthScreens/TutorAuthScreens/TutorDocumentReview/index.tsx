import React, { useEffect, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import useUi from '../../../../hooks/ui/useUi';
import ReviewHeader from '../../../../components/Tutor/ReviewHeader';
import InterviewInfoCard from '../../../../components/Tutor/InterviewInfoCard';
import ActionCards from '../../../../components/Tutor/ActionCard';
import { AuthGlassBackground } from '../../../../components/AuthGlass';
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
    <AuthGlassBackground>
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

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleGoToDashboard}
                  style={styles.dashboardButton}
                >
                  <Text style={styles.dashboardButtonText}>
                    Open Tutor Dashboard
                  </Text>
                </TouchableOpacity>
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

            {/* ==========================================
                CHECK APPROVAL BUTTON

                This becomes the 3rd action:
                1. Schedule Interview
                2. Video Call
                3. Check Approval Status
            ========================================== */}

            {showWaitingActions ? (
              <View style={styles.approvalContainer}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleCheckApproval}
                  style={styles.approvalButton}
                >
                  <Text style={styles.approvalButtonText}>
                    Check Approval Status
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {/* ==========================================
                INFO
            ========================================== */}

            <Text style={styles.infoText}>
              Approved tutors appear in student search automatically.
            </Text>
          </>
        )}
      </ScrollView>
    </AuthGlassBackground>
  );
};

export default DocumentReviewScreen;

// =====================================================
// STYLES
// =====================================================

const createStyles = (colors:any, resp:any) =>
  StyleSheet.create({
    scrollView: {
      flex: 1,
      width: '100%',
    },

    content: {
      flexGrow: 1,
      width: '100%',
      paddingHorizontal: resp.dx(16),
      paddingBottom: resp.dy(40),
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

    dashboardButton: {
      width: '100%',
      height: resp.dy(50),
      marginTop: resp.dy(14),

      borderRadius: resp.dx(12),

      backgroundColor: colors.PRIMARY_COLOR,

      alignItems: 'center',
      justifyContent: 'center',
    },

    dashboardButtonText: {
      fontSize: resp.df(14),
      fontWeight: '700',
      color: '#FFFFFF',
    },

    // -------------------------------------------------
    // CHECK APPROVAL BUTTON
    // -------------------------------------------------

    approvalContainer: {
      width: '100%',
      marginTop: resp.dy(20),
    },

    approvalButton: {
      width: '100%',
      minHeight: resp.dy(52),

      borderRadius: resp.dx(14),

      backgroundColor: '#EEF2FF',

      borderWidth: 1,
      borderColor: '#D9E0FF',

      alignItems: 'center',
      justifyContent: 'center',

      paddingHorizontal: resp.dx(16),
      paddingVertical: resp.dy(12),
    },

    approvalButtonText: {
      fontSize: resp.df(14),
      fontWeight: '700',
      color: colors.PRIMARY_COLOR,
      textAlign: 'center',
    },

    // -------------------------------------------------
    // INFO TEXT
    // -------------------------------------------------

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