import { Picker } from '@react-native-picker/picker';
import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { cartSalesStyles } from '../styles/NewSalesStyles';

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
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantityToAdd, setQuantityToAdd] = useState<string>('1');

  // Ajouter un produit au panier
  const addToCart = useCallback(() => {
    if (!selectedProductId) {
      Alert.alert('Erreur', 'Veuillez sélectionner un produit');
      return;
    }

    const product = MOCK_PRODUCTS.find(p => p.id === selectedProductId);
    if (!product) return;

    const qty = parseInt(quantityToAdd) || 1;
    
    if (qty <= 0) {
      Alert.alert('Erreur', 'La quantité doit être supérieure à 0');
      return;
    }

    if (qty > product.quantiteDisponible) {
      Alert.alert('Erreur', `Seulement ${product.quantiteDisponible} unités disponibles`);
      return;
    }

    // Vérifier si le produit existe déjà dans le panier
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingItemIndex !== -1) {
      const updatedCart = [...cart];
      const newQty = updatedCart[existingItemIndex].quantiteAcheter + qty;
      
      if (newQty > product.quantiteDisponible) {
        Alert.alert('Erreur', `Maximum ${product.quantiteDisponible} unités disponibles`);
        return;
      }
      
      updatedCart[existingItemIndex].quantiteAcheter = newQty;
      updatedCart[existingItemIndex].montant = newQty * product.prixUnitaire;
      setCart(updatedCart);
    } else {
      const cartItem: CartItem = {
        ...product,
        quantiteAcheter: qty,
        montant: qty * product.prixUnitaire,
      };
      setCart([...cart, cartItem]);
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedProductId('');
    setQuantityToAdd('1');
  }, [selectedProductId, quantityToAdd, cart]);

  // Supprimer un article du panier
  const removeFromCart = useCallback((productId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCart(cart.filter(item => item.id !== productId));
  }, [cart]);

  // Modifier la quantité dans le panier
  const updateCartQuantity = useCallback((productId: string, newQty: number) => {
    const product = MOCK_PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    if (newQty > product.quantiteDisponible) {
      Alert.alert('Erreur', `Maximum ${product.quantiteDisponible} unités disponibles`);
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
    
    // Naviguer vers CartValidationScreen avec les données du panier
    navigation.navigate('CartValidation', {
      cart,
      totalAmount,
      totalItems,
    });
  }, [cart, totalAmount, totalItems, navigation]);

  return (
    <SafeAreaView style={cartSalesStyles.safeArea}>
      {/* Header */}
      <View style={cartSalesStyles.header}>
        <TouchableOpacity
          style={cartSalesStyles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={cartSalesStyles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>

        <Text style={cartSalesStyles.headerTitle}>Nouvelle Vente</Text>

        {cart.length > 0 && (
          <View style={cartSalesStyles.headerBadge}>
            <Text style={cartSalesStyles.headerBadgeText}>{totalItems}</Text>
          </View>
        )}
        {cart.length === 0 && <View style={{ width: 40 }} />}
      </View>

      <ScrollView
        style={cartSalesStyles.container}
        contentContainerStyle={cartSalesStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* SECTION AJOUTER PRODUIT */}
        <View style={cartSalesStyles.section}>
          <Text style={cartSalesStyles.sectionTitle}>AJOUTER AU PANIER</Text>
          
          <View style={cartSalesStyles.picker}>
            <Picker
              selectedValue={selectedProductId}
              onValueChange={setSelectedProductId}
              style={Platform.OS === 'ios' ? cartSalesStyles.pickerIOS : cartSalesStyles.pickerAndroid}
            >
              <Picker.Item label="Sélectionnez un produit" value="" />
              {MOCK_PRODUCTS.map((product) => (
                <Picker.Item 
                  key={product.id} 
                  label={`${product.reference} - ${product.designation} (€${product.prixUnitaire})`}
                  value={product.id} 
                />
              ))}
            </Picker>
          </View>

          {selectedProductId && (
            <>
              <View style={cartSalesStyles.productDetail}>
                {(() => {
                  const product = MOCK_PRODUCTS.find(p => p.id === selectedProductId);
                  if (!product) return null;
                  return (
                    <>
                      <View style={cartSalesStyles.productRow}>
                        <Text style={cartSalesStyles.productLabel}>Référence:</Text>
                        <Text style={cartSalesStyles.productValue}>{product.reference}</Text>
                      </View>
                      <View style={cartSalesStyles.productRow}>
                        <Text style={cartSalesStyles.productLabel}>Prix unitaire:</Text>
                        <Text style={cartSalesStyles.productValue}>€ {product.prixUnitaire.toFixed(2)}</Text>
                      </View>
                      <View style={cartSalesStyles.productRow}>
                        <Text style={cartSalesStyles.productLabel}>Stock disponible:</Text>
                        <Text style={[cartSalesStyles.productValue, { color: product.quantiteDisponible > 10 ? '#10b981' : '#f59e0b' }]}>
                          {product.quantiteDisponible} unités
                        </Text>
                      </View>
                    </>
                  );
                })()}
              </View>

              <View style={cartSalesStyles.addToCartRow}>
                <View style={cartSalesStyles.quantityInput}>
                  <Text style={cartSalesStyles.label}>Quantité</Text>
                  <TextInput
                    style={cartSalesStyles.textInput}
                    value={quantityToAdd}
                    onChangeText={(value) => setQuantityToAdd(value.replace(/[^0-9]/g, ''))}
                    placeholder="1"
                    keyboardType="number-pad"
                  />
                </View>

                <TouchableOpacity
                  style={cartSalesStyles.addButton}
                  onPress={addToCart}
                >
                  <Text style={cartSalesStyles.addButtonText}>Ajouter</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* PANIER */}
        <View style={cartSalesStyles.section}>
          <View style={cartSalesStyles.cartHeader}>
            <Text style={cartSalesStyles.sectionTitle}>PANIER</Text>
            {cart.length > 0 && (
              <View style={cartSalesStyles.badge}>
                <Text style={cartSalesStyles.badgeText}>{totalItems}</Text>
              </View>
            )}
          </View>

          {cart.length === 0 ? (
            <View style={cartSalesStyles.emptyCart}>
              <Text style={cartSalesStyles.emptyCartIcon}>🛒</Text>
              <Text style={cartSalesStyles.emptyCartText}>Le panier est vide</Text>
              <Text style={cartSalesStyles.emptyCartSubtext}>
                Sélectionnez des produits pour commencer
              </Text>
            </View>
          ) : (
            <>
              {cart.map((item) => (
                <View key={item.id} style={cartSalesStyles.cartItem}>
                  <View style={cartSalesStyles.cartItemHeader}>
                    <View style={cartSalesStyles.cartItemTitle}>
                      <Text style={cartSalesStyles.cartItemRef}>{item.reference}</Text>
                      <Text style={cartSalesStyles.cartItemName}>{item.designation}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeFromCart(item.id)}
                      style={cartSalesStyles.removeButton}
                    >
                      <Text style={cartSalesStyles.removeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={cartSalesStyles.cartItemDetails}>
                    <View style={cartSalesStyles.cartItemRow}>
                      <Text style={cartSalesStyles.cartItemLabel}>Prix unitaire:</Text>
                      <Text style={cartSalesStyles.cartItemValue}>€ {item.prixUnitaire.toFixed(2)}</Text>
                    </View>
                    
                    <View style={cartSalesStyles.cartItemRow}>
                      <Text style={cartSalesStyles.cartItemLabel}>Disponible:</Text>
                      <Text style={cartSalesStyles.cartItemValue}>{item.quantiteDisponible} unités</Text>
                    </View>

                    <View style={cartSalesStyles.cartItemRow}>
                      <Text style={cartSalesStyles.cartItemLabel}>Quantité:</Text>
                      <View style={cartSalesStyles.quantityControls}>
                        <TouchableOpacity
                          style={cartSalesStyles.qtyButton}
                          onPress={() => updateCartQuantity(item.id, item.quantiteAcheter - 1)}
                        >
                          <Text style={cartSalesStyles.qtyButtonText}>−</Text>
                        </TouchableOpacity>
                        <Text style={cartSalesStyles.qtyValue}>{item.quantiteAcheter}</Text>
                        <TouchableOpacity
                          style={cartSalesStyles.qtyButton}
                          onPress={() => updateCartQuantity(item.id, item.quantiteAcheter + 1)}
                        >
                          <Text style={cartSalesStyles.qtyButtonText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={[cartSalesStyles.cartItemRow, cartSalesStyles.totalRow]}>
                      <Text style={cartSalesStyles.cartItemTotal}>Montant:</Text>
                      <Text style={cartSalesStyles.cartItemTotalValue}>€ {item.montant.toFixed(2)}</Text>
                    </View>
                  </View>
                </View>
              ))}

              {/* Total général */}
              <View style={cartSalesStyles.totalCard}>
                <View style={cartSalesStyles.totalRow}>
                  <Text style={cartSalesStyles.totalLabel}>Total articles:</Text>
                  <Text style={cartSalesStyles.totalValue}>{totalItems}</Text>
                </View>
                <View style={[cartSalesStyles.totalRow, { marginTop: 8 }]}>
                  <Text style={cartSalesStyles.totalLabelMain}>TOTAL:</Text>
                  <Text style={cartSalesStyles.totalValueMain}>€ {totalAmount.toFixed(2)}</Text>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Footer avec bouton continuer */}
      {cart.length > 0 && (
        <View style={cartSalesStyles.footer}>
          <TouchableOpacity
            style={cartSalesStyles.continueButton}
            onPress={goToValidation}
          >
            <View style={cartSalesStyles.continueButtonContent}>
              <View>
                <Text style={cartSalesStyles.continueButtonLabel}>Continuer</Text>
                <Text style={cartSalesStyles.continueButtonSubtext}>{totalItems} article(s)</Text>
              </View>
              <Text style={cartSalesStyles.continueButtonPrice}>€ {totalAmount.toFixed(2)}</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}