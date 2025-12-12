import { useAuth } from './useAuth';

export const useUserEmail = () => {
  const { user } = useAuth();
  return user?.email ?? '';   // toujours une string
};