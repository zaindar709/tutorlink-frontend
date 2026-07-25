import { CommonActions, createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export const resetToAuth = () => {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: 'AuthNavigator' as never }],
    });
  }
};

export const resetToHome = (role: 'student' | 'tutor' | 'parent') => {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [
        {
          name: 'MyTabs' as never,
          params: { role, screen: 'Home' },
        },
      ],
    });
  }
};

/**
 * Open a screen inside root HomeNavigator from any tab.
 *
 * Always mounts HomeNavigator with ONLY the target screen so back
 * pops straight to MyTabs (not EditProfile / leftover stack history).
 */
export const navigateHomeStack = (
  screen: string,
  params?: Record<string, unknown>
) => {
  if (!navigationRef.isReady()) {
    console.warn('[Nav] navigateHomeStack: navigation not ready', screen);
    return;
  }

  navigationRef.dispatch(
    CommonActions.navigate({
      name: 'HomeNavigator',
      params: {
        state: {
          routes: [{ name: screen, params }],
          index: 0,
        },
      },
    })
  );
};

/** Leave HomeNavigator and return to tabs (Home by default). */
export const leaveHomeStackToTabs = (tabScreen = 'Home') => {
  if (!navigationRef.isReady()) return;

  if (navigationRef.canGoBack()) {
    navigationRef.goBack();
    return;
  }

  navigationRef.dispatch(
    CommonActions.navigate({
      name: 'MyTabs',
      params: { screen: tabScreen },
    })
  );
};
