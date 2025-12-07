/******************************************************************
 *  ProductScreen.tsx  –  Liste des produits avec filtres de stock
 ******************************************************************/
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Image,
  TextInput,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StackNavigationProp } from '@react-navigation/stack';
import { productScreenStyles as styles } from '../styles/productScreenStyles';
import { useFocusEffect } from '@react-navigation/native';
import { productService, Product as ApiProduct } from '../services/productService';

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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [searchFocused, setSearchFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  }, [products, searchQuery, stockFilter]);

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
                  <Text style={styles.price}>{formattedPrice} €</Text>
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
                  <Text style={[styles.detailValue, styles.priceValue]}>{formattedPrice} €</Text>
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
                {/* Bouton vide invisible pour garder l'espace */}
                <View style={{ flex: 1, marginRight: 8, opacity: 0 }}>
                  <View style={styles.actionButton}>
                    <Ionicons name="eye" size={24} color="#4F46E5" />
                    <Text style={styles.actionButtonText}>Détails</Text>
                  </View>
               </View>
  
                <Pressable
                 style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.8 : 1, flex: 1 }]}
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
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.ref_produit}
        contentContainerStyle={
          filteredProducts.length ? styles.listContainer : styles.listContainerCenter
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
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews
        keyboardShouldPersistTaps="handled"
      />

      {/* FAB */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={handleAddProduct}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={26} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}