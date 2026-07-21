import { useState } from 'react';
import AdminDashboard from './components/AdminDashboard';
import AdminLoginPage from './components/pages/AdminLoginPage';
import { ADMIN_PREVIEW_KEY, ADMIN_TOKEN_KEY } from './config/firebase';
import { setAdminAuthToken } from './api/admin.api';

const storedToken = sessionStorage.getItem(ADMIN_TOKEN_KEY);
const previewMode = sessionStorage.getItem(ADMIN_PREVIEW_KEY) === '1';

if (storedToken) {
  setAdminAuthToken(storedToken);
}

export default function App() {
  const [access, setAccess] = useState<'login' | 'dashboard'>(() => {
    if (storedToken || previewMode) return 'dashboard';
    return 'login';
  });
  const [isPreview, setIsPreview] = useState(previewMode && !storedToken);

  if (access === 'login') {
    return (
      <AdminLoginPage
        onLoggedIn={() => {
          sessionStorage.removeItem(ADMIN_PREVIEW_KEY);
          const nextToken = sessionStorage.getItem(ADMIN_TOKEN_KEY);
          setIsPreview(false);
          setAccess('dashboard');
          if (nextToken) setAdminAuthToken(nextToken);
        }}
        onPreview={() => {
          sessionStorage.setItem(ADMIN_PREVIEW_KEY, '1');
          sessionStorage.removeItem(ADMIN_TOKEN_KEY);
          setAdminAuthToken('');
          setIsPreview(true);
          setAccess('dashboard');
        }}
      />
    );
  }

  return (
    <AdminDashboard
      previewMode={isPreview}
      onLogout={() => {
        sessionStorage.removeItem(ADMIN_TOKEN_KEY);
        sessionStorage.removeItem(ADMIN_PREVIEW_KEY);
        setAdminAuthToken('');
        setIsPreview(false);
        setAccess('login');
      }}
    />
  );
}
