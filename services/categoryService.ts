// services/categoryService.ts
import api from "./api";

export const categoryService = {
  createCategory: async (data: { categorie: string; description: string }) => {
    try {
      const response = await api.post("/categories/create", data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: "Erreur interne" };
    }
  },
};
