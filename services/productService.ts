// services/productService.ts
import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api";

const PRODUCT_URL = `${API_BASE_URL}${API_ENDPOINTS.PRODUCT}`;

export interface ProductResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface ApiError {
  code: number;
  message: string;
}

export const productService = {
  /** ✔ CREATE PRODUCT */
  createProduct: async (productData: any): Promise<ProductResponse> => {
    try {
      const response = await axios.post(PRODUCT_URL, productData);
      return {
        success: true,
        message: response.data.message || "Produit créé avec succès",
        data: response.data.data,
      };
    } catch (error: any) {
      console.log("❌ Erreur API createProduct :", error.response?.data);
      
      throw {
        code: error.response?.status || 500,
        message: error.response?.data?.message || "Erreur réseau ou serveur",
      };
    }
  },

  /** ✔ UPDATE PRODUCT */
  updateProduct: async (id: string, productData: any): Promise<ProductResponse> => {
    try {
      const response = await axios.put(`${PRODUCT_URL}/${id}`, productData);
      return {
        success: true,
        message: response.data.message || "Produit mis à jour avec succès",
        data: response.data.data,
      };
    } catch (error: any) {
      console.log("❌ Erreur API updateProduct :", error.response?.data);
      
      throw {
        code: error.response?.status || 500,
        message: error.response?.data?.message || "Erreur réseau ou serveur",
      };
    }
  },

  /** ✔ CHECK REFERENCE EXISTS */
  checkReferenceExists: async (reference: string): Promise<boolean> => {
    try {
      const response = await axios.get(`${PRODUCT_URL}/check-reference/${reference}`);
      return response.data.exists || false;
    } catch (error: any) {
      console.log("❌ Erreur API checkReferenceExists :", error.response?.data);
      return false;
    }
  },

  // Vous pouvez ajouter d'autres méthodes suivant le même pattern :

  /** ✔ GET ALL PRODUCTS */
  getProducts: async () => {
    try {
      const response = await axios.get(PRODUCT_URL);
      return response.data.data;
    } catch (error: any) {
      throw {
        message:
          error.response?.data?.messages ||
          "Impossible de charger les produits",
      };
    }
  },

  /** ✔ GET ONE PRODUCT */
  getProduct: async (id: string) => {
    try {
      const response = await axios.get(`${PRODUCT_URL}/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw {
        message:
          error.response?.data?.messages || "Produit introuvable",
      };
    }
  },

  /** ✔ DELETE PRODUCT */
  deleteProduct: async (id: string) => {
    try {
      const response = await axios.delete(`${PRODUCT_URL}/${id}`);
      return response.data;
    } catch (error: any) {
      throw {
        message:
          error.response?.data?.messages ||
          "Erreur lors de la suppression du produit",
      };
    }
  },
};