// services/proformaCartService.ts
import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api";
import { Product as ApiProduct, productService } from "./productService";

const PROFORMA_URL = `${API_BASE_URL}${API_ENDPOINTS.PROFORMA}`;

// Types de paiement cohérents avec l'écran
export type PaymentMethod = 'cash' | 'card' | 'mobile' | 'transfer' | 'check';

// Interfaces basées sur votre base de données
export interface ProformaItem {
  id: string;
  ref_produit: string;
  designation: string;
  prix_actuel: number;
  prix_unitaire?: number;
  qte_disponible: number;
  quantiteDisponible?: number;
  quantiteAcheter: number;
  montant: number;
  categorie?: string;
  prix_precedent?: number;
  date_mise_a_jour_prix?: string;
  image_url?: string;
}

// Interface pour le proforma selon votre schéma de base de données
export interface DatabaseProforma {
  ref_facture: string;
  ref_produit: string; // Format: "pdt1, pdt2, ..., pdtn"
  qte_a_acheter: string; // Format: "qte1, qte2, ..., qten"
  email: string;
  remise: string; // Peut être "%" ou "ar"
  date_facture: string;
}

export interface ApiResponse<T = any> {
  status: string;
  data: T;
  message: string;
}

export interface StockValidationResult {
  reference: string;
  valid: boolean;
  message: string;
}

export interface StockValidationResponse {
  valid: boolean;
  results: StockValidationResult[];
}

export interface ProformaSummary {
  items: ProformaItem[];
  totalAmount: number;
  totalItems: number;
  subtotal: number;
  discountAmount: number;
  netAmount: number;
}

// Fonction pour générer la référence de facture
export const generateInvoiceRef = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `PRO-${year}${month}${day}${hours}${minutes}${seconds}`;
};

// Fonction utilitaire pour obtenir le prix
export const getProductPrice = (item: ProformaItem): number => {
  return item.prix_unitaire || item.prix_actuel || 0;
};

// Fonction utilitaire pour obtenir la quantité disponible
export const getAvailableQuantity = (item: ProformaItem): number => {
  return item.quantiteDisponible || item.qte_disponible || 0;
};

export interface ProformaCreationData {
  cartItems: ProformaItem[];
  clientEmail: string;
  discountInfo: {
    discount_amount: number;
    discount_type: 'percent' | 'amount';
  };
  notes?: string;
  subtotal: number;
  net_amount: number;
}

export const formatCartForDatabase = (data: ProformaCreationData): any => {
  const ref_facture = generateInvoiceRef();
  const ref_produit = data.cartItems.map(item => item.ref_produit).join(', ');
  const qte_a_acheter = data.cartItems.map(item => item.quantiteAcheter).join(', ');
  
  // Retourner les données minimales adaptées au proforma
  return {
    ref_facture,
    ref_produit,
    qte_a_acheter,
    email: data.clientEmail || '',
    remise: data.discountInfo.discount_type === 'percent' 
      ? `${data.discountInfo.discount_amount}%`
      : `ar${data.discountInfo.discount_amount.toFixed(2)}`,
    date_facture: new Date().toISOString()
  };
};

export const proformaCartService = {
  /** Créer un proforma dans la base de données */
  createProforma: async (data: ProformaCreationData) => {
    try {
      const dbProforma = formatCartForDatabase(data);
      console.log('Envoi proforma à la base de données:', dbProforma);
      
      const response = await axios.post<ApiResponse<DatabaseProforma>>(PROFORMA_URL, dbProforma);
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur création proforma",
        code: error.response?.status || 500,
        data: error.response?.data
      };
    }
  },

  /** Créer un proforma (version simplifiée pour compatibilité) */
  createProformaSimple: async (cartItems: ProformaItem[], clientEmail: string, notes?: string) => {
    try {
      const subtotal = cartItems.reduce((sum, item) => sum + (item.montant || 0), 0);
      const proformaData: ProformaCreationData = {
        cartItems,
        clientEmail,
        discountInfo: {
          discount_amount: 0,
          discount_type: 'amount',
        },
        notes,
        subtotal,
        net_amount: subtotal
      };
      
      return await proformaCartService.createProforma(proformaData);
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur création proforma",
        code: error.response?.status || 500,
        data: error.response?.data
      };
    }
  },

  /** Valider le stock avant création de proforma */
  validateStock: async (cartItems: ProformaItem[]): Promise<StockValidationResponse> => {
    try {
      const validationResults = await Promise.all(
        cartItems.map(async (item) => {
          try {
            const product = await productService.getProduct(item.ref_produit);
            
            const availableStock = product.qte_disponible || 0;
            const requestedQuantity = item.quantiteAcheter || 0;
            
            if (availableStock < requestedQuantity) {
              return {
                reference: item.ref_produit,
                valid: false,
                message: `Stock insuffisant pour ${item.designation}. Disponible: ${availableStock}, Demandé: ${requestedQuantity}`
              };
            }
            
            return {
              reference: item.ref_produit,
              valid: true,
              message: "Stock disponible"
            };
          } catch (error: any) {
            return {
              reference: item.ref_produit,
              valid: false,
              message: "Produit non trouvé dans l'inventaire"
            };
          }
        })
      );
      
      return {
        valid: validationResults.every(result => result.valid),
        results: validationResults
      };
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur validation stock",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Récupérer tous les proformas */
  getProformas: async (params?: { 
    startDate?: string; 
    endDate?: string; 
    email?: string;
    limit?: number;
    page?: number;
  }) => {
    try {
      const response = await axios.get<ApiResponse<DatabaseProforma[]>>(PROFORMA_URL, {
        params: params
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

  /** Récupérer un proforma spécifique */
  getProforma: async (ref_facture: string) => {
    try {
      const response = await axios.get<ApiResponse<DatabaseProforma>>(`${PROFORMA_URL}/${ref_facture}`);
      return response.data.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Proforma introuvable",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Rechercher des proformas */
  searchProformas: async (searchTerm: string) => {
    try {
      const response = await axios.get<ApiResponse<DatabaseProforma[]>>(`${PROFORMA_URL}/search`, {
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

  /** Récupérer les proformas par client */
  getProformasByClient: async (email: string) => {
    try {
      const response = await axios.get<ApiResponse<DatabaseProforma[]>>(`${PROFORMA_URL}/client/${email}`);
      return response.data.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur chargement proformas client",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Calculer le résumé d'un panier proforma */
  calculateProformaSummary: (cartItems: ProformaItem[]): ProformaSummary => {
    const totalItems = cartItems.reduce((sum, item) => sum + (item.quantiteAcheter || 0), 0);
    const subtotal = cartItems.reduce((sum, item) => sum + (item.montant || 0), 0);
    
    return {
      items: cartItems,
      totalAmount: subtotal,
      totalItems,
      subtotal,
      discountAmount: 0,
      netAmount: subtotal
    };
  },

  /** Calculer le résumé avec remise */
  calculateProformaSummaryWithDiscount: (
    cartItems: ProformaItem[], 
    discountAmount: number, 
    discountType: 'percent' | 'amount'
  ): ProformaSummary => {
    const totalItems = cartItems.reduce((sum, item) => sum + (item.quantiteAcheter || 0), 0);
    const subtotal = cartItems.reduce((sum, item) => sum + (item.montant || 0), 0);
    
    let discount = discountAmount;
    if (discountType === 'percent') {
      discount = subtotal * (discountAmount / 100);
    }
    
    const netAmount = Math.max(0, subtotal - discount);
    
    return {
      items: cartItems,
      totalAmount: netAmount,
      totalItems,
      subtotal,
      discountAmount: discount,
      netAmount
    };
  },

  /** Vérifier et ajuster les quantités selon stock disponible */
  adjustQuantitiesByStock: async (cartItems: ProformaItem[]) => {
    const adjustedItems = await Promise.all(
      cartItems.map(async (item) => {
        try {
          const product = await productService.getProduct(item.ref_produit);
          const availableStock = product.qte_disponible || 0;
          const requestedQuantity = item.quantiteAcheter || 0;
          
          const adjustedQuantity = Math.min(requestedQuantity, availableStock);
          const prix_unitaire = getProductPrice(item);
          
          return {
            ...item,
            quantiteAcheter: adjustedQuantity,
            qte_disponible: availableStock,
            montant: prix_unitaire * adjustedQuantity
          };
        } catch (error) {
          // Si produit non trouvé, retourner 0 quantité
          return {
            ...item,
            quantiteAcheter: 0,
            qte_disponible: 0,
            montant: 0
          };
        }
      })
    );
    
    // Filtrer les items avec quantité > 0
    const validItems = adjustedItems.filter(item => item.quantiteAcheter > 0);
    
    return {
      adjustedItems: validItems,
      hasChanges: validItems.length !== cartItems.length || 
        validItems.some((item, index) => item.quantiteAcheter !== cartItems[index].quantiteAcheter)
    };
  },

  /** Récupérer les statistiques des proformas */
  getProformasStats: async (period?: { startDate: string; endDate: string }) => {
    try {
      const response = await axios.get<ApiResponse>(`${PROFORMA_URL}/stats`, {
        params: period
      });
      return response.data.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur chargement statistiques proformas",
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

  /** Récupérer les proformas d'aujourd'hui */
  getTodayProformas: async () => {
    try {
      const response = await axios.get<ApiResponse<DatabaseProforma[]>>(`${PROFORMA_URL}/today`);
      return response.data.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur chargement proformas du jour",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Convertir un proforma en vente (si votre application le permet) */
  convertToSale: async (ref_facture: string, paymentInfo: {
    method: PaymentMethod;
    amount_paid: number;
    condition: string;
  }) => {
    try {
      const response = await axios.post<ApiResponse>(`${PROFORMA_URL}/${ref_facture}/convert-to-sale`, {
        payment_method: paymentInfo.method,
        amount_paid: paymentInfo.amount_paid,
        condition: paymentInfo.condition
      });
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur conversion en vente",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Vérifier si un produit est dans le panier proforma */
  isProductInProforma: (cartItems: ProformaItem[], ref_produit: string): boolean => {
    return cartItems.some(item => item.ref_produit === ref_produit);
  },

  /** Calculer le montant total d'un item */
  calculateItemAmount: (item: ProformaItem): number => {
    const price = getProductPrice(item);
    const quantity = item.quantiteAcheter || 0;
    return price * quantity;
  },

  /** Formater un montant pour affichage */
  formatAmount: (amount: number | undefined): string => {
    const value = amount || 0;
    return `ar ${value.toFixed(2)}`;
  },

  /** Parser un proforma de la base de données pour l'affichage */
  parseDatabaseProforma: (dbProforma: DatabaseProforma): {
    ref_facture: string;
    email: string;
    products: Array<{
      ref_produit: string;
      qte_a_acheter: number;
    }>;
    remise: string;
    date_facture: string;
  } => {
    // Parser les références produits
    const productRefs = dbProforma.ref_produit.split(', ').map(ref => ref.trim());
    
    // Parser les quantités à acheter
    const quantities = dbProforma.qte_a_acheter.split(', ').map(qte => parseInt(qte.trim()));
    
    // Créer le tableau de produits
    const products = productRefs.map((ref, index) => ({
      ref_produit: ref,
      qte_a_acheter: quantities[index] || 0
    }));
    
    return {
      ref_facture: dbProforma.ref_facture,
      email: dbProforma.email,
      products,
      remise: dbProforma.remise,
      date_facture: dbProforma.date_facture
    };
  },

  /** Calculer le montant total à partir d'un proforma */
  calculateProformaTotal: (dbProforma: DatabaseProforma, productsData: ApiProduct[]): number => {
    const parsedProforma = proformaCartService.parseDatabaseProforma(dbProforma);
    
    let total = 0;
    parsedProforma.products.forEach(item => {
      const product = productsData.find(p => p.ref_produit === item.ref_produit);
      if (product) {
        total += (product.prix_actuel || 0) * (item.qte_a_acheter || 0);
      }
    });
    
    return total;
  }
};

// Fonctions utilitaires pour le panier proforma local (client-side)
export const localProformaCartService = {
  // Ajouter un produit au panier proforma
  addToProforma: (currentCart: ProformaItem[], product: ApiProduct, quantity: number = 1): ProformaItem[] => {
    const existingIndex = currentCart.findIndex(item => item.ref_produit === product.ref_produit);
    const price = product.prix_actuel || 0;
    const availableStock = product.qte_disponible || 0;
    
    if (existingIndex !== -1) {
      // Mettre à jour la quantité
      const updatedCart = [...currentCart];
      const newQty = updatedCart[existingIndex].quantiteAcheter + quantity;
      
      if (newQty > availableStock) {
        // Ne pas dépasser le stock disponible
        return currentCart;
      }
      
      updatedCart[existingIndex].quantiteAcheter = newQty;
      updatedCart[existingIndex].montant = price * newQty;
      return updatedCart;
    } else {
      // Ajouter nouveau produit
      const proformaItem: ProformaItem = {
        id: product.ref_produit,
        ref_produit: product.ref_produit,
        designation: product.designation,
        prix_actuel: price,
        prix_unitaire: price,
        qte_disponible: availableStock,
        quantiteDisponible: availableStock,
        quantiteAcheter: quantity,
        montant: price * quantity,
        categorie: product.categorie,
        prix_precedent: product.prix_precedent,
        date_mise_a_jour_prix: product.date_mise_a_jour_prix,
        image_url: product.image_url
      };
      return [...currentCart, proformaItem];
    }
  },

  // Supprimer du panier proforma
  removeFromProforma: (currentCart: ProformaItem[], ref_produit: string): ProformaItem[] => {
    return currentCart.filter(item => item.ref_produit !== ref_produit);
  },

  // Mettre à jour la quantité
  updateProformaItemQuantity: (currentCart: ProformaItem[], ref_produit: string, quantity: number): ProformaItem[] => {
    return currentCart.map(item => {
      if (item.ref_produit === ref_produit) {
        const newQuantity = Math.max(0, quantity);
        const price = getProductPrice(item);
        return {
          ...item,
          quantiteAcheter: newQuantity,
          montant: price * newQuantity
        };
      }
      return item;
    }).filter(item => item.quantiteAcheter > 0);
  },

  // Vider le panier proforma
  clearProforma: (): ProformaItem[] => {
    return [];
  },

  // Calculer le total
  calculateTotal: (cartItems: ProformaItem[]): number => {
    return cartItems.reduce((sum, item) => sum + (item.montant || 0), 0);
  },

  // Calculer le nombre total d'articles
  calculateTotalItems: (cartItems: ProformaItem[]): number => {
    return cartItems.reduce((sum, item) => sum + (item.quantiteAcheter || 0), 0);
  },

  // Vérifier si le panier proforma est vide
  isProformaEmpty: (cartItems: ProformaItem[]): boolean => {
    return cartItems.length === 0;
  },

  // Calculer le montant net avec remise
  calculateNetAmount: (subtotal: number, discountAmount: number, discountType: 'percent' | 'amount'): number => {
    let discount = discountAmount;
    if (discountType === 'percent') {
      discount = subtotal * (discountAmount / 100);
    }
    return Math.max(0, subtotal - discount);
  },

  // Générer la référence de facture proforma
  generateInvoiceRef
};

export default proformaCartService;