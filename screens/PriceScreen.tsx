import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    LayoutAnimation,
    Platform,
    Pressable,
    RefreshControl,
    Text,
    TextInput,
    TouchableOpacity,
    UIManager,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Product, productService } from '../services/productService';
import { productScreenStyles as styles } from '../styles/productScreenStyles';

type Props = { onScroll?: any };

interface LocalProduct extends Omit<Product, 'prix_actuel' | 'prix_precedent' | 'qte_disponible'> {
  prix_actuel: number;
  prix_precedent: number | null;
  qte_disponible: number;
}

const FAB_SAFE_AREA = 88; // hauteur FAB + marges

export default function PriceScreen({ onScroll }: Props) {
  const [prices, setPrices] = useState<LocalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const flatListRef = useRef<FlatList>(null);

  if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental?.(true);
  }

  const convertProductToNumber = (product: Product): LocalProduct => ({
    ...product,
    prix_actuel: typeof product.prix_actuel === 'string' ? parseFloat(product.prix_actuel) : product.prix_actuel || 0,
    prix_precedent: product.prix_precedent != null ? (typeof product.prix_precedent === 'string' ? parseFloat(product.prix_precedent) : product.prix_precedent) : null,
    qte_disponible: typeof product.qte_disponible === 'string' ? parseInt(product.qte_disponible) : product.qte_disponible || 0,
  });

  const fetchPrices = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    try {
      const data = await productService.getProducts();
      const converted = data.map(convertProductToNumber);
      setPrices(converted);
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

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  const toggle = useCallback((id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const handleRowPress = useCallback((price: LocalProduct) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggle(price.ref_produit);
  }, [toggle]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const filteredPrices = useMemo(() => {
    if (!searchQuery.trim()) return prices;
    const query = searchQuery.toLowerCase();
    return prices.filter(
      (p) =>
        p.designation.toLowerCase().includes(query) ||
        p.ref_produit.toLowerCase().includes(query)
    );
  }, [prices, searchQuery]);

  const paginatedPrices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPrices.slice(start, start + itemsPerPage);
  }, [filteredPrices, currentPage]);

  const totalPages = Math.ceil(filteredPrices.length / itemsPerPage) || 1;

  const goToPage = useCallback((page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentPage(page);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [currentPage, totalPages]);

  const getPriceInitials = useCallback((designation: string) => {
    return designation.charAt(0).toUpperCase() || 'P';
  }, []);

  const formatDate = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateString;
    }
  }, []);

  const getPriceChange = useCallback((current: number, previous: number | null) => {
    if (!previous || previous === 0) return { text: 'Nouveau', color: '#4F46E5', icon: 'add-circle' };
    const change = current - previous;
    const percentChange = (change / previous) * 100;
    if (change > 0) return { text: `+${percentChange.toFixed(1)}%`, color: '#10B981', icon: 'arrow-up-circle' };
    if (change < 0) return { text: `${percentChange.toFixed(1)}%`, color: '#EF4444', icon: 'arrow-down-circle' };
    return { text: 'Stable', color: '#6B7280', icon: 'remove-circle' };
  }, []);

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
                <Text style={[styles.iconText, { color: '#0284c7' }]}>{initials}</Text>
              </View>
            </View>

            <View style={styles.nameContainer}>
              <Text style={styles.name} numberOfLines={2}>{item.designation}</Text>
              <Text style={styles.reference}>Ref: {item.ref_produit}</Text>
              <View style={styles.brandRow}>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>{item.prix_actuel.toFixed(2)} ar</Text>
                </View>
                <View style={[styles.stockContainer, { marginTop: 0 }]}>
                  <Ionicons name={priceChange.icon as any} size={12} color={priceChange.color} style={{ marginRight: 4 }} />
                  <Text style={[styles.stockText, { color: priceChange.color }]}>{priceChange.text}</Text>
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
                  <Text style={[styles.detailValue, styles.priceValue]}>{item.prix_actuel.toFixed(2)} ar</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Prix précédent</Text>
                  <Text style={styles.detailValue}>
                    {hasPreviousPrice && item.prix_precedent !== null
                      ? `${item.prix_precedent.toFixed(2)} ar`
                      : 'N/A'}
                  </Text>
                </View>
              </View>

              {hasPreviousPrice && item.prix_precedent !== null && (
                <View style={{ marginTop: 12, padding: 12, backgroundColor: '#f8fafc', borderRadius: 8, borderLeftWidth: 4, borderLeftColor: priceChange.color }}>
                  <Text style={[styles.fieldLabel, { marginBottom: 4 }]}>Évolution du prix :</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name={priceChange.icon as any} size={18} color={priceChange.color} style={{ marginRight: 6 }} />
                      <Text style={[styles.fieldValue, { color: priceChange.color, fontWeight: '600' }]}>{priceChange.text}</Text>
                    </View>
                    <Text style={[styles.fieldValue, { fontSize: 14 }]}>
                      {item.prix_actuel > item.prix_precedent ? 'Augmentation' : item.prix_actuel < item.prix_precedent ? 'Baisse' : 'Stable'}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </Pressable>
      );
    },
    [expandedId, handleRowPress, toggle, getPriceInitials, formatDate, getPriceChange]
  );

  const renderEmptyList = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Ionicons name={searchQuery ? 'search-outline' : 'pricetag-outline'} size={64} color="#9CA3AF" />
        <Text style={styles.emptyText}>
          {searchQuery ? 'Aucun prix ne correspond à la recherche' : 'Aucun prix référencé'}
        </Text>
        <Text style={styles.emptySubtext}>
          {searchQuery ? 'Essayez avec d’autres mots-clés' : 'Les prix sont gérés depuis l’écran des produits'}
        </Text>
        {searchQuery && (
          <TouchableOpacity style={styles.clearFiltersButton} onPress={clearSearch}>
            <Text style={styles.clearFiltersButtonText}>Effacer la recherche</Text>
          </TouchableOpacity>
        )}
      </View>
    ),
    [searchQuery, clearSearch]
  );

  const renderHeader = useCallback(
    () => (
      <View style={styles.header}>
        <Text style={styles.title}>Prix</Text>
        <Text style={styles.subtitle}>
          {filteredPrices.length} prix référencé{filteredPrices.length > 1 ? 's' : ''}
        </Text>
      </View>
    ),
    [filteredPrices.length]
  );

  const renderPagination = useCallback(() => {
    if (filteredPrices.length <= itemsPerPage) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, filteredPrices.length);

    const goToPrev = () => goToPage(currentPage - 1);
    const goToNext = () => goToPage(currentPage + 1);

    return (
      <View style={[styles.paginationContainer, { marginBottom: FAB_SAFE_AREA }]}>
        <View style={styles.paginationInfo}>
          <Text style={styles.paginationText}>
            {startItem}-{endItem} sur {filteredPrices.length} prix
          </Text>
          <Text style={styles.paginationPageText}>
            Page {currentPage} sur {totalPages}
          </Text>
        </View>

        <View style={styles.paginationButtons}>
          <TouchableOpacity
            style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
            onPress={goToPrev}
            disabled={currentPage === 1}
          >
            <Ionicons name="chevron-back" size={24} color={currentPage === 1 ? '#9CA3AF' : '#4F46E5'} />
          </TouchableOpacity>

          <View style={styles.pageIndicators}>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) pageNum = i + 1;
              else if (currentPage <= 3) pageNum = i + 1;
              else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = currentPage - 2 + i;

              return (
                <TouchableOpacity
                  key={`page-${pageNum}`}
                  style={[styles.pageIndicator, currentPage === pageNum && styles.pageIndicatorActive]}
                  onPress={() => goToPage(pageNum)}
                >
                  <Text
                    style={[
                      styles.pageIndicatorText,
                      currentPage === pageNum && styles.pageIndicatorTextActive,
                    ]}
                  >
                    {pageNum}
                  </Text>
                </TouchableOpacity>
              );
            })}
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <Text style={styles.pageDots}>…</Text>
                <TouchableOpacity style={styles.pageIndicator} onPress={() => goToPage(totalPages)}>
                  <Text style={styles.pageIndicatorText}>{totalPages}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          <TouchableOpacity
            style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
            onPress={goToNext}
            disabled={currentPage === totalPages}
          >
            <Ionicons name="chevron-forward" size={24} color={currentPage === totalPages ? '#9CA3AF' : '#4F46E5'} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [currentPage, totalPages, filteredPrices.length, itemsPerPage, goToPage]);

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
          <Ionicons name="search" size={20} color={searchFocused ? '#4F46E5' : '#9CA3AF'} style={styles.searchIcon} />
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
            <TouchableOpacity style={styles.clearButton} onPress={clearSearch} accessibilityLabel="Effacer la recherche">
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={paginatedPrices}
        renderItem={renderItem}
        keyExtractor={(item) => item.ref_produit}
        contentContainerStyle={
          paginatedPrices.length
            ? [styles.listContainer, { paddingBottom: FAB_SAFE_AREA }]
            : [styles.listContainerCenter, { paddingBottom: FAB_SAFE_AREA }]
        }
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F46E5" colors={['#4F46E5']} />
        }
        ListEmptyComponent={renderEmptyList}
        ListFooterComponent={renderPagination}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
}