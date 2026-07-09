import { AppDispatch } from '../store';
import { registerWithEmail, AuthSignupData } from '../../services/auth/authService';
import { setLoading, setUser } from './authSlice';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export const signupUser =
  (data: AuthSignupData, navigation: NativeStackNavigationProp<any>) =>
  async (dispatch: AppDispatch) => {
    try {
      dispatch(setLoading(true));

      const session = await registerWithEmail(data);

      dispatch(
        setUser({
          user: session.user,
          token: session.token,
          role: session.role,
        })
      );

      if (session.role === 'student') {
        navigation.replace('StudentSubjectSelection');
      } else if (session.role === 'tutor') {
        navigation.reset({
          index: 1,
          routes: [
            { name: 'TutorSignUpScreen', params: { role: 'tutor' } },
            { name: 'DocumentUploadScreen' },
          ],
        });
      } else {
        navigation.replace('MyTabs', { screen: 'Home' });
      }
    } catch (err) {
      console.log('SIGNUP ERROR:', err);
    } finally {
      dispatch(setLoading(false));
    }
  };
