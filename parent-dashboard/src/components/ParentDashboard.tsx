import { useState } from 'react';
import type { ParentNavId, SettingsViewId } from '../types/parent.types';
import { SETTINGS_VIEW_TITLES } from '../constants/nav';
import { useParentDashboard } from '../hooks/useParentDashboard';
import { useTheme } from '../hooks/useTheme';
import Sidebar from './layout/Sidebar';
import TopBar from './layout/TopBar';
import Toast from './shared/Toast';
import OverviewPage from './pages/OverviewPage';
import MyChildrenPage from './pages/MyChildrenPage';
import SessionsPage from './pages/SessionsPage';
import ProgressPage from './pages/ProgressPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsHubPage from './settings/SettingsHubPage';
import SettingsLayout from './settings/SettingsLayout';
import ProfileSettingsPage from './settings/ProfileSettingsPage';
import AccountSecurityPage from './settings/AccountSecurityPage';
import NotificationPreferencesPage from './settings/NotificationPreferencesPage';
import PrivacySettingsPage from './settings/PrivacySettingsPage';
import LinkedStudentsSettingsPage from './settings/LinkedStudentsSettingsPage';
import AppearanceSettingsPage from './settings/AppearanceSettingsPage';
import LanguageSettingsPage from './settings/LanguageSettingsPage';

export default function ParentDashboard() {
  const [activeNav, setActiveNav] = useState<ParentNavId>('overview');
  const [settingsView, setSettingsView] = useState<SettingsViewId>('hub');
  const { theme, setTheme, toggleTheme, resolvedTheme } = useTheme();
  const {
    data,
    toast,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    updateSettings,
    updateProfile,
  } = useParentDashboard();

  const handleNavigate = (nav: ParentNavId) => {
    setActiveNav(nav);
    if (nav === 'settings') setSettingsView('hub');
  };

  const pageTitle =
    activeNav === 'settings' && settingsView !== 'hub'
      ? SETTINGS_VIEW_TITLES[settingsView]
      : undefined;

  const renderSettings = () => {
    switch (settingsView) {
      case 'profile':
        return (
          <ProfileSettingsPage profile={data.profile} onSave={updateProfile} />
        );
      case 'account':
        return <AccountSecurityPage />;
      case 'notifications-prefs':
        return (
          <NotificationPreferencesPage
            settings={data.settings}
            onSave={updateSettings}
          />
        );
      case 'privacy':
        return (
          <PrivacySettingsPage settings={data.settings} onSave={updateSettings} />
        );
      case 'linked-students':
        return <LinkedStudentsSettingsPage children={data.children} />;
      case 'appearance':
        return (
          <AppearanceSettingsPage theme={theme} onThemeChange={setTheme} />
        );
      case 'language':
        return <LanguageSettingsPage />;
      default:
        return <SettingsHubPage onOpen={setSettingsView} />;
    }
  };

  const renderPage = () => {
    switch (activeNav) {
      case 'overview':
        return (
          <OverviewPage
            data={data}
            onNavigate={section => setActiveNav(section)}
          />
        );
      case 'children':
        return <MyChildrenPage children={data.children} />;
      case 'sessions':
        return <SessionsPage sessions={data.sessions} />;
      case 'progress':
        return <ProgressPage progress={data.progress} />;
      case 'notifications':
        return (
          <NotificationsPage
            notifications={data.notifications}
            onMarkRead={markNotificationRead}
            onMarkAllRead={markAllNotificationsRead}
            onDelete={deleteNotification}
          />
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
          profileName={data.profile.name}
          profileInitials={data.profile.avatarInitials}
          isDark={resolvedTheme === 'dark'}
          onToggleTheme={toggleTheme}
          onNotifications={() => handleNavigate('notifications')}
        />

        <main className="flex-1 p-4 sm:p-6">{renderPage()}</main>
      </div>

      {toast ? <Toast message={toast} /> : null}
    </div>
  );
}
