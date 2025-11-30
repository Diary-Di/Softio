// services/categoryService.ts
import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api";

const CATEGORY_URL = `${API_BASE_URL}${API_ENDPOINTS.CATEGORY}`;

export const categoryService = {

  /** ✔ CREATE CATEGORY */
  createCategory: async (data: { categorie: string; description: string }) => {
    try {
      const response = await axios.post(CATEGORY_URL, data);
      return response.data;
    } catch (error: any) {
      console.log("❌ Erreur API createCategory :", error.response?.data);

      throw {
        message: error.response?.data?.messages || "Une erreur est survenue",
        code: error.response?.status || 500,
      };
    }
  },

  /** ✔ GET ALL */
  getCategories: async () => {
    try {
      const response = await axios.get(CATEGORY_URL);
      return response.data.data;
    } catch (error: any) {
      throw {
        message:
          error.response?.data?.messages ||
          "Impossible de charger les catégories",
      };
    }
  },

  /** ✔ GET ONE (clé primaire = categorie) */
  getCategory: async (categorie: string) => {
    try {
      const response = await axios.get(`${CATEGORY_URL}/${categorie}`);
      return response.data.data;
    } catch (error: any) {
      throw {
        message:
          error.response?.data?.messages || "Catégorie introuvable",
      };
    }
  },

  /** ✔ UPDATE */
  updateCategory: async (categorie: string, data: any) => {
    try {
      const response = await axios.put(`${CATEGORY_URL}/${categorie}`, data);
      return response.data;
    } catch (error: any) {
      throw {
        message:
          error.response?.data?.messages ||
          "Erreur lors de la mise à jour",
      };
    }
  },

  /** ✔ DELETE */
  deleteCategory: async (categorie: string) => {
    try {
      const response = await axios.delete(`${CATEGORY_URL}/${categorie}`);
      return response.data;
    } catch (error: any) {
      throw {
        message:
          error.response?.data?.messages ||
          "Erreur lors de la suppression",
      };
    }
  },
};
