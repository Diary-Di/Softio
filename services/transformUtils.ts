// services/transformUtils.ts
import { Product } from "./productService";

export interface CartItem {
  id: string;
  reference: string;
  designation: string;
  prixUnitaire: number;
  quantiteDisponible: number;
  quantiteAcheter: number;
  montant: number;
}

export const transformProductToCartItem = (
  product: Product, 
  quantity: number = 1
): CartItem => {
  return {
    id: product.ref_produit, // Utiliser la référence comme ID
    reference: product.ref_produit,
    designation: product.designation,
    prixUnitaire: product.prix_actuel || 0,
    quantiteDisponible: product.qte_disponible || 0,
    quantiteAcheter: quantity,
    montant: (product.prix_actuel || 0) * quantity
  };
};

export const transformCartItemToOrder = (cartItem: CartItem) => {
  return {
    ref_produit: cartItem.reference,
    designation: cartItem.designation,
    prix_actuel: cartItem.prixUnitaire,
    quantite_achetee: cartItem.quantiteAcheter,
    montant_total: cartItem.montant
  };
};