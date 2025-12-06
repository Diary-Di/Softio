// screens/CartProformaScreen.tsx
import * as Haptics from 'expo-haptics';
import { useCallback, useState, useEffect, useRef } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { cartSalesStyles } from '../styles/NewSalesStyles'; // Utiliser le même style pour l'instant
import { Ionicons } from '@expo/vector-icons';
import { productService, Product as ApiProduct } from '../services/productService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

// Types
type Product = {
  id: string;
  ref_produit: string;
  designation: string;
  prix_actuel: number;
  prix_unitaire?: number;
  qte_disponible: number;
  quantiteDisponible?: number;
  categorie?: string;
  prix_precedent?: number;
  date_mise_a_jour_prix?: string;
  image_url?: string;
};

type ProformaItem = Product & {
  quantiteAcheter: number;
  montant: number;
};

// Cache local pour les produits
const PRODUCT_CACHE_KEY = 'products_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fonction utilitaire pour obtenir le prix
const getProductPrice = (product: Product): number => {
  return product.prix_unitaire || product.prix_actuel || 0;
};

// Fonction utilitaire pour obtenir la quantité
const getProductQuantity = (product: Product): number => {
  return product.quantiteDisponible || product.qte_disponible || 0;
};

// Fonction utilitaire pour formater le prix
const formatPrice = (price: number | undefined): string => {
  if (price === undefined || price === null || isNaN(price)) {
    return '€ 0.00';
  }
  return `€ ${price.toFixed(2)}`;
};

// Fonction pour normaliser un produit API vers le format local
const normalizeProduct = (apiProduct: ApiProduct): Product => {
  return {
    id: apiProduct.ref_produit, // Utiliser la référence comme ID
    ref_produit: apiProduct.ref_produit || '',
    designation: apiProduct.designation || 'Produit sans nom',
    prix_actuel: typeof apiProduct.prix_actuel === 'number' ? apiProduct.prix_actuel : 
                typeof apiProduct.prix_actuel === 'string' ? parseFloat(apiProduct.prix_actuel) : 0,
    prix_unitaire: typeof apiProduct.prix_actuel === 'number' ? apiProduct.prix_actuel : 
                  typeof apiProduct.prix_actuel === 'string' ? parseFloat(apiProduct.prix_actuel) : 0,
    qte_disponible: typeof apiProduct.qte_disponible === 'number' ? apiProduct.qte_disponible :
                   typeof apiProduct.qte_disponible === 'string' ? parseInt(apiProduct.qte_disponible, 10) : 0,
    quantiteDisponible: typeof apiProduct.qte_disponible === 'number' ? apiProduct.qte_disponible :
                       typeof apiProduct.qte_disponible === 'string' ? parseInt(apiProduct.qte_disponible, 10) : 0,
    categorie: apiProduct.categorie,
    prix_precedent: apiProduct.prix_precedent,
    date_mise_a_jour_prix: apiProduct.date_mise_a_jour_prix,
    image_url: apiProduct.image_url
  };
};

