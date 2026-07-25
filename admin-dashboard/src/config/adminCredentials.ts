/** Seeded admin credentials — set in admin-dashboard/.env.local (never commit). */
export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL ?? '';
export const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? '';

export const isAdminCredentialsConfigured = (): boolean =>
  Boolean(ADMIN_EMAIL.trim() && ADMIN_PASSWORD);

export const assertAllowedAdminCredentials = (
  email: string,
  password: string
): void => {
  if (!isAdminCredentialsConfigured()) {
    throw new Error(
      'Admin credentials are not configured. Add VITE_ADMIN_EMAIL and VITE_ADMIN_PASSWORD to admin-dashboard/.env.local'
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  const allowedEmail = ADMIN_EMAIL.trim().toLowerCase();

  if (normalizedEmail !== allowedEmail || password !== ADMIN_PASSWORD) {
    throw new Error('Invalid admin email or password.');
  }
};
