// services/customerService.ts
import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api";

// services/customerService.ts
const CUSTOMER_URL = `${API_BASE_URL}${API_ENDPOINTS.CUSTOMER}`;

export const customerService = {
  /** ✔ CREATE CUSTOMER */
  createCustomer: async (data: {
    type: 'particulier' | 'entreprise';
    email: string; // REQUIS car clé primaire
    sigle?: string;
    nom?: string;
    prenoms?: string;
    adresse?: string;
    telephone?: string;
    nif?: string;
    stat?: string;
  }) => {
    try {
      const response = await axios.post(CUSTOMER_URL, data);
      return response.data;
    } catch (error: any) {
      console.log("❌ Erreur API createCustomer :", error.response?.data);

      throw {
        message: error.response?.data?.messages || "Une erreur est survenue lors de la création du client",
        code: error.response?.status || 500,
      };
    }
  },

  /** ✔ GET ALL CUSTOMERS */
  getCustomers: async () => {
    try {
      const response = await axios.get(CUSTOMER_URL);
      return response.data.data;
    } catch (error: any) {
      throw {
        message:
          error.response?.data?.messages ||
          "Impossible de charger les clients",
        code: error.response?.status || 500,
      };
    }
  },

  /** ✔ GET CUSTOMER BY EMAIL (clé primaire) */
  getCustomer: async (email: string) => {
    try {
      // Encoder l'email pour l'URL (car contient @)
      const encodedEmail = encodeURIComponent(email);
      const response = await axios.get(`${CUSTOMER_URL}/${encodedEmail}`);
      return response.data.data;
    } catch (error: any) {
      throw {
        message:
          error.response?.data?.messages || "Client introuvable",
        code: error.response?.status || 404,
      };
    }
  },

  /** ✔ UPDATE CUSTOMER */
  updateCustomer: async (email: string, data: any) => {
    try {
      // Encoder l'email pour l'URL
      const encodedEmail = encodeURIComponent(email);
      const response = await axios.put(`${CUSTOMER_URL}/${encodedEmail}`, data);
      return response.data;
    } catch (error: any) {
      throw {
        message:
          error.response?.data?.messages ||
          "Erreur lors de la mise à jour du client",
        code: error.response?.status || 500,
      };
    }
  },

  /** ✔ DELETE CUSTOMER */
  deleteCustomer: async (email: string) => {
    try {
      // Encoder l'email pour l'URL
      const encodedEmail = encodeURIComponent(email);
      const response = await axios.delete(`${CUSTOMER_URL}/${encodedEmail}`);
      return response.data;
    } catch (error: any) {
      throw {
        message:
          error.response?.data?.messages ||
          "Erreur lors de la suppression du client",
        code: error.response?.status || 500,
      };
    }
  },

  // ... autres méthodes
};