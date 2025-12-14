/******************************************************************
 *  ProductScreen.tsx  –  Liste des produits avec filtres de stock
 ******************************************************************/
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react'; // Ajout de useRef
import {
    ActivityIndicator,
    Alert,
    Animated,
    FlatList,
    Image,
    LayoutAnimation,
    Platform,
    Pressable,
    RefreshControl,
    Text,
    TextInput,
    TouchableOpacity,
    UIManager,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Product as ApiProduct, productService } from '../services/productService';
import { productScreenStyles as styles } from '../styles/productScreenStyles';

/* --------------------  TYPES  -------------------- */
type Product = {
  ref_produit: string;
  categorie: string;
  designation: string;
  prix_actuel: number;
  qte_disponible: number;
  image_url?: string;
};

type StockFilter = 'all' | 'in-stock' | 'low-stock' | 'out-of-stock';

// Define navigation types
export type ProductStackParamList = {
  ProductList: undefined;
  CreateProduct: undefined;
  EditProduct: { product: Product };
};

type ProductScreenNavigationProp = StackNavigationProp<
  ProductStackParamList,
  'ProductList'
>;

type Props = {
  navigation: ProductScreenNavigationProp;
};

/* --------------------  COMPONENT  -------------------- */
export default function ProductScreen({ navigation }: Props) {
  if (Platform.OS === "android") {
    UIManager.setLayoutAnimationEnabledExperimental?.(true);
  }

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]); // Nouveau: produits affichés
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [searchFocused, setSearchFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  // Références pour les animations
  const fabAnimation = useRef(new Animated.Value(1)).current;
  const isScrolling = useRef(false);
  const scrollTimeout = useRef<any>(null); // Changé de NodeJS.Timeout à any
  const flatListRef = useRef<FlatList>(null);

  const FAB_SAFE_AREA = 88; // 56 (hauteur classique du FAB) + 16*2 (marges)

  const fetchProducts = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) {
      setLoading(true);
      setError(null);
    }
    
    try {
      console.log('🔍 Chargement des produits...');
      const data = await productService.getProducts();
      
      if (!Array.isArray(data)) {
        console.error('❌ Les données ne sont pas un tableau:', data);
        throw new Error('Format de données invalide');
      }
      
      console.log('📊 Nombre de produits:', data.length);
      
      // Nettoyer et valider les données
      const cleanedData = data.map((product: ApiProduct) => {
        const ref_produit = product.ref_produit || 'REF-000';
        const categorie = product.categorie || 'Non catégorisé';
        const designation = product.designation || 'Produit sans nom';
        
        let prix_actuel = 0;
        if (typeof product.prix_actuel === 'number') {
          prix_actuel = product.prix_actuel;
        } else if (typeof product.prix_actuel === 'string') {
          prix_actuel = parseFloat(product.prix_actuel);
        }
        if (isNaN(prix_actuel)) prix_actuel = 0;
        
        let qte_disponible = 0;
        if (typeof product.qte_disponible === 'number') {
          qte_disponible = product.qte_disponible;
        } else if (typeof product.qte_disponible === 'string') {
          qte_disponible = parseInt(product.qte_disponible);
        }
        if (isNaN(qte_disponible)) qte_disponible = 0;
        
        const image_url = product.image_url && typeof product.image_url === 'string' 
          ? product.image_url.trim() 
          : '';
        
        return {
          ref_produit,
          categorie,
          designation,
          prix_actuel,
          qte_disponible,
          image_url,
        };
      });
      
      setProducts(cleanedData);
      
      if (isRefreshing) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error: any) {
      console.error('❌ Erreur chargement produits:', error);
      const errorMessage = error.message || 'Impossible de charger les produits';
      setError(errorMessage);
      
      if (isRefreshing) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Erreur', errorMessage);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Filter products
  useEffect(() => {
    let filtered = [...products];
    
    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product =>
        (product.designation?.toLowerCase() || '').includes(query) ||
        (product.ref_produit?.toLowerCase() || '').includes(query) ||
        (product.categorie?.toLowerCase() || '').includes(query)
      );
    }
    
    // Filter by stock status
    if (stockFilter !== 'all') {
      filtered = filtered.filter(product => {
        const quantity = product.qte_disponible || 0;
        switch (stockFilter) {
          case 'in-stock':
            return quantity > 10;
          case 'low-stock':
            return quantity > 0 && quantity <= 10;
          case 'out-of-stock':
            return quantity === 0;
          default:
            return true;
        }
      });
    }
    
    setFilteredProducts(filtered);
    setCurrentPage(1); // Réinitialiser à la première page quand les filtres changent
  }, [products, searchQuery, stockFilter]);

  // Mettre à jour les produits affichés (pagination)
  useEffect(() => {
    // Calculer le nombre total de pages
    const total = Math.ceil(filteredProducts.length / itemsPerPage);
    setTotalPages(total || 1);
    
    // Extraire les produits pour la page courante
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    setDisplayedProducts(paginatedProducts);
    
    // Scroll vers le haut quand la page change
    if (flatListRef.current && currentPage > 1) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Recharger quand l'écran obtient le focus
  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [fetchProducts])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts(true);
  }, [fetchProducts]);

  const handleProductPress = useCallback((product: Product) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggle(product.ref_produit);
  }, []);

  const handleAddProduct = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('CreateProduct');
  }, [navigation]);

  const handleEditProduct = useCallback((product: Product) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('EditProduct', { product });
  }, [navigation]);

  const handleDeleteProduct = useCallback(async (product: Product) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    Alert.alert(
      'Supprimer le produit',
      `Êtes-vous sûr de vouloir supprimer "${product.designation}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await productService.deleteProduct(product.ref_produit);
              
              setProducts(prev => prev.filter(p => p.ref_produit !== product.ref_produit));
              
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Succès', 'Produit supprimé avec succès');
            } catch (error: any) {
              console.error('❌ Erreur suppression produit:', error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('Erreur', error.message || 'Erreur lors de la suppression');
            } finally {
              setLoading(false);
            }
          }
        },
      ]
    );
  }, []);

  const toggle = useCallback((ref_produit: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === ref_produit ? null : ref_produit));
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  // Navigation entre les pages
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentPage(page);
    }
  }, [totalPages, currentPage]);

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);

  const goToPrevPage = useCallback(() => {
    if (currentPage > 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  // Gestion du scroll pour cacher/afficher le FAB
  const handleScrollBegin = useCallback(() => {
    isScrolling.current = true;
    
    // Cacher le FAB
    Animated.timing(fabAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
    
    // Clear previous timeout
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
  }, [fabAnimation]);

  const handleScrollEnd = useCallback(() => {
    isScrolling.current = false;
    
    // Set timeout to show FAB after scrolling stops
    scrollTimeout.current = setTimeout(() => {
      if (!isScrolling.current) {
        Animated.timing(fabAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    }, 500);
  }, [fabAnimation]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  // Get stock filter options
  const getStockFilters = useCallback(() => {
    return [
      { id: 'all' as StockFilter, label: 'Tous', icon: 'apps' },
      { id: 'in-stock' as StockFilter, label: 'En stock', icon: 'checkmark-circle' },
      { id: 'low-stock' as StockFilter, label: 'Stock bas', icon: 'alert-circle' },
      { id: 'out-of-stock' as StockFilter, label: 'Rupture', icon: 'close-circle' },
    ];
  }, []);

  // Get stock status label and color
  const getStockStatus = useCallback((quantity: number) => {
    if (quantity > 10) {
      return { label: 'En stock', color: '#10B981', icon: 'checkmark-circle' };
    } else if (quantity > 0) {
      return { label: 'Stock bas', color: '#F59E0B', icon: 'alert-circle' };
    } else {
      return { label: 'Rupture', color: '#EF4444', icon: 'close-circle' };
    }
  }, []);

  // Get filter display text
  const getFilterDisplayText = useCallback(() => {
    switch (stockFilter) {
      case 'in-stock':
        return 'en stock';
      case 'low-stock':
        return 'stock bas';
      case 'out-of-stock':
        return 'en rupture';
      default:
        return '';
    }
  }, [stockFilter]);

  // Get initials for icon
  const getProductInitials = useCallback((product: Product) => {
    const designationFirst = product.designation?.[0] || '';
    return designationFirst.toUpperCase() || 'P';
  }, []);

  // Format price safely
  const formatPrice = useCallback((price: number) => {
    if (typeof price !== 'number' || isNaN(price)) return '0,00';
    return price.toFixed(2).replace('.', ',');
  }, []);

  // Get image URI
  const getImageUri = useCallback((image_url: string | undefined) => {
    if (!image_url || typeof image_url !== 'string' || image_url.trim() === '') {
      return null;
    }
    
    const trimmed = image_url.trim();
    
    if (trimmed.startsWith('data:image/')) {
      return trimmed;
    }
    
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    
    if (trimmed.startsWith('file://')) {
      return trimmed;
    }
    
    return null;
  }, []);

  // Rendu du composant de pagination
  const renderPagination = useCallback(() => {
  if (filteredProducts.length <= itemsPerPage) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredProducts.length);

  return (
    <View style={[styles.paginationContainer, { marginBottom: FAB_SAFE_AREA }]}>
      <View style={styles.paginationInfo}>
        <Text style={styles.paginationText}>
          {startItem}-{endItem} sur {filteredProducts.length} produits
        </Text>
        <Text style={styles.paginationPageText}>
          Page {currentPage} sur {totalPages}
        </Text>
      </View>

      <View style={styles.paginationButtons}>
        {/* Bouton Précédent (icone seulement) */}
        <TouchableOpacity
          style={[
            styles.paginationButton,
            currentPage === 1 && styles.paginationButtonDisabled
          ]}
          onPress={goToPrevPage}
          disabled={currentPage === 1}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={currentPage === 1 ? "#9CA3AF" : "#4F46E5"}
          />
        </TouchableOpacity>

        {/* Indicateurs de page */}
        <View style={styles.pageIndicators}>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <TouchableOpacity
                key={`page-${pageNum}`}
                style={[
                  styles.pageIndicator,
                  currentPage === pageNum && styles.pageIndicatorActive
                ]}
                onPress={() => goToPage(pageNum)}
              >
                <Text
                  style={[
                    styles.pageIndicatorText,
                    currentPage === pageNum && styles.pageIndicatorTextActive
                  ]}
                >
                  {pageNum}
                </Text>
              </TouchableOpacity>
            );
          })}

          {totalPages > 5 && currentPage < totalPages - 2 && (
            <>
              <Text style={styles.pageDots}>...</Text>
              <TouchableOpacity
                style={styles.pageIndicator}
                onPress={() => goToPage(totalPages)}
              >
                <Text style={styles.pageIndicatorText}>{totalPages}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Bouton Suivant (icone seulement) */}
        <TouchableOpacity
          style={[
            styles.paginationButton,
            currentPage === totalPages && styles.paginationButtonDisabled
          ]}
          onPress={goToNextPage}
          disabled={currentPage === totalPages}
        >
          <Ionicons
            name="chevron-forward"
            size={24}
            color={currentPage === totalPages ? "#9CA3AF" : "#4F46E5"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}, [
  currentPage,
  totalPages,
  filteredProducts.length,
  itemsPerPage,
  goToPrevPage,
  goToNextPage,
  goToPage,
]);

  /* --------------------  RENDER ITEM  -------------------- */
  const renderProductItem = useCallback(
    ({ item }: { item: Product }) => {
      const isExpanded = expandedId === item.ref_produit;
      const initials = getProductInitials(item);
      const imageUri = getImageUri(item.image_url);
      const hasImage = !!imageUri;
      const formattedPrice = formatPrice(item.prix_actuel);
      const quantity = item.qte_disponible || 0;
      const stockStatus = getStockStatus(quantity);

      return (
        <Pressable
          onPress={() => handleProductPress(item)}
          style={styles.card}
          accessibilityLabel={`Produit ${item.designation}`}
        >
          <View style={styles.headerRow}>
            {/* Product image/icon container */}
            <View style={styles.imageContainer}>
              {hasImage ? (
                <>
                  <Image 
                    source={{ uri: imageUri }} 
                    style={styles.productImage}
                    resizeMode="cover"
                    onError={(e) => {
                      console.log(`❌ Image non chargée pour ${item.ref_produit}`);
                    }}
                    onLoad={() => console.log(`✅ Image chargée avec succès: ${item.ref_produit}`)}
                  />
                </>
              ) : (
                <View style={[styles.iconContainer, { backgroundColor: '#f1f5f9' }]}>
                  <Ionicons name="cube-outline" size={32} color="#6B7280" />
                  <Text style={[styles.iconText, { color: '#6B7280' }]}>
                    {initials}
                  </Text>
                </View>
              )}
            </View>

            {/* Product info */}
            <View style={styles.nameContainer}>
              <Text style={styles.name} numberOfLines={2}>
                {item.designation}
              </Text>
              <Text style={styles.reference}>Ref: {item.ref_produit}</Text>
              <Text style={styles.brand}>{item.categorie}</Text>
              
              <View style={styles.brandRow}>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>{formattedPrice} ar</Text>
                </View>
                <View style={[styles.stockContainer, { marginTop: 0 }]}>
                  <View style={[
                    styles.stockIndicator, 
                    { backgroundColor: stockStatus.color }
                  ]} />
                  <Text style={[styles.stockText, { color: stockStatus.color }]}>
                    {stockStatus.label}
                  </Text>
                  <Text style={[styles.stockText, { color: '#6B7280', marginLeft: 4 }]}>
                    ({quantity} unité{quantity !== 1 ? 's' : ''})
                  </Text>
                </View>
              </View>
            </View>

            {/* Chevron button */}
            <Pressable
              onPress={() => toggle(item.ref_produit)}
              style={({ pressed }) => [
                styles.chevronButton,
                { opacity: pressed ? 0.85 : 1, transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] },
              ]}
              accessibilityLabel={isExpanded ? 'Réduire les détails' : 'Développer les détails'}
            >
              <Ionicons name="chevron-down" size={20} color="#4F46E5" />
            </Pressable>
          </View>

          {/* Expanded details */}
          {isExpanded && (
            <View style={styles.expanded}>
              {/* Details grid */}
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Référence</Text>
                  <Text style={styles.detailValue}>{item.ref_produit}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Catégorie</Text>
                  <Text style={styles.detailValue}>
                    {item.categorie}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Prix actuel</Text>
                  <Text style={[styles.detailValue, styles.priceValue]}>{formattedPrice} ar</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>État du stock</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons 
                      name={stockStatus.icon as any} 
                      size={16} 
                      color={stockStatus.color} 
                      style={{ marginRight: 6 }}
                    />
                    <Text style={[
                      styles.detailValue, 
                      { color: stockStatus.color, fontWeight: '600' }
                    ]}>
                      {stockStatus.label} ({quantity} unité{quantity !== 1 ? 's' : ''})
                    </Text>
                  </View>
                </View>
              </View>

              {/* Image info */}
              <View style={{ marginTop: 12, padding: 8, backgroundColor: '#f8fafc', borderRadius: 6 }}>
                <Text style={[styles.fieldLabel, { marginBottom: 4 }]}>Image:</Text>
                {item.image_url ? (
                  <View>
                    {hasImage ? (
                      <>
                        <Text style={[styles.fieldValue, { fontSize: 12, color: '#10B981' }]}>
                          ✓ Image disponible
                        </Text>
                      </>
                    ) : (
                      <Text style={[styles.fieldValue, { fontSize: 12, color: '#F59E0B' }]}>
                        ⚠️ URL d'image présente mais non accessible
                      </Text>
                    )}
                  </View>
                ) : (
                  <Text style={[styles.fieldValue, { fontSize: 12, color: '#6B7280' }]}>
                    Aucune image
                  </Text>
                )}
              </View>

              {/* Action buttons */}
              <View style={styles.actionRow}>
                <Pressable
                  style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.8 : 1, flex: 1, marginRight: 8 }]}
                  onPress={() => handleEditProduct(item)}
                >
                  <Ionicons name="create" size={24} color="#F59E0B" />
                  <Text style={styles.actionButtonText}>Modifier</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.8 : 1, flex: 1, marginLeft: 8 }]}
                  onPress={() => handleDeleteProduct(item)}
                >
                  <Ionicons name="trash" size={24} color="#DC2626" />
                  <Text style={styles.actionButtonText}>Supprimer</Text>
                </Pressable>
              </View>
            </View>
          )}
        </Pressable>
      );
    },
    [expandedId, handleProductPress, toggle, handleEditProduct, handleDeleteProduct, getProductInitials, formatPrice, getImageUri, getStockStatus]
  );

  /* --------------------  EMPTY / HEADER  -------------------- */
  const renderEmptyList = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Ionicons 
          name={searchQuery || stockFilter !== 'all' ? "search-outline" : "cube-outline"} 
          size={64} 
          color="#9CA3AF" 
        />
        <Text style={styles.emptyText}>
          {searchQuery || stockFilter !== 'all' 
            ? "Aucun produit ne correspond aux critères" 
            : "Aucun produit pour le moment"}
        </Text>
        <Text style={styles.emptySubtext}>
          {searchQuery 
            ? "Essayez avec d'autres mots-clés" 
            : stockFilter !== 'all'
              ? `Aucun produit ${getFilterDisplayText()}`
              : "Ajoutez votre premier produit en cliquant sur le bouton +"}
        </Text>
        {(searchQuery || stockFilter !== 'all') && (
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={() => {
              setSearchQuery("");
              setStockFilter('all');
            }}
          >
            <Text style={styles.clearFiltersButtonText}>Effacer les filtres</Text>
          </TouchableOpacity>
        )}
      </View>
    ),
    [searchQuery, stockFilter, getFilterDisplayText]
  );

  const renderHeader = useCallback(() => (
    <View style={styles.header}>
      <Text style={styles.title}>Produits</Text>
      <Text style={styles.subtitle}>
        {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''}
        {stockFilter !== 'all' && ` (${getFilterDisplayText()})`}
      </Text>
    </View>
  ), [filteredProducts.length, stockFilter, getFilterDisplayText]);

  /* --------------------  LOADING  -------------------- */
  if (loading && !refreshing && products.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Chargement des produits...</Text>
        </View>
      </SafeAreaView>
    );
  }

  /* --------------------  ERROR STATE  -------------------- */
  if (error && products.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#DC2626" />
          <Text style={[styles.loadingText, { color: '#DC2626', marginTop: 16 }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.clearFiltersButton, { marginTop: 20, backgroundColor: '#4F46E5' }]}
            onPress={() => {
              setError(null);
              fetchProducts();
            }}
          >
            <Text style={[styles.clearFiltersButtonText, { color: '#fff' }]}>
              Réessayer
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /* --------------------  MAIN RENDER  -------------------- */
  return (
    <SafeAreaView style={styles.safeArea}>
      {renderHeader()}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchInputContainer, searchFocused && styles.searchInputFocused]}>
          <Ionicons 
            name="search" 
            size={20} 
            color={searchFocused ? "#4F46E5" : "#9CA3AF"} 
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un produit..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearSearch}
              accessibilityLabel="Effacer la recherche"
            >
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Stock Status Filters */}
      <View style={styles.filterContainer}>
        <FlatList
          data={getStockFilters()}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {
            let iconColor = '#6B7280';
            if (stockFilter === item.id) {
              switch (item.id) {
                case 'in-stock':
                  iconColor = '#10B981';
                  break;
                case 'low-stock':
                  iconColor = '#F59E0B';
                  break;
                case 'out-of-stock':
                  iconColor = '#EF4444';
                  break;
                default:
                  iconColor = '#4F46E5';
              }
            }
            
            return (
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  stockFilter === item.id && styles.filterButtonActive,
                  item.id === 'all' && { minWidth: 60 }
                ]}
                onPress={() => setStockFilter(item.id)}
              >
                <Ionicons 
                  name={item.icon as any} 
                  size={16} 
                  color={iconColor}
                  style={{ marginRight: 6 }}
                />
                <Text style={[
                  styles.filterButtonText,
                  stockFilter === item.id && styles.filterButtonTextActive
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.filterRow}
        />
      </View>

      {/* Product List */}
      <FlatList
        ref={flatListRef}
        data={displayedProducts} // Utiliser displayedProducts au lieu de filteredProducts
        renderItem={renderProductItem}
        keyExtractor={(item) => item.ref_produit}
        contentContainerStyle={
        displayedProducts.length
          ? [styles.listContainer, { paddingBottom: FAB_SAFE_AREA }]
          : [styles.listContainerCenter, { paddingBottom: FAB_SAFE_AREA }]
          }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4F46E5"
            colors={['#4F46E5']}
          />
        }
        ListEmptyComponent={renderEmptyList}
        ListFooterComponent={renderPagination} // Ajout de la pagination en bas
        onScrollBeginDrag={handleScrollBegin}
        onScrollEndDrag={handleScrollEnd}
        onMomentumScrollEnd={handleScrollEnd}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews
        keyboardShouldPersistTaps="handled"
      />

      {/* FAB avec animation */}
      <Animated.View 
        style={[
          styles.fabContainer,
          {
            transform: [{
              translateY: fabAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0]
              })
            }],
            opacity: fabAnimation
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.fab} 
          onPress={handleAddProduct}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={26} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}