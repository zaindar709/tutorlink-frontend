import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

export const useAuth = () => {
  const auth = useSelector((state: RootState) => state.auth);

  return {
    user: auth.user,
    role: auth.role,
    token: auth.token,
    isLoggedIn: auth.isLoggedIn,
  };
};