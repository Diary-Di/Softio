// services/userService.ts
import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api";

export const userService = {
  async getProfile(token: string) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.PROFILE}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("Erreur récupération profil :", error?.response || error);
      throw error?.response?.data || { message: "Erreur serveur." };
    }
  },
};
