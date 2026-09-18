import { useEffect, useState } from 'react';
import type { ParentNavId, SettingsViewId } from '../types/parent.types';
import { SETTINGS_VIEW_TITLES } from '../constants/nav';
import { useParentDashboard } from '../hooks/useParentDashboard';
import { filterDashboardByChild } from '../utils/normalizeDashboard';
import { useTheme } from '../hooks/useTheme';
import Sidebar from './layout/Sidebar';
import TopBar from './layout/TopBar';
import Toast from './shared/Toast';
import OverviewPage from './pages/OverviewPage';
import MyChildrenPage from './pages/MyChildrenPage';
import SessionsPage from './pages/SessionsPage';
import ProgressPage from './pages/ProgressPage';
import PaymentsPage from './pages/PaymentsPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsHubPage from './settings/SettingsHubPage';
import SettingsLayout from './settings/SettingsLayout';
import NotificationPreferencesPage from './settings/NotificationPreferencesPage';
import PrivacySettingsPage from './settings/PrivacySettingsPage';
import LinkedStudentsSettingsPage from './settings/LinkedStudentsSettingsPage';
import AppearanceSettingsPage from './settings/AppearanceSettingsPage';
import LanguageSettingsPage from './settings/LanguageSettingsPage';
import LinkStudentGate from './auth/LinkStudentGate';
import ChildScopeBar from './layout/ChildScopeBar';

export default function ParentDashboard() {
  const [activeNav, setActiveNav] = useState<ParentNavId>('overview');
  const [settingsView, setSettingsView] = useState<SettingsViewId>('hub');
  const { theme, setTheme, resolvedTheme } = useTheme();
  const dash = useParentDashboard();
  const {
    booting,
    data,
    toast,
    unreadCount,
    prefillCode,
    error,
    payments,
    monthlySpend,
    logout,
    selectedChildId,
    linkStudent,
    selectChild,
    unlinkStudent,
    updateSettings,
    refreshSessions,
    refreshProgress,
    refreshNotifications,
    refreshPayments,
    loading,
  } = dash;

  useEffect(() => {
    if (!data?.settings?.theme) return;
    if (data.settings.theme !== theme) {
      setTheme(data.settings.theme);
    }
    // Sync from server once when dashboard arrives.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.settings?.theme]);

  useEffect(() => {
    if (!data?.children.length) return;
    if (activeNav === 'sessions') void refreshSessions();
    if (activeNav === 'progress') void refreshProgress();
    if (activeNav === 'notifications') void refreshNotifications();
    if (activeNav === 'payments') void refreshPayments();
  }, [
    activeNav,
    data?.children.length,
    selectedChildId,
    refreshNotifications,
    refreshPayments,
    refreshProgress,
    refreshSessions,
  ]);

  if (booting) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-tl-bg px-6 text-center">
        <p className="text-sm font-semibold text-tl-text-muted">
          Loading parent dashboard…
        </p>
        <p className="max-w-sm text-xs text-tl-text-muted">
          The server can take up to a minute to wake up. This is not an invalid
          code.
        </p>
      </div>
    );
  }

  if (!data || data.children.length === 0) {
    return (
      <>
        <LinkStudentGate
          onLink={linkStudent}
          prefillCode={prefillCode}
          initialError={error}
        />
        {toast ? <Toast message={toast} /> : null}
      </>
    );
  }

  const visibleData = filterDashboardByChild(data, selectedChildId || null);
  const visiblePayments = selectedChildId
    ? payments.filter(item => !item.childId || item.childId === selectedChildId)
    : payments;
  const visibleSpend = visiblePayments.length
    ? visiblePayments
        .filter(item => item.status === 'completed')
        .reduce((sum, item) => sum + item.amount, 0)
    : monthlySpend;

  const handleNavigate = (nav: ParentNavId) => {
    setActiveNav(nav);
    if (nav === 'settings') setSettingsView('hub');
  };

  const handleThemeChange = (next: typeof theme) => {
    setTheme(next);
    void updateSettings({ theme: next });
  };

  const pageTitle =
    activeNav === 'settings' && settingsView !== 'hub'
      ? SETTINGS_VIEW_TITLES[settingsView]
      : undefined;

  const renderSettings = () => {
    switch (settingsView) {
      case 'notifications-prefs':
        return (
          <NotificationPreferencesPage
            settings={data.settings}
            onSave={updateSettings}
          />
        );
      case 'privacy':
        return (
          <PrivacySettingsPage
            settings={data.settings}
            onSave={updateSettings}
          />
        );
      case 'linked-students':
        return (
          <LinkedStudentsSettingsPage
            children={data.children}
            onUnlink={unlinkStudent}
            onLink={linkStudent}
          />
        );
      case 'appearance':
        return (
          <AppearanceSettingsPage
            theme={theme}
            onThemeChange={handleThemeChange}
          />
        );
      case 'language':
        return (
          <LanguageSettingsPage
            settings={data.settings}
            onSave={updateSettings}
          />
        );
      default:
        return <SettingsHubPage onOpen={setSettingsView} />;
    }
  };

  const renderPage = () => {
    switch (activeNav) {
      case 'overview':
        return (
          <OverviewPage
            data={visibleData}
            onNavigate={section => setActiveNav(section)}
            onSelectChild={selectChild}
          />
        );
      case 'children':
        return (
          <MyChildrenPage
            children={data.children}
            selectedId={selectedChildId}
            onSelectChild={selectChild}
            onLink={linkStudent}
          />
        );
      case 'sessions':
        return <SessionsPage sessions={visibleData.sessions} />;
      case 'progress':
        return <ProgressPage progress={visibleData.progress} />;
      case 'payments':
        return (
          <PaymentsPage
            payments={visiblePayments}
            monthlySpend={visibleSpend}
          />
        );
      case 'notifications':
        return (
          <NotificationsPage notifications={visibleData.notifications} />
        );
      case 'settings':
        return (
          <SettingsLayout
            view={settingsView}
            onBack={() => setSettingsView('hub')}
          >
            {renderSettings()}
          </SettingsLayout>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-tl-bg">
      <Sidebar activeNav={activeNav} onNavigate={handleNavigate} />

      <div className="flex min-h-screen flex-1 flex-col lg:ml-64">
        <TopBar
          activeNav={activeNav}
          pageTitle={pageTitle}
          unreadCount={unreadCount}
          profileName={data.children.find(child => child.id === selectedChildId)?.name || data.profile.name}
          profileInitials={
            data.children.find(child => child.id === selectedChildId)
              ?.avatarInitials || data.profile.avatarInitials
          }
          isDark={resolvedTheme === 'dark'}
          onToggleTheme={() => {
            const next = resolvedTheme === 'dark' ? 'light' : 'dark';
            handleThemeChange(next);
          }}
          onNotifications={() => handleNavigate('notifications')}
          onLogout={logout}
        />

        <ChildScopeBar
          children={data.children}
          selectedId={selectedChildId}
          onSelect={selectChild}
          onLink={linkStudent}
        />

        {error || loading ? (
          <div
            className={`mx-4 mt-3 rounded-xl border px-4 py-2 text-sm font-semibold ${
              error
                ? 'border-tl-red/30 bg-red-50 text-tl-red dark:bg-red-950/30'
                : 'border-tl-border bg-tl-surface-muted text-tl-text-muted'
            }`}
          >
            {error || 'Refreshing this student’s dashboard…'}
          </div>
        ) : null}

        <nav className="flex gap-2 overflow-x-auto border-b border-tl-border px-4 py-2 lg:hidden">
          {['overview', 'children', 'sessions', 'progress', 'payments', 'notifications', 'settings'].map(
            id => (
              <button
                key={id}
                type="button"
                onClick={() => handleNavigate(id as ParentNavId)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
                  activeNav === id
                    ? 'bg-gradient-to-r from-tl-primary-dark to-tl-primary-light text-white'
                    : 'border border-tl-border text-tl-text-muted'
                }`}
              >
                {id === 'children' ? 'Children' : id}
              </button>
            )
          )}
        </nav>

        <main className="flex-1 p-4 sm:p-6">{renderPage()}</main>
      </div>

      {toast ? <Toast message={toast} /> : null}
    </div>
  );
}
