import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser, setLoading } from '../../store/auth/authSlice';
import {
    validateFullName,
    validateEmail,
    validatePassword,
    validateConfirmPassword,
} from '../../utils/validations/authValidation';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Role = 'student' | 'tutor';
type Mode = 'login' | 'signup';

export const useAuthForm = (mode: Mode, role: Role) => {
    const dispatch = useDispatch();
    const navigation = useNavigation<any>();

    const [form, setForm] = useState({
        fullName: '',
        email: '',
        password: '',
        expertise: '',
        phone: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState<any>({});

    const handleChange = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));

        // live validation
        let errors = '';
        if (field === 'fullName') errors = validateFullName(value);
        if (field === 'email') errors = validateEmail(value);
        if (field === 'password') errors = validatePassword(value);
        if (field === 'confirmPassword')
            errors = validateConfirmPassword(form.password, value);

        setErrors((prev: any) => ({ ...prev, [field]: errors }));
    };

    const validateForm = () => {
        let newErrors: any = {};

        if (mode === 'signup') {
            newErrors.fullName = validateFullName(form.fullName);
            newErrors.confirmPassword = validateConfirmPassword(
                form.password,
                form.confirmPassword
            );
        }

        newErrors.email = validateEmail(form.email);
        newErrors.password = validatePassword(form.password);

        setErrors(newErrors);

        return Object.values(newErrors).every(err => !err);
    };

    const submit = async () => {
        if (!validateForm()) return;

        try {
            dispatch(setLoading(true));

            const payload = {
                fullName: form.fullName,
                email: form.email,
                password: form.password,
                confirmPassword: form.confirmPassword,
                role: role,
            };

            const response = await axios.post(
                'http://YOUR_BACKEND_URL/api/auth/signup',
                payload,
            );

            if (response.data?.success) {
                const { user, token } = response.data;

                // 🧠 save in redux
                dispatch(setUser({ user, token, role }));

                // 💾 optional: save token
                await AsyncStorage.setItem('token', token);

                // 🔥 navigation reset (better than replace)
                navigation.reset({
                    index: 0,
                    routes: [
                        {
                            name: 'StudentSubjectSelection',
                            params: { role },
                        },
                    ],
                });
            } else {
                Alert.alert(response.data?.message || 'Signup failed');
            }
        } catch (error: any) {
            console.log('SIGNUP ERROR:', error?.response?.data || error.message);

            Alert.alert(
                'Signup Failed',
                error?.response?.data?.message ||
                'Something went wrong. Please try again.',
            );
        } finally {
            dispatch(setLoading(false));
        }
    };
    return {
        form,
        errors,
        handleChange,
        submit,
    };
};