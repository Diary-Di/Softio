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
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  error: ApiError | null;
  checkAuth: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  // Vérifier si l'utilisateur est déjà connecté au démarrage
  const checkAuth = useCallback(async (): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Optionnel: Vérifier la validité du token avec le backend
        // await authService.getProfile();
      }
    } catch (err) {
      console.error('Erreur vérification auth:', err);
      // En cas d'erreur, déconnecter l'utilisateur
      await AsyncStorage.multiRemove(['userToken', 'userData']);
      setUser(null);
    }
  }, []);

  const login = useCallback(async (credentials: LoginRequest): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(credentials);
      
      if (response.success && response.token && response.user) {
        // Stocker le token et les données utilisateur
        await AsyncStorage.setItem('userToken', response.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.user));
        setUser(response.user);
      } else {
        throw new Error(response.message || 'Échec de la connexion');
      }
    } catch (err: any) {
      const apiError: ApiError = {
        message: err.message || 'Erreur de connexion',
        code: err.code,
      };
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData: any): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.register(userData);
      
      if (!response.success) {
        throw new Error(response.message || 'Échec de l\'inscription');
      }
    } catch (err: any) {
      const apiError: ApiError = {
        message: err.message || 'Erreur lors de l\'inscription',
        code: err.code,
      };
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Erreur lors de la déconnexion API:', err);
    } finally {
      // Toujours supprimer les données locales
      await AsyncStorage.multiRemove(['userToken', 'userData']);
      setUser(null);
      setError(null);
    }
  }, []);

  return {
    user,
    loading,
    login,
    register,
    logout,
    error,
    checkAuth,
  };
};