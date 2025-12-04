import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { productScreenStyles as styles } from '../styles/productScreenStyles';
import { productService, Product } from '../services/productService';

type Props = { onScroll?: any };

// Interface locale pour garantir les types numériques
interface LocalProduct extends Omit<Product, 'prix_actuel' | 'prix_precedent' | 'qte_disponible'> {
  prix_actuel: number;
  prix_precedent: number | null;
  qte_disponible: number;
}

export default function PriceScreen({ onScroll }: Props) {
  const [prices, setPrices] = useState<LocalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  if (Platform.OS === "android") {
    UIManager.setLayoutAnimationEnabledExperimental?.(true);
  }

  // Fonction pour convertir les chaînes en nombres et gérer les null
  const convertProductToNumber = (product: Product): LocalProduct => {
    return {
      ...product,
      prix_actuel: typeof product.prix_actuel === 'string' ? parseFloat(product.prix_actuel) : (product.prix_actuel || 0),
      prix_precedent: product.prix_precedent !== null && product.prix_precedent !== undefined 
        ? (typeof product.prix_precedent === 'string' ? parseFloat(product.prix_precedent) : product.prix_precedent)
        : null,
      qte_disponible: typeof product.qte_disponible === 'string' ? parseInt(product.qte_disponible) : (product.qte_disponible || 0)
    };
  };

  const fetchPrices = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    try {
      const data = await productService.getProducts();
      // Convertir les chaînes en nombres
      const convertedData = data.map(convertProductToNumber);
      setPrices(convertedData);
      if (isRefreshing) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erreur', error.message || 'Impossible de charger les prix');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPrices(true);
  }, [fetchPrices]);

  useEffect(() => { fetchPrices(); }, [fetchPrices]);

  const toggle = useCallback((id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const handleRowPress = useCallback((price: LocalProduct) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggle(price.ref_produit);
  }, [toggle]);

  const handleDeletePrice = useCallback(async (ref_produit: string) => {
    try {
      await productService.deleteProduct(ref_produit);
      setPrices((prev) => prev.filter((x) => x.ref_produit !== ref_produit));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Succès', 'Prix supprimé avec succès');
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erreur', error.message || 'Erreur lors de la suppression');
    }
  }, []);

  const handleUpdatePrice = useCallback(async (ref_produit: string, newData: Partial<Product>) => {
    try {
      await productService.updateProduct(ref_produit, newData);
      
      setPrices((prev) => 
        prev.map((item) => 
          item.ref_produit === ref_produit 
            ? convertProductToNumber({ ...item, ...newData } as Product)
            : item
        )
      );
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Succès', 'Prix mis à jour avec succès');
      setExpandedId(null);
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erreur', error.message || 'Erreur lors de la mise à jour');
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const filteredPrices = prices.filter(price => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      price.designation.toLowerCase().includes(query) ||
      price.ref_produit.toLowerCase().includes(query)
    );
  });

  const getPriceInitials = useCallback((designation: string) => {
    return designation.charAt(0).toUpperCase() || 'P';
  }, []);

  const formatDate = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  }, []);

  const getPriceChange = useCallback((current: number, previous: number | null) => {
    if (!previous || previous === 0) return { text: 'Nouveau', color: '#4F46E5', icon: 'add-circle' };
    
    const change = current - previous;
    const percentChange = (change / previous) * 100;
    
    if (change > 0) {
      return { 
        text: `+${percentChange.toFixed(1)}%`, 
        color: '#10B981', 
        icon: 'arrow-up-circle' 
      };
    } else if (change < 0) {
      return { 
        text: `${percentChange.toFixed(1)}%`, 
        color: '#EF4444', 
        icon: 'arrow-down-circle' 
      };
    } else {
      return { 
        text: 'Stable', 
        color: '#6B7280', 
        icon: 'remove-circle' 
      };
    }
  }, []);

  /* --------------------  RENDER ITEM  -------------------- */
  const renderItem = useCallback(
    ({ item }: { item: LocalProduct }) => {
      const isExpanded = expandedId === item.ref_produit;
      const initials = getPriceInitials(item.designation);
      const formattedDate = formatDate(item.date_mise_a_jour_prix);
      const priceChange = getPriceChange(item.prix_actuel, item.prix_precedent);
      const hasPreviousPrice = item.prix_precedent !== null && item.prix_precedent !== undefined && item.prix_precedent !== 0;

      return (
        <Pressable
          onPress={() => handleRowPress(item)}
          style={styles.card}
          accessibilityLabel={`Prix ${item.designation}`}
        >
          <View style={styles.headerRow}>
            <View style={styles.imageContainer}>
              <View style={[styles.iconContainer, { backgroundColor: '#e0f2fe' }]}>
                <Ionicons name="pricetag-outline" size={32} color="#0284c7" />
                <Text style={[styles.iconText, { color: '#0284c7' }]}>
                  {initials}
                </Text>
              </View>
            </View>

            <View style={styles.nameContainer}>
              <Text style={styles.name} numberOfLines={2}>
                {item.designation}
              </Text>
              <Text style={styles.reference}>Ref: {item.ref_produit}</Text>
              
              <View style={styles.brandRow}>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>{item.prix_actuel.toFixed(2)} €</Text>
                </View>
                <View style={[styles.stockContainer, { marginTop: 0 }]}>
                  <Ionicons 
                    name={priceChange.icon as any} 
                    size={12} 
                    color={priceChange.color}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.stockText, { color: priceChange.color }]}>
                    {priceChange.text}
                  </Text>
                </View>
              </View>
            </View>

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

          {isExpanded && (
            <View style={styles.expanded}>
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Référence</Text>
                  <Text style={styles.detailValue}>{item.ref_produit}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Dernière mise à jour</Text>
                  <Text style={styles.detailValue}>{formattedDate}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Prix actuel</Text>
                  <Text style={[styles.detailValue, styles.priceValue]}>{item.prix_actuel.toFixed(2)} €</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Prix précédent</Text>
                  <Text style={styles.detailValue}>
                    {hasPreviousPrice && item.prix_precedent !== null 
                      ? `${item.prix_precedent.toFixed(2)} €` 
                      : 'N/A'}
                  </Text>
                </View>
              </View>

              {hasPreviousPrice && item.prix_precedent !== null && (
                <View style={{ 
                  marginTop: 12, 
                  padding: 12, 
                  backgroundColor: '#f8fafc', 
                  borderRadius: 8,
                  borderLeftWidth: 4,
                  borderLeftColor: priceChange.color
                }}>
                  <Text style={[styles.fieldLabel, { marginBottom: 4 }]}>Évolution du prix:</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name={priceChange.icon as any} size={18} color={priceChange.color} style={{ marginRight: 6 }} />
                      <Text style={[styles.fieldValue, { color: priceChange.color, fontWeight: '600' }]}>
                        {priceChange.text}
                      </Text>
                    </View>
                    <Text style={[styles.fieldValue, { fontSize: 14 }]}>
                      {item.prix_actuel > item.prix_precedent ? 'Augmentation' : 
                       item.prix_actuel < item.prix_precedent ? 'Baisse' : 'Stable'}
                    </Text>
                  </View>
                </View>
              )}

              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'flex-end',
                alignItems: 'center',
                marginTop: 16,
                gap: 12
              }}>
                <Pressable
                  style={({ pressed }) => [
                    { 
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 8,
                      backgroundColor: '#fef3c7',
                      opacity: pressed ? 0.8 : 1,
                      minWidth: 100,
                      justifyContent: 'center'
                    }
                  ]}
                  onPress={() => {
                    Alert.prompt(
                      'Modifier le prix',
                      'Entrez le nouveau prix:',
                      [
                        { text: 'Annuler', style: 'cancel' },
                        { 
                          text: 'Mettre à jour', 
                          onPress: (newPrice?: string) => {
                            if (newPrice && newPrice.trim()) {
                              const priceValue = parseFloat(newPrice);
                              if (!isNaN(priceValue) && priceValue > 0) {
                                handleUpdatePrice(item.ref_produit, { 
                                  prix_actuel: priceValue,
                                  prix_precedent: item.prix_actuel,
                                  date_mise_a_jour_prix: new Date().toISOString().slice(0, 19).replace('T', ' ')
                                });
                              } else {
                                Alert.alert('Erreur', 'Veuillez entrer un prix valide');
                              }
                            }
                          }
                        }
                      ],
                      'plain-text',
                      item.prix_actuel.toString()
                    );
                  }}
                >
                  <Ionicons name="create" size={20} color="#D97706" style={{ marginRight: 6 }} />
                  <Text style={{ color: '#92400E', fontWeight: '600', fontSize: 14 }}>
                    Modifier
                  </Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    { 
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 8,
                      backgroundColor: '#fee2e2',
                      opacity: pressed ? 0.8 : 1,
                      minWidth: 100,
                      justifyContent: 'center'
                    }
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                    Alert.alert(
                      'Supprimer le prix',
                      `Êtes-vous sûr de vouloir supprimer le prix de "${item.designation}" ?`,
                      [
                        { text: 'Annuler', style: 'cancel' },
                        { 
                          text: 'Supprimer', 
                          style: 'destructive',
                          onPress: () => handleDeletePrice(item.ref_produit)
                        },
                      ]
                    );
                  }}
                >
                  <Ionicons name="trash" size={20} color="#DC2626" style={{ marginRight: 6 }} />
                  <Text style={{ color: '#DC2626', fontWeight: '600', fontSize: 14 }}>
                    Supprimer
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </Pressable>
      );
    },
    [expandedId, handleRowPress, toggle, getPriceInitials, formatDate, getPriceChange, handleUpdatePrice, handleDeletePrice]
  );

  /* --------------------  EMPTY / HEADER  -------------------- */
  const renderEmptyList = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Ionicons 
          name={searchQuery ? "search-outline" : "pricetag-outline"} 
          size={64} 
          color="#9CA3AF" 
        />
        <Text style={styles.emptyText}>
          {searchQuery 
            ? "Aucun prix ne correspond à la recherche" 
            : "Aucun prix référencé"}
        </Text>
        <Text style={styles.emptySubtext}>
          {searchQuery 
            ? "Essayez avec d'autres mots-clés" 
            : "Les prix sont gérés depuis l'écran des produits"}
        </Text>
        {searchQuery && (
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={clearSearch}
          >
            <Text style={styles.clearFiltersButtonText}>Effacer la recherche</Text>
          </TouchableOpacity>
        )}
      </View>
    ),
    [searchQuery, clearSearch]
  );

  const renderHeader = useCallback(() => (
    <View style={styles.header}>
      <Text style={styles.title}>Prix</Text>
      <Text style={styles.subtitle}>
        {filteredPrices.length} prix référencé{filteredPrices.length > 1 ? 's' : ''}
      </Text>
    </View>
  ), [filteredPrices.length]);

  if (loading && !refreshing && prices.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Chargement des prix...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {renderHeader()}

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
            placeholder="Rechercher un prix..."
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

      <FlatList
        data={filteredPrices}
        renderItem={renderItem}
        keyExtractor={(item) => item.ref_produit}
        contentContainerStyle={
          filteredPrices.length ? styles.listContainer : styles.listContainerCenter
        }
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
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
    </SafeAreaView>
  );
}