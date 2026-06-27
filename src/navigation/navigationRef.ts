import { createNavigationContainerRef } from '@react-navigation/native';

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
