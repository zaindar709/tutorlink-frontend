import { useState } from 'react';
import type { NavSectionId } from '../types/admin.types';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import Sidebar from './layout/Sidebar';
import TopBar from './layout/TopBar';
import LoadingSpinner from './shared/LoadingSpinner';
import Toast from './shared/Toast';
import OverviewPage from './pages/OverviewPage';
import TutorVerificationPage from './pages/TutorVerificationPage';
import ParentStudentLinksPage from './pages/ParentStudentLinksPage';
import EscrowManagementPage from './pages/EscrowManagementPage';
import AiSystemHealthPage from './pages/AiSystemHealthPage';
import SettingsPage from './pages/SettingsPage';

export default function AdminDashboard() {
  const [activeNav, setActiveNav] = useState<NavSectionId>('overview');
  const {
    dashboard,
    loading,
    actionLoading,
    toast,
    handleApprove,
    handleReject,
    handleScheduleInterview,
    handleResolveDispute,
    handleRevokeLink,
    handleUpdateSettings,
  } = useAdminDashboard();

  const renderPage = () => {
    switch (activeNav) {
      case 'overview':
        return (
          <OverviewPage
            dashboard={dashboard}
            actionLoading={actionLoading}
            onApprove={handleApprove}
            onReject={handleReject}
            onScheduleInterview={handleScheduleInterview}
          />
        );
      case 'verification':
        return (
          <TutorVerificationPage
            dashboard={dashboard}
            actionLoading={actionLoading}
            onApprove={handleApprove}
            onReject={handleReject}
            onScheduleInterview={handleScheduleInterview}
          />
        );
      case 'links':
        return (
          <ParentStudentLinksPage
            links={dashboard.parentLinks ?? []}
            actionLoading={actionLoading}
            onRevoke={handleRevokeLink}
          />
        );
      case 'escrow':
        return (
          <EscrowManagementPage
            dashboard={dashboard}
            actionLoading={actionLoading}
            onResolveDispute={handleResolveDispute}
          />
        );
      case 'ai':
        return <AiSystemHealthPage dashboard={dashboard} />;
      case 'settings':
        return (
          <SettingsPage
            settings={
              dashboard.settings ?? {
                platformName: 'TutorLink',
                supportEmail: 'admin@tutorlink.com',
                autoApproveTutors: false,
                interviewRequired: true,
                escrowHoldDays: 3,
                notifyOnNewTutor: true,
                notifyOnDispute: true,
              }
            }
            onUpdate={handleUpdateSettings}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-tl-bg">
      <Sidebar activeNav={activeNav} onNavigate={setActiveNav} />

      <div className="flex min-h-screen flex-1 flex-col lg:ml-64">
        <TopBar
          activeNav={activeNav}
          pendingCount={dashboard.stats.pendingTutors}
        />

        <main className="flex-1 p-4 sm:p-6">
          {loading ? <LoadingSpinner /> : renderPage()}
        </main>
      </div>

      {toast && <Toast message={toast} />}
    </div>
  );
}
