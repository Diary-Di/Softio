// services/productService.ts
import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api";

const PRODUCT_URL = `${API_BASE_URL}${API_ENDPOINTS.PRODUCT}`;

// Interface pour le produit
export interface Product {
  ref_produit: string;
  designation: string;
  categorie?: string;
  prix_actuel: number;
  prix_precedent: number;
  date_mise_a_jour_prix: string;
  qte_disponible: number;
  image_url?: string;
}

export interface ApiResponse<T = any> {
  [x: string]: any;
  status: string;
  data: T;
  message: string;
}

export const productService = {
  /** Créer un produit */
  createProduct: async (productData: Partial<Product>) => {
    try {
      const response = await axios.post<ApiResponse<Product>>(PRODUCT_URL, productData);
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur création produit",
        code: error.response?.status || 500,
        data: error.response?.data
      };
    }
  },

  /** Vérifier si une référence existe */
  checkReferenceExists: async (ref_produit: string) => {
    try {
      // Utilisez l'endpoint show pour vérifier l'existence
      const response = await axios.get(`${PRODUCT_URL}/${ref_produit}`);
      return true; // Si la requête réussit, le produit existe
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false; // Produit non trouvé
      }
      console.error("Erreur vérification référence:", error);
      return false;
    }
  },

  /** Récupérer tous les produits */
  getProducts: async () => {
    try {
      const response = await axios.get<ApiResponse<Product[]>>(PRODUCT_URL);
      return response.data.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur chargement produits",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Récupérer un produit */
  getProduct: async (ref_produit: string) => {
    try {
      const response = await axios.get<ApiResponse<Product>>(`${PRODUCT_URL}/${ref_produit}`);
      return response.data.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Produit introuvable",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Mettre à jour un produit */
  updateProduct: async (ref_produit: string, productData: Partial<Product>) => {
    try {
      const response = await axios.put<ApiResponse<Product>>(`${PRODUCT_URL}/${ref_produit}`, productData);
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur mise à jour",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Supprimer un produit */
  deleteProduct: async (ref_produit: string) => {
    try {
      const response = await axios.delete<ApiResponse>(`${PRODUCT_URL}/${ref_produit}`);
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur suppression",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Rechercher des produits */
  searchProducts: async (searchTerm: string) => {
    try {
      const response = await axios.get<ApiResponse<Product[]>>(`${PRODUCT_URL}/search`, {
        params: { q: searchTerm }
      });
      return response.data.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur recherche",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Filtrer par catégorie */
  getProductsByCategory: async (category: string) => {
    try {
      const response = await axios.get<ApiResponse<Product[]>>(`${PRODUCT_URL}/category/${category}`);
      return response.data.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur chargement par catégorie",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Mettre à jour la quantité */
  updateQuantity: async (ref_produit: string, quantity: number) => {
    try {
      const response = await axios.patch<ApiResponse<Product>>(
        `${PRODUCT_URL}/${ref_produit}/quantity`, 
        { qte_disponible: quantity }
      );
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur mise à jour quantité",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Récupérer les statistiques */
  getStats: async () => {
    try {
      const response = await axios.get<ApiResponse>(`${PRODUCT_URL}/stats`);
      return response.data.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur chargement statistiques",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  }
};

// Fonctions utilitaires
export const formatProductForAPI = (product: Partial<Product>): any => {
  return {
    ref_produit: product.ref_produit,
    designation: product.designation,
    categorie: product.categorie || null,
    prix_actuel: product.prix_actuel || 0,
    prix_precedent: product.prix_precedent || 0,
    date_mise_a_jour_prix: product.date_mise_a_jour_prix || new Date().toISOString().slice(0, 19).replace('T', ' '),
    qte_disponible: product.qte_disponible || 0,
    image_url: product.image_url || null
  };
};