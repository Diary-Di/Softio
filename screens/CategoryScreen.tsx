import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { categoryService } from '../services/categoryService';

type Category = { categorie: string; description: string };
type Props = { onScroll?: any };

const FAB_SAFE_AREA = 88; // hauteur FAB + marges

export default function CategoryScreen({ onScroll }: Props) {
  const navigation: any = useNavigation();
  const [categories, setCategories] = useState<Category[]>([]);
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

  const fetchCategories = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
      if (isRefreshing) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erreur', error.message || 'Impossible de charger les catégories');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCategories(true);
  }, [fetchCategories]);

  useFocusEffect(
    useCallback(() => {
      fetchCategories();
    }, [fetchCategories])
  );

  const toggle = useCallback((id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const handleRowPress = useCallback((category: Category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggle(category.categorie);
  }, [toggle]);

  const handleDeleteCategory = useCallback(async (categorie: string) => {
    try {
      await categoryService.deleteCategory(categorie);
      setCategories((prev) => prev.filter((x) => x.categorie !== categorie));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Succès', 'Catégorie supprimée avec succès');
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erreur', error.message || 'Erreur lors de la suppression');
    }
  }, []);

  const handleUpdateCategory = useCallback(
    async (categorie: string, newData: { categorie?: string; description: string }) => {
      try {
        await categoryService.updateCategory(categorie, newData);
        setCategories((prev) => prev.map((cat) => (cat.categorie === categorie ? { ...cat, ...newData } : cat)));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Succès', 'Catégorie mise à jour avec succès');
        setExpandedId(null);
      } catch (error: any) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Erreur', error.message || 'Erreur lors de la mise à jour');
      }
    },
    []
  );

  const handleAddCategory = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('CreateCategory', { onCategoryAdded: () => fetchCategories() });
  }, [navigation, fetchCategories]);

  const handleEditCategory = useCallback(
    (cat: Category) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      navigation.navigate('CreateCategory', {
        categoryId: cat.categorie, // ou l'id technique si vous en avez un autre
        categorie: cat.categorie,
        description: cat.description,
        onCategoryAdded: () => fetchCategories(), // même callback rafraîchissant la liste
      });
    },
    [navigation, fetchCategories]
  );

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const query = searchQuery.toLowerCase();
    return categories.filter(
      (c) => c.categorie.toLowerCase().includes(query) || c.description.toLowerCase().includes(query)
    );
  }, [categories, searchQuery]);

  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCategories.slice(start, start + itemsPerPage);
  }, [filteredCategories, currentPage]);

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage) || 1;

  const goToPage = useCallback((page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentPage(page);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [currentPage, totalPages]);

  const getCategoryInitials = useCallback((name: string) => {
    return name.charAt(0).toUpperCase() || 'C';
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Category }) => {
      const isExpanded = expandedId === item.categorie;
      const initials = getCategoryInitials(item.categorie);

      return (
        <Pressable
          onPress={() => handleRowPress(item)}
          style={styles.card}
          accessibilityLabel={`Catégorie ${item.categorie}`}
        >
          <View style={styles.headerRow}>
            <View style={styles.imageContainer}>
              <View style={[styles.iconContainer, { backgroundColor: '#e0e7ff' }]}>
                <Ionicons name="folder-outline" size={32} color="#4F46E5" />
                <Text style={[styles.iconText, { color: '#4F46E5' }]}>{initials}</Text>
              </View>
            </View>

            <View style={styles.nameContainer}>
              <Text style={styles.name} numberOfLines={1}>{item.categorie}</Text>
              <Text style={styles.brand} numberOfLines={2}>{item.description}</Text>
            </View>

            <Pressable
              onPress={() => toggle(item.categorie)}
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
              <View style={{ marginBottom: 16 }}>
                <Text style={[styles.fieldLabel, { marginBottom: 8 }]}>Description complète :</Text>
                <Text style={[styles.fieldValue, { fontSize: 15, lineHeight: 22 }]}>{item.description}</Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 8, gap: 12 }}>
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
                      justifyContent: 'center',
                    },
                  ]}
                  onPress={() => handleEditCategory(item)} // <-- nouvel appel
                >
                  <Ionicons name="create" size={20} color="#D97706" style={{ marginRight: 6 }} />
                  <Text style={{ color: '#92400E', fontWeight: '600', fontSize: 14 }}>Modifier</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: '#fee2e2', opacity: pressed ? 0.8 : 1, minWidth: 100, justifyContent: 'center' },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                    Alert.alert(
                      'Supprimer la catégorie',
                      `Êtes-vous sûr de vouloir supprimer "${item.categorie}" ?`,
                      [
                        { text: 'Annuler', style: 'cancel' },
                        { text: 'Supprimer', style: 'destructive', onPress: () => handleDeleteCategory(item.categorie) },
                      ]
                    );
                  }}
                >
                  <Ionicons name="trash" size={20} color="#DC2626" style={{ marginRight: 6 }} />
                  <Text style={{ color: '#DC2626', fontWeight: '600', fontSize: 14 }}>Supprimer</Text>
                </Pressable>
              </View>
            </View>
          )}
        </Pressable>
      );
    },
    [expandedId, handleRowPress, toggle, getCategoryInitials, handleEditCategory, handleDeleteCategory]
  );

  const renderEmptyList = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Ionicons name={searchQuery ? 'search-outline' : 'folder-outline'} size={64} color="#9CA3AF" />
        <Text style={styles.emptyText}>
          {searchQuery ? 'Aucune catégorie ne correspond à la recherche' : 'Aucune catégorie pour le moment'}
        </Text>
        <Text style={styles.emptySubtext}>
          {searchQuery ? 'Essayez avec d’autres mots-clés' : 'Ajoutez votre première catégorie en cliquant sur le bouton +'}
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
        <Text style={styles.title}>Catégories</Text>
        <Text style={styles.subtitle}>
          {filteredCategories.length} catégorie{filteredCategories.length > 1 ? 's' : ''}
        </Text>
      </View>
    ),
    [filteredCategories.length]
  );

  const renderPagination = useCallback(() => {
    if (filteredCategories.length <= itemsPerPage) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, filteredCategories.length);

    const goToPrev = () => {
      if (currentPage > 1) goToPage(currentPage - 1);
    };
    const goToNext = () => {
      if (currentPage < totalPages) goToPage(currentPage + 1);
    };

    return (
      <View style={[styles.paginationContainer, { marginBottom: FAB_SAFE_AREA }]}>
        <View style={styles.paginationInfo}>
          <Text style={styles.paginationText}>
            {startItem}-{endItem} sur {filteredCategories.length} catégories
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
  }, [currentPage, totalPages, filteredCategories.length, itemsPerPage, goToPage]);

  if (loading && !refreshing && categories.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Chargement des catégories...</Text>
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
            placeholder="Rechercher une catégorie..."
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
        data={paginatedCategories}
        renderItem={renderItem}
        keyExtractor={(item) => item.categorie}
        contentContainerStyle={
          paginatedCategories.length
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

      <TouchableOpacity style={styles.fab} onPress={handleAddCategory} activeOpacity={0.85}>
        <Ionicons name="add" size={26} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}