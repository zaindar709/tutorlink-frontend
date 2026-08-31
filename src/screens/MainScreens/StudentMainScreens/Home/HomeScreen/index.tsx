import React, { useMemo } from 'react';
import { ActivityIndicator, View } from 'react-native';
import FirstTimeHome from './FirstTimeHome';
import StudentDashboardHome from './StudentDashboardHome';
import { useDashboard } from '../../../../../hooks/api/useDashboard';
import { useStudentTutorRelations } from '../../../../../hooks/api/useStudentTutorRelations';
import { GlassScreen } from '../../../../../components/Glass';
import { GLASS } from '../../../../../theme/glass';

type Props = {
  onFindTutorPress?: () => void;
};

/**
 * Student Home tab entry:
 * - No hired tutor yet → discovery / FirstTimeHome
 * - Has accepted tutoring (package/session) → schedule dashboard
 */
const StudentHome: React.FC<Props> = ({ onFindTutorPress }) => {
  const { data: dashboard, loading: dashboardLoading } = useDashboard();
  const { bookings, loading: relationsLoading } = useStudentTutorRelations();

  const hasHiredTutor = useMemo(() => {
    if (dashboard?.hasActiveTutor) return true;
    if ((dashboard?.upcomingSessionCount || 0) > 0) return true;
    if ((dashboard?.todaySchedule?.currentLessons?.length || 0) > 0) {
      return true;
    }
    return bookings.some(b => {
      const status = String(b.status || '').toLowerCase();
      return status === 'accepted' || status === 'confirmed';
    });
  }, [bookings, dashboard]);

  const bootstrapping =
    (dashboardLoading || relationsLoading) &&
    !dashboard &&
    bookings.length === 0;

  if (bootstrapping) {
    return (
      <GlassScreen
        scroll={false}
        contentStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <View>
          <ActivityIndicator color={GLASS.primary} size="large" />
        </View>
      </GlassScreen>
    );
  }

  if (hasHiredTutor) {
    return <StudentDashboardHome />;
  }

  return <FirstTimeHome onFindTutorPress={onFindTutorPress} />;
};

export default StudentHome;
