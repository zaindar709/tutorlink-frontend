import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import {
  validateFullName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from '../../utils/validations/authValidation';

const useStudentSignUpForm = () => {
  const navigation = useNavigation<any>();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleFullName = (text: string) => {
    setFullName(text);
    setErrors((prev) => ({
      ...prev,
      fullName: validateFullName(text),
    }));
  };

  const handleEmail = (text: string) => {
    setEmail(text);
    setErrors((prev) => ({
      ...prev,
      email: validateEmail(text),
    }));
  };

  const handlePassword = (text: string) => {
    setPassword(text);

    setErrors((prev) => ({
      ...prev,
      password: validatePassword(text),
      confirmPassword: validateConfirmPassword(text, confirmPassword),
    }));
  };

  const handleConfirmPassword = (text: string) => {
    setConfirmPassword(text);

    setErrors((prev) => ({
      ...prev,
      confirmPassword: validateConfirmPassword(password, text),
    }));
  };

  const handleNext = () => {
    const fullNameErr = validateFullName(fullName);
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    const confirmErr = validateConfirmPassword(password, confirmPassword);

    setErrors({
      fullName: fullNameErr,
      email: emailErr,
      password: passwordErr,
      confirmPassword: confirmErr,
    });

    if (!fullNameErr && !emailErr && !passwordErr && !confirmErr) {
      navigation.navigate('StudentSubjectSelection');
    }
  };

  return {
    fullName,
    email,
    password,
    confirmPassword,
    errors,
    handleFullName,
    handleEmail,
    handlePassword,
    handleConfirmPassword,
    handleNext,
  };
};

export default useStudentSignUpForm;