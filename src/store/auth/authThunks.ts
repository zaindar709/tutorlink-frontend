import { AppDispatch } from '../store';
import { signupAPI, SignupPayload } from '../../api/auth.api';
import { setLoading, setUser } from './authSlice';
import { saveToken } from '../../services/storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export const signupUser =
  (data: SignupPayload, navigation: NativeStackNavigationProp<any>) =>
  async (dispatch: AppDispatch) => {
    try {
      dispatch(setLoading(true));

      const res = await signupAPI(data);

      const { user, token } = res.data;

      await saveToken(token);

      dispatch(
        setUser({
          user,
          token,
          role: data.role,
        })
      );

      navigation.replace('StudentSubjectSelection', {
        role: data.role,
      });
    } catch (err) {
      console.log('SIGNUP ERROR:', err);
    } finally {
      dispatch(setLoading(false));
    }
  };