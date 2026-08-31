import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GLASS } from '../../theme/glass';
import { SummaryHomework, SummaryTopic } from '../../types/summary.types';

export const SummaryTopicList = ({ topics }: { topics: SummaryTopic[] }) => {
  if (!topics?.length) {
    return <Text style={styles.empty}>No topics listed.</Text>;
  }
  return (
    <View style={styles.stack}>
      {topics.map((t, i) => (
        <View key={`${t.title}-${i}`} style={styles.item}>
          <Text style={styles.bullet}>•</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemTitle}>{t.title}</Text>
            {t.detail ? <Text style={styles.itemBody}>{t.detail}</Text> : null}
          </View>
        </View>
      ))}
    </View>
  );
};

export const HomeworkList = ({ items }: { items: SummaryHomework[] }) => {
  if (!items?.length) {
    return <Text style={styles.empty}>No homework assigned.</Text>;
  }
  return (
    <View style={styles.stack}>
      {items.map((h, i) => (
        <View key={`${h.title}-${i}`} style={styles.hw}>
          <Text style={styles.itemTitle}>{h.title}</Text>
          {h.description ? (
            <Text style={styles.itemBody}>{h.description}</Text>
          ) : null}
          {h.dueHint ? (
            <Text style={styles.due}>Due: {h.dueHint}</Text>
          ) : null}
        </View>
      ))}
    </View>
  );
};

export const BulletList = ({ items }: { items: string[] }) => {
  if (!items?.length) {
    return <Text style={styles.empty}>None listed.</Text>;
  }
  return (
    <View style={styles.stack}>
      {items.map((line, i) => (
        <View key={`${line}-${i}`} style={styles.item}>
          <Text style={styles.bullet}>•</Text>
          <Text style={[styles.itemBody, { flex: 1 }]}>{line}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  stack: { gap: 8 },
  item: { flexDirection: 'row', gap: 8 },
  bullet: { color: GLASS.primary, fontWeight: '800', marginTop: 1 },
  itemTitle: { color: GLASS.textPrimary, fontWeight: '700', fontSize: 14 },
  itemBody: { color: GLASS.textSecondary, fontSize: 13, lineHeight: 19 },
  hw: {
    backgroundColor: 'rgba(117,72,245,0.06)',
    borderRadius: 12,
    padding: 12,
  },
  due: { marginTop: 4, color: GLASS.primaryDeep, fontSize: 12, fontWeight: '700' },
  empty: { color: GLASS.textMuted, fontSize: 13 },
});
