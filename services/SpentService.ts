// services/SpentService.ts
import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api";

const SPENT_URL = `${API_BASE_URL}${API_ENDPOINTS.SPENT}`;

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */
export interface Spent {
  numero: number;
  raison: string;
  montant: number;
  date_depense: string; // YYYY-MM-DD
  heur_depense: string; // HH:mm:ss
}

export interface CreateSpentData {
  raison: string;
  montant: number;
  date_depense: string;
  heur_depense: string;
}

export interface UpdateSpentData {
  raison?: string;
  montant?: number;
  date_depense?: string;
  heur_depense?: string;
}

/* -------------------------------------------------------------------------- */
/*                                 SERVICE                                    */
/* -------------------------------------------------------------------------- */
export const spentService = {
  /** ✔ CREATE SPENT */
  createSpent: async (data: CreateSpentData) => {
    try {
      console.log("🚀 Envoi API createSpent avec data :", data);
      const response = await axios.post(SPENT_URL, data);
      console.log("🚀 Envoi API createSpent avec data :", data);
      return response.data;
    } catch (error: any) {
      console.log("❌ Erreur API createSpent :", error.response?.data);

      throw {
        message:
          error.response?.data?.message ||
          "Erreur lors de l'ajout de la dépense",
        code: error.response?.status || 500,
      };
    }
  },

  /** ✔ GET ALL SPENTS */
  getSpents: async (params?: {
    limit?: number;
    offset?: number;
  }) => {
    try {
      const response = await axios.get(SPENT_URL, { params });
      return response.data.data as Spent[];
    } catch (error: any) {
      throw {
        message:
          error.response?.data?.message ||
          "Impossible de charger les dépenses",
        code: error.response?.status || 500,
      };
    }
  },

  /** ✔ GET SINGLE SPENT */
  getSpentById: async (numero: number) => {
    try {
      const response = await axios.get(`${SPENT_URL}/${numero}`);
      return response.data as Spent;
    } catch (error: any) {
      throw {
        message:
          error.response?.data?.message || "Dépense introuvable",
        code: error.response?.status || 404,
      };
    }
  },

  /** ✔ UPDATE SPENT */
  updateSpent: async (numero: number, data: UpdateSpentData) => {
    try {
      const response = await axios.put(`${SPENT_URL}/${numero}`, data);
      return response.data;
    } catch (error: any) {
      throw {
        message:
          error.response?.data?.message ||
          "Erreur lors de la mise à jour de la dépense",
        code: error.response?.status || 500,
      };
    }
  },

  /** ✔ DELETE SPENT */
  deleteSpent: async (numero: number) => {
    try {
      const response = await axios.delete(`${SPENT_URL}/${numero}`);
      return response.data;
    } catch (error: any) {
      throw {
        message:
          error.response?.data?.message ||
          "Erreur lors de la suppression de la dépense",
        code: error.response?.status || 500,
      };
    }
  },
};

export const getSpent = spentService.getSpentById;