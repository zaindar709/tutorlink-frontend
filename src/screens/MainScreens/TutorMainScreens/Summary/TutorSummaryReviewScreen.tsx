import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { IconButton } from 'react-native-paper';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { GlassScreen } from '../../../../components/Glass';
import { GLASS } from '../../../../theme/glass';
import CustomButton from '../../../../components/CustomButton';
import {
  BulletList,
  HomeworkList,
  SummarySection,
  SummaryTopicList,
  SummaryErrorState,
} from '../../../../components/Summary';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  fetchSummaryByIdThunk,
  fetchSessionSummaryThunk,
  fetchSummaryStatusThunk,
  publishSummaryThunk,
  retrySummaryThunk,
  reviewSummaryThunk,
} from '../../../../store/summary/summarySlice';
import { ReviewSummaryPayload } from '../../../../types/summary.types';

const TutorSummaryReviewScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const summaryId = route.params?.summaryId as string | undefined;
  const sessionId = route.params?.sessionId as string | undefined;
  const dispatch = useAppDispatch();
  const summary = useAppSelector(s =>
    summaryId ? s.summary.byId[summaryId] : undefined
  );
  const statusPayload = useAppSelector(s =>
    sessionId ? s.summary.statusBySession[sessionId] : undefined
  );
  const loading = useAppSelector(s => s.summary.detailLoading);
  const mutating = useAppSelector(s => s.summary.mutating);
  const error = useAppSelector(s => s.summary.lastError);

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [overview, setOverview] = useState('');
  const [keyPointsText, setKeyPointsText] = useState('');
  const [areasText, setAreasText] = useState('');
  const [nextStepsText, setNextStepsText] = useState('');
  const [topicsText, setTopicsText] = useState('');
  const [homeworkText, setHomeworkText] = useState('');
  const [tutorNote, setTutorNote] = useState('');
  const [manualTranscript, setManualTranscriptText] = useState('');

  const effectiveStatus =
    summary?.status || statusPayload?.status || undefined;
  const resolvedSessionId = sessionId || summary?.sessionId;

  const load = useCallback(() => {
    if (summaryId) {
      void dispatch(fetchSummaryByIdThunk(summaryId));
    } else if (sessionId) {
      void dispatch(fetchSessionSummaryThunk(sessionId));
    }
    if (sessionId) {
      void dispatch(fetchSummaryStatusThunk(sessionId));
    }
  }, [dispatch, sessionId, summaryId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  useEffect(() => {
    if (!summary) return;
    setTitle(summary.title || '');
    setOverview(summary.overview || '');
    setKeyPointsText((summary.keyPoints || []).join('\n'));
    setAreasText((summary.areasToImprove || []).join('\n'));
    setNextStepsText((summary.nextSteps || []).join('\n'));
    setTopicsText(
      (summary.topicsCovered || [])
        .map(t => (t.detail ? `${t.title}: ${t.detail}` : t.title))
        .join('\n')
    );
    setHomeworkText(
      (summary.homework || [])
        .map(h => (h.description ? `${h.title}: ${h.description}` : h.title))
        .join('\n')
    );
    setTutorNote(summary.tutorReview?.note || '');
  }, [summary]);

  const resolvedId = summary?._id || summaryId || statusPayload?.summaryId;

  const buildPayload = (): ReviewSummaryPayload => ({
    title: title.trim(),
    overview: overview.trim(),
    keyPoints: keyPointsText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean),
    areasToImprove: areasText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean),
    nextSteps: nextStepsText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean),
    topicsCovered: topicsText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)
      .map(line => {
        const [t, ...rest] = line.split(':');
        return {
          title: t.trim(),
          detail: rest.join(':').trim() || undefined,
        };
      }),
    homework: homeworkText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)
      .map(line => {
        const [t, ...rest] = line.split(':');
        return {
          title: t.trim(),
          description: rest.join(':').trim() || undefined,
        };
      }),
    tutorNote: tutorNote.trim() || undefined,
  });

  const save = async () => {
    if (!resolvedId) return;
    try {
      await dispatch(
        reviewSummaryThunk({ summaryId: resolvedId, data: buildPayload() })
      ).unwrap();
      setEditing(false);
      Alert.alert('Saved', 'Your edits were saved.');
    } catch (e) {
      Alert.alert('Could not save', String(e));
    }
  };

  const publish = () => {
    if (!resolvedId) return;
    Alert.alert(
      'Publish this summary?',
      'Once published, the student will be able to view it.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Publish',
          style: 'default',
          onPress: async () => {
            try {
              if (editing) {
                await dispatch(
                  reviewSummaryThunk({
                    summaryId: resolvedId,
                    data: buildPayload(),
                  })
                ).unwrap();
              }
              await dispatch(publishSummaryThunk(resolvedId)).unwrap();
              Alert.alert('Published', 'Student has been notified.');
              navigation.goBack();
            } catch (e) {
              Alert.alert('Could not publish', String(e));
            }
          },
        },
      ]
    );
  };

  const retryWithNotes = async () => {
    if (!resolvedSessionId) {
      Alert.alert('Missing session', 'Cannot retry without a session id.');
      return;
    }
    const notes = manualTranscript.trim();
    if (!notes) {
      Alert.alert(
        'Paste class notes',
        'Add a short transcript or notes from the class, then retry.'
      );
      return;
    }
    try {
      await dispatch(
        retrySummaryThunk({
          sessionId: resolvedSessionId,
          transcriptText: notes,
        })
      ).unwrap();
      Alert.alert('Retry started', 'Generating a new summary…');
      navigation.replace('SessionSummaryProcessingScreen', {
        sessionId: resolvedSessionId,
        role: 'tutor',
      });
    } catch (e) {
      Alert.alert('Retry failed', String(e));
    }
  };

  const meta = useMemo(() => {
    if (!summary) return '';
    return [
      summary.subject,
      summary.sessionDate,
      summary.startTime && summary.endTime
        ? `${summary.startTime}–${summary.endTime}`
        : null,
      summary.durationMinutes ? `${summary.durationMinutes} min` : null,
    ]
      .filter(Boolean)
      .join(' · ');
  }, [summary]);

  if (loading && !summary && effectiveStatus !== 'failed') {
    return (
      <GlassScreen scroll={false}>
        <ActivityIndicator style={{ marginTop: 40 }} color={GLASS.primary} />
      </GlassScreen>
    );
  }

  // Failed generation: tutor pastes notes then retries (FYP path without STT).
  if (effectiveStatus === 'failed' && resolvedSessionId) {
    return (
      <GlassScreen scroll={false} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Summary Failed</Text>
          <View style={{ width: 48 }} />
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.kicker}>Needs class notes</Text>
          <Text style={styles.failBody}>
            Generation needs a transcript. Paste what was covered in class,
            then retry. Speech-to-text is optional on the backend.
          </Text>
          {error ? <Text style={styles.failError}>{error}</Text> : null}
          <Label>Class notes / transcript</Label>
          <TextInput
            style={[styles.input, styles.areaLarge]}
            multiline
            placeholder="e.g. Covered quadratic equations, practiced 3 word problems, homework: exercise 4.2…"
            placeholderTextColor={GLASS.textMuted}
            value={manualTranscript}
            onChangeText={setManualTranscriptText}
          />
          <View style={styles.actions}>
            <CustomButton
              title="Save Notes & Retry"
              onPress={() => void retryWithNotes()}
              loading={mutating}
            />
            <CustomButton
              title="Retry Without New Notes"
              onPress={() => {
                void dispatch(retrySummaryThunk(resolvedSessionId))
                  .unwrap()
                  .then(() => {
                    navigation.replace('SessionSummaryProcessingScreen', {
                      sessionId: resolvedSessionId,
                      role: 'tutor',
                    });
                  })
                  .catch(e => Alert.alert('Retry failed', String(e)));
              }}
              loading={mutating}
              backgroundColor="#fff"
              textColor={GLASS.primary}
              borderColor={GLASS.primary}
              borderWidth={1.5}
              style={{ marginTop: 10 }}
            />
          </View>
        </ScrollView>
      </GlassScreen>
    );
  }

  if (!summary) {
    return (
      <GlassScreen>
        <SummaryErrorState
          message={error || 'Summary not found'}
          onRetry={load}
        />
      </GlassScreen>
    );
  }

  return (
    <GlassScreen scroll={false} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>AI Summary Review</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>AI Generated Summary</Text>
        <Text style={styles.meta}>{meta}</Text>
        <Text style={styles.party}>
          Student: {summary.student?.name || '—'} · Tutor:{' '}
          {summary.tutor?.name || 'You'}
        </Text>

        {editing ? (
          <>
            <Label>Title</Label>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} />
            <Label>Overview</Label>
            <TextInput
              style={[styles.input, styles.area]}
              multiline
              value={overview}
              onChangeText={setOverview}
            />
            <Label>Topics (one per line, optional “Title: detail”)</Label>
            <TextInput
              style={[styles.input, styles.area]}
              multiline
              value={topicsText}
              onChangeText={setTopicsText}
            />
            <Label>Key points (one per line)</Label>
            <TextInput
              style={[styles.input, styles.area]}
              multiline
              value={keyPointsText}
              onChangeText={setKeyPointsText}
            />
            <Label>Homework (one per line)</Label>
            <TextInput
              style={[styles.input, styles.area]}
              multiline
              value={homeworkText}
              onChangeText={setHomeworkText}
            />
            <Label>Areas to improve</Label>
            <TextInput
              style={[styles.input, styles.area]}
              multiline
              value={areasText}
              onChangeText={setAreasText}
            />
            <Label>Next steps</Label>
            <TextInput
              style={[styles.input, styles.area]}
              multiline
              value={nextStepsText}
              onChangeText={setNextStepsText}
            />
            <Label>Note to student (optional)</Label>
            <TextInput
              style={styles.input}
              value={tutorNote}
              onChangeText={setTutorNote}
            />
          </>
        ) : (
          <>
            <Text style={styles.title}>{summary.title}</Text>
            <SummarySection title="Session Overview">
              <Text style={styles.body}>{summary.overview || '—'}</Text>
            </SummarySection>
            <SummarySection title="Topics Covered">
              <SummaryTopicList topics={summary.topicsCovered} />
            </SummarySection>
            <SummarySection title="Key Points">
              <BulletList items={summary.keyPoints} />
            </SummarySection>
            <SummarySection title="Important Concepts">
              <BulletList
                items={summary.importantConcepts.map(
                  c =>
                    c.explanation ? `${c.name}: ${c.explanation}` : c.name
                )}
              />
            </SummarySection>
            <SummarySection title="Questions Discussed">
              <BulletList items={summary.questionsDiscussed} />
            </SummarySection>
            <SummarySection title="Homework">
              <HomeworkList items={summary.homework} />
            </SummarySection>
            <SummarySection title="Student Strengths">
              <BulletList items={summary.studentStrengths} />
            </SummarySection>
            <SummarySection title="Areas to Improve">
              <BulletList items={summary.areasToImprove} />
            </SummarySection>
            <SummarySection title="Next Steps">
              <BulletList items={summary.nextSteps} />
            </SummarySection>
          </>
        )}

        <View style={styles.actions}>
          {editing ? (
            <>
              <CustomButton
                title="Save Changes"
                onPress={() => void save()}
                loading={mutating}
              />
              <TouchableOpacity
                onPress={() => setEditing(false)}
                style={styles.cancel}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <CustomButton
                title="Edit Summary"
                onPress={() => setEditing(true)}
                backgroundColor="#fff"
                textColor={GLASS.primary}
                borderColor={GLASS.primary}
                borderWidth={1.5}
              />
              {summary.status !== 'published' ? (
                <CustomButton
                  title="Approve & Publish"
                  onPress={publish}
                  loading={mutating}
                  style={{ marginTop: 10 }}
                />
              ) : null}
            </>
          )}
        </View>
      </ScrollView>
    </GlassScreen>
  );
};

