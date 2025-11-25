// types/api.ts
export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  expiresIn: number;
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