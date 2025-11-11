import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { productScreenStyles } from '../styles/productScreenStyles';

// Types for better TypeScript support
type Product = {
  id: string;
  reference: string;
  designation: string;
  marque: string;
  prix: number;
  categorie: string;
};

// Mock data - replace with actual API calls
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    reference: 'REF001',
    designation: 'Laptop Dell XPS 13',
    marque: 'Dell',
    prix: 1299.99,
    categorie: 'Informatique',
  },
  {
    id: '2',
    reference: 'REF002',
    designation: 'iPhone 14 Pro 256GB',
    marque: 'Apple',
    prix: 1159.99,
    categorie: 'Téléphonie',
  },
  {
    id: '3',
    reference: 'REF003',
    designation: 'Samsung Galaxy S23 Ultra',
    marque: 'Samsung',
    prix: 899.99,
    categorie: 'Téléphonie',
  },
  {
    id: '4',
    reference: 'REF004',
    designation: 'MacBook Air M2 13"',
    marque: 'Apple',
    prix: 1499.99,
    categorie: 'Informatique',
  },
  {
    id: '5',
    reference: 'REF005',
    designation: 'PlayStation 5 Edition Digital',
    marque: 'Sony',
    prix: 499.99,
    categorie: 'Gaming',
  },
];

export default function ProductScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Memoized fetch function
  const fetchProducts = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) {
      setLoading(true);
    }
    
    try {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Replace with actual API call:
      // const response = await api.get('/products');
      // setProducts(response.data);
      
      setProducts(MOCK_PRODUCTS);
      
      // Haptic feedback on success
      if (isRefreshing) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Erreur', 'Impossible de charger les produits');
      
      // Haptic feedback on error
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts(true);
  }, [fetchProducts]);

  // Initial load
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle product press
  const handleProductPress = useCallback((product: Product) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to product detail or show actions
    Alert.alert(
      product.designation,
      `Référence: ${product.reference}\nPrix: ${product.prix} €`,
      [{ text: 'OK', style: 'default' }]
    );
  }, []);

  // Handle add product
  const handleAddProduct = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Navigate to add product screen
    Alert.alert('Nouveau Produit', 'Fonctionnalité à implémenter');
  }, []);

  // Render product item
  const renderProductItem = useCallback(({ item }: { item: Product }) => (
    <TouchableOpacity
      style={productScreenStyles.productCard}
      onPress={() => handleProductPress(item)}
      activeOpacity={0.7}
      delayPressIn={50}
    >
      <View style={productScreenStyles.productHeader}>
        <Text style={productScreenStyles.reference} numberOfLines={1}>
          {item.reference}
        </Text>
        <Text style={productScreenStyles.price}>
          {item.prix.toFixed(2)} €
        </Text>
      </View>
      
      <Text style={productScreenStyles.designation} numberOfLines={2}>
        {item.designation}
      </Text>
      
      <View style={productScreenStyles.productDetails}>
        <View style={productScreenStyles.detailRow}>
          <Text style={productScreenStyles.detailLabel}>Marque:</Text>
          <Text style={productScreenStyles.detailValue} numberOfLines={1}>
            {item.marque}
          </Text>
        </View>
        <View style={productScreenStyles.detailRow}>
          <Text style={productScreenStyles.detailLabel}>Catégorie:</Text>
          <Text style={productScreenStyles.detailValue} numberOfLines={1}>
            {item.categorie}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  ), [handleProductPress]);

  // Render empty state
  const renderEmptyList = useCallback(() => (
    <View style={productScreenStyles.emptyContainer}>
      <Ionicons name="cube-outline" size={72} color="#CCCCCC" />
      <Text style={productScreenStyles.emptyText}>Aucun produit trouvé</Text>
      <Text style={productScreenStyles.emptySubText}>
        Appuyez sur le bouton "+" pour ajouter votre premier produit
      </Text>
    </View>
  ), []);

  // Render header
  const renderHeader = useCallback(() => (
    <View style={productScreenStyles.header}>
      <Text style={productScreenStyles.title}>Produits</Text>
      <TouchableOpacity
        style={productScreenStyles.addButton}
        onPress={handleAddProduct}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={22} color="white" />
        <Text style={productScreenStyles.addButtonText}>Nouveau</Text>
      </TouchableOpacity>
    </View>
  ), [handleAddProduct]);

  // Loading state
  return (
  <SafeAreaView style={productScreenStyles.safeArea}>
    {/* ----- HEADER WITHOUT THE OLD BUTTON ----- */}
    <View style={productScreenStyles.header}>
      <Text style={productScreenStyles.title}>Produits</Text>
    </View>

    <FlatList
      data={products}
      renderItem={renderProductItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={productScreenStyles.listContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#007AFF"
          colors={['#007AFF']}
          style={productScreenStyles.refreshControl}
        />
      }
      ListEmptyComponent={renderEmptyList}
      initialNumToRender={8}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      windowSize={7}
      removeClippedSubviews
      keyboardShouldPersistTaps="handled"
    />

    {/* ----- FLOATING BUTTON ----- */}
    <TouchableOpacity
      style={productScreenStyles.fab}
      onPress={handleAddProduct}
      activeOpacity={0.85}
    >
      <Ionicons name="add" size={26} color="#fff" />
    </TouchableOpacity>
  </SafeAreaView>
);
}