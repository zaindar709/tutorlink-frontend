import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { GLASS } from '../../theme/glass';
import { AiClassSummary } from '../../types/summary.types';
import SummaryStatusBadge from './SummaryStatusBadge';
import TutorReviewBadge from './TutorReviewBadge';

type Props = {
  summary: AiClassSummary;
  viewer: 'student' | 'tutor' | 'parent';
  onPress: () => void;
};

const SummaryCard: React.FC<Props> = ({ summary, viewer, onPress }) => {
  const peer =
    viewer === 'tutor' ? summary.student?.name : summary.tutor?.name;
  const peerLabel = viewer === 'tutor' ? 'Student' : 'Tutor';

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      <View style={styles.top}>
        <Text style={styles.subject}>{summary.subject}</Text>
        <SummaryStatusBadge status={summary.status} compact />
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {summary.title}
      </Text>
      <Text style={styles.meta}>
        {peer ? `${peerLabel}: ${peer}` : peerLabel}
        {summary.durationMinutes ? ` · ${summary.durationMinutes} min` : ''}
        {summary.sessionDate ? ` · ${summary.sessionDate}` : ''}
      </Text>
      {summary.tutorReview?.reviewed ? (
        <TutorReviewBadge
          tutorName={summary.tutorReview.reviewedByName || summary.tutor?.name}
        />
      ) : null}
      <View style={styles.footer}>
        <Text style={styles.link}>
          {viewer === 'tutor' && summary.status !== 'published'
            ? 'Review Summary'
            : 'View Summary'}
        </Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={GLASS.primary}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: GLASS.cardBgStrong,
    borderRadius: GLASS.radius.xl,
    borderWidth: 1,
    borderColor: GLASS.cardBorder,
    padding: 16,
    ...GLASS.shadow.soft,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  subject: { color: GLASS.primary, fontWeight: '800', fontSize: 12 },
  title: {
    color: GLASS.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  meta: { color: GLASS.textSecondary, fontSize: 12, marginBottom: 8 },
  footer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 2,
  },
  link: { color: GLASS.primary, fontWeight: '800', fontSize: 13 },
});

export default SummaryCard;
