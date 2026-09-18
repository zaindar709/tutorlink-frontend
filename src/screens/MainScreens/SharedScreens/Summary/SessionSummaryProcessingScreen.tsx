import React, { useCallback, useEffect, useRef } from 'react';
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
  const cachedSummary = useAppSelector(s => {
    if (!sessionId) return undefined;
    if (statusPayload?.summaryId && s.summary.byId[statusPayload.summaryId]) {
      return s.summary.byId[statusPayload.summaryId];
    }
    return Object.values(s.summary.byId).find(
      item => item.sessionId === sessionId
    );
  });
  const status: SummaryStatus =
    cachedSummary?.status || statusPayload?.status || 'processing';
  const summaryId = cachedSummary?._id || statusPayload?.summaryId;
  const fetchedReady = useRef(false);

  const refresh = useCallback(() => {
    if (!sessionId) return;
    void dispatch(fetchSummaryStatusThunk(sessionId));
  }, [dispatch, sessionId]);

  useFocusEffect(
    useCallback(() => {
      fetchedReady.current = false;
      void ensureSummarySocket();
      refresh();
      const t = setInterval(refresh, 3000);
      return () => clearInterval(t);
    }, [refresh])
  );

  useEffect(() => {
    if (!sessionId) return;
    const ready =
      status === 'generated' ||
      status === 'under_review' ||
      status === 'published' ||
      status === 'failed';
    if (!ready || fetchedReady.current) return;
    fetchedReady.current = true;
    if (role === 'tutor' || status === 'published') {
      void dispatch(fetchSessionSummaryThunk(sessionId));
    }
    if (status === 'published') {
      void dispatch(
        fetchStudentSummariesThunk({ page: 1, limit: 30, status: 'published' })
      );
    }
  }, [dispatch, sessionId, status, role]);

  const goHome = () => leaveHomeStackToTabs('Home');

  const onContinue = () => {
    if (role === 'tutor') {
      if (status === 'failed' || status === 'generated' || status === 'under_review') {
        navigation.replace('TutorSummaryReviewScreen', {
          summaryId,
          sessionId,
        });
        return;
      }
      if (status === 'published' && summaryId) {
        navigation.replace('TutorSummaryReviewScreen', {
          summaryId,
          sessionId,
        });
        return;
      }
    }
    if (
      (role === 'student' || !role) &&
      status === 'published' &&
      summaryId
    ) {
      navigation.replace('StudentSummaryDetailScreen', {
        summaryId,
      });
      return;
    }
    goHome();
  };

  const continueLabel =
    role === 'tutor' && status === 'failed'
      ? 'Add Notes & Retry'
      : role === 'tutor' &&
          (status === 'generated' || status === 'under_review')
        ? 'Review Summary'
        : status === 'published'
          ? 'View Summary'
          : 'Go to Dashboard';

  return (
    <GlassScreen contentStyle={styles.screen}>
      <Text style={styles.heading}>Class Completed</Text>
      <Text style={styles.sub}>
        Your learning summary is being prepared.
      </Text>
      <SummaryProcessingCard
        status={status}
        hint={
          role === 'tutor'
            ? 'When generation finishes, review the notes and publish them for the student.'
            : 'Your tutor will review it before it is shared with you.'
        }
        onRetry={
          status === 'failed' && sessionId && role === 'tutor'
            ? () =>
                navigation.replace('TutorSummaryReviewScreen', {
                  summaryId,
                  sessionId,
                })
            : undefined
        }
        onContinue={onContinue}
        continueLabel={continueLabel}
      />
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
