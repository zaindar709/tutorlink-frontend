import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { IconButton } from 'react-native-paper';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { GlassScreen } from '../../../../components/Glass';
import { GLASS } from '../../../../theme/glass';
import {
  SummaryCard,
  SummaryEmptyState,
  SummaryErrorState,
  SummaryLoadingState,
} from '../../../../components/Summary';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchTutorSummariesThunk } from '../../../../store/summary/summarySlice';
import { ensureSummarySocket } from '../../../../services/summaries/summarySocket';
import { AiClassSummary } from '../../../../types/summary.types';

const TutorSummariesScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const ids = useAppSelector(s => s.summary.tutorListIds);
  const byId = useAppSelector(s => s.summary.byId);
  const loading = useAppSelector(s => s.summary.listLoading);
  const error = useAppSelector(s => s.summary.lastError);
  const items = ids.map(id => byId[id]).filter(Boolean) as AiClassSummary[];

  const pending = useMemo(
    () =>
      items.filter(
        s => s.status === 'generated' || s.status === 'under_review'
      ),
    [items]
  );
  const published = useMemo(
    () => items.filter(s => s.status === 'published'),
    [items]
  );

  const load = useCallback(() => {
    void dispatch(fetchTutorSummariesThunk({ page: 1, limit: 40 }));
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      void ensureSummarySocket();
      load();
    }, [load])
  );

  const data = [...pending, ...published.filter(p => !pending.includes(p))];

  return (
    <GlassScreen scroll={false} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
        <Text style={styles.title}>AI Summaries</Text>
        <View style={{ width: 48 }} />
      </View>

      <View style={styles.stats}>
        <Text style={styles.stat}>
          Pending review: <Text style={styles.statN}>{pending.length}</Text>
        </Text>
        <Text style={styles.stat}>
          Published: <Text style={styles.statN}>{published.length}</Text>
        </Text>
      </View>

      {loading && items.length === 0 ? (
        <View style={styles.pad}>
          <SummaryLoadingState />
        </View>
      ) : error && items.length === 0 ? (
        <View style={styles.pad}>
          <SummaryErrorState message={error} onRetry={load} />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={load}
              tintColor={GLASS.primary}
            />
          }
          ListEmptyComponent={
            <SummaryEmptyState
              title="No AI summaries yet"
              subtitle="After a class ends, generated summaries ready for review appear here."
            />
          }
          renderItem={({ item }) => (
            <SummaryCard
              summary={item}
              viewer="tutor"
              onPress={() =>
                navigation.navigate('TutorSummaryReviewScreen', {
                  summaryId: item._id,
                  sessionId: item.sessionId,
                })
              }
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
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
  title: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '800',
    fontSize: 17,
    color: GLASS.textPrimary,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  stat: { color: GLASS.textSecondary, fontSize: 13, fontWeight: '600' },
  statN: { color: GLASS.textPrimary, fontWeight: '800' },
  list: { padding: 16, paddingBottom: 40 },
  pad: { padding: 16 },
});

export default TutorSummariesScreen;
