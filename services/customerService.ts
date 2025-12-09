// services/customerService.ts
import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api";

const CUSTOMER_URL = `${API_BASE_URL}${API_ENDPOINTS.CUSTOMER}`;

// Types
export interface Customer {
  identifiant: number;
  type: 'particulier' | 'entreprise';
  email?: string;
  sigle?: string;
  nom?: string;
  prenoms?: string;
  adresse?: string;
  telephone?: string;
  nif?: string;
  stat?: string;
}

export interface CreateCustomerData {
  type: 'particulier' | 'entreprise';
  email?: string;
  sigle?: string;
  nom?: string;
  prenoms?: string;
  adresse?: string;
  telephone?: string;
  nif?: string;
  stat?: string;
}

export interface UpdateCustomerData {
  type?: 'particulier' | 'entreprise';
  email?: string;
  sigle?: string;
  nom?: string;
  prenoms?: string;
  adresse?: string;
  telephone?: string;
  nif?: string;
  stat?: string;
}

export const customerService = {
  /** ✔ CREATE CUSTOMER */
  createCustomer: async (data: CreateCustomerData) => {
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
  getCustomers: async (params?: {
    type?: 'particulier' | 'entreprise';
    q?: string;
  }) => {
    try {
      const response = await axios.get(CUSTOMER_URL, { params });
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

  /** ✔ GET CUSTOMER BY ID */
  getCustomerById: async (id: number) => {
    try {
      const response = await axios.get(`${CUSTOMER_URL}/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw {
        message:
          error.response?.data?.messages || "Client introuvable",
        code: error.response?.status || 404,
      };
    }
  },

  /** ✔ GET CUSTOMER BY EMAIL */
  getCustomerByEmail: async (email: string) => {
    try {
      const encodedEmail = encodeURIComponent(email);
      const response = await axios.get(`${CUSTOMER_URL}/email`, {
        params: { email: encodedEmail }
      });
      return response.data.data;
    } catch (error: any) {
      throw {
        message:
          error.response?.data?.messages || "Client introuvable",
        code: error.response?.status || 404,
      };
    }
  },

  /** ✔ UPDATE CUSTOMER BY ID */
  updateCustomer: async (id: number, data: UpdateCustomerData) => {
    try {
      const response = await axios.put(`${CUSTOMER_URL}/${id}`, data);
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

  /** ✔ DELETE CUSTOMER BY ID */
  deleteCustomer: async (id: number) => {
    try {
      const response = await axios.delete(`${CUSTOMER_URL}/${id}`);
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

  /** ✔ SEARCH CUSTOMERS */
  searchCustomers: async (query: string) => {
    try {
      const response = await axios.get(`${CUSTOMER_URL}/search`, {
        params: { q: query }
      });
      return response.data.data;
    } catch (error: any) {
      throw {
        message:
          error.response?.data?.messages ||
          "Erreur lors de la recherche des clients",
        code: error.response?.status || 500,
      };
    }
  },

  /** ✔ GET CUSTOMERS BY TYPE */
  getCustomersByType: async (type: 'particulier' | 'entreprise') => {
    try {
      const response = await axios.get(`${CUSTOMER_URL}/type/${type}`);
      return response.data.data;
    } catch (error: any) {
      throw {
        message:
          error.response?.data?.messages ||
          "Erreur lors du chargement des clients par type",
        code: error.response?.status || 500,
      };
    }
  }
};