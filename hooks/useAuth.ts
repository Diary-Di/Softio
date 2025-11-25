// hooks/useAuth.ts
import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';
import { LoginRequest, User, ApiError } from '../types/api';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  error: ApiError | null;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  const login = useCallback(async (credentials: LoginRequest): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(credentials);
      
      // Stocker le token et les données utilisateur
      await AsyncStorage.setItem('userToken', response.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.user));
      
      setUser(response.user);
    } catch (err: any) {
      const apiError: ApiError = {
        message: err.message || 'Erreur de connexion',
        code: err.code,
      };
      setError(apiError);
      Alert.alert('Erreur', apiError.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      setUser(null);
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
    }
  }, []);

  return {
    user,
    loading,
    login,
    logout,
    error,
  };
};