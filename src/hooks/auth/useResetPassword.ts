import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  validateConfirmPassword,
  validatePassword,
} from '../../utils/validations/authValidation';
import {
  confirmPasswordResetWithCode,
  loadPasswordResetContext,
  mapPasswordResetError,
  PasswordResetRole,
  verifyPasswordResetOobCode,
} from '../../services/auth/passwordResetService';

type Params = {
  oobCode?: string;
  email?: string;
  role?: PasswordResetRole;
};

export const useResetPassword = (params: Params) => {
  const navigation = useNavigation<any>();
  const [oobCode, setOobCode] = useState(String(params.oobCode || '').trim());
  const [email, setEmail] = useState(String(params.email || '').trim());
  const [role, setRole] = useState<PasswordResetRole>(
    params.role === 'tutor'
      ? 'tutor'
      : params.role === 'parent'
        ? 'parent'
        : 'student'
  );

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [formError, setFormError] = useState('');
  const [verifyingLink, setVerifyingLink] = useState(Boolean(params.oobCode));
  const [submitting, setSubmitting] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const ctx = await loadPasswordResetContext();
      if (!mounted) return;
      if (ctx?.email && !params.email) setEmail(ctx.email);
      if (ctx?.role && !params.role) setRole(ctx.role);

      const code = String(params.oobCode || oobCode || '').trim();
      if (!code) {
        setVerifyingLink(false);
        setFormError(
          'Open the reset link from your email to continue, or request a new link.'
        );
        return;
      }
      setOobCode(code);

      try {
        setVerifyingLink(true);
        const verifiedEmail = await verifyPasswordResetOobCode(code);
        if (!mounted) return;
        if (verifiedEmail) setEmail(verifiedEmail);
        setFormError('');
      } catch (err) {
        if (!mounted) return;
        setFormError(mapPasswordResetError(err));
      } finally {
        if (mounted) setVerifyingLink(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // Only re-verify when the link code changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.oobCode]);

  const onChangeNewPassword = useCallback((text: string) => {
    setNewPassword(text);
    setPasswordError(text ? validatePassword(text) : '');
    setFormError('');
    if (confirmPassword) {
      setConfirmError(validateConfirmPassword(text, confirmPassword));
    }
  }, [confirmPassword]);

  const onChangeConfirmPassword = useCallback(
    (text: string) => {
      setConfirmPassword(text);
      setConfirmError(validateConfirmPassword(newPassword, text));
      setFormError('');
    },
    [newPassword]
  );

  const isFormValid = useMemo(() => {
    return (
      Boolean(oobCode) &&
      !validatePassword(newPassword) &&
      !validateConfirmPassword(newPassword, confirmPassword)
    );
  }, [confirmPassword, newPassword, oobCode]);

  const submitNewPassword = useCallback(async () => {
    if (!oobCode) {
      setFormError('Missing reset link. Open the link from your email.');
      return;
    }

    const pwdErr = validatePassword(newPassword);
    if (pwdErr) {
      setPasswordError(pwdErr);
      return;
    }
    const confErr = validateConfirmPassword(newPassword, confirmPassword);
    if (confErr) {
      setConfirmError(confErr);
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      await confirmPasswordResetWithCode(oobCode, newPassword);
      setOobCode('');
      navigation.replace('SuccessScreen', { role, email });
    } catch (err) {
      setFormError(mapPasswordResetError(err));
    } finally {
      setSubmitting(false);
    }
  }, [confirmPassword, email, navigation, newPassword, oobCode, role]);

  return {
    email,
    role,
    oobCode,
    setOobCode,
    newPassword,
    confirmPassword,
    passwordError,
    confirmError,
    formError,
    verifyingLink,
    submitting,
    showNewPassword,
    showConfirmPassword,
    setShowNewPassword,
    setShowConfirmPassword,
    onChangeNewPassword,
    onChangeConfirmPassword,
    submitNewPassword,
    isFormValid: isFormValid && !submitting && !verifyingLink,
  };
};
