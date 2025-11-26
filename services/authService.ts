// services/authService.ts
import { apiService } from './api';
import { API_ENDPOINTS } from '../config/api';
import { 
  RegisterRequest, 
  RegisterResponse, 
  LoginRequest, 
  LoginResponse, 
  ApiError, 
  User
} from '../types/api';

// Fonction utilitaire pour gérer les erreurs
const handleApiError = (error: any): ApiError => {
  console.log('Erreur API détaillée:', error);
  
  if (error.response) {
    // Le serveur a répondu avec un statut d'erreur
    return {
      message: error.response.data?.message || 'Erreur serveur',
      code: error.response.status,
      details: error.response.data,
    };
  } else if (error.request) {
    // La requête a été faite mais aucune réponse n'a été reçue
    return {
      message: 'Impossible de contacter le serveur. Vérifiez votre connexion internet.',
    };
  } else {
    // Une erreur s'est produite lors de la configuration de la requête
    return {
      message: 'Erreur de configuration de la requête',
      details: error.message,
    };
  }
};

export const authService = {
  register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
    try {
      console.log('📝 Tentative d\'inscription:', { ...userData, mot_de_passe: '***' });
      const response = await apiService.post<RegisterResponse>(
        API_ENDPOINTS.REGISTER, 
        userData
      );
      console.log('✅ Inscription réussie:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Erreur inscription:', error);
      const apiError = handleApiError(error);
      throw apiError;
    }
  },

  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      console.log('🔐 Tentative de connexion:', { ...credentials, mot_de_passe: '***' });
      const response = await apiService.post<LoginResponse>(
        API_ENDPOINTS.LOGIN, 
        credentials
      );
      console.log('✅ Connexion réussie:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Erreur connexion:', error);
      const apiError = handleApiError(error);
      throw apiError;
    }
  },

  logout: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiService.post<{ success: boolean; message: string }>(
        API_ENDPOINTS.LOGOUT
      );
      return response;
    } catch (error: any) {
      console.error('❌ Erreur déconnexion:', error);
      const apiError = handleApiError(error);
      throw apiError;
    }
  },

  getProfile: async (): Promise<{ success: boolean; user: User }> => {
    try {
      const response = await apiService.get<{ success: boolean; user: User }>(
        API_ENDPOINTS.PROFILE
      );
      return response;
    } catch (error: any) {
      console.error('❌ Erreur profil:', error);
      const apiError = handleApiError(error);
      throw apiError;
    }
  },
};