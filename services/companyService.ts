import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api";

const COMPANY_URL = `${API_BASE_URL}${API_ENDPOINTS.COMPANY}`;

export interface CompanyData {
  companyName: string;
  address: string;
  phone: string;
  identifiant: string;
  nif: string;
  stat: string;
  rcs: string;
  logoUrl?: string | null; // Changé de logo à logoUrl pour plus de clarté
}

export const companyService = {
  /** ✔ CREATE COMPANY avec URL de logo */
  createCompany: async (data: CompanyData) => {
    try {
      const response = await axios.post(COMPANY_URL, data);
      return response.data;
    } catch (error: any) {
      console.log("❌ Erreur API createCompany :", error.response?.data);

      throw {
        message: error.response?.data?.messages || "Une erreur est survenue lors de la création de l'entreprise",
        code: error.response?.status || 500,
      };
    }
  },

  /** ✔ UPLOAD LOGO séparément (optionnel) */
  uploadLogo: async (companyId: string, logoUri: string) => {
    try {
      // Créer FormData pour l'upload de fichier
      const formData = new FormData();
      
      // Extraire le nom du fichier de l'URI
      const filename = logoUri.split('/').pop() || 'logo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      // Ajouter le fichier à FormData
      formData.append('logo', {
        uri: logoUri,
        name: filename,
        type,
      } as any);

      const response = await axios.post(`${COMPANY_URL}/${companyId}/upload-logo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.messages || "Erreur lors du téléchargement du logo",
      };
    }
  },

  /** ✔ GET ALL COMPANIES */
  getCompanies: async () => {
    try {
      const response = await axios.get(COMPANY_URL);
      return response.data.data;
    } catch (error: any) {
      throw {
        message:
          error.response?.data?.messages ||
          "Impossible de charger les entreprises",
      };
    }
  },

  /** ✔ GET ONE COMPANY */
  getCompany: async (id: string) => {
    try {
      const response = await axios.get(`${COMPANY_URL}/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw {
        message:
          error.response?.data?.messages || "Entreprise introuvable",
      };
    }
  },

  /** ✔ UPDATE COMPANY */
  updateCompany: async (id: string, data: Partial<CompanyData>) => {
    try {
      const response = await axios.put(`${COMPANY_URL}/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw {
        message:
          error.response?.data?.messages ||
          "Erreur lors de la mise à jour de l'entreprise",
      };
    }
  },

  /** ✔ DELETE COMPANY */
  deleteCompany: async (id: string) => {
    try {
      const response = await axios.delete(`${COMPANY_URL}/${id}`);
      return response.data;
    } catch (error: any) {
      throw {
        message:
          error.response?.data?.messages ||
          "Erreur lors de la suppression de l'entreprise",
      };
    }
  },
};