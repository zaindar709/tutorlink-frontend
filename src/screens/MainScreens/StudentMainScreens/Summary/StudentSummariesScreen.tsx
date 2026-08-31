import React, { useCallback } from 'react';
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
import { fetchStudentSummariesThunk } from '../../../../store/summary/summarySlice';
import { ensureSummarySocket } from '../../../../services/summaries/summarySocket';
import { AiClassSummary } from '../../../../types/summary.types';

const StudentSummariesScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const ids = useAppSelector(s => s.summary.studentListIds);
  const byId = useAppSelector(s => s.summary.byId);
  const loading = useAppSelector(s => s.summary.listLoading);
  const error = useAppSelector(s => s.summary.lastError);
  const items = ids.map(id => byId[id]).filter(Boolean) as AiClassSummary[];

  const load = useCallback(() => {
    void dispatch(
      fetchStudentSummariesThunk({ page: 1, limit: 30, status: 'published' })
    );
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      void ensureSummarySocket();
      load();
    }, [load])
  );

  return (
    <GlassScreen scroll={false} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
        <Text style={styles.title}>Learning Summaries</Text>
        <View style={{ width: 48 }} />
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
          data={items}
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
            <SummaryEmptyState subtitle="Published class summaries from your tutors appear here." />
          }
          renderItem={({ item }) => (
            <SummaryCard
              summary={item}
              viewer="student"
              onPress={() =>
                navigation.navigate('StudentSummaryDetailScreen', {
                  summaryId: item._id,
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
  list: { padding: 16, paddingBottom: 40 },
  pad: { padding: 16 },
});

export default StudentSummariesScreen;
