import { useState } from 'react';
import type { NavSectionId } from '../types/admin.types';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import Sidebar from './layout/Sidebar';
import TopBar from './layout/TopBar';
import LoadingSpinner from './shared/LoadingSpinner';
import Toast from './shared/Toast';
import OverviewPage from './pages/OverviewPage';
import TutorVerificationPage from './pages/TutorVerificationPage';
import TutorRatingsPage from './pages/TutorRatingsPage';
import ParentStudentLinksPage from './pages/ParentStudentLinksPage';
import EscrowManagementPage from './pages/EscrowManagementPage';
import AiSystemHealthPage from './pages/AiSystemHealthPage';
import SettingsPage from './pages/SettingsPage';
import { ADMIN_TOKEN_KEY } from '../config/firebase';
import { setAdminAuthToken } from '../api/admin.api';

interface AdminDashboardProps {
  initialNav?: NavSectionId;
  onLogout?: () => void;
}

export default function AdminDashboard({
  initialNav = 'overview',
  onLogout,
}: AdminDashboardProps) {
  const [activeNav, setActiveNav] = useState<NavSectionId>(initialNav);
  const {
    dashboard,
    data,
    loading,
    actionLoading,
    toast,
    error,
    loadDashboard,
    handleApprove,
    handleReject,
    handleScheduleInterview,
    handleResolveDispute,
    handleRevokeLink,
    handleUpdateSettings,
    handleKeepTutor,
    handleRemoveRatedTutor,
  } = useAdminDashboard();

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    setAdminAuthToken('');
    onLogout?.();
  };

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
      case 'ratings':
        return (
          <TutorRatingsPage
            rows={dashboard.tutorRatings ?? []}
            actionLoading={actionLoading}
            onKeep={handleKeepTutor}
            onRemove={handleRemoveRatedTutor}
            onRefresh={() => void loadDashboard()}
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
          onRefresh={loadDashboard}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-4 sm:p-6">
          {loading ? (
            <LoadingSpinner />
          ) : error && !data ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-8 text-center text-sm text-amber-900">
              <p className="font-semibold">Could not load tutor requests</p>
              <p className="mt-2">{error}</p>
              <button
                type="button"
                onClick={loadDashboard}
                className="mt-4 rounded-xl bg-gradient-to-r from-tl-primary-dark to-tl-primary-light px-4 py-2 text-sm font-bold text-white"
              >
                Retry
              </button>
            </div>
          ) : (
            renderPage()
          )}
        </main>
      </div>

      {toast && <Toast message={toast} />}
    </div>
  );
}
