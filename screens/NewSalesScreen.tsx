import { Picker } from '@react-native-picker/picker';
import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { cartSalesStyles } from '../styles/NewSalesStyles';
import { Ionicons } from '@expo/vector-icons';

// Types
type Product = {
  id: string;
  reference: string;
  designation: string;
  prixUnitaire: number;
  quantiteDisponible: number;
};

type CartItem = Product & {
  quantiteAcheter: number;
  montant: number;
};

// Mock data
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    reference: 'REF001',
    designation: 'Bouquet de Roses',
    prixUnitaire: 25.00,
    quantiteDisponible: 50,
  },
  {
    id: '2',
    reference: 'REF002',
    designation: 'Pain Complet',
    prixUnitaire: 2.50,
    quantiteDisponible: 100,
  },
  {
    id: '3',
    reference: 'REF003',
    designation: 'Laptop Dell XPS 13',
    prixUnitaire: 1299.99,
    quantiteDisponible: 15,
  },
  {
    id: '4',
    reference: 'REF004',
    designation: 'iPhone 14 Pro',
    prixUnitaire: 1199.00,
    quantiteDisponible: 25,
  },
  {
    id: '5',
    reference: 'REF005',
    designation: 'Samsung Galaxy S23',
    prixUnitaire: 899.00,
    quantiteDisponible: 30,
  },
];

export default function CartSalesScreen({ navigation }: any) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [reference, setReference] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantityToAdd, setQuantityToAdd] = useState<string>('1');
  const [searchError, setSearchError] = useState<string>('');
  const [searchLoading, setSearchLoading] = useState<boolean>(false);

  // Rechercher un produit par référence
  const searchProduct = useCallback(() => {
    if (!reference.trim()) {
      setSearchError('Veuillez entrer une référence');
      return;
    }

    setSearchLoading(true);
    setSearchError('');

    // Simuler un délai de recherche
    setTimeout(() => {
      const product = MOCK_PRODUCTS.find(
        p => p.reference.toLowerCase() === reference.trim().toLowerCase()
      );
      
      if (!product) {
        setSearchError('Produit non trouvé');
        setSelectedProduct(null);
      } else {
        setSelectedProduct(product);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setSearchLoading(false);
      Keyboard.dismiss();
    }, 500);
  }, [reference]);

  // Ajouter un produit au panier
  const addToCart = useCallback(() => {
    if (!selectedProduct) {
      Alert.alert('Erreur', 'Veuillez rechercher et sélectionner un produit');
      return;
    }

    const qty = parseInt(quantityToAdd) || 1;
    
    if (qty <= 0) {
      Alert.alert('Erreur', 'La quantité doit être supérieure à 0');
      return;
    }

    if (qty > selectedProduct.quantiteDisponible) {
      Alert.alert('Erreur', `Stock insuffisant: ${selectedProduct.quantiteDisponible} unités disponibles`);
      return;
    }

    // Vérifier si le produit existe déjà dans le panier
    const existingItemIndex = cart.findIndex(item => item.id === selectedProduct.id);
    
    if (existingItemIndex !== -1) {
      const updatedCart = [...cart];
      const newQty = updatedCart[existingItemIndex].quantiteAcheter + qty;
      
      if (newQty > selectedProduct.quantiteDisponible) {
        Alert.alert('Erreur', `Maximum ${selectedProduct.quantiteDisponible} unités disponibles`);
        return;
      }
      
      updatedCart[existingItemIndex].quantiteAcheter = newQty;
      updatedCart[existingItemIndex].montant = newQty * selectedProduct.prixUnitaire;
      setCart(updatedCart);
    } else {
      const cartItem: CartItem = {
        ...selectedProduct,
        quantiteAcheter: qty,
        montant: qty * selectedProduct.prixUnitaire,
      };
      setCart([...cart, cartItem]);
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedProduct(null);
    setReference('');
    setQuantityToAdd('1');
    setSearchError('');
  }, [selectedProduct, quantityToAdd, cart]);

  // Supprimer un article du panier
  const removeFromCart = useCallback((productId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCart(cart.filter(item => item.id !== productId));
  }, [cart]);

  // Modifier la quantité dans le panier
  const updateCartQuantity = useCallback((productId: string, newQty: number) => {
    const product = cart.find(item => item.id === productId);
    if (!product) return;

    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    const originalProduct = MOCK_PRODUCTS.find(p => p.id === productId);
    if (!originalProduct) return;

    if (newQty > originalProduct.quantiteDisponible) {
      Alert.alert('Erreur', `Maximum ${originalProduct.quantiteDisponible} unités disponibles`);
      return;
    }

    const updatedCart = cart.map(item => {
      if (item.id === productId) {
        return {
          ...item,
          quantiteAcheter: newQty,
          montant: newQty * item.prixUnitaire,
        };
      }
      return item;
    });
    
    setCart(updatedCart);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [cart, removeFromCart]);

  // Calculer le total
  const totalAmount = cart.reduce((sum, item) => sum + item.montant, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantiteAcheter, 0);

  // Naviguer vers l'écran de validation
  const goToValidation = useCallback(() => {
    if (cart.length === 0) {
      Alert.alert('Panier vide', 'Ajoutez des produits avant de continuer');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    navigation.navigate('CartValidation', {
      cart,
      totalAmount,
      totalItems,
    });
  }, [cart, totalAmount, totalItems, navigation]);

  // Incrémenter/Décrémenter la quantité
  const handleQuantityChange = useCallback((type: 'increment' | 'decrement') => {
    const currentQty = parseInt(quantityToAdd) || 1;
    const newQty = type === 'increment' ? currentQty + 1 : Math.max(1, currentQty - 1);
    setQuantityToAdd(newQty.toString());
  }, [quantityToAdd]);

  // Gérer la soumission du champ de référence (touche Entrée)
  const handleReferenceSubmit = useCallback(() => {
    if (reference.trim()) {
      searchProduct();
    }
  }, [reference, searchProduct]);

  // Focus sur le champ de référence
  const [isReferenceFocused, setIsReferenceFocused] = useState(false);

  return (
    <SafeAreaView style={cartSalesStyles.safeArea}>
      {/* Header */}
      <View style={cartSalesStyles.header}>
        <TouchableOpacity
          style={cartSalesStyles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>

        <View style={cartSalesStyles.headerTitleContainer}>
          <Text style={cartSalesStyles.headerTitle}>Nouvelle Vente</Text>
          {cart.length > 0 && (
            <View style={cartSalesStyles.headerBadge}>
              <Text style={cartSalesStyles.headerBadgeText}>{totalItems}</Text>
            </View>
          )}
        </View>

        {cart.length > 0 ? (
          <TouchableOpacity
            style={cartSalesStyles.emptyCartButton}
            onPress={() => setCart([])}
          >
            <Ionicons name="trash-outline" size={20} color="#666" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <ScrollView
        style={cartSalesStyles.container}
        contentContainerStyle={cartSalesStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* SECTION RECHERCHE PRODUIT */}
        <View style={cartSalesStyles.section}>
          <Text style={cartSalesStyles.sectionTitle}>AJOUTER UN PRODUIT</Text>
          
          {/* Zone de recherche */}
          <View style={cartSalesStyles.searchContainer}>
            <View style={[
              cartSalesStyles.searchInputContainer,
              isReferenceFocused && cartSalesStyles.searchInputContainerFocused
            ]}>
              <Ionicons name="search" size={20} color="#999" style={cartSalesStyles.searchIcon} />
              <TextInput
                style={cartSalesStyles.searchInput}
                value={reference}
                onChangeText={(text) => {
                  setReference(text);
                  if (selectedProduct) setSelectedProduct(null);
                  if (searchError) setSearchError('');
                }}
                placeholder="Entrer la référence du produit"
                placeholderTextColor="#999"
                onSubmitEditing={handleReferenceSubmit}
                autoCapitalize="characters"
                returnKeyType="search"
                editable={true} // S'assurer que c'est éditable
                selectTextOnFocus={true} // Sélectionner tout le texte au focus
                onFocus={() => setIsReferenceFocused(true)}
                onBlur={() => setIsReferenceFocused(false)}
                // Props spécifiques pour le Web
                {...(Platform.OS === 'web' && {
                  // Ces props aident à résoudre les problèmes d'édition sur le Web
                  disableFullscreenUI: true,
                  accessibilityRole: 'text',
                  tabIndex: 0,
                })}
              />
              {reference.length > 0 && (
                <TouchableOpacity
                  style={cartSalesStyles.clearButton}
                  onPress={() => {
                    setReference('');
                    setSelectedProduct(null);
                    setSearchError('');
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>
            
            <TouchableOpacity
              style={[
                cartSalesStyles.searchButton,
                (!reference.trim() || searchLoading) && cartSalesStyles.searchButtonDisabled
              ]}
              onPress={searchProduct}
              disabled={!reference.trim() || searchLoading}
              activeOpacity={0.7}
            >
              {searchLoading ? (
                <Ionicons name="reload" size={20} color="#FFF" />
              ) : (
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>

          {searchError ? (
            <View style={cartSalesStyles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#FF3B30" />
              <Text style={cartSalesStyles.errorText}>{searchError}</Text>
            </View>
          ) : null}

          {/* Affichage du produit trouvé */}
          {selectedProduct && (
            <View style={cartSalesStyles.productCard}>
              <View style={cartSalesStyles.productHeader}>
                <View>
                  <Text style={cartSalesStyles.productRef}>{selectedProduct.reference}</Text>
                  <Text style={cartSalesStyles.productName}>{selectedProduct.designation}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedProduct(null);
                    setReference('');
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={cartSalesStyles.productDetails}>
                <View style={cartSalesStyles.productDetailRow}>
                  <View style={cartSalesStyles.productDetailItem}>
                    <Text style={cartSalesStyles.productDetailLabel}>Prix unitaire</Text>
                    <Text style={cartSalesStyles.productDetailValue}>
                      € {selectedProduct.prixUnitaire.toFixed(2)}
                    </Text>
                  </View>
                  <View style={cartSalesStyles.productDetailItem}>
                    <Text style={cartSalesStyles.productDetailLabel}>Stock disponible</Text>
                    <Text style={[
                      cartSalesStyles.productDetailValue,
                      { color: selectedProduct.quantiteDisponible > 10 ? '#34C759' : '#FF9500' }
                    ]}>
                      {selectedProduct.quantiteDisponible} unités
                    </Text>
                  </View>
                </View>

                {/* Contrôle de quantité */}
                <View style={cartSalesStyles.quantitySection}>
                  <Text style={cartSalesStyles.quantityLabel}>Quantité</Text>
                  <View style={cartSalesStyles.quantityControls}>
                    <TouchableOpacity
                      style={cartSalesStyles.quantityButton}
                      onPress={() => handleQuantityChange('decrement')}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="remove" size={20} color="#007AFF" />
                    </TouchableOpacity>
                    
                    <TextInput
                      style={cartSalesStyles.quantityInput}
                      value={quantityToAdd}
                      onChangeText={(value) => {
                        // Permettre uniquement des nombres
                        const numValue = value.replace(/[^0-9]/g, '');
                        setQuantityToAdd(numValue || '1');
                      }}
                      keyboardType="number-pad"
                      textAlign="center"
                      editable={true}
                      selectTextOnFocus={true}
                      {...(Platform.OS === 'web' && {
                        disableFullscreenUI: true,
                        accessibilityRole: 'text',
                        tabIndex: 0,
                      })}
                    />
                    
                    <TouchableOpacity
                      style={cartSalesStyles.quantityButton}
                      onPress={() => handleQuantityChange('increment')}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="add" size={20} color="#007AFF" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Bouton Ajouter au panier */}
                <TouchableOpacity
                  style={cartSalesStyles.addToCartButton}
                  onPress={addToCart}
                  activeOpacity={0.7}
                >
                  <Ionicons name="cart" size={20} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={cartSalesStyles.addToCartButtonText}>
                    Ajouter au panier - € {(selectedProduct.prixUnitaire * (parseInt(quantityToAdd) || 1)).toFixed(2)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* SECTION PANIER */}
        <View style={cartSalesStyles.section}>
          <View style={cartSalesStyles.cartHeader}>
            <Text style={cartSalesStyles.sectionTitle}>PANIER</Text>
            {cart.length > 0 && (
              <View style={cartSalesStyles.cartCountBadge}>
                <Text style={cartSalesStyles.cartCountText}>{totalItems} article(s)</Text>
              </View>
            )}
          </View>

          {cart.length === 0 ? (
            <View style={cartSalesStyles.emptyCart}>
              <Ionicons name="cart-outline" size={64} color="#D1D1D6" />
              <Text style={cartSalesStyles.emptyCartText}>Votre panier est vide</Text>
              <Text style={cartSalesStyles.emptyCartSubtext}>
                Recherchez des produits pour les ajouter
              </Text>
            </View>
          ) : (
            <>
              {cart.map((item) => (
                <View key={item.id} style={cartSalesStyles.cartItemCard}>
                  <View style={cartSalesStyles.cartItemHeader}>
                    <View>
                      <Text style={cartSalesStyles.cartItemRef}>{item.reference}</Text>
                      <Text style={cartSalesStyles.cartItemName}>{item.designation}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeFromCart(item.id)}
                      style={cartSalesStyles.cartItemRemove}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>

                  <View style={cartSalesStyles.cartItemDetails}>
                    <View style={cartSalesStyles.cartItemRow}>
                      <Text style={cartSalesStyles.cartItemLabel}>Prix unitaire:</Text>
                      <Text style={cartSalesStyles.cartItemValue}>€ {item.prixUnitaire.toFixed(2)}</Text>
                    </View>

                    <View style={cartSalesStyles.cartItemRow}>
                      <Text style={cartSalesStyles.cartItemLabel}>Quantité:</Text>
                      <View style={cartSalesStyles.cartQuantityControls}>
                        <TouchableOpacity
                          style={cartSalesStyles.cartQtyButton}
                          onPress={() => updateCartQuantity(item.id, item.quantiteAcheter - 1)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons name="remove" size={16} color="#007AFF" />
                        </TouchableOpacity>
                        <Text style={cartSalesStyles.cartQtyValue}>{item.quantiteAcheter}</Text>
                        <TouchableOpacity
                          style={cartSalesStyles.cartQtyButton}
                          onPress={() => updateCartQuantity(item.id, item.quantiteAcheter + 1)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons name="add" size={16} color="#007AFF" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={cartSalesStyles.cartItemRow}>
                      <Text style={cartSalesStyles.cartItemLabel}>Total:</Text>
                      <Text style={cartSalesStyles.cartItemTotal}>€ {item.montant.toFixed(2)}</Text>
                    </View>
                  </View>
                </View>
              ))}

              {/* Total général */}
              <View style={cartSalesStyles.totalCard}>
                <View style={cartSalesStyles.totalRow}>
                  <Text style={cartSalesStyles.totalLabel}>Total articles</Text>
                  <Text style={cartSalesStyles.totalValue}>{totalItems}</Text>
                </View>
                <View style={cartSalesStyles.totalSeparator} />
                <View style={cartSalesStyles.totalRow}>
                  <Text style={cartSalesStyles.totalMainLabel}>TOTAL À PAYER</Text>
                  <Text style={cartSalesStyles.totalMainValue}>€ {totalAmount.toFixed(2)}</Text>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Footer avec bouton continuer */}
      {cart.length > 0 && (
        <View style={cartSalesStyles.footer}>
          <View style={cartSalesStyles.footerTotal}>
            <Text style={cartSalesStyles.footerTotalLabel}>Total</Text>
            <Text style={cartSalesStyles.footerTotalAmount}>€ {totalAmount.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={cartSalesStyles.continueButton}
            onPress={goToValidation}
            activeOpacity={0.7}
          >
            <Text style={cartSalesStyles.continueButtonText}>Continuer</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}