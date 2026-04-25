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

  if (value.length < 8)
    return 'Password must be at least 8 characters long';

  if (!/[A-Z]/.test(value))
    return 'Add at least one uppercase letter';

  if (!/[a-z]/.test(value))
    return 'Add at least one lowercase letter';

  if (!/[0-9]/.test(value))
    return 'Add at least one number';

  if (!/[@$!%*?&]/.test(value))
    return 'Add at least one special character (@$!%*?&)';

  return '';
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