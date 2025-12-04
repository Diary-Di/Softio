// services/cartService.ts
import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api";
import { Product as ApiProduct, productService } from "./productService";

const SALE_URL = `${API_BASE_URL}${API_ENDPOINTS.SALES}`;

// Interfaces basées sur votre CartSalesScreen
export interface CartItem {
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

export interface SaleItem {
  ref_produit: string;
  designation: string;
  prix_unitaire: number;
  quantite_vendue: number;
  montant_total: number;
}

export interface Sale {
  id: string;
  client_id: string;
  client_name?: string;
  items: SaleItem[];
  montant_total: number;
  date_vente: string;
  notes?: string;
  statut: 'pending' | 'completed' | 'cancelled';
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

export interface CartSummary {
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
}

// Fonction utilitaire pour obtenir le prix
export const getProductPrice = (item: CartItem): number => {
  return item.prix_unitaire || item.prix_actuel || 0;
};

// Fonction utilitaire pour obtenir la quantité disponible
export const getAvailableQuantity = (item: CartItem): number => {
  return item.quantiteDisponible || item.qte_disponible || 0;
};

// Transformations
export const transformCartItemToSaleItem = (cartItem: CartItem): SaleItem => {
  const prix_unitaire = getProductPrice(cartItem);
  return {
    ref_produit: cartItem.ref_produit,
    designation: cartItem.designation,
    prix_unitaire: prix_unitaire,
    quantite_vendue: cartItem.quantiteAcheter || 0,
    montant_total: cartItem.montant || 0
  };
};

export const formatCartForAPI = (cartItems: CartItem[], clientId: string, notes?: string) => {
  const items = cartItems.map(transformCartItemToSaleItem);
  const montant_total = cartItems.reduce((sum, item) => sum + (item.montant || 0), 0);
  
  return {
    client_id: clientId,
    items: items,
    montant_total: montant_total,
    notes: notes || '',
    date_vente: new Date().toISOString().slice(0, 19).replace('T', ' '),
    statut: 'completed'
  };
};

export const cartService = {
  /** Créer une vente (validation du panier) */
  createSale: async (cartItems: CartItem[], clientId: string, notes?: string) => {
    try {
      const saleData = formatCartForAPI(cartItems, clientId, notes);
      console.log('Envoi vente:', saleData);
      
      const response = await axios.post<ApiResponse<Sale>>(SALE_URL, saleData);
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur création vente",
        code: error.response?.status || 500,
        data: error.response?.data
      };
    }
  },

  /** Valider le stock avant vente */
  validateStock: async (cartItems: CartItem[]): Promise<StockValidationResponse> => {
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

  /** Récupérer toutes les ventes */
  getSales: async (params?: { 
    startDate?: string; 
    endDate?: string; 
    clientId?: string;
    limit?: number;
    page?: number;
    statut?: string;
  }) => {
    try {
      const response = await axios.get<ApiResponse<Sale[]>>(SALE_URL, {
        params: params
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

  /** Récupérer une vente spécifique */
  getSale: async (saleId: string) => {
    try {
      const response = await axios.get<ApiResponse<Sale>>(`${SALE_URL}/${saleId}`);
      return response.data.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Vente introuvable",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Mettre à jour une vente (statut, notes, etc.) */
  updateSale: async (saleId: string, saleData: Partial<Sale>) => {
    try {
      const response = await axios.put<ApiResponse<Sale>>(`${SALE_URL}/${saleId}`, saleData);
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur mise à jour vente",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Annuler une vente */
  cancelSale: async (saleId: string) => {
    try {
      const response = await axios.patch<ApiResponse<Sale>>(`${SALE_URL}/${saleId}/cancel`);
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur annulation vente",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Rechercher des ventes */
  searchSales: async (searchTerm: string) => {
    try {
      const response = await axios.get<ApiResponse<Sale[]>>(`${SALE_URL}/search`, {
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

  /** Récupérer les ventes par client */
  getSalesByClient: async (clientId: string) => {
    try {
      const response = await axios.get<ApiResponse<Sale[]>>(`${SALE_URL}/client/${clientId}`);
      return response.data.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur chargement ventes client",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Calculer le résumé d'un panier */
  calculateCartSummary: (cartItems: CartItem[]): CartSummary => {
    const totalItems = cartItems.reduce((sum, item) => sum + (item.quantiteAcheter || 0), 0);
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.montant || 0), 0);
    
    return {
      items: cartItems,
      totalAmount,
      totalItems
    };
  },

  /** Vérifier et ajuster les quantités selon stock disponible */
  adjustQuantitiesByStock: async (cartItems: CartItem[]) => {
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

  /** Récupérer les statistiques des ventes */
  getSalesStats: async (period?: { startDate: string; endDate: string }) => {
    try {
      const response = await axios.get<ApiResponse>(`${SALE_URL}/stats`, {
        params: period
      });
      return response.data.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur chargement statistiques ventes",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Générer un reçu PDF pour une vente */
  generateReceipt: async (saleId: string) => {
    try {
      const response = await axios.get<ApiResponse<{ pdf_url: string }>>(`${SALE_URL}/${saleId}/receipt`, {
        responseType: 'blob'
      });
      return response.data.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur génération reçu",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Récupérer les ventes d'aujourd'hui */
  getTodaySales: async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await axios.get<ApiResponse<Sale[]>>(`${SALE_URL}/today`);
      return response.data.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur chargement ventes du jour",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Synchroniser les stocks après vente */
  syncStockAfterSale: async (cartItems: CartItem[]) => {
    try {
      const results = await Promise.all(
        cartItems.map(async (item) => {
          try {
            const product = await productService.getProduct(item.ref_produit);
            const newQuantity = (product.qte_disponible || 0) - (item.quantiteAcheter || 0);
            
            if (newQuantity < 0) {
              throw new Error(`Quantité négative pour ${item.ref_produit}`);
            }
            
            await productService.updateQuantity(item.ref_produit, newQuantity);
            
            return {
              reference: item.ref_produit,
              success: true,
              oldQuantity: product.qte_disponible,
              newQuantity: newQuantity
            };
          } catch (error: any) {
            return {
              reference: item.ref_produit,
              success: false,
              error: error.message
            };
          }
        })
      );
      
      return {
        success: results.every(r => r.success),
        results: results
      };
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur synchronisation stocks",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Vérifier si un produit est dans le panier */
  isProductInCart: (cartItems: CartItem[], ref_produit: string): boolean => {
    return cartItems.some(item => item.ref_produit === ref_produit);
  },

  /** Calculer le montant total d'un item */
  calculateItemAmount: (item: CartItem): number => {
    const price = getProductPrice(item);
    const quantity = item.quantiteAcheter || 0;
    return price * quantity;
  },

  /** Formater un montant pour affichage */
  formatAmount: (amount: number | undefined): string => {
    const value = amount || 0;
    return `€ ${value.toFixed(2)}`;
  }
};

// Fonctions utilitaires pour le panier local (client-side)
export const localCartService = {
  // Ajouter un produit au panier
  addToCart: (currentCart: CartItem[], product: ApiProduct, quantity: number = 1): CartItem[] => {
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
      const cartItem: CartItem = {
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
      return [...currentCart, cartItem];
    }
  },

  // Supprimer du panier
  removeFromCart: (currentCart: CartItem[], ref_produit: string): CartItem[] => {
    return currentCart.filter(item => item.ref_produit !== ref_produit);
  },

  // Mettre à jour la quantité
  updateCartItemQuantity: (currentCart: CartItem[], ref_produit: string, quantity: number): CartItem[] => {
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

  // Vider le panier
  clearCart: (): CartItem[] => {
    return [];
  },

  // Calculer le total
  calculateTotal: (cartItems: CartItem[]): number => {
    return cartItems.reduce((sum, item) => sum + (item.montant || 0), 0);
  },

  // Calculer le nombre total d'articles
  calculateTotalItems: (cartItems: CartItem[]): number => {
    return cartItems.reduce((sum, item) => sum + (item.quantiteAcheter || 0), 0);
  },

  // Vérifier si le panier est vide
  isCartEmpty: (cartItems: CartItem[]): boolean => {
    return cartItems.length === 0;
  }
};

export default cartService;