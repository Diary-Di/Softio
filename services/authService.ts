// services/authService.ts
import { API_ENDPOINTS } from '../config/api';
import { User } from '../types/api';
import { apiService } from './api';

interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}

interface UpdateUserResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

export const authService = {
  updateUser: async (
    id: string,
    body: { nom?: string; email?: string; mot_de_passe?: string }
  ): Promise<UpdateUserResponse> => {
    try {
      return await apiService.put<UpdateUserResponse>(
        `${API_ENDPOINTS.UPDATE_USER}/${id}`,
        body
      );
    } catch (e: any) {
      console.error('updateUser', e);
      return {
        success: false,
        message: e.response?.data?.message || 'Erreur lors de la mise à jour',
      };
    }
  },

  login: async (payload: { email: string; mot_de_passe: string }): Promise<AuthResponse> => {
    try {
      const res = await apiService.post<AuthResponse>(API_ENDPOINTS.LOGIN, payload);
      return res as AuthResponse;
    } catch (e: any) {
      console.error('authService.login', e);
      // Normaliser l'erreur en renvoyant une structure connue ou rejeter
      throw e;
    }
  },

  register: async (payload: { nom: string; email: string; mot_de_passe: string }): Promise<AuthResponse> => {
    try {
      const res = await apiService.post<AuthResponse>(API_ENDPOINTS.REGISTER, payload);
      return res as AuthResponse;
    } catch (e: any) {
      console.error('authService.register', e);
      throw e;
    }
  },
};