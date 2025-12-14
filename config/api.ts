// config/api.ts

// Pour le développement local avec XAMPP
export const API_BASE_URL = __DEV__ 
  //?'http://localhost/SOFTIO/backend/public'
  ? 'https://softio-app-mobile.tuto-info.com'  // Remplacez par votre IP locale
  : 'https://votredomaine.com';

// Pour Ngrok (décommentez si vous utilisez Ngrok)
// export const API_BASE_URL = __DEV__ 
//   ? 'https://votre-url-ngrok.ngrok.io/SOFTIO/backend'
//   : 'https://votredomaine.com';

export const API_ENDPOINTS = {
  REGISTER: '/api/register',
  LOGIN: '/api/login',
  LOGOUT: '/api/logout',
  PROFILE: '/api/profil',
  UPDATE_USER: "/api/update",
  CATEGORY: '/api/category',
  PRODUCT: '/api/product',
  CUSTOMER: '/api/customer',
  SALES: '/api/sales',
  COMPANY: '/api/company',
  PROFORMA: '/api/proforma',
  SPENT: '/api/spent',
} as const;

export type ApiEndpoints = keyof typeof API_ENDPOINTS;