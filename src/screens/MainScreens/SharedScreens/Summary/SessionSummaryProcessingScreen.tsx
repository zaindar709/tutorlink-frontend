import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { GlassScreen } from '../../../../components/Glass';
import { GLASS } from '../../../../theme/glass';
import SummaryProcessingCard from '../../../../components/Summary/SummaryProcessingCard';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  fetchSummaryStatusThunk,
  fetchSessionSummaryThunk,
  fetchStudentSummariesThunk,
} from '../../../../store/summary/summarySlice';
import { publishSummaryThunk } from '../../../../store/summary/summarySlice';
import { getSummaryStatusAPI, getSessionSummaryAPI } from '../../../../api/summaries.api';
import { Alert } from 'react-native';
import { ensureSummarySocket } from '../../../../services/summaries/summarySocket';
import { leaveHomeStackToTabs } from '../../../../navigation/navigationRef';
import { SummaryStatus } from '../../../../types/summary.types';

/**
 * Shown after WebRTC class ends — backend owns AI; FE only shows status.
 */
const SessionSummaryProcessingScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const sessionId = String(route.params?.sessionId || '');
  const role = route.params?.role as 'tutor' | 'student' | undefined;
  const dispatch = useAppDispatch();
  const statusPayload = useAppSelector(s =>
    sessionId ? s.summary.statusBySession[sessionId] : undefined
  );
  const status: SummaryStatus = statusPayload?.status || 'processing';

  const refresh = useCallback(() => {
    if (!sessionId) return;
    void dispatch(fetchSummaryStatusThunk(sessionId));
  }, [dispatch, sessionId]);

  const manualSync = useCallback(async () => {
    if (!sessionId) return;
    try {
      // Refresh status and try to fetch full summary for the session.
      await dispatch(fetchSummaryStatusThunk(sessionId));
      const res = await dispatch(fetchSessionSummaryThunk(sessionId));
      // If a summary exists and is published/generated, refresh student list so it appears.
      if (res && res.payload) {
        const payload: any = res.payload;
        if (payload.status === 'published') {
          // refresh student's published summaries list
          void dispatch(fetchStudentSummariesThunk({ page: 1, limit: 30, status: 'published' }));
        }
      }
    } catch (err) {
      // swallow — fetch thunks set errors in slice
    }
  }, [dispatch, sessionId]);

  const debugFetch = useCallback(async () => {
    if (!sessionId) {
      Alert.alert('Debug', 'No sessionId available');
      return;
    }
    try {
      const statusRes = await getSummaryStatusAPI(sessionId);
      console.log('DEBUG summary status raw:', statusRes.data);
      const statusBody = statusRes.data?.data || statusRes.data;
      const status = statusBody?.status || statusBody?.status === 0 ? statusBody.status : undefined;

      let summaryInfo = 'no summary';
      try {
        const summaryRes = await getSessionSummaryAPI(sessionId);
        console.log('DEBUG session summary raw:', summaryRes.data);
        const sBody = summaryRes.data?.data || summaryRes.data;
        summaryInfo = `summaryId: ${sBody?._id || sBody?.id || 'none'}\nstatus: ${sBody?.status || 'unknown'}`;
      } catch (err) {
        console.warn('DEBUG could not fetch session summary', err);
      }

      Alert.alert('Debug', `status: ${status || 'unknown'}\n${summaryInfo}`);
    } catch (err) {
      console.warn('DEBUG status fetch failed', err);
      Alert.alert('Debug', `Status fetch failed: ${(err as any)?.message || err}`);
    }
  }, [sessionId]);

  useFocusEffect(
    useCallback(() => {
      void ensureSummarySocket();
      refresh();
      const t = setInterval(refresh, 12000);
      return () => clearInterval(t);
    }, [refresh])
  );

  const goHome = () => leaveHomeStackToTabs('Home');

  const onContinue = () => {
    if (role === 'tutor') {
      if (status === 'failed') {
        navigation.replace('TutorSummaryReviewScreen', {
          summaryId: statusPayload?.summaryId,
          sessionId,
        });
        return;
      }
      if (
        statusPayload?.summaryId &&
        (status === 'generated' || status === 'under_review')
      ) {
        navigation.replace('TutorSummaryReviewScreen', {
          summaryId: statusPayload.summaryId,
          sessionId,
        });
        return;
      }
    }
    if (
      (role === 'student' || !role) &&
      status === 'published' &&
      statusPayload?.summaryId
    ) {
      navigation.replace('StudentSummaryDetailScreen', {
        summaryId: statusPayload.summaryId,
      });
      return;
    }
    goHome();
  };

  const openDraft = () => {
    if (!statusPayload?.summaryId) return;
    navigation.replace('TutorSummaryReviewScreen', {
      summaryId: statusPayload.summaryId,
      sessionId,
    });
  };

  const forcePublish = async () => {
    if (!statusPayload?.summaryId) {
      Alert.alert('No summary', 'No draft summary id available to publish.');
      return;
    }
    Alert.alert(
      'Force publish?',
      'This will publish the summary immediately and notify the student.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Publish',
          onPress: async () => {
            try {
              await dispatch(publishSummaryThunk(statusPayload.summaryId)).unwrap();
              Alert.alert('Published', 'Summary published.');
              // Refresh student list
              void dispatch(fetchStudentSummariesThunk({ page: 1, limit: 30, status: 'published' }));
            } catch (e) {
              Alert.alert('Publish failed', String(e));
            }
          },
        },
      ]
    );
  };

  return (
    <GlassScreen contentStyle={styles.screen}>
      <Text style={styles.heading}>Class Completed</Text>
      <Text style={styles.sub}>
        Your learning summary is being prepared.
      </Text>
      <SummaryProcessingCard
        status={status}
        onRetry={
          status === 'failed' && sessionId && role === 'tutor'
            ? () =>
                navigation.replace('TutorSummaryReviewScreen', {
                  summaryId: statusPayload?.summaryId,
                  sessionId,
                })
            : undefined
        }
        onContinue={onContinue}
        continueLabel={
          role === 'tutor' && status === 'failed'
            ? 'Add Notes & Retry'
            : role === 'tutor' &&
                (status === 'generated' || status === 'under_review')
              ? 'Review Summary'
              : status === 'published'
                ? 'View Summary'
                : 'Go to Dashboard'
        }
      />
      <View style={{ height: 8 }} />
      <Text
        onPress={() => void manualSync()}
        style={{
          color: GLASS.primary,
          textAlign: 'center',
          fontWeight: '700',
          marginTop: 6,
        }}
      >
        Sync now
      </Text>
      <Text
        onPress={() => void debugFetch()}
        style={{
          color: GLASS.textSecondary,
          textAlign: 'center',
          fontWeight: '700',
          marginTop: 6,
        }}
      >
        Debug info
      </Text>
      {role === 'tutor' && statusPayload?.summaryId ? (
        <>
          <Text
            onPress={() => openDraft()}
            style={{
              color: GLASS.primary,
              textAlign: 'center',
              fontWeight: '700',
              marginTop: 8,
            }}
          >
            Open draft for review
          </Text>
          <Text
            onPress={() => void forcePublish()}
            style={{
              color: '#B91C1C',
              textAlign: 'center',
              fontWeight: '700',
              marginTop: 6,
            }}
          >
            Force publish (dev)
          </Text>
        </>
      ) : null}
      <View style={{ height: 24 }} />
    </GlassScreen>
  );
};

const styles = StyleSheet.create({
  screen: { paddingTop: 12 },
  heading: {
    color: GLASS.textPrimary,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
  },
  sub: {
    color: GLASS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
});

export default SessionSummaryProcessingScreen;
