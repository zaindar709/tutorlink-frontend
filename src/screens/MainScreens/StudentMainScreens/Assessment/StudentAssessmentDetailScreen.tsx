import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { GlassScreen } from '../../../../components/Glass';
import { GLASS } from '../../../../theme/glass';
import ProfileSubHeader from '../../../../components/Profile/ProfileSubHeader/ProfileSubHeader';
import CustomButton from '../../../../components/CustomButton';
import {
  AssessmentErrorState,
  AssessmentLoadingState,
} from '../../../../components/Assessment';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  fetchAssessmentThunk,
  startAttemptThunk,
} from '../../../../store/assessment/assessmentSlice';

const fmt = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
};

const StudentAssessmentDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const assessmentId = String(route.params?.assessmentId || '');
  const dispatch = useAppDispatch();
  const item = useAppSelector(s => s.assessment.byId[assessmentId]);
  const loading = useAppSelector(s => s.assessment.detailLoading);
  const mutating = useAppSelector(s => s.assessment.mutating);
  const error = useAppSelector(s => s.assessment.lastError);

  const load = useCallback(() => {
    if (assessmentId) void dispatch(fetchAssessmentThunk(assessmentId));
  }, [assessmentId, dispatch]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const start = async () => {
    const result = await dispatch(startAttemptThunk(assessmentId));
    if (startAttemptThunk.fulfilled.match(result)) {
      navigation.navigate('StudentTakeAssessmentScreen', {
        assessmentId,
        attemptId: result.payload._id,
      });
      return;
    }
    Alert.alert('Cannot start', String(result.payload || 'Try again.'));
  };

  const openResult = () => {
    const attemptId = String(route.params?.attemptId || item?.lastAttemptId || '');
    if (!attemptId) {
      Alert.alert('Result not ready', 'No submitted attempt was found yet.');
      return;
    }
    navigation.navigate('StudentAssessmentResultScreen', {
      assessmentId,
      attemptId,
    });
  };

  const remaining =
    item?.remainingAttempts ??
    Math.max(0, (item?.attemptsAllowed ?? 1) - (item?.attemptsUsed ?? 0));
  const canStart =
    item &&
    item.status === 'published' &&
    item.studentStatus !== 'grading' &&
    (item.studentStatus === 'in_progress' || remaining > 0);
  const isResume = item?.studentStatus === 'in_progress';

  const showResult =
    item &&
    (item.studentStatus === 'submitted' ||
      item.studentStatus === 'grading' ||
      item.studentStatus === 'graded' ||
      Boolean(item.lastAttemptId && item.studentStatus !== 'not_started' && item.studentStatus !== 'in_progress'));

  return (
    <GlassScreen scroll={false} edges={['top', 'left', 'right']}>
      <ProfileSubHeader navigation={navigation} title={item?.title || 'Assessment'} />
      {loading && !item ? (
        <View style={styles.pad}>
          <AssessmentLoadingState />
        </View>
      ) : error && !item ? (
        <View style={styles.pad}>
          <AssessmentErrorState message={error} onRetry={load} />
        </View>
      ) : item ? (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.kicker}>
            {item.type.toUpperCase()}
            {item.subject ? ` · ${item.subject}` : ''}
          </Text>
          <Text style={styles.title}>{item.title}</Text>
          {item.description ? <Text style={styles.body}>{item.description}</Text> : null}
          <View style={styles.card}>
            <Row label="Marks" value={`${item.totalMarks} (pass ${item.passingMarks})`} />
            {item.durationMinutes ? (
              <Row label="Duration" value={`${item.durationMinutes} min`} />
            ) : null}
            <Row label="Opens" value={fmt(item.startAt)} />
            <Row label="Due" value={fmt(item.dueAt)} />
            <Row
              label="Attempts"
              value={`${item.attemptsUsed ?? 0} / ${item.attemptsAllowed}`}
            />
            {item.tutor?.name ? <Row label="Tutor" value={item.tutor.name} /> : null}
          </View>
          {item.instructions ? (
            <View style={styles.card}>
              <Text style={styles.section}>Instructions</Text>
              <Text style={styles.body}>{item.instructions}</Text>
            </View>
          ) : null}
          {canStart ? (
            <CustomButton
              title={
                isResume
                  ? 'Continue'
                  : item.type === 'assignment'
                    ? 'Open assignment'
                    : 'Start'
              }
              onPress={() => void start()}
              loading={mutating}
            />
          ) : null}
          {showResult ? (
            <CustomButton
              title="View result"
              onPress={openResult}
              backgroundColor={GLASS.primarySoft}
              textColor={GLASS.primaryDeep}
            />
          ) : null}
        </ScrollView>
      ) : null}
    </GlassScreen>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  pad: { padding: 16 },
  content: { padding: 16, paddingBottom: 40, gap: 12 },
  kicker: { color: GLASS.primary, fontWeight: '800', fontSize: 12, letterSpacing: 0.6 },
  title: { color: GLASS.textPrimary, fontWeight: '800', fontSize: 22 },
  body: { color: GLASS.textSecondary, lineHeight: 20, fontSize: 14 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.42)',
    borderWidth: 1,
    borderColor: GLASS.cardBorder,
    borderRadius: 18,
    padding: 14,
    gap: 8,
  },
  section: { fontWeight: '800', color: GLASS.textPrimary, marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  label: { color: GLASS.textMuted, fontWeight: '700', fontSize: 13 },
  value: { color: GLASS.textPrimary, fontWeight: '700', fontSize: 13, flex: 1, textAlign: 'right' },
});

export default StudentAssessmentDetailScreen;