export default function CartProformaScreen({ navigation, route }: any) {
  const [proformaItems, setProformaItems] = useState<ProformaItem[]>([]);
  const [reference, setReference] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantityToAdd, setQuantityToAdd] = useState<string>('1');
  const [searchError, setSearchError] = useState<string>('');
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [productsCache, setProductsCache] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const searchTimeoutRef = useRef<any>(null);
  const [isReferenceFocused, setIsReferenceFocused] = useState(false);

  // Charger les données du proforma existant si fourni
  useEffect(() => {
    if (route.params?.proformaRef) {
      loadExistingProforma(route.params.proformaRef);
    }
  }, [route.params?.proformaRef]);

  // Calculer les totaux à partir du panier proforma
  const totalAmount = proformaItems.reduce((sum, item) => sum + (item.montant || 0), 0);
  const totalItems = proformaItems.reduce((sum, item) => sum + (item.quantiteAcheter || 0), 0);

  // Charger le cache au démarrage
  useEffect(() => {
    loadCachedProducts();
    fetchProducts();
  }, []);

  // Charger un proforma existant
  const loadExistingProforma = async (proformaRef: string) => {
    try {
      // Implémentez cette fonction selon votre API proforma
      // const existingProforma = await proformaService.getProforma(proformaRef);
      // setProformaItems(existingProforma.products);
    } catch (error) {
      console.error('Erreur chargement proforma:', error);
      Alert.alert('Erreur', 'Impossible de charger le proforma existant');
    }
  };

  // Charger les produits depuis le cache
  const loadCachedProducts = async () => {
    try {
      const cachedData = await AsyncStorage.getItem(PRODUCT_CACHE_KEY);
      if (cachedData) {
        const { timestamp, products } = JSON.parse(cachedData);
        const now = Date.now();
        
        // Utiliser le cache si moins de 5 minutes
        if (now - timestamp < CACHE_DURATION) {
          setProductsCache(products);
        }
      }
    } catch (error) {
      console.error('Erreur chargement cache:', error);
    }
  };

  // Récupérer tous les produits depuis l'API
  const fetchProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const apiProducts = await productService.getProducts();
      
      // Normaliser et valider les produits
      const normalizedProducts: Product[] = apiProducts
        .map(normalizeProduct)
        .filter((product: Product) => product.ref_produit); // Filtrer les produits sans référence

      setProductsCache(normalizedProducts);
      
      // Mettre à jour le cache
      await AsyncStorage.setItem(PRODUCT_CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        products: normalizedProducts
      }));
    } catch (error: any) {
      console.error('Erreur chargement produits:', error);
      Alert.alert('Erreur', error.message || 'Impossible de charger les produits');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Rechercher un produit par référence avec debounce
  const searchProduct = useCallback(async () => {
    if (!reference.trim()) {
      setSearchError('Veuillez entrer une référence');
      return;
    }

    // Nettoyer le timeout précédent
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setSearchLoading(true);
    setSearchError('');

    // Recherche locale d'abord dans le cache
    const cachedProduct = productsCache.find(
      p => p.ref_produit.toLowerCase() === reference.trim().toLowerCase()
    );

    if (cachedProduct) {
      setSelectedProduct(cachedProduct);
      setSearchLoading(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Keyboard.dismiss();
      return;
    }

    // Si non trouvé dans le cache, recherche API
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const apiProduct = await productService.getProduct(reference.trim());
        
        if (!apiProduct) {
          setSearchError('Produit non trouvé');
          setSelectedProduct(null);
        } else {
          // Normaliser le produit
          const normalizedProduct = normalizeProduct(apiProduct);
          
          // Vérifier que le produit est valide
          if (!normalizedProduct.ref_produit) {
            setSearchError('Référence produit invalide');
            setSelectedProduct(null);
            return;
          }
          
          setSelectedProduct(normalizedProduct);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          
          // Ajouter à la cache
          if (!productsCache.find(p => p.ref_produit === normalizedProduct.ref_produit)) {
            const updatedCache = [...productsCache, normalizedProduct];
            setProductsCache(updatedCache);
            await AsyncStorage.setItem(PRODUCT_CACHE_KEY, JSON.stringify({
              timestamp: Date.now(),
              products: updatedCache
            }));
          }
        }
      } catch (error: any) {
        console.error('Erreur recherche produit:', error);
        if (error.code === 404) {
          setSearchError('Produit non trouvé');
        } else {
          setSearchError(error.message || 'Erreur lors de la recherche');
        }
        setSelectedProduct(null);
      } finally {
        setSearchLoading(false);
        Keyboard.dismiss();
      }
    }, 500);
  }, [reference, productsCache]);

  // Calculer le montant pour l'affichage
  const calculateDisplayAmount = useCallback(() => {
    if (!selectedProduct) return 0;
    
    const price = getProductPrice(selectedProduct);
    const quantity = parseInt(quantityToAdd) || 1;
    
    return price * quantity;
  }, [selectedProduct, quantityToAdd]);

  // Ajouter un produit au proforma
  const addToProforma = useCallback(() => {
    if (!selectedProduct) {
      Alert.alert('Erreur', 'Veuillez rechercher et sélectionner un produit');
      return;
    }

    const qty = parseInt(quantityToAdd) || 1;
    
    if (qty <= 0) {
      Alert.alert('Erreur', 'La quantité doit être supérieure à 0');
      return;
    }

    const availableQuantity = getProductQuantity(selectedProduct);
    
    // Pour un proforma, on peut permettre plus que le stock disponible
    // car c'est une commande future
    if (qty > availableQuantity) {
      Alert.alert(
        'Avertissement', 
        `Attention: Stock insuffisant: ${availableQuantity} unités disponibles.\nVoulez-vous quand même ajouter ce produit au proforma?`,
        [
          { text: 'Annuler', style: 'cancel' },
          { 
            text: 'Ajouter quand même', 
            style: 'default',
            onPress: () => {
              addProductToProforma(selectedProduct, qty);
            }
          }
        ]
      );
      return;
    }

    addProductToProforma(selectedProduct, qty);
  }, [selectedProduct, quantityToAdd]);

  const addProductToProforma = (product: Product, quantity: number) => {
    // Vérifier si le produit existe déjà dans le proforma
    const existingItemIndex = proformaItems.findIndex(item => item.ref_produit === product.ref_produit);
    
    if (existingItemIndex !== -1) {
      const updatedItems = [...proformaItems];
      const newQty = updatedItems[existingItemIndex].quantiteAcheter + quantity;
      
      const price = getProductPrice(product);
      updatedItems[existingItemIndex].quantiteAcheter = newQty;
      updatedItems[existingItemIndex].montant = newQty * price;
      setProformaItems(updatedItems);
    } else {
      const price = getProductPrice(product);
      const proformaItem: ProformaItem = {
        ...product,
        quantiteAcheter: quantity,
        montant: quantity * price,
      };
      setProformaItems([...proformaItems, proformaItem]);
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedProduct(null);
    setReference('');
    setQuantityToAdd('1');
    setSearchError('');
  };

  // Supprimer un article du proforma
  const removeFromProforma = useCallback((productId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setProformaItems(proformaItems.filter(item => item.id !== productId));
  }, [proformaItems]);

  // Modifier la quantité dans le proforma
  const updateProformaQuantity = useCallback((productId: string, newQty: number) => {
    const product = proformaItems.find(item => item.id === productId);
    if (!product) return;

    if (newQty <= 0) {
      removeFromProforma(productId);
      return;
    }

    // Pour un proforma, pas de limite de stock
    const updatedItems = proformaItems.map(item => {
      if (item.id === productId) {
        const price = getProductPrice(item);
        return {
          ...item,
          quantiteAcheter: newQty,
          montant: newQty * price,
        };
      }
      return item;
    });
    
    setProformaItems(updatedItems);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [proformaItems, removeFromProforma]);

  // Naviguer vers l'écran de validation du proforma
  // Dans CartProformaScreen.tsx, assurez-vous que la navigation est correcte
const goToProformaValidation = useCallback(() => {
  if (proformaItems.length === 0) {
    Alert.alert('Proforma vide', 'Ajoutez des produits avant de continuer');
    return;
  }

  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  
  // Navigation vers ProformaValidation
  navigation.navigate('ProformaValidation', {
    proformaItems,
    totalAmount,
    totalItems,
    onProformaCompleted: () => {
      setProformaItems([]);
    }
  });
}, [proformaItems, totalAmount, totalItems, navigation]);

  // Vider complètement le proforma
  const emptyProforma = useCallback(() => {
    if (proformaItems.length === 0) return;
    
    Alert.alert(
      'Vider le proforma',
      'Êtes-vous sûr de vouloir vider votre proforma ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Vider', 
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setProformaItems([]);
          }
        }
      ]
    );
  }, [proformaItems]);

  // Incrémenter/Décrémenter la quantité
  const handleQuantityChange = useCallback((type: 'increment' | 'decrement') => {
    const currentQty = parseInt(quantityToAdd) || 1;
    const newQty = type === 'increment' ? currentQty + 1 : Math.max(1, currentQty - 1);
    setQuantityToAdd(newQty.toString());
  }, [quantityToAdd]);

  // Gérer la soumission du champ de référence
  const handleReferenceSubmit = useCallback(() => {
    if (reference.trim()) {
      searchProduct();
    }
  }, [reference, searchProduct]);

  // Effacer la recherche
  const clearSearch = useCallback(() => {
    setReference('');
    setSelectedProduct(null);
    setSearchError('');
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  }, []);

  // Sauvegarder le proforma comme brouillon
  const saveProformaDraft = useCallback(async () => {
    if (proformaItems.length === 0) {
      Alert.alert('Proforma vide', 'Ajoutez des produits pour pouvoir sauvegarder');
      return;
    }

    try {
      const draftData = {
        items: proformaItems,
        date: new Date().toISOString(),
        totalAmount,
        totalItems
      };

      await AsyncStorage.setItem('proforma_draft', JSON.stringify(draftData));
      Alert.alert('Succès', 'Proforma sauvegardé comme brouillon');
    } catch (error) {
      console.error('Erreur sauvegarde brouillon:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder le brouillon');
    }
  }, [proformaItems, totalAmount, totalItems]);

  // Charger le proforma brouillon
  const loadProformaDraft = useCallback(async () => {
    try {
      const draftData = await AsyncStorage.getItem('proforma_draft');
      if (draftData) {
        const { items } = JSON.parse(draftData);
        Alert.alert(
          'Charger brouillon',
          'Voulez-vous charger le proforma sauvegardé?',
          [
            { text: 'Annuler', style: 'cancel' },
            { 
              text: 'Charger', 
              style: 'default',
              onPress: () => {
                setProformaItems(items);
              }
            }
          ]
        );
      } else {
        Alert.alert('Aucun brouillon', 'Aucun proforma n\'a été sauvegardé comme brouillon');
      }
    } catch (error) {
      console.error('Erreur chargement brouillon:', error);
      Alert.alert('Erreur', 'Impossible de charger le brouillon');
    }
  }, []);

  // Rendu de l'indicateur de chargement des produits
  if (isLoadingProducts) {
    return (
      <SafeAreaView style={cartSalesStyles.safeArea}>
        <View style={[cartSalesStyles.header, { justifyContent: 'center' }]}>
          <Text style={cartSalesStyles.headerTitle}>Chargement...</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={{ marginTop: 16, color: '#8E8E93' }}>Chargement des produits</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={cartSalesStyles.headerTitle}>Nouveau Proforma</Text>
          {proformaItems.length > 0 && (
            <View style={cartSalesStyles.headerBadge}>
              <Text style={cartSalesStyles.headerBadgeText}>{totalItems}</Text>
            </View>
          )}
        </View>

        <View style={cartSalesStyles.headerActions}>
          {proformaItems.length > 0 && (
            <TouchableOpacity
              style={cartSalesStyles.saveDraftButton}
              onPress={saveProformaDraft}
            >
              <Ionicons name="save-outline" size={20} color="#666" />
            </TouchableOpacity>
          )}
          {proformaItems.length > 0 ? (
            <TouchableOpacity
              style={cartSalesStyles.emptyCartButton}
              onPress={emptyProforma}
            >
              <Ionicons name="trash-outline" size={20} color="#666" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={cartSalesStyles.saveDraftButton}
              onPress={loadProformaDraft}
            >
              <Ionicons name="document-text-outline" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
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
                editable={true}
                selectTextOnFocus={true}
                onFocus={() => setIsReferenceFocused(true)}
                onBlur={() => setIsReferenceFocused(false)}
                {...(Platform.OS === 'web' ? {
                  autoCorrect: false,
                  spellCheck: false,
                  autoComplete: 'off' as any,
                } : {})}
              />
              {reference.length > 0 && (
                <TouchableOpacity
                  style={cartSalesStyles.clearButton}
                  onPress={clearSearch}
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
                <ActivityIndicator color="#FFF" size="small" />
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
                  <Text style={cartSalesStyles.productRef}>{selectedProduct.ref_produit}</Text>
                  <Text style={cartSalesStyles.productName}>{selectedProduct.designation}</Text>
                </View>
                <TouchableOpacity
                  onPress={clearSearch}
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
                      {formatPrice(getProductPrice(selectedProduct))}
                    </Text>
                  </View>
                  <View style={cartSalesStyles.productDetailItem}>
                    <Text style={cartSalesStyles.productDetailLabel}>Stock disponible</Text>
                    <Text style={[
                      cartSalesStyles.productDetailValue,
                      { color: getProductQuantity(selectedProduct) > 10 ? '#34C759' : '#FF9500' }
                    ]}>
                      {getProductQuantity(selectedProduct)} unités
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
                        const numValue = value.replace(/[^0-9]/g, '');
                        setQuantityToAdd(numValue || '1');
                      }}
                      keyboardType="number-pad"
                      textAlign="center"
                      editable={true}
                      selectTextOnFocus={true}
                      {...(Platform.OS === 'web' ? {
                        autoCorrect: false,
                        spellCheck: false,
                        autoComplete: 'off' as any,
                      } : {})}
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

                {/* Bouton Ajouter au proforma */}
                <TouchableOpacity
                  style={[cartSalesStyles.addToCartButton, { backgroundColor: '#6B7280' }]}
                  onPress={addToProforma}
                  activeOpacity={0.7}
                >
                  <Ionicons name="document-text-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={cartSalesStyles.addToCartButtonText}>
                    Ajouter au proforma - {formatPrice(calculateDisplayAmount())}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* SECTION PROFORMA */}
        <View style={cartSalesStyles.section}>
          <View style={cartSalesStyles.cartHeader}>
            <Text style={cartSalesStyles.sectionTitle}>PROFORMA</Text>
            {proformaItems.length > 0 && (
              <View style={cartSalesStyles.cartCountBadge}>
                <Text style={cartSalesStyles.cartCountText}>{totalItems} article(s)</Text>
              </View>
            )}
          </View>

          {proformaItems.length === 0 ? (
            <View style={cartSalesStyles.emptyCart}>
              <Ionicons name="document-text-outline" size={64} color="#D1D1D6" />
              <Text style={cartSalesStyles.emptyCartText}>Votre proforma est vide</Text>
              <Text style={cartSalesStyles.emptyCartSubtext}>
                Recherchez des produits pour les ajouter
              </Text>
            </View>
          ) : (
            <>
              {proformaItems.map((item) => (
                <View key={item.id} style={cartSalesStyles.cartItemCard}>
                  <View style={cartSalesStyles.cartItemHeader}>
                    <View>
                      <Text style={cartSalesStyles.cartItemRef}>{item.ref_produit}</Text>
                      <Text style={cartSalesStyles.cartItemName}>{item.designation}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeFromProforma(item.id)}
                      style={cartSalesStyles.cartItemRemove}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>

                  <View style={cartSalesStyles.cartItemDetails}>
                    <View style={cartSalesStyles.cartItemRow}>
                      <Text style={cartSalesStyles.cartItemLabel}>Prix unitaire:</Text>
                      <Text style={cartSalesStyles.cartItemValue}>
                        {formatPrice(getProductPrice(item))}
                      </Text>
                    </View>

                    <View style={cartSalesStyles.cartItemRow}>
                      <Text style={cartSalesStyles.cartItemLabel}>Quantité demandée:</Text>
                      <View style={cartSalesStyles.cartQuantityControls}>
                        <TouchableOpacity
                          style={cartSalesStyles.cartQtyButton}
                          onPress={() => updateProformaQuantity(item.id, item.quantiteAcheter - 1)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons name="remove" size={16} color="#007AFF" />
                        </TouchableOpacity>
                        <Text style={cartSalesStyles.cartQtyValue}>{item.quantiteAcheter}</Text>
                        <TouchableOpacity
                          style={cartSalesStyles.cartQtyButton}
                          onPress={() => updateProformaQuantity(item.id, item.quantiteAcheter + 1)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons name="add" size={16} color="#007AFF" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Indicateur de stock */}
                    <View style={cartSalesStyles.cartItemRow}>
                      <Text style={cartSalesStyles.cartItemLabel}>Stock disponible:</Text>
                      <Text style={[
                        cartSalesStyles.cartItemValue,
                        getProductQuantity(item) >= item.quantiteAcheter ? 
                          { color: '#34C759' } : { color: '#FF9500' }
                      ]}>
                        {getProductQuantity(item)} unités
                        {getProductQuantity(item) < item.quantiteAcheter && ' ⚠️'}
                      </Text>
                    </View>

                    <View style={cartSalesStyles.cartItemRow}>
                      <Text style={cartSalesStyles.cartItemLabel}>Total estimé:</Text>
                      <Text style={cartSalesStyles.cartItemTotal}>{formatPrice(item.montant)}</Text>
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
                  <Text style={cartSalesStyles.totalMainLabel}>MONTANT TOTAL ESTIMÉ</Text>
                  <Text style={cartSalesStyles.totalMainValue}>€ {totalAmount.toFixed(2)}</Text>
                </View>
              </View>

              {/* Note sur les stocks insuffisants */}
              {proformaItems.some(item => getProductQuantity(item) < item.quantiteAcheter) && (
                <View style={cartSalesStyles.warningCard}>
                  <Ionicons name="alert-circle-outline" size={20} color="#FF9500" />
                  <Text style={cartSalesStyles.warningText}>
                    Attention: Certains produits demandent plus que le stock disponible.
                    Ce proforma est une commande future qui nécessitera une réapprovisionnement.
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Footer avec bouton continuer */}
      {proformaItems.length > 0 && (
        <View style={cartSalesStyles.footer}>
          <View style={cartSalesStyles.footerTotal}>
            <Text style={cartSalesStyles.footerTotalLabel}>Total estimé</Text>
            <Text style={cartSalesStyles.footerTotalAmount}>€ {totalAmount.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={[cartSalesStyles.continueButton, { backgroundColor: '#6B7280' }]}
            onPress={goToProformaValidation}
            activeOpacity={0.7}
          >
            <Text style={cartSalesStyles.continueButtonText}>Créer le proforma</Text>
            <Ionicons name="document-text-outline" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}