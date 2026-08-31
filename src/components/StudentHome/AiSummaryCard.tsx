import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { GLASS } from '../../theme/glass';
import { DashboardAiSummary } from '../../types/api.types';

type Props = {
  summary: DashboardAiSummary;
  onPress?: () => void;
};

const subjectIcon = (subject: string) => {
  const s = subject.toLowerCase();
  if (s.includes('math') || s.includes('calculus') || s.includes('algebra')) {
    return 'ruler-square';
  }
  if (s.includes('physics') || s.includes('science')) return 'atom';
  if (s.includes('chem')) return 'flask-outline';
  if (s.includes('english') || s.includes('lit')) return 'book-open-page-variant';
  if (s.includes('cs') || s.includes('computer') || s.includes('code')) {
    return 'laptop';
  }
  return 'lightbulb-on-outline';
};

const formatSessionDate = (raw?: string, fallbackIso?: string) => {
  const value = String(raw || fallbackIso || '').trim();
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value.slice(0, 10);
  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const AiSummaryCard: React.FC<Props> = ({ summary, onPress }) => {
  const dateLabel = formatSessionDate(summary.sessionDate, summary.createdAt);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.topRow}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons
            name={(summary.icon || subjectIcon(summary.subject)) as never}
            size={22}
            color={GLASS.textSecondary}
          />
        </View>
        <View style={styles.sparkle}>
          <MaterialCommunityIcons name="star-four-points" size={12} color="#fff" />
        </View>
      </View>

      <Text style={styles.subject} numberOfLines={1}>
        {summary.subject}
      </Text>
      <Text style={styles.title} numberOfLines={2}>
        {summary.title}
      </Text>

      {summary.tutorName ? (
        <Text style={styles.meta} numberOfLines={1}>
          Tutor: {summary.tutorName}
        </Text>
      ) : null}
      {dateLabel ? (
        <Text style={styles.meta} numberOfLines={1}>
          {dateLabel}
        </Text>
      ) : null}

      {summary.excerpt ? (
        <Text style={styles.excerpt} numberOfLines={2}>
          {summary.excerpt}
        </Text>
      ) : null}

      <View style={styles.footer}>
        <Text style={styles.link}>View Summary</Text>
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
    padding: GLASS.space.lg,
    ...GLASS.shadow.soft,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(253, 230, 138, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: GLASS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subject: {
    color: GLASS.primary,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  title: {
    color: GLASS.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  meta: {
    color: GLASS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  excerpt: {
    color: GLASS.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
  footer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 2,
  },
  link: { color: GLASS.primary, fontWeight: '800', fontSize: 13 },
});

export default AiSummaryCard;
