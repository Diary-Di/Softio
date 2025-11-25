// config/api.ts
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8000/api'  // Développement
  : 'https://votre-domaine.com/api'; // Production

export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  USERS: '/users',
} as const;

export type ApiEndpoints = keyof typeof API_ENDPOINTS;