import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { GLASS } from '../../theme/glass';
import { Assessment, AssessmentType } from '../../types/assessment.types';

const TYPE_META: Record<
  AssessmentType,
  { icon: string; label: string; tint: string }
> = {
  quiz: { icon: 'help-circle-outline', label: 'Quiz', tint: '#EDE9FE' },
  test: { icon: 'check-circle-outline', label: 'Test', tint: '#ECFDF3' },
  assignment: { icon: 'book-open-page-variant', label: 'Assignment', tint: '#FFF7ED' },
};

const formatWhen = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const AssessmentCard = ({
  item,
  onPress,
  rightLabel,
}: {
  item: Assessment;
  onPress: () => void;
  rightLabel?: string;
}) => {
  const meta = TYPE_META[item.type] || TYPE_META.quiz;
  const due = formatWhen(item.dueAt);
  const status = item.studentStatus || item.status;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.iconWrap, { backgroundColor: meta.tint }]}>
        <MaterialCommunityIcons name={meta.icon} size={22} color={GLASS.primary} />
      </View>
      <View style={styles.body}>
        <Text style={styles.kicker}>
          {meta.label}
          {item.subject ? ` · ${item.subject}` : ''}
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {item.totalMarks} marks
          {due ? ` · Due ${due}` : ''}
          {item.tutor?.name ? ` · ${item.tutor.name}` : ''}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.status}>
          {rightLabel || String(status || '').replace(/_/g, ' ')}
        </Text>
        <MaterialCommunityIcons name="chevron-right" size={20} color={GLASS.textMuted} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.42)',
    borderWidth: 1,
    borderColor: GLASS.cardBorder,
    borderRadius: 18,
    padding: 12,
    gap: 10,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  kicker: {
    color: GLASS.primary,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  title: { color: GLASS.textPrimary, fontWeight: '800', fontSize: 15, marginTop: 2 },
  meta: { color: GLASS.textSecondary, fontSize: 12, marginTop: 4 },
  right: { alignItems: 'flex-end', gap: 4, maxWidth: 88 },
  status: {
    color: GLASS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
    textAlign: 'right',
  },
});
