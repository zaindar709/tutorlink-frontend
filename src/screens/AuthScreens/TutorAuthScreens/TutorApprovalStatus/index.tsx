import React, { useCallback, useEffect, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import useUi from '../../../../hooks/ui/useUi';
import CustomButton from '../../../../components/CustomButton';
import { AuthGlassBackground, AuthGlassHeader } from '../../../../components/AuthGlass';
import { AUTH_GLASS } from '../../../../components/AuthGlass/authGlassTheme';
import { useTutorOnboarding } from '../../../../hooks/tutor/useTutorOnboarding';
import { isTutorApproved } from '../../../../utils/tutor/tutorNavigation';
import { TutorOnboardingStatusData } from '../../../../types/api.types';

type StepState = 'done' | 'active' | 'upcoming';

const getStatusMeta = (status?: TutorOnboardingStatusData) => {
  const onboardingStatus = status?.onboardingStatus;
  const approved = status ? isTutorApproved(status) : false;

  if (approved) {
    return {
      title: 'Approved!',
      body: 'Your profile is verified. You can now access your tutor dashboard and receive bookings.',
      tone: 'success' as const,
      icon: 'check-decagram' as const,
    };
  }

  if (onboardingStatus === 'rejected') {
    return {
      title: 'Application Rejected',
      body:
        status?.rejectionReason ||
        'Your application was not approved. Please contact support for more details.',
      tone: 'danger' as const,
      icon: 'close-circle-outline' as const,
    };
  }

  if (onboardingStatus === 'interview_scheduled') {
    return {
      title: 'Interview Scheduled',
      body: status?.interviewScheduledAt
        ? `Your interview is scheduled for ${new Date(
            status.interviewScheduledAt
          ).toLocaleString()}. Final approval happens after the interview.`
        : 'Your interview has been scheduled. Final approval happens after the interview.',
      tone: 'info' as const,
      icon: 'calendar-clock' as const,
    };
  }

  return {
    title: 'Under Admin Review',
    body: 'Your documents were submitted successfully. An admin is reviewing your application. Check back here for updates.',
    tone: 'warning' as const,
    icon: 'clock-outline' as const,
  };
};

const stepState = (
  step: number,
  currentStep: number
): StepState => {
  if (step < currentStep) return 'done';
  if (step === currentStep) return 'active';
  return 'upcoming';
};

const TutorApprovalStatusScreen = () => {
  const { colors, resp } = useUi();
  const styles = useMemo(() => createStyles(colors, resp), [colors, resp]);
  const navigation = useNavigation<any>();
  const { status, loading, refreshStatus } = useTutorOnboarding();

  const approved = status ? isTutorApproved(status) : false;
  const meta = getStatusMeta(status ?? undefined);

  const currentStep = approved
    ? 3
    : status?.onboardingStatus === 'interview_scheduled'
      ? 2
      : status?.onboardingStatus === 'rejected'
        ? 1
        : 1;

  const onRefresh = useCallback(async () => {
    await refreshStatus();
  }, [refreshStatus]);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const goToDashboard = () => {
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

  const toneStyles = {
    success: { bg: AUTH_GLASS.cardBg, border: '#BBF7D0', accent: '#059669' },
    warning: { bg: AUTH_GLASS.cardBg, border: '#FED7AA', accent: '#D97706' },
    info: { bg: AUTH_GLASS.cardBg, border: '#BFDBFE', accent: '#2563EB' },
    danger: { bg: AUTH_GLASS.cardBg, border: '#FECACA', accent: '#DC2626' },
  }[meta.tone];

  return (
    <AuthGlassBackground scroll={false}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        }
      >
        <AuthGlassHeader
          title="Approval Status"
          subtitle="Track your tutor verification progress"
        />

        {loading && !status ? (
          <ActivityIndicator style={{ marginTop: 40 }} />
        ) : (
          <>
            <View
              style={[
                styles.statusCard,
                {
                  backgroundColor: toneStyles.bg,
                  borderColor: toneStyles.border,
                },
              ]}
            >
              <View
                style={[
                  styles.statusIcon,
                  { backgroundColor: `${toneStyles.accent}22` },
                ]}
              >
                <MaterialCommunityIcons
                  name={meta.icon}
                  size={28}
                  color={toneStyles.accent}
                />
              </View>
              <Text style={styles.statusTitle}>{meta.title}</Text>
              <Text style={styles.statusBody}>{meta.body}</Text>
              {status?.documentsSubmittedAt ? (
                <Text style={styles.submittedAt}>
                  Submitted{' '}
                  {new Date(status.documentsSubmittedAt).toLocaleString()}
                </Text>
              ) : null}
            </View>

            <View style={styles.timelineCard}>
              <Text style={styles.timelineTitle}>Verification Steps</Text>
              {[
                { label: 'Documents submitted', step: 0 },
                { label: 'Admin review', step: 1 },
                { label: approved ? 'Approved' : 'Final decision', step: 3 },
              ].map(item => {
                const state = stepState(item.step, currentStep);
                return (
                  <View key={item.label} style={styles.timelineRow}>
                    <View
                      style={[
                        styles.timelineDot,
                        state === 'done' && styles.timelineDotDone,
                        state === 'active' && styles.timelineDotActive,
                      ]}
                    >
                      {state === 'done' ? (
                        <MaterialCommunityIcons
                          name="check"
                          size={12}
                          color="#fff"
                        />
                      ) : null}
                    </View>
                    <Text
                      style={[
                        styles.timelineLabel,
                        state === 'active' && styles.timelineLabelActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>
                );
              })}
            </View>

            {approved ? (
              <CustomButton
                title="Go to Tutor Dashboard"
                onPress={goToDashboard}
                style={{ marginTop: resp.dy(20) }}
              />
            ) : (
              <CustomButton
                title="Refresh Status"
                onPress={onRefresh}
                loading={loading}
                backgroundColor="#EEF2FF"
                textColor={colors.PRIMARY_COLOR as string}
                style={{ marginTop: resp.dy(20) }}
              />
            )}

            {!approved && status?.onboardingStatus !== 'rejected' ? (
              <Text style={styles.hint}>
                Pull down to refresh. Once an admin approves your profile, the
                dashboard button will appear here.
              </Text>
            ) : null}
          </>
        )}
      </ScrollView>
    </AuthGlassBackground>
  );
};

const createStyles = (colors: any, resp: any) =>
  StyleSheet.create({
    content: {
      paddingHorizontal: resp.dx(16),
      paddingBottom: resp.dy(30),
    },
    statusCard: {
      marginTop: resp.dy(16),
      borderRadius: resp.dx(18),
      borderWidth: 1,
      padding: resp.dx(18),
      backgroundColor: AUTH_GLASS.cardBg,
    },
    statusIcon: {
      width: 52,
      height: 52,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: resp.dy(12),
    },
    statusTitle: {
      fontSize: resp.df(18),
      fontWeight: '800',
      color: AUTH_GLASS.title,
      marginBottom: resp.dy(6),
    },
    statusBody: {
      fontSize: resp.df(14),
      color: AUTH_GLASS.subtitle,
      lineHeight: resp.dy(21),
    },
    submittedAt: {
      marginTop: resp.dy(10),
      fontSize: resp.df(12),
      color: AUTH_GLASS.muted,
    },
    timelineCard: {
      marginTop: resp.dy(18),
      backgroundColor: AUTH_GLASS.cardBg,
      borderRadius: resp.dx(18),
      padding: resp.dx(18),
      borderWidth: 1,
      borderColor: AUTH_GLASS.cardBorder,
    },
    timelineTitle: {
      fontSize: resp.df(15),
      fontWeight: '700',
      color: AUTH_GLASS.title,
      marginBottom: resp.dy(14),
    },
    timelineRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: resp.dy(12),
    },
    timelineDot: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: '#D1D5DB',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: resp.dx(12),
    },
    timelineDotDone: {
      backgroundColor: colors.PRIMARY_COLOR || '#7548F5',
      borderColor: colors.PRIMARY_COLOR || '#7548F5',
    },
    timelineDotActive: {
      borderColor: colors.PRIMARY_COLOR || '#7548F5',
    },
    timelineLabel: {
      fontSize: resp.df(14),
      color: AUTH_GLASS.muted,
    },
    timelineLabelActive: {
      color: AUTH_GLASS.title,
      fontWeight: '700',
    },
    hint: {
      marginTop: resp.dy(14),
      textAlign: 'center',
      fontSize: resp.df(12),
      color: AUTH_GLASS.muted,
      lineHeight: resp.dy(18),
    },
  });

export default TutorApprovalStatusScreen;
