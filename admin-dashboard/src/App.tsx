import { useState } from 'react';
import AdminDashboard from './components/AdminDashboard';
import AdminLoginPage from './components/pages/AdminLoginPage';
import { ADMIN_TOKEN_KEY } from './config/firebase';
import { setAdminAuthToken } from './api/admin.api';
import type { NavSectionId } from './types/admin.types';

const storedToken = sessionStorage.getItem(ADMIN_TOKEN_KEY);

if (storedToken) {
  setAdminAuthToken(storedToken);
}

export default function App() {
  const [access, setAccess] = useState<'login' | 'dashboard'>(() =>
    storedToken ? 'dashboard' : 'login'
  );
  const [initialNav, setInitialNav] = useState<NavSectionId>('verification');

  if (access === 'login') {
    return (
      <AdminLoginPage
        onLoggedIn={() => {
          const nextToken = sessionStorage.getItem(ADMIN_TOKEN_KEY);
          setInitialNav('verification');
          setAccess('dashboard');
          if (nextToken) setAdminAuthToken(nextToken);
        }}
      />
    );
  }

  return (
    <AdminDashboard
      initialNav={initialNav}
      onLogout={() => {
        sessionStorage.removeItem(ADMIN_TOKEN_KEY);
        setAdminAuthToken('');
        setAccess('login');
      }}
    />
  );
}
