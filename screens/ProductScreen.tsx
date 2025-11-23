
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { productScreenStyles as styles } from '../styles/productScreenStyles';

/* --------------------  TYPES  -------------------- */
type Product = {
  id: string;
  reference: string;
  designation: string;
  marque: string;
  prix: number;
  categorie: string;
  imageUrl: string;
};

/* --------------------  MOCK DATA  -------------------- */
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    reference: 'REF001',
    designation: 'Laptop Dell XPS 13',
    marque: 'Dell',
    prix: 1299.99,
    categorie: 'Informatique',
    imageUrl: 'https://picsum.photos/seed/dell/400/400',
  },
  {
    id: '2',
    reference: 'REF002',
    designation: 'iPhone 14 Pro 256GB',
    marque: 'Apple',
    prix: 1159.99,
    categorie: 'Téléphonie',
    imageUrl: 'https://picsum.photos/seed/iphone/400/400',
  },
  {
    id: '3',
    reference: 'REF003',
    designation: 'Samsung Galaxy S23 Ultra',
    marque: 'Samsung',
    prix: 899.99,
    categorie: 'Téléphonie',
    imageUrl: 'https://picsum.photos/seed/samsung/400/400',
  },
  {
    id: '4',
    reference: 'REF004',
    designation: 'MacBook Air M2 13"',
    marque: 'Apple',
    prix: 1499.99,
    categorie: 'Informatique',
    imageUrl: 'https://picsum.photos/seed/macbook/400/400',
  },
  {
    id: '5',
    reference: 'REF005',
    designation: 'PlayStation 5 Edition Digital',
    marque: 'Sony',
    prix: 499.99,
    categorie: 'Gaming',
    imageUrl: 'https://picsum.photos/seed/ps5/400/400',
  },
];

/* --------------------  COMPONENT  -------------------- */
export default function ProductScreen({ navigation }: any) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1200)); // fake network delay
      setProducts(MOCK_PRODUCTS);
      if (isRefreshing)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erreur', 'Impossible de charger les produits');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts(true);
  }, [fetchProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleProductPress = useCallback((p: Product) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(p.designation, `Référence: ${p.reference}\nPrix: ${p.prix} €`);
  }, []);

  const handleAddProduct = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('CreateProduct');
  }, [navigation]);

  // Handle three-dot menu press
  const handleMenuPress = useCallback((product: Product, event: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    event.stopPropagation(); // Prevent triggering the card press
    
    // Show action sheet with options
    Alert.alert(
      'Options du produit',
      `Que voulez-vous faire avec "${product.designation}" ?`,
      [
        {
          text: 'Modifier',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Alert.alert('Modifier', `Modifier le produit: ${product.designation}`);
          },
        },
        {
          text: 'Supprimer',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            Alert.alert(
              'Supprimer',
              `Êtes-vous sûr de vouloir supprimer "${product.designation}" ?`,
              [
                { text: 'Annuler', style: 'cancel' },
                { 
                  text: 'Supprimer', 
                  style: 'destructive',
                  onPress: () => {
                    // Remove product from list
                    setProducts(prev => prev.filter(p => p.id !== product.id));
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  }
                },
              ]
            );
          },
          style: 'destructive',
        },
        {
          text: 'Voir les détails',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert(
              product.designation,
              `Référence: ${product.reference}\nMarque: ${product.marque}\nPrix: ${product.prix} €\nCatégorie: ${product.categorie}`
            );
          },
        },
        {
          text: 'Annuler',
          style: 'cancel',
        },
      ]
    );
  }, []);

  /* --------------------  RENDER ITEM  -------------------- */
  const renderProductItem = useCallback(
    ({ item }: { item: Product }) => (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleProductPress(item)}
        activeOpacity={0.9}
      >
        {/* -------  product image  ------- */}
        <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />

        {/* -------  details  ------- */}
        <View style={styles.cardInfo}>
          {/* Header with title and menu button */}
          <View style={styles.cardHeader}>
            <Text style={styles.cardName} numberOfLines={2}>
              {item.designation}
            </Text>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={(e) => handleMenuPress(item, e)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="ellipsis-vertical" size={18} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Ref:</Text>
            <Text style={styles.metaValue}>{item.reference}</Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Marque:</Text>
            <Text style={styles.metaValue}>{item.marque}</Text>
          </View>

          <Text style={styles.cardPrice}>{item.prix.toFixed(2)} €</Text>
        </View>
      </TouchableOpacity>
    ),
    [handleProductPress, handleMenuPress]
  );

  /* --------------------  EMPTY / HEADER  -------------------- */
  const renderEmptyList = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Ionicons name="cube-outline" size={72} color="#ccc" />
        <Text style={styles.emptyText}>Aucun produit trouvé</Text>
        <Text style={styles.emptySubText}>
          Appuyez sur le bouton "+" pour ajouter votre premier produit
        </Text>
      </View>
    ),
    []
  );

  const renderHeader = useCallback(() => null, []);

  /* --------------------  LOADING  -------------------- */
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Chargement des produits...</Text>
        </View>
      </SafeAreaView>
    );
  }

  /* --------------------  LIST  -------------------- */
  return (
    <SafeAreaView style={styles.safeArea}>
      {renderHeader()}

      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          products.length ? styles.listContent : styles.listContentCenter
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
            colors={['#007AFF']}
          />
        }
        ListEmptyComponent={renderEmptyList}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews
        keyboardShouldPersistTaps="handled"
      />

      {/* --------------------  FAB  -------------------- */}
      <TouchableOpacity style={styles.fab} onPress={handleAddProduct}>
        <Ionicons name="add" size={26} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}