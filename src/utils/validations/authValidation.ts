export const validateFullName = (value: string) => {
  if (!value.trim()) return 'Full name is required';

  const regex = /^[a-zA-Z\s]+$/;
  if (!regex.test(value)) return 'Name should contain only letters';

  return '';
};

export const validateEmail = (value: string) => {
  if (!value.trim()) return 'Email is required';

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(value)) return 'Enter a valid email address';

  return '';
};

export const validatePassword = (value: string) => {
  if (!value) return 'Password is required';
  const errors: string[] = [];
  if (value.length < 8)
    errors.push('Min 8 characters');

  if (!/[A-Z]/.test(value))
    errors.push(' 1 uppercase');

  if (!/[a-z]/.test(value))
    errors.push(' 1 lowercase');

  if (!/[0-9]/.test(value))
    errors.push(' 1 number');

  if (!/[@$!%*?&]/.test(value))
    errors.push(' one special character (@$!%*?&)');

  return errors.length > 0 ? errors.join(',') : '';
};

export const validateConfirmPassword = (
  password: string,
  confirmPassword: string
) => {
  if (!confirmPassword) return 'Confirm password is required';

  if (confirmPassword !== password)
    return 'Passwords do not match';

  return '';
};