// types/api.ts

// Types pour l'authentification
export interface User {
  id: number;
  nom: string;
  email: string;
}

export interface RegisterRequest {
  nom: string;
  email: string;
  mot_de_passe: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user_id?: number;
}

export interface LoginRequest {
  email: string;
  mot_de_passe: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export interface ApiError {
  message: string;
  code?: number;
  details?: any;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}