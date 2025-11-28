import { apiService } from "./api";
import { API_ENDPOINTS } from "../config/api";
import { User } from "../types/api";

interface LoginResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

interface RegisterResponse {
  success: boolean;
  message?: string;
}

export const authService = {
  // Connexion
  login: async (credentials: { email: string; mot_de_passe: string }): Promise<LoginResponse> => {
    try {
      const data = await apiService.post<LoginResponse>(API_ENDPOINTS.LOGIN, credentials);
      return {
        success: data.success,
        token: data.token,
        user: data.user,
        message: data.message,
      };
    } catch (error: any) {
      console.error("Erreur login:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Erreur lors de la connexion",
      };
    }
  },

  // Inscription
  register: async (userData: { nom: string; email: string; mot_de_passe: string }): Promise<RegisterResponse> => {
    try {
      const data = await apiService.post<RegisterResponse>(API_ENDPOINTS.REGISTER, userData);
      return {
        success: data.success,
        message: data.message,
      };
    } catch (error: any) {
      console.error("Erreur register:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Erreur lors de l'inscription",
      };
    }
  },

  // Déconnexion (optionnel côté API si nécessaire)
  logout: async (): Promise<{ success: boolean }> => {
    try {
      const data = await apiService.post<{ success: boolean }>(API_ENDPOINTS.LOGOUT);
      return { success: data.success };
    } catch (error) {
      console.error("Erreur logout:", error);
      return { success: false };
    }
  },

  // Récupération du profil utilisateur
  getProfile: async (): Promise<User | null> => {
    try {
      const data = await apiService.get<User>(API_ENDPOINTS.PROFILE);
      return data;
    } catch (error) {
      console.error("Erreur getProfile:", error);
      return null;
    }
  },
};
