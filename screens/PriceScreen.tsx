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

type PriceItem = {
  id: string;
  ref: string;
  designation: string;
  lastUpdate: string; // ISO
  unitPrice: number;
  previousPrice?: number;
};

const MOCK_PRICES: PriceItem[] = [
  { id: '1', ref: 'REF001', designation: 'Laptop Dell XPS 13', lastUpdate: '2025-11-20', unitPrice: 1299.99, previousPrice: 1349.99 },
  { id: '2', ref: 'REF002', designation: 'iPhone 14 Pro 256 GB', lastUpdate: '2025-11-22', unitPrice: 1159.99, previousPrice: 1199.99 },
  { id: '3', ref: 'REF003', designation: 'Galaxy S23 Ultra', lastUpdate: '2025-11-18', unitPrice: 899.99, previousPrice: 949.99 },
  { id: '4', ref: 'REF004', designation: 'MacBook Air M2 13"', lastUpdate: '2025-11-24', unitPrice: 1499.99, previousPrice: 1599.99 },
  { id: '5', ref: 'REF005', designation: 'PlayStation 5 Digital', lastUpdate: '2025-11-15', unitPrice: 499.99, previousPrice: 449.99 },
];

type Props = { onScroll?: any };

export default function PriceScreen({ onScroll }: Props) {
  const [prices, setPrices] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  if (Platform.OS === "android") {
    UIManager.setLayoutAnimationEnabledExperimental?.(true);
  }

  const fetchPrices = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      setPrices(MOCK_PRICES);
      if (isRefreshing) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erreur', 'Impossible de charger les prix');
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

  const handleRowPress = useCallback((price: PriceItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggle(price.id);
  }, [toggle]);

  const handleMenu = (price: PriceItem, e: any) => {
    e.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Options prix',
      `${price.designation}`,
      [
        { text: 'Modifier', onPress: () => Alert.alert('Modifier', price.ref) },
        { text: 'Supprimer', style: 'destructive', onPress: () => setPrices((prev) => prev.filter((x) => x.id !== price.id)) },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  // Filter prices based on search
  const filteredPrices = prices.filter(price => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      price.designation.toLowerCase().includes(query) ||
      price.ref.toLowerCase().includes(query)
    );
  });

  // Get initials for icon
  const getPriceInitials = useCallback((designation: string) => {
    return designation.charAt(0).toUpperCase() || 'P';
  }, []);

  // Format date
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }, []);

  // Calculate price change
  const getPriceChange = useCallback((current: number, previous?: number) => {
    if (!previous) return { text: 'Nouveau', color: '#4F46E5', icon: 'add-circle' };
    
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
    ({ item }: { item: PriceItem }) => {
      const isExpanded = expandedId === item.id;
      const initials = getPriceInitials(item.designation);
      const formattedDate = formatDate(item.lastUpdate);
      const priceChange = getPriceChange(item.unitPrice, item.previousPrice);
      const hasPreviousPrice = item.previousPrice !== undefined;

      return (
        <Pressable
          onPress={() => handleRowPress(item)}
          style={styles.card}
          accessibilityLabel={`Prix ${item.designation}`}
        >
          <View style={styles.headerRow}>
            {/* Price icon container */}
            <View style={styles.imageContainer}>
              <View style={[styles.iconContainer, { backgroundColor: '#e0f2fe' }]}>
                <Ionicons name="pricetag-outline" size={32} color="#0284c7" />
                <Text style={[styles.iconText, { color: '#0284c7' }]}>
                  {initials}
                </Text>
              </View>
            </View>

            {/* Price info */}
            <View style={styles.nameContainer}>
              <Text style={styles.name} numberOfLines={2}>
                {item.designation}
              </Text>
              <Text style={styles.reference}>Ref: {item.ref}</Text>
              
              <View style={styles.brandRow}>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>{item.unitPrice.toFixed(2)} €</Text>
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

            {/* Chevron button */}
            <Pressable
              onPress={() => toggle(item.id)}
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
                  <Text style={styles.detailValue}>{item.ref}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Dernière mise à jour</Text>
                  <Text style={styles.detailValue}>{formattedDate}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Prix actuel</Text>
                  <Text style={[styles.detailValue, styles.priceValue]}>{item.unitPrice.toFixed(2)} €</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Prix précédent</Text>
                  <Text style={styles.detailValue}>
                    {hasPreviousPrice ? `${item.previousPrice?.toFixed(2)} €` : 'N/A'}
                  </Text>
                </View>
              </View>

              {/* Price evolution */}
              {hasPreviousPrice && (
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
                      {item.unitPrice > (item.previousPrice || 0) ? 'Augmentation' : 
                       item.unitPrice < (item.previousPrice || 0) ? 'Baisse' : 'Stable'}
                    </Text>
                  </View>
                </View>
              )}

              {/* Action buttons alignés à droite */}
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
                  onPress={() => Alert.alert('Modifier', `Modifier le prix pour ${item.designation}`)}
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
                          onPress: () => {
                            setPrices((prev) => prev.filter((x) => x.id !== item.id));
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                          }
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
    [expandedId, handleRowPress, toggle, getPriceInitials, formatDate, getPriceChange]
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

  /* --------------------  LOADING  -------------------- */
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

      {/* Price List */}
      <FlatList
        data={filteredPrices}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
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