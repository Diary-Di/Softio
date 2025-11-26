// services/api.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration de base axios
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour les requêtes
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    console.log(`🔄 API Call: ${config.method?.toUpperCase()} ${config.url}`);
    
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Erreur récupération token:', error);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`✅ API Success: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });

    // Gestion des erreurs spécifiques
    if (error.code === 'ECONNABORTED') {
      console.error('⏰ Timeout - Vérifiez votre connexion');
    }

    if (!error.response) {
      console.error('🌐 Network Error - Serveur inaccessible');
    }

    return Promise.reject(error);
  }
);

// Méthodes API typées
export const apiService = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await api.get(url, config);
    return response.data;
  },

  post: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await api.post(url, data, config);
    return response.data;
  },

  put: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await api.put(url, data, config);
    return response.data;
  },

  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await api.delete(url, config);
    return response.data;
  },
};

export default api;