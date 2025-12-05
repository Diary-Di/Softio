// services/salesService.ts
import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api";

const SALES_URL = `${API_BASE_URL}${API_ENDPOINTS.SALES}`;

// Interface pour une vente
export interface Sale {
  id?: number;
  ref_facture: string;
  ref_produit: string;
  qte_vendu: string;
  email: string;
  mode_paiement: string;
  montant_paye: number;
  condition_paiement: string;
  date_achat: string;
  remise?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SaleStats {
  date: string;
  nombre_ventes: number;
  chiffre_affaires: number;
  mode_paiement: string;
}

export interface SalesStatsResponse {
  stats_period: {
    start_date: string;
    end_date: string;
  };
  stats_par_jour: SaleStats[];
}

export interface ApiResponse<T = any> {
  status: string;
  data: T;
  message: string;
}

export interface SalesFilterParams {
  startDate?: string;
  endDate?: string;
  email?: string;
  mode_paiement?: string;
  limit?: number;
  page?: number;
}

export const salesService = {
  /** Récupérer toutes les ventes avec filtres optionnels */
  getSales: async (params?: SalesFilterParams) => {
    try {
      const response = await axios.get<ApiResponse<Sale[]>>(SALES_URL, {
        params
      });
      return response.data.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur chargement des ventes",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Récupérer une vente par référence de facture */
  getSale: async (ref_facture: string) => {
    try {
      const response = await axios.get<ApiResponse<Sale>>(`${SALES_URL}/${ref_facture}`);
      return response.data.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Vente introuvable",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Vérifier si une référence de facture existe déjà */
  checkInvoiceExists: async (ref_facture: string) => {
    try {
      await axios.get(`${SALES_URL}/${ref_facture}`);
      return true; // Si la requête réussit, la facture existe
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false; // Facture non trouvée
      }
      console.error("Erreur vérification référence facture:", error);
      return false;
    }
  },

  /** Rechercher des ventes */
  searchSales: async (searchTerm: string) => {
    try {
      const response = await axios.get<ApiResponse<Sale[]>>(`${SALES_URL}/search`, {
        params: { q: searchTerm }
      });
      return response.data.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur recherche ventes",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Récupérer les ventes d'un client */
  getSalesByClient: async (email: string) => {
    try {
      const response = await axios.get<ApiResponse<Sale[]>>(`${SALES_URL}/client/${email}`);
      return response.data.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur chargement des ventes du client",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Récupérer les ventes d'aujourd'hui */
  getTodaySales: async () => {
    try {
      const response = await axios.get<ApiResponse<Sale[]>>(`${SALES_URL}/today`);
      return response.data.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur chargement des ventes du jour",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Récupérer les statistiques des ventes */
  getStats: async (startDate?: string, endDate?: string) => {
    try {
      const response = await axios.get<ApiResponse<SalesStatsResponse>>(`${SALES_URL}/stats`, {
        params: { startDate, endDate }
      });
      return response.data.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur chargement des statistiques",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Endpoint de test */
  testEndpoint: async (testData?: any) => {
    try {
      const response = await axios.post<ApiResponse>(`${SALES_URL}/test`, testData);
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur endpoint test",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  }
};

// Fonctions utilitaires pour formater les données
export const formatSaleForAPI = (sale: Partial<Sale>): any => {
  return {
    ref_facture: sale.ref_facture || generateInvoiceRef(),
    ref_produit: sale.ref_produit || '',
    qte_vendu: sale.qte_vendu || '',
    email: sale.email || '',
    mode_paiement: sale.mode_paiement || 'cash',
    montant_paye: sale.montant_paye || 0,
    condition_paiement: sale.condition_paiement || '',
    date_achat: sale.date_achat || new Date().toISOString().slice(0, 19).replace('T', ' '),
    remise: sale.remise || null
  };
};

/** Générer une référence de facture unique */
export const generateInvoiceRef = (): string => {
  const date = new Date();
  const dateStr = date.getFullYear().toString() +
                 (date.getMonth() + 1).toString().padStart(2, '0') +
                 date.getDate().toString().padStart(2, '0') +
                 date.getHours().toString().padStart(2, '0') +
                 date.getMinutes().toString().padStart(2, '0') +
                 date.getSeconds().toString().padStart(2, '0');
  
  const randomNum = Math.floor(1000 + Math.random() * 9000); // Génère un nombre entre 1000 et 9999
  return dateStr + randomNum.toString();
};

/** Calculer le montant total d'une liste de ventes */
export const calculateTotalSales = (sales: Sale[]): number => {
  return sales.reduce((total, sale) => total + (sale.montant_paye || 0), 0);
};

/** Formater la date pour l'affichage */
export const formatSaleDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/** Parser les produits et quantités depuis les chaînes */
export const parseProductsAndQuantities = (sale: Sale): { refs: string[], quantities: number[] } => {
  const refs = sale.ref_produit ? sale.ref_produit.split(',').map(ref => ref.trim()) : [];
  const quantities = sale.qte_vendu ? sale.qte_vendu.split(',').map(qty => parseInt(qty.trim()) || 0) : [];
  
  return { refs, quantities };
};