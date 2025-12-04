import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
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
import { categoryService } from '../services/categoryService';

type Category = {
  categorie: string;
  description: string;
};

type Props = { onScroll?: any };

export default function CategoryScreen({ onScroll }: Props) {
  const navigation: any = useNavigation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  if (Platform.OS === "android") {
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

  // Recharger les données quand l'écran redevient actif
  useFocusEffect(
    useCallback(() => {
      fetchCategories();
    }, [fetchCategories])
  );

  useEffect(() => { 
    fetchCategories(); 
  }, [fetchCategories]);

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

  const handleUpdateCategory = useCallback(async (categorie: string, newData: { categorie?: string; description: string }) => {
    try {
      await categoryService.updateCategory(categorie, newData);
      
      // Mettre à jour localement
      setCategories((prev) => 
        prev.map((cat) => 
          cat.categorie === categorie 
            ? { ...cat, ...newData }
            : cat
        )
      );
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Succès', 'Catégorie mise à jour avec succès');
      setExpandedId(null); // Fermer l'expansion après modification
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erreur', error.message || 'Erreur lors de la mise à jour');
    }
  }, []);

  const handleAddCategory = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('CreateCategory', { 
      onCategoryAdded: () => {
        fetchCategories(); // Recharger après ajout
      }
    });
  }, [navigation, fetchCategories]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  // Filter categories based on search
  const filteredCategories = categories.filter(category => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      category.categorie.toLowerCase().includes(query) ||
      category.description.toLowerCase().includes(query)
    );
  });

  // Get initials for icon
  const getCategoryInitials = useCallback((name: string) => {
    return name.charAt(0).toUpperCase() || 'C';
  }, []);

  /* --------------------  RENDER ITEM  -------------------- */
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
            {/* Category icon container */}
            <View style={styles.imageContainer}>
              <View style={[styles.iconContainer, { backgroundColor: '#e0e7ff' }]}>
                <Ionicons name="folder-outline" size={32} color="#4F46E5" />
                <Text style={[styles.iconText, { color: '#4F46E5' }]}>
                  {initials}
                </Text>
              </View>
            </View>

            {/* Category info */}
            <View style={styles.nameContainer}>
              <Text style={styles.name} numberOfLines={1}>
                {item.categorie}
              </Text>
              <Text style={styles.brand} numberOfLines={2}>
                {item.description}
              </Text>
            </View>

            {/* Chevron button */}
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

          {/* Expanded details */}
          {isExpanded && (
            <View style={styles.expanded}>
              {/* Description détaillée */}
              <View style={{ marginBottom: 16 }}>
                <Text style={[styles.fieldLabel, { marginBottom: 8 }]}>Description complète:</Text>
                <Text style={[styles.fieldValue, { fontSize: 15, lineHeight: 22 }]}>
                  {item.description}
                </Text>
              </View>

              {/* Action buttons alignés à droite */}
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'flex-end',
                alignItems: 'center',
                marginTop: 8,
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
                      'Modifier la catégorie',
                      'Entrez la nouvelle description:',
                      [
                        { text: 'Annuler', style: 'cancel' },
                        { 
                          text: 'Mettre à jour', 
                          onPress: (description?: string) => {
                            if (description && description.trim()) {
                              handleUpdateCategory(item.categorie, { description: description.trim() });
                            }
                          }
                        }
                      ],
                      'plain-text',
                      item.description
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
                      'Supprimer la catégorie',
                      `Êtes-vous sûr de vouloir supprimer "${item.categorie}" ?`,
                      [
                        { text: 'Annuler', style: 'cancel' },
                        { 
                          text: 'Supprimer', 
                          style: 'destructive',
                          onPress: () => handleDeleteCategory(item.categorie)
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
    [expandedId, handleRowPress, toggle, getCategoryInitials, handleUpdateCategory, handleDeleteCategory]
  );

  /* --------------------  EMPTY / HEADER  -------------------- */
  const renderEmptyList = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Ionicons 
          name={searchQuery ? "search-outline" : "folder-outline"} 
          size={64} 
          color="#9CA3AF" 
        />
        <Text style={styles.emptyText}>
          {searchQuery 
            ? "Aucune catégorie ne correspond à la recherche" 
            : "Aucune catégorie pour le moment"}
        </Text>
        <Text style={styles.emptySubtext}>
          {searchQuery 
            ? "Essayez avec d'autres mots-clés" 
            : "Ajoutez votre première catégorie en cliquant sur le bouton +"}
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
      <Text style={styles.title}>Catégories</Text>
      <Text style={styles.subtitle}>
        {filteredCategories.length} catégorie{filteredCategories.length > 1 ? 's' : ''}
      </Text>
    </View>
  ), [filteredCategories.length]);

  /* --------------------  LOADING  -------------------- */
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

      {/* Category List */}
      <FlatList
        data={filteredCategories}
        renderItem={renderItem}
        keyExtractor={(item) => item.categorie}
        contentContainerStyle={
          filteredCategories.length ? styles.listContainer : styles.listContainerCenter
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

      {/* FAB */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={handleAddCategory}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={26} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}