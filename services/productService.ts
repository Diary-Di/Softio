// services/productService.ts
import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api";

const PRODUCT_URL = `${API_BASE_URL}${API_ENDPOINTS.PRODUCT}`;

export const productService = {
  /** Créer un produit */
  createProduct: async (productData: any) => {
    try {
      const response = await axios.post(PRODUCT_URL, productData);
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur création produit",
        code: error.response?.status || 500,
      };
    }
  },

  /** Vérifier si une référence existe */
  checkReferenceExists: async (ref_produit: string) => {
    try {
      const response = await axios.get(`${PRODUCT_URL}/check-reference/${ref_produit}`);
      return response.data.exists || false;
    } catch (error: any) {
      console.error("Erreur vérification référence:", error);
      return false;
    }
  },

  /** Récupérer tous les produits */
  getProducts: async () => {
    try {
      const response = await axios.get(PRODUCT_URL);
      return response.data.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur chargement produits",
      };
    }
  },

  /** Récupérer un produit */
  getProduct: async (ref_produit: string) => {
    try {
      const response = await axios.get(`${PRODUCT_URL}/${ref_produit}`);
      return response.data.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Produit introuvable",
      };
    }
  },

  /** Mettre à jour un produit */
  updateProduct: async (ref_produit: string, productData: any) => {
    try {
      const response = await axios.put(`${PRODUCT_URL}/${ref_produit}`, productData);
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur mise à jour",
      };
    }
  },

  /** Supprimer un produit */
  deleteProduct: async (ref_produit: string) => {
    try {
      const response = await axios.delete(`${PRODUCT_URL}/${ref_produit}`);
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur suppression",
      };
    }
  },
};