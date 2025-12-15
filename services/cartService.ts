// services/cartService.ts
import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api";
import { Product as ApiProduct, productService } from "./productService";

const SALE_URL = `${API_BASE_URL}${API_ENDPOINTS.SALES}`;

// Types de paiement cohérents avec l'écran
export type PaymentMethod = 'cash' | 'card' | 'mobile' | 'transfer' | 'check';

// Interfaces basées sur votre base de données
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

// Interface pour la vente selon votre schéma de base de données
export interface DatabaseSale {
  ref_facture: string;
  ref_produit: string; // Format: "pdt1, pdt2, ..., pdtn"
  qte_vendu: string;   // Format: "qte1, qte2, ..., qten"
  identifiant: number;
  remise: string;      // Peut être "%" ou "ar"
  mode_paiement: PaymentMethod;
  montant_a_payer: number; // ← Nouveau champ ajouté
  montant_paye: number;
  condition: string;
  montant_total: number;
  date_vente: string;
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
  
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

// Fonction utilitaire pour obtenir le prix
export const getProductPrice = (item: CartItem): number => {
  return item.prix_unitaire || item.prix_actuel || 0;
};

// Fonction utilitaire pour obtenir la quantité disponible
export const getAvailableQuantity = (item: CartItem): number => {
  return item.quantiteDisponible || item.qte_disponible || 0;
};

export interface SaleCreationData {
  cartItems: CartItem[];
  clientId?: number;
  paymentInfo: {
    method: PaymentMethod;
    amount_paid: number;
    discount_amount: number;
    discount_type: 'percent' | 'amount';
    condition: string;
    change_amount?: number;
    remaining_amount?: number;
    montant_a_payer: number; // ← Nouveau champ ajouté
  };
  notes?: string;
  subtotal: number;
  net_amount: number;
}

export const formatCartForDatabase = (data: SaleCreationData): any => {
  const ref_facture = generateInvoiceRef();
  const ref_produit = data.cartItems.map(item => item.ref_produit).join(', ');
  const qte_vendu = data.cartItems.map(item => item.quantiteAcheter).join(', ');
  
  // Retourner les données minimales
  return {
    ref_facture,
    ref_produit,
    qte_vendu,
    identifiant: data.clientId || '',
    remise: data.paymentInfo.discount_type === 'percent' 
      ? `${data.paymentInfo.discount_amount}%`
      : `ar${data.paymentInfo.discount_amount.toFixed(2)}`,
    mode_paiement: data.paymentInfo.method,
    montant_a_payer: data.paymentInfo.montant_a_payer, // ← Nouveau champ ajouté
    montant_paye: data.paymentInfo.amount_paid,
    condition_paiement: data.paymentInfo.condition || 'Payé comptant'
  };
};

export const cartService = {
  /** Créer une vente dans la base de données */
  createSale: async (data: SaleCreationData) => {
    try {
      const dbSale = formatCartForDatabase(data);
      console.log('Envoi vente à la base de données:', dbSale);
      
      const response = await axios.post<ApiResponse<DatabaseSale>>(SALE_URL, dbSale);
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Erreur création vente",
        code: error.response?.status || 500,
        data: error.response?.data
      };
    }
  },

  /** Créer une vente (version simplifiée pour compatibilité) */
  createSaleSimple: async (cartItems: CartItem[], clientId: number, notes?: string) => {
    try {
      const subtotal = cartItems.reduce((sum, item) => sum + (item.montant || 0), 0);
      const saleData: SaleCreationData = {
        cartItems,
        clientId,
        paymentInfo: {
          method: 'cash',
          amount_paid: subtotal,
          discount_amount: 0,
          discount_type: 'amount',
          condition: 'Payé comptant',
          change_amount: 0,
          montant_a_payer: subtotal // ← Nouveau champ ajouté
        },
        notes,
        subtotal,
        net_amount: subtotal
      };
      
      return await cartService.createSale(saleData);
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
    identifiant?: number;
    mode_paiement?: PaymentMethod;
    limit?: number;
    page?: number;
  }) => {
    try {
      const response = await axios.get<ApiResponse<DatabaseSale[]>>(SALE_URL, {
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
  getSale: async (ref_facture: string) => {
    try {
      const response = await axios.get<ApiResponse<DatabaseSale>>(`${SALE_URL}/${ref_facture}`);
      return response.data.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Vente introuvable",
        code: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /** Rechercher des ventes */
  searchSales: async (searchTerm: string) => {
    try {
      const response = await axios.get<ApiResponse<DatabaseSale[]>>(`${SALE_URL}/search`, {
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
  getSalesByClient: async (identifiant: string) => {
    try {
      const response = await axios.get<ApiResponse<DatabaseSale[]>>(`${SALE_URL}/client/${identifiant}`);
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
  calculateCartSummaryWithDiscount: (
    cartItems: CartItem[], 
    discountAmount: number, 
    discountType: 'percent' | 'amount'
  ): CartSummary => {
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
  generateReceipt: async (ref_facture: string) => {
    try {
      const response = await axios.get<ApiResponse<{ pdf_url: string }>>(`${SALE_URL}/${ref_facture}/receipt`, {
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
      const response = await axios.get<ApiResponse<DatabaseSale[]>>(`${SALE_URL}/today`);
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
    return `ar ${value.toFixed(2)}`;
  },

  /** Obtenir le nom de la méthode de paiement */
  getPaymentMethodName: (method: PaymentMethod): string => {
    const methods: Record<PaymentMethod, string> = {
      'cash': 'Espèces',
      'card': 'Carte bancaire',
      'mobile': 'Mobile',
      'transfer': 'Virement',
      'check': 'Chèque'
    };
    return methods[method] || 'Non spécifié';
  },

  /** Parser une vente de la base de données pour l'affichage */
  parseDatabaseSale: (dbSale: DatabaseSale): {
    ref_facture: string;
    identifiant: number;
    products: Array<{
      ref_produit: string;
      qte_vendu: number;
    }>;
    remise: string;
    mode_paiement: PaymentMethod;
    montant_a_payer: number; // ← Nouveau champ ajouté
    montant_paye: number;
    condition: string;
    montant_total: number;
    date_vente: string;
  } => {
    // Parser les références produits
    const productRefs = dbSale.ref_produit.split(', ').map(ref => ref.trim());
    
    // Parser les quantités vendues
    const quantities = dbSale.qte_vendu.split(', ').map(qte => parseInt(qte.trim()));
    
    // Créer le tableau de produits
    const products = productRefs.map((ref, index) => ({
      ref_produit: ref,
      qte_vendu: quantities[index] || 0
    }));
    
    return {
      ref_facture: dbSale.ref_facture,
      identifiant: dbSale.identifiant,
      products,
      remise: dbSale.remise,
      mode_paiement: dbSale.mode_paiement,
      montant_a_payer: dbSale.montant_a_payer, // ← Nouveau champ ajouté
      montant_paye: dbSale.montant_paye,
      condition: dbSale.condition,
      montant_total: dbSale.montant_total,
      date_vente: dbSale.date_vente
    };
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
  },

  // Calculer le montant net avec remise
  calculateNetAmount: (subtotal: number, discountAmount: number, discountType: 'percent' | 'amount'): number => {
    let discount = discountAmount;
    if (discountType === 'percent') {
      discount = subtotal * (discountAmount / 100);
    }
    return Math.max(0, subtotal - discount);
  },

  // Générer la référence de facture
  generateInvoiceRef
};

export default cartService;