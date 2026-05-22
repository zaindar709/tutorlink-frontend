import { useEffect, useRef, useState } from 'react';
import { TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const PIN_LENGTH = 4;

export const useVerifyCode = (email: string, role: string) => {
  const navigation = useNavigation<any>();

  const [digits, setDigits] = useState<string[]>(Array(PIN_LENGTH).fill(''));
  const [timer, setTimer] = useState(48);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  // auto focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
    setFocusedIndex(0);
  }, []);

  // timer
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // change digit
  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]*$/.test(value)) return;

    const updated = [...digits];
    updated[index] = value.slice(-1);
    setDigits(updated);

    if (value && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  };

  // backspace logic
  const handleKeyPress = ({ nativeEvent }: any, index: number) => {
    if (nativeEvent.key !== 'Backspace') return;

    const updated = [...digits];

    if (updated[index]) {
      updated[index] = '';
      setDigits(updated);
      return;
    }

    if (index > 0) {
      updated[index - 1] = '';
      setDigits(updated);
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    }
  };

  const handleVerify = () => {
    const code = digits.join('');
    if (code.length !== PIN_LENGTH) return;

    console.log('VERIFY:', { code, email, role });

    navigation.navigate('NewPasswordScreen', { email, role });
  };

  const handleResend = () => {
    setDigits(Array(PIN_LENGTH).fill(''));
    setTimer(48);
    inputRefs.current[0]?.focus();
    setFocusedIndex(0);
  };

  const isValid = digits.every(d => d.length === 1);

  return {
    digits,
    timer,
    focusedIndex,
    inputRefs,
    handleChange,
    handleKeyPress,
    handleVerify,
    handleResend,
    isValid,
    setFocusedIndex,
  };
};