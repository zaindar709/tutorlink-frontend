// DocumentReviewScreen.tsx

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import useUi from '../../../../hooks/ui/useUi';

import ReviewHeader from '../../../../components/Tutor/ReviewHeader';
import InterviewInfoCard from '../../../../components/Tutor/InterviewInfoCard';
import ActionCards from '../../../../components/Tutor/ActionCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '../../../../components/CustomButton';
import { Text } from 'react-native-paper';

const DocumentReviewScreen = () => {
  const { colors, resp } = useUi();

  const styles = createStyles(colors, resp);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <ReviewHeader />
        <InterviewInfoCard />
        <ActionCards />
        <View style={{ marginTop: resp.dy(20) }}>
          <CustomButton
            title="Schedule my Interview"
            onPress={() => 'Schedule my Interview pressed  '}
            icon="calendar-month-outline"
          />
        </View>
        <Text style={styles.infoText}>
          💡 You can schedule the interview at your convenience
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DocumentReviewScreen;

const createStyles = (colors: any, resp: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F8FAFC',
    },

    content: {
      paddingBottom: 30,
    },
    infoText: {
      color: '#6B7280',
      fontSize: resp.df(12),
      textAlign: 'center',
      marginTop: resp.dy(20),
    },
  });
