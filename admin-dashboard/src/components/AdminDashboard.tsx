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
import { ADMIN_PREVIEW_KEY, ADMIN_TOKEN_KEY } from '../config/firebase';
import { setAdminAuthToken } from '../api/admin.api';

interface AdminDashboardProps {
  previewMode?: boolean;
  onLogout?: () => void;
}

export default function AdminDashboard({
  previewMode = false,
  onLogout,
}: AdminDashboardProps) {
  const [activeNav, setActiveNav] = useState<NavSectionId>('overview');
  const {
    dashboard,
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
  } = useAdminDashboard(previewMode);

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_PREVIEW_KEY);
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
          {previewMode ? (
            <div className="mb-4 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-4 text-sm text-violet-900">
              <p className="font-bold">Preview mode — no real tutor data</p>
              <p className="mt-2 leading-6">
                Click the logout icon (top right) → choose{' '}
                <strong>Create admin (first time)</strong> → pick any email and
                password → then open <strong>Tutor Verification</strong> to
                approve tutors from the mobile app.
              </p>
            </div>
          ) : null}
          {error && !previewMode ? (
            <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {error}
            </div>
          ) : null}
          {loading ? <LoadingSpinner /> : renderPage()}
        </main>
      </div>

      {toast && <Toast message={toast} />}
    </div>
  );
}
