import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { IconButton } from 'react-native-paper';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { GlassScreen } from '../../../../components/Glass';
import { GLASS } from '../../../../theme/glass';
import {
  BulletList,
  HomeworkList,
  SummaryErrorState,
  SummarySection,
  SummaryTopicList,
  TutorReviewBadge,
} from '../../../../components/Summary';
import SummaryProcessingCard from '../../../../components/Summary/SummaryProcessingCard';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchSummaryByIdThunk } from '../../../../store/summary/summarySlice';
import { leaveHomeStackToTabs } from '../../../../navigation/navigationRef';

const StudentSummaryDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const summaryId = String(route.params?.summaryId || '');
  const dispatch = useAppDispatch();
  const summary = useAppSelector(s => s.summary.byId[summaryId]);
  const loading = useAppSelector(s => s.summary.detailLoading);
  const error = useAppSelector(s => s.summary.lastError);

  const load = useCallback(() => {
    if (summaryId) void dispatch(fetchSummaryByIdThunk(summaryId));
  }, [dispatch, summaryId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <GlassScreen scroll={false} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Learning Summary</Text>
        <View style={{ width: 48 }} />
      </View>

      {loading && !summary ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={GLASS.primary} />
      ) : !summary ? (
        <View style={{ padding: 16 }}>
          <SummaryErrorState
            message={error || 'Summary not found'}
            onRetry={load}
          />
        </View>
      ) : summary.status !== 'published' ? (
        <View style={{ padding: 16 }}>
          <Text style={styles.subject}>{summary.subject || 'Class'}</Text>
          <Text style={styles.pendingTitle}>Summary not ready yet</Text>
          <Text style={styles.meta}>
            Full content is available only after your tutor publishes it.
          </Text>
          <SummaryProcessingCard
            status={summary.status}
            onContinue={() => leaveHomeStackToTabs('Home')}
            continueLabel="Go to Dashboard"
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={load}
              tintColor={GLASS.primary}
            />
          }
        >
          <Text style={styles.subject}>{summary.subject}</Text>
          <Text style={styles.title}>{summary.title}</Text>
          <Text style={styles.meta}>
            {summary.tutor?.name ? `Tutor: ${summary.tutor.name}` : 'Tutor'}
            {summary.sessionDate ? ` · ${summary.sessionDate}` : ''}
            {summary.durationMinutes
              ? ` · ${summary.durationMinutes} min`
              : ''}
          </Text>
          {summary.tutorReview?.reviewed ? (
            <TutorReviewBadge
              tutorName={
                summary.tutorReview.reviewedByName || summary.tutor?.name
              }
            />
          ) : null}

          <SummarySection title="Session Overview">
            <Text style={styles.body}>{summary.overview || '—'}</Text>
          </SummarySection>
          <SummarySection title="Topics Covered">
            <SummaryTopicList topics={summary.topicsCovered} />
          </SummarySection>
          <SummarySection title="Key Concepts">
            <BulletList
              items={summary.importantConcepts.map(c =>
                c.explanation ? `${c.name}: ${c.explanation}` : c.name
              )}
            />
          </SummarySection>
          <SummarySection title="Key Points">
            <BulletList items={summary.keyPoints} />
          </SummarySection>
          <SummarySection title="Questions Discussed">
            <BulletList items={summary.questionsDiscussed} />
          </SummarySection>
          <SummarySection title="Homework">
            <HomeworkList items={summary.homework} />
          </SummarySection>
          {summary.studentStrengths?.length ? (
            <SummarySection title="Student Strengths">
              <BulletList items={summary.studentStrengths} />
            </SummarySection>
          ) : null}
          <SummarySection title="Areas to Improve">
            <BulletList items={summary.areasToImprove} />
          </SummarySection>
          <SummarySection title="Next Steps">
            <BulletList items={summary.nextSteps} />
          </SummarySection>
          {summary.tutorReview?.note ? (
            <SummarySection title="Tutor Review">
              <Text style={styles.body}>{summary.tutorReview.note}</Text>
            </SummarySection>
          ) : null}
        </ScrollView>
      )}
    </GlassScreen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: GLASS.cardBorder,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '800',
    fontSize: 17,
    color: GLASS.textPrimary,
  },
  content: { padding: 16, paddingBottom: 40 },
  subject: { color: GLASS.primary, fontWeight: '800', fontSize: 12 },
  title: {
    color: GLASS.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
    marginBottom: 8,
  },
  pendingTitle: {
    color: GLASS.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 6,
    marginBottom: 6,
  },
  meta: { color: GLASS.textSecondary, fontSize: 13, marginBottom: 10 },
  body: { color: GLASS.textSecondary, lineHeight: 20, fontSize: 14 },
});

export default StudentSummaryDetailScreen;
