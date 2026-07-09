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
import { SafeAreaView } from 'react-native-safe-area-context';
import useUi from '../../../../hooks/ui/useUi';
import ReviewHeader from '../../../../components/Tutor/ReviewHeader';
import InterviewInfoCard from '../../../../components/Tutor/InterviewInfoCard';
import ActionCards from '../../../../components/Tutor/ActionCard';
import CustomButton from '../../../../components/CustomButton';
import { useTutorOnboarding } from '../../../../hooks/tutor/useTutorOnboarding';
import { isTutorApproved } from '../../../../utils/tutor/tutorNavigation';

const DocumentReviewScreen = () => {
  const { colors, resp } = useUi();
  const styles = useMemo(() => createStyles(colors, resp), [colors, resp]);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { status, loading, refreshStatus, scheduleInterview } =
    useTutorOnboarding();

  const rejected = route.params?.rejected;
  const rejectionReason = route.params?.reason || status?.rejectionReason;

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const currentStatus = status?.onboardingStatus || route.params?.status;
  const approved = status ? isTutorApproved(status) : false;
  const underReview =
    currentStatus === 'under_review' || currentStatus === 'documents_uploaded';
  const interviewScheduled = currentStatus === 'interview_scheduled';

  const handleGoToDashboard = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'MyTabs',
          params: { role: 'tutor', screen: 'Home' },
        },
      ],
    });
  };

  const handleScheduleInterview = async () => {
    const interviewDate = new Date(
      Date.now() + 3 * 24 * 60 * 60 * 1000
    ).toISOString();

    const result = await scheduleInterview(interviewDate);
    if (result) {
      Alert.alert(
        'Interview Scheduled',
        'Your interview has been scheduled. You will be notified with details.'
      );
      await refreshStatus();
    }
  };

  const handleRefreshStatus = async () => {
    const latest = await refreshStatus();
    if (latest && isTutorApproved(latest)) {
      Alert.alert(
        'Approved!',
        'Your profile has been verified. Welcome to TutorLink.',
        [{ text: 'Go to Dashboard', onPress: handleGoToDashboard }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <ReviewHeader />

        {loading && !status ? (
          <ActivityIndicator style={{ marginVertical: 24 }} />
        ) : (
          <>
            {rejected || currentStatus === 'rejected' ? (
              <View style={styles.statusCard}>
                <Text style={styles.statusTitle}>Application Rejected</Text>
                <Text style={styles.statusBody}>
                  {rejectionReason ||
                    'Your application was not approved. Please contact support or re-apply.'}
                </Text>
              </View>
            ) : approved ? (
              <View style={[styles.statusCard, styles.approvedCard]}>
                <Text style={styles.statusTitle}>You are approved!</Text>
                <Text style={styles.statusBody}>
                  Your profile is live. Students can now find and book you.
                </Text>
                <CustomButton
                  title="Open Tutor Dashboard"
                  onPress={handleGoToDashboard}
                  style={{ marginTop: resp.dy(12) }}
                />
              </View>
            ) : underReview ? (
              <View style={styles.statusCard}>
                <Text style={styles.statusTitle}>Under Admin Review</Text>
                <Text style={styles.statusBody}>
                  Your documents have been submitted. An admin will review your
                  application shortly. You will get access to the tutor dashboard
                  once approved.
                </Text>
              </View>
            ) : interviewScheduled ? (
              <View style={styles.statusCard}>
                <Text style={styles.statusTitle}>Interview Scheduled</Text>
                <Text style={styles.statusBody}>
                  Your interview is scheduled
                  {status?.interviewScheduledAt
                    ? ` for ${new Date(status.interviewScheduledAt).toLocaleString()}`
                    : ''}
                  . Final approval will happen after the interview.
                </Text>
              </View>
            ) : null}

            <InterviewInfoCard />
            <ActionCards />

            {!approved && !rejected && currentStatus !== 'rejected' && (
              <>
                {underReview && (
                  <View style={{ marginTop: resp.dy(20) }}>
                    <CustomButton
                      title="Schedule my Interview"
                      onPress={handleScheduleInterview}
                      icon="calendar-month-outline"
                      loading={loading}
                    />
                  </View>
                )}

                <View style={{ marginTop: resp.dy(12) }}>
                  <CustomButton
                    title="Check Approval Status"
                    onPress={handleRefreshStatus}
                    backgroundColor="#EEF2FF"
                    textColor={colors.PRIMARY_COLOR as string}
                    loading={loading}
                  />
                </View>
              </>
            )}
          </>
        )}

        <Text style={styles.infoText}>
          Approved tutors appear in student search automatically.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DocumentReviewScreen;

const createStyles = (colors: any, resp: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F8FAFC',
    },
    content: {
      paddingBottom: 30,
    },
    statusCard: {
      marginHorizontal: resp.dx(16),
      marginTop: resp.dy(16),
      backgroundColor: '#FFF7ED',
      borderRadius: resp.dx(16),
      padding: resp.dx(16),
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
      color: '#111827',
      marginBottom: resp.dy(6),
    },
    statusBody: {
      fontSize: resp.df(13),
      color: '#4B5563',
      lineHeight: resp.dy(20),
    },
    infoText: {
      color: '#6B7280',
      fontSize: resp.df(12),
      textAlign: 'center',
      marginTop: resp.dy(20),
      paddingHorizontal: resp.dx(20),
    },
  });