const Label = ({ children }: { children: string }) => (
  <Text style={styles.label}>{children}</Text>
);

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
  kicker: { color: GLASS.primary, fontWeight: '800', fontSize: 12 },
  meta: { color: GLASS.textSecondary, marginTop: 4, fontSize: 13 },
  party: { color: GLASS.textMuted, marginTop: 4, marginBottom: 14, fontSize: 12 },
  title: {
    color: GLASS.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
  },
  body: { color: GLASS.textSecondary, lineHeight: 20, fontSize: 14 },
  failBody: {
    color: GLASS.textSecondary,
    lineHeight: 20,
    fontSize: 14,
    marginTop: 8,
    marginBottom: 8,
  },
  failError: {
    color: '#B91C1C',
    fontSize: 13,
    marginBottom: 8,
  },
  label: {
    color: GLASS.textSecondary,
    fontWeight: '700',
    fontSize: 12,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: GLASS.inputBorder,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: GLASS.textPrimary,
  },
  area: { minHeight: 88, textAlignVertical: 'top' },
  areaLarge: { minHeight: 160, textAlignVertical: 'top' },
  actions: { marginTop: 20, gap: 8 },
  cancel: { alignItems: 'center', padding: 12 },
  cancelText: { color: GLASS.textSecondary, fontWeight: '700' },
});

export default TutorSummaryReviewScreen;
