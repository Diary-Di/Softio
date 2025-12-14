// services/proformaService.ts
import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api";

const PROFORMA_URL = `${API_BASE_URL}${API_ENDPOINTS.PROFORMA}`;

// Interface pour un proforma
export interface Proforma {
  id?: number;
  ref_facture: string;
  ref_produit: string;
  qte_a_acheter: string;
  email: string;
  remise: string;
  date_facture: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProformaStats {
  date: string;
  nombre_proformas: number;
  chiffre_affaires_estime: number;
}

export interface ProformaStatsResponse {
  stats_period: {
    start_date: string;
    end_date: string;
  };
  stats_par_jour: ProformaStats[];
}

export interface ApiResponse<T = any> {
  status: string;
  data: T;
  message: string;
}

export interface ProformaFilterParams {
  startDate?: string;
  endDate?: string;
  email?: string;
  limit?: number;
  page?: number;
}

export const proformaService = {
  /** Récupérer tous les proformas avec filtres optionnels */
  getProformas: async (params?: ProformaFilterParams) => {
    try {
      const response = await axios.get<ApiResponse<Proforma[]>>(PROFORMA_URL, {
        params
      });
      return response.data.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur chargement des proformas",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Récupérer un proforma par référence de facture */
  getProforma: async (ref_facture: string) => {
    try {
      const response = await axios.get<ApiResponse<Proforma>>(`${PROFORMA_URL}/${ref_facture}`);
      return response.data.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Proforma introuvable",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Vérifier si une référence de facture existe déjà */
  checkInvoiceExists: async (ref_facture: string) => {
    try {
      await axios.get(`${PROFORMA_URL}/${ref_facture}`);
      return true; // Si la requête réussit, la facture existe
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false; // Facture non trouvée
      }
      console.error("Erreur vérification référence facture:", error);
      return false;
    }
  },

  /** Rechercher des proformas */
  searchProformas: async (searchTerm: string) => {
    try {
      const response = await axios.get<ApiResponse<Proforma[]>>(`${PROFORMA_URL}/search`, {
        params: { q: searchTerm }
      });
      return response.data.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur recherche proformas",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Récupérer les proformas d'un client */
  getProformasByClient: async (email: string) => {
    try {
      const response = await axios.get<ApiResponse<Proforma[]>>(`${PROFORMA_URL}/client/${email}`);
      return response.data.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur chargement des proformas du client",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Récupérer les proformas d'aujourd'hui */
  getTodayProformas: async () => {
    try {
      const response = await axios.get<ApiResponse<Proforma[]>>(`${PROFORMA_URL}/today`);
      return response.data.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur chargement des proformas du jour",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Récupérer les statistiques des proformas */
  getStats: async (startDate?: string, endDate?: string) => {
    try {
      const response = await axios.get<ApiResponse<ProformaStatsResponse>>(`${PROFORMA_URL}/stats`, {
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
      const response = await axios.post<ApiResponse>(`${PROFORMA_URL}/test`, testData);
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur endpoint test",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Convertir un proforma en vente */
  convertToSale: async (ref_facture: string, paymentData: {
    mode_paiement: string;
    montant_paye: number;
    condition_paiement: string;
  }) => {
    try {
      const response = await axios.post<ApiResponse>(`${PROFORMA_URL}/${ref_facture}/convert-to-sale`, paymentData);
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur conversion en vente",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Créer un nouveau proforma */
  createProforma: async (proformaData: Partial<Proforma>) => {
    try {
      const formattedData = formatProformaForAPI(proformaData);
      const response = await axios.post<ApiResponse<Proforma>>(PROFORMA_URL, formattedData);
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur création du proforma",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Mettre à jour un proforma */
  updateProforma: async (ref_facture: string, proformaData: Partial<Proforma>) => {
    try {
      const response = await axios.put<ApiResponse<Proforma>>(`${PROFORMA_URL}/${ref_facture}`, proformaData);
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur mise à jour du proforma",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Supprimer un proforma */
  deleteProforma: async (ref_facture: string) => {
    try {
      const response = await axios.delete<ApiResponse>(`${PROFORMA_URL}/${ref_facture}`);
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur suppression du proforma",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Récupérer les produits d'un proforma */
  getProformaProducts: async (ref_facture: string) => {
    try {
      const response = await axios.get<ApiResponse>(`${PROFORMA_URL}/${ref_facture}/products`);
      return response.data.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur chargement des produits du proforma",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Générer un PDF pour un proforma */
  generateProformaPDF: async (ref_facture: string) => {
    try {
      const response = await axios.get<ApiResponse<{ pdf_url: string }>>(`${PROFORMA_URL}/${ref_facture}/pdf`, {
        responseType: 'blob'
      });
      return response.data.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur génération PDF proforma",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Calculer le montant total estimé d'un proforma */
  calculateEstimatedAmount: async (ref_facture: string) => {
    try {
      const response = await axios.get<ApiResponse<{ estimated_amount: number }>>(`${PROFORMA_URL}/${ref_facture}/estimated-amount`);
      return response.data.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur calcul montant estimé",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Dupliquer un proforma existant */
  duplicateProforma: async (ref_facture: string) => {
    try {
      const response = await axios.post<ApiResponse<Proforma>>(`${PROFORMA_URL}/${ref_facture}/duplicate`);
      return response.data.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur duplication du proforma",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Valider un proforma */
  validateProforma: async (ref_facture: string) => {
    try {
      const response = await axios.post<ApiResponse>(`${PROFORMA_URL}/${ref_facture}/validate`);
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur validation du proforma",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Marquer un proforma comme expiré */
  markAsExpired: async (ref_facture: string) => {
    try {
      const response = await axios.post<ApiResponse>(`${PROFORMA_URL}/${ref_facture}/expire`);
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur marquage proforma comme expiré",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Récupérer les proformas expirés */
  getExpiredProformas: async () => {
    try {
      const response = await axios.get<ApiResponse<Proforma[]>>(`${PROFORMA_URL}/expired`);
      return response.data.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur chargement des proformas expirés",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Récupérer les proformas en attente */
  getPendingProformas: async () => {
    try {
      const response = await axios.get<ApiResponse<Proforma[]>>(`${PROFORMA_URL}/pending`);
      return response.data.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur chargement des proformas en attente",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Exporter les données d'un proforma */
  exportProformaData: async (ref_facture: string, format: 'json' | 'csv' = 'json') => {
    try {
      const response = await axios.get<ApiResponse>(`${PROFORMA_URL}/${ref_facture}/export`, {
        params: { format }
      });
      return response.data.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur export proforma",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  }
};

// Fonctions utilitaires pour formater les données
export const formatProformaForAPI = (proforma: Partial<Proforma>): any => {
  return {
    ref_facture: proforma.ref_facture || generateProformaRef(),
    ref_produit: proforma.ref_produit || '',
    qte_a_acheter: proforma.qte_a_acheter || '',
    email: proforma.email || '',
    remise: proforma.remise || '',
    date_facture: proforma.date_facture || new Date().toISOString().slice(0, 19).replace('T', ' ')
  };
};

/** Générer une référence de proforma unique */
export const generateProformaRef = (): string => {
  const date = new Date();
  const dateStr = date.getFullYear().toString() +
                 (date.getMonth() + 1).toString().padStart(2, '0') +
                 date.getDate().toString().padStart(2, '0') +
                 date.getHours().toString().padStart(2, '0') +
                 date.getMinutes().toString().padStart(2, '0') +
                 date.getSeconds().toString().padStart(2, '0');
  
  const randomNum = Math.floor(1000 + Math.random() * 9000); // Génère un nombre entre 1000 et 9999
  return `PRO-${dateStr}${randomNum.toString()}`;
};

/** Calculer le montant total estimé d'une liste de proformas */
export const calculateTotalEstimatedAmount = (proformas: Proforma[], productData?: any[]): number => {
  // Cette fonction nécessite des données produits pour calculer les montants
  // Si productData n'est pas fourni, retourner 0
  if (!productData) return 0;
  
  return proformas.reduce((total, proforma) => {
    const { refs, quantities } = parseProformaProductsAndQuantities(proforma);
    
    let proformaTotal = 0;
    refs.forEach((ref, index) => {
      const product = productData.find(p => p.ref_produit === ref);
      if (product && product.prix_actuel) {
        proformaTotal += product.prix_actuel * (quantities[index] || 0);
      }
    });
    
    return total + proformaTotal;
  }, 0);
};

/** Formater la date pour l'affichage */
export const formatProformaDate = (dateString: string): string => {
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
export const parseProformaProductsAndQuantities = (proforma: Proforma): { refs: string[], quantities: number[] } => {
  const refs = proforma.ref_produit ? proforma.ref_produit.split(',').map(ref => ref.trim()) : [];
  const quantities = proforma.qte_a_acheter ? proforma.qte_a_acheter.split(',').map(qty => parseInt(qty.trim()) || 0) : [];
  
  return { refs, quantities };
};

/** Formater la remise pour l'affichage */
export const formatDiscount = (remise: string): string => {
  if (!remise) return '0%';
  
  if (remise.includes('%')) {
    return remise;
  } else if (remise.includes('ar')) {
    return remise;
  } else {
    return `${remise}%`;
  }
};

/** Calculer le nombre total d'articles dans un proforma */
export const calculateTotalItems = (proforma: Proforma): number => {
  const { quantities } = parseProformaProductsAndQuantities(proforma);
  return quantities.reduce((total, qty) => total + (qty || 0), 0);
};

/** Obtenir le statut d'un proforma (basé sur la date) */
export const getProformaStatus = (proforma: Proforma): string => {
  const proformaDate = new Date(proforma.date_facture);
  const today = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(today.getDate() - 7);
  
  if (proformaDate > today) {
    return 'Futur';
  } else if (proformaDate >= oneWeekAgo) {
    return 'Récent';
  } else {
    return 'Ancien';
  }
};

/** Exporter un proforma en format CSV */
export const exportProformaToCSV = (proforma: Proforma): string => {
  const headers = ['Référence', 'Produit', 'Quantité', 'Email', 'Remise', 'Date'];
  const { refs, quantities } = parseProformaProductsAndQuantities(proforma);
  
  const rows = refs.map((ref, index) => [
    proforma.ref_facture,
    ref,
    quantities[index] || 0,
    proforma.email,
    proforma.remise || '0%',
    formatProformaDate(proforma.date_facture)
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
};

/** Vérifier si un proforma est expiré */
export const isProformaExpired = (proforma: Proforma, daysToExpire: number = 30): boolean => {
  const proformaDate = new Date(proforma.date_facture);
  const expirationDate = new Date(proformaDate);
  expirationDate.setDate(proformaDate.getDate() + daysToExpire);
  
  return new Date() > expirationDate;
};

/** Calculer les jours restants avant expiration */
export const getDaysUntilExpiration = (proforma: Proforma, daysToExpire: number = 30): number => {
  const proformaDate = new Date(proforma.date_facture);
  const expirationDate = new Date(proformaDate);
  expirationDate.setDate(proformaDate.getDate() + daysToExpire);
  
  const today = new Date();
  const diffTime = expirationDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/** Calculer le montant après remise */
export const calculateAmountAfterDiscount = (originalAmount: number, discount: string): number => {
  if (!discount) return originalAmount;
  
  if (discount.includes('%')) {
    const discountPercent = parseFloat(discount.replace('%', ''));
    return originalAmount * (1 - discountPercent / 100);
  } else if (discount.includes('ar')) {
    const discountAmount = parseFloat(discount.replace('ar', '').replace(',', '.'));
    return Math.max(0, originalAmount - discountAmount);
  }
  
  return originalAmount;
};

export default proformaService;