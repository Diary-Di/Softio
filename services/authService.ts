// services/authService.ts
import { apiService } from './api';
import { API_ENDPOINTS } from '../config/api';
import { LoginRequest, LoginResponse, User, ApiError } from '../types/api';

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await apiService.post<LoginResponse>(
        API_ENDPOINTS.LOGIN, 
        credentials
      );
      return response;
    } catch (error: any) {
      const apiError: ApiError = {
        message: error.response?.data?.message || 'Erreur de connexion',
        code: error.response?.status,
        details: error.response?.data,
      };
      throw apiError;
    }
  },

  register: async (userData: Omit<User, 'id' | 'createdAt'> & { password: string }): Promise<LoginResponse> => {
    try {
      const response = await apiService.post<LoginResponse>(
        API_ENDPOINTS.REGISTER, 
        userData
      );
      return response;
    } catch (error: any) {
      const apiError: ApiError = {
        message: error.response?.data?.message || "Erreur d'inscription",
        code: error.response?.status,
        details: error.response?.data,
      };
      throw apiError;
    }
  },

  getProfile: async (): Promise<User> => {
    try {
      const response = await apiService.get<User>('/profile');
      return response;
    } catch (error: any) {
      const apiError: ApiError = {
        message: error.response?.data?.message || 'Erreur de récupération du profil',
        code: error.response?.status,
      };
      throw apiError;
    }
  },
};