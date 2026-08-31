import React, { useEffect } from 'react';
import { Linking } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { navigationRef } from '../navigation/navigationRef';
import {
  isPasswordResetLink,
  loadPasswordResetContext,
  parsePasswordResetLink,
  savePendingPasswordReset,
  type PasswordResetRole,
} from '../services/auth/passwordResetService';

const LOG = '[PasswordResetLink]';

export const navigateToNewPasswordScreen = (params: {
  oobCode: string;
  email?: string;
  role?: PasswordResetRole;
}) => {
  const role = params.role || 'student';
  const email = params.email || '';

  const navigateWhenReady = (attempt = 0) => {
    if (navigationRef.isReady()) {
      console.log(LOG, 'dispatching NewPasswordScreen', {
        hasCode: Boolean(params.oobCode),
        role,
        attempt,
      });
      navigationRef.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: 'AuthNavigator',
              state: {
                index: 0,
                routes: [
                  {
                    name: 'NewPasswordScreen',
                    params: {
                      oobCode: params.oobCode,
                      email,
                      role,
                    },
                  },
                ],
              },
            },
          ],
        })
      );
      return;
    }
    if (attempt < 40) {
      setTimeout(() => navigateWhenReady(attempt + 1), 250);
    } else {
      console.log(LOG, 'navigation never became ready');
    }
  };

  navigateWhenReady();
};

const openNewPasswordScreen = async (url: string) => {
  console.log(LOG, 'Incoming email-link URL received', {
    hostPath: url.split('?')[0],
  });

  const parsed = parsePasswordResetLink(url);
  if (!parsed?.oobCode) {
    console.log(LOG, 'URL ignored — no reset oobCode found');
    return;
  }

  const ctx = await loadPasswordResetContext();
  const role = ctx?.role || 'student';
  const email = ctx?.email || '';

  await savePendingPasswordReset({
    oobCode: parsed.oobCode,
    mode: parsed.mode,
    email,
    role,
  });

  console.log(LOG, 'opening NewPasswordScreen', {
    mode: parsed.mode,
    hasCode: Boolean(parsed.oobCode),
    role,
  });

  navigateToNewPasswordScreen({
    oobCode: parsed.oobCode,
    email,
    role,
  });
};

/** Listens for Firebase password-reset email links and opens New Password. */
const PasswordResetLinkBridge = () => {
  useEffect(() => {
    const handleUrl = (url: string | null) => {
      if (!url || !isPasswordResetLink(url)) return;
      void openNewPasswordScreen(url);
    };

    void Linking.getInitialURL().then(handleUrl);
    const sub = Linking.addEventListener('url', event => {
      handleUrl(event.url);
    });

    return () => sub.remove();
  }, []);

  return null;
};

export default PasswordResetLinkBridge;
