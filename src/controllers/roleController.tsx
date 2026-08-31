import { useState } from 'react';
import { Alert } from 'react-native';
import { openParentDashboard } from '../config/parentDashboard';

export const useRoleController = (navigation: any) => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const roleRoutes: Record<string, string> = {
    student: 'AuthSelectionScreen',
    tutor: 'AuthSelectionScreen',
  };

  const handleContinue = () => {
    if (!selectedRole) return;

    // Parent auth + dashboard are web-only — never enter in-app parent login.
    if (selectedRole === 'parent') {
      Alert.alert(
        'Parent Dashboard (Web)',
        'Parent signup and login are on the web dashboard, not in this app.\n\nWe will open the Parent Dashboard in your browser.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Web Dashboard',
            onPress: () => {
              void openParentDashboard();
            },
          },
        ]
      );
      return;
    }

    navigation.navigate(roleRoutes[selectedRole], {
      role: selectedRole,
    });
  };

  return {
    selectedRole,
    setSelectedRole,
    handleContinue,
  };
};
