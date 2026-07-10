import { useState } from 'react';

export const useRoleController = (navigation: any) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const roleRoutes: any = {
    student: 'AuthSelectionScreen',
    tutor: 'AuthSelectionScreen',
    parent: 'AuthSelectionScreen',
  };
  const handleContinue = () => {
    if (selectedRole) {
      navigation.navigate(roleRoutes[selectedRole], {
        role: selectedRole, 
      });
    }
  };
  return {
    selectedRole,
    setSelectedRole,
    handleContinue,
  };
};
