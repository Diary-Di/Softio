// services/authService.ts
import { apiService } from './api';
import { API_ENDPOINTS } from '../config/api';
import { User } from '../types/api';

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
};