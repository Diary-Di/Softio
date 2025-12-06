// screens/ProformaScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useState, useEffect, useCallback } from "react";
import { 
  FlatList, 
  LayoutAnimation, 
  Platform, 
  Pressable, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  UIManager, 
  View,
  Modal,
  ScrollView,
  Alert
} from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { SalesStackParamList } from '../navigation/SalesStackNavigator';
import { 
  proformaService, 
  Proforma, 
  formatProformaDate,
  isProformaExpired,
  getDaysUntilExpiration
} from '../services/proformaService';
import styles from "../styles/ProformaScreenStyles";
import { productScreenStyles as productStyles } from '../styles/productScreenStyles';

type ProformaScreenNavigationProp = StackNavigationProp<SalesStackParamList, 'ProformaList'>;

interface ProformaScreenProps {
  navigation?: ProformaScreenNavigationProp;
  route?: any;
}

interface FilterOptions {
  searchText: string;
  startDate: Date | null;
  endDate: Date | null;
}

export default function ProformaScreen() {

  const navigation = useNavigation<ProformaScreenNavigationProp>();
  // Enable LayoutAnimation on Android
  if (Platform.OS === "android") {
    UIManager.setLayoutAnimationEnabledExperimental?.(true);
  }

  const [proformas, setProformas] = useState<Proforma[]>([]);
  const [filteredProformas, setFilteredProformas] = useState<Proforma[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    searchText: '',
    startDate: null,
    endDate: null,
  });

  useEffect(() => {
    loadProformas();
  }, []);

  useEffect(() => {
    filterProformas();
  }, [proformas, filters]);

  const loadProformas = async () => {
    try {
      setLoading(true);
      const response = await proformaService.getProformas();
      
      // Vérifier la structure de la réponse
      console.log('Réponse API proformas:', response);
      
      // Si la réponse est un tableau, l'utiliser directement
      // Sinon, vérifier si c'est un objet avec une propriété data
      let proformaData: Proforma[] = [];
      
      if (Array.isArray(response)) {
        proformaData = response;
      } else if (response && typeof response === 'object' && 'data' in response) {
        // Si c'est une réponse API standard avec propriété data
        proformaData = (response as any).data;
      } else if (response && typeof response === 'object' && Array.isArray((response as any).proformas)) {
        // Si c'est un objet avec propriété proformas
        proformaData = (response as any).proformas;
      }
      
      // Assurer que proformaData est un tableau
      if (!Array.isArray(proformaData)) {
        console.warn('proformaData n\'est pas un tableau:', proformaData);
        proformaData = [];
      }
      
      setProformas(proformaData);
    } catch (error) {
      console.error("Erreur chargement des proformas:", error);
      Alert.alert("Erreur", "Impossible de charger les proformas");
      setProformas([]); // S'assurer que proformas est toujours un tableau
    } finally {
      setLoading(false);
    }
  };

  const filterProformas = useCallback(() => {
    // S'assurer que proformas est un tableau
    if (!Array.isArray(proformas)) {
      console.warn('proformas n\'est pas un tableau, utilisation d\'un tableau vide');
      setFilteredProformas([]);
      return;
    }
    
    let result = [...proformas];

    // Filtre par texte de recherche
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      result = result.filter(item => 
        (item.ref_facture && item.ref_facture.toLowerCase().includes(searchLower)) ||
        (item.email && item.email.toLowerCase().includes(searchLower)) ||
        (item.ref_produit && item.ref_produit.toLowerCase().includes(searchLower))
      );
    }

    // Filtre par date
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0);
      result = result.filter(item => {
        if (!item.date_facture) return false;
        try {
          const proformaDate = new Date(item.date_facture);
          return proformaDate >= startDate;
        } catch (error) {
          console.error('Erreur parsing date:', item.date_facture);
          return false;
        }
      });
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      result = result.filter(item => {
        if (!item.date_facture) return false;
        try {
          const proformaDate = new Date(item.date_facture);
          return proformaDate <= endDate;
        } catch (error) {
          console.error('Erreur parsing date:', item.date_facture);
          return false;
        }
      });
    }

    // Trier par date décroissante
    result.sort((a, b) => {
      try {
        const dateA = a.date_facture ? new Date(a.date_facture).getTime() : 0;
        const dateB = b.date_facture ? new Date(b.date_facture).getTime() : 0;
        return dateB - dateA;
      } catch (error) {
        return 0;
      }
    });

    setFilteredProformas(result);
  }, [proformas, filters]);

  const renderField = (label: string, value: string | number) => (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}:</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );

  const toggle = (ref_facture: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === ref_facture ? null : ref_facture));
  };

  const getInitials = (email: string) => {
    if (!email) return '??';
    const username = email.split('@')[0];
    const parts = username.split(/[._-]/);
    const initials = parts.map(part => part.charAt(0)).join('').toUpperCase();
    return initials.length > 2 ? initials.substring(0, 2) : initials || '??';
  };

  const handleDateChange = (event: any, selectedDate: Date | undefined, type: 'start' | 'end') => {
    setShowDatePicker(null);
    if (selectedDate) {
      setFilters(prev => ({
        ...prev,
        [type === 'start' ? 'startDate' : 'endDate']: selectedDate
      }));
    }
  };

  const clearFilters = () => {
    setFilters({
      searchText: '',
      startDate: null,
      endDate: null,
    });
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Sélectionner';
    return date.toLocaleDateString('fr-FR');
  };

  const handleConvertToSale = async (ref_facture: string) => {
    Alert.alert(
      "Convertir en vente",
      "Voulez-vous convertir ce proforma en vente?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Convertir", 
          style: "default",
          onPress: async () => {
            try {
              // Navigation vers l'écran de paiement avec les données du proforma
              navigation.navigate('NewSales', { 
                proformaRef: ref_facture
              } as any);
            } catch (error) {
              console.error("Erreur conversion:", error);
              Alert.alert("Erreur", "Impossible de convertir le proforma");
            }
          }
        }
      ]
    );
  };

  const handleViewProforma = (proforma: Proforma) => {
    // Navigation vers l'écran de détail du proforma
    navigation.navigate('ProformaDetail' as any, { 
      ref_facture: proforma.ref_facture 
    } as any);
  };

  const handleProformaAction = (proforma: Proforma, action: 'view' | 'convert' | 'edit') => {
    switch (action) {
      case 'view':
        handleViewProforma(proforma);
        break;
      case 'convert':
        handleConvertToSale(proforma.ref_facture);
        break;
      case 'edit':
        // Navigation vers l'écran d'édition
        navigation.navigate('EditProforma' as any, { 
          ref_facture: proforma.ref_facture 
        } as any);
        break;
    }
  };

  const renderItem = ({ item }: { item: Proforma }) => {
    const isExpanded = expandedId === item.ref_facture;
    const initials = getInitials(item.email || '');
    const formattedDate = item.date_facture ? formatProformaDate(item.date_facture) : 'Date inconnue';
    const expired = isProformaExpired(item);

    return (
      <Pressable
        onPress={() => toggle(item.ref_facture || '')}
        style={[
          styles.card,
          expired && { borderLeftColor: '#EF4444', borderLeftWidth: 4 }
        ]}
        accessibilityLabel={`Proforma ${item.ref_facture || 'inconnu'}`}
      >
        <View style={styles.headerRow}>
          <View style={[
            styles.avatar,
            expired && { backgroundColor: '#FEE2E2' }
          ]}>
            <Text style={[
              styles.avatarText,
              expired && { color: '#DC2626' }
            ]}>
              {initials}
            </Text>
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.invoiceRef}>Proforma: {item.ref_facture || 'Référence inconnue'}</Text>
            <Text style={styles.email}>{item.email || 'Email inconnu'}</Text>
            <View style={styles.statusContainer}>
              {item.remise && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountBadgeText}>{item.remise}</Text>
                </View>
              )}
              {expired ? (
                <View style={styles.expiredBadge}>
                  <Text style={styles.expiredBadgeText}>Expiré</Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              onPress={() => handleProformaAction(item, 'view')}
              style={({ pressed }) => [
                styles.actionButton,
                { opacity: pressed ? 0.85 : 1 }
              ]}
              accessibilityLabel="Voir le proforma"
            >
              <Ionicons name="eye-outline" size={20} color="#4F46E5" />
            </Pressable>
            
            <Pressable
              onPress={() => handleProformaAction(item, 'convert')}
              style={({ pressed }) => [
                styles.actionButton,
                { opacity: pressed ? 0.85 : 1 }
              ]}
              accessibilityLabel="Convertir en vente"
            >
              <Ionicons name="cart-outline" size={20} color="#10B981" />
            </Pressable>

            <Pressable
              onPress={() => toggle(item.ref_facture || '')}
              style={({ pressed }) => [
                styles.chevronButton,
                { opacity: pressed ? 0.85 : 1, transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] },
              ]}
              accessibilityLabel={isExpanded ? 'Réduire les détails' : 'Développer les détails'}
            >
              <Ionicons name="chevron-down" size={20} color="#4F46E5" />
            </Pressable>
          </View>
        </View>

        {isExpanded && (
          <View style={styles.expanded}>
            {item.ref_produit && renderField("Produits", item.ref_produit)}
            {item.qte_a_acheter && renderField("Quantités à acheter", item.qte_a_acheter)}
            {item.remise && renderField("Remise", item.remise)}
            {renderField("Date facture", formattedDate)}
          </View>
        )}
      </Pressable>
    );
  };

  // Rendu de la modale des filtres
  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      transparent
      animationType="slide"
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtres Proformas</Text>
            <Pressable onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color="#4F46E5" />
            </Pressable>
          </View>

          <ScrollView style={styles.filterContainer}>
            {/* Filtres par date */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Date de facture</Text>
              
              <View style={styles.dateFilterRow}>
                <View style={styles.dateFilterItem}>
                  <Text style={styles.filterLabel}>Du</Text>
                  <Pressable 
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker('start')}
                  >
                    <Ionicons name="calendar" size={20} color="#4F46E5" />
                    <Text style={styles.dateButtonText}>{formatDate(filters.startDate)}</Text>
                  </Pressable>
                </View>

                <View style={styles.dateFilterItem}>
                  <Text style={styles.filterLabel}>Au</Text>
                  <Pressable 
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker('end')}
                  >
                    <Ionicons name="calendar" size={20} color="#4F46E5" />
                    <Text style={styles.dateButtonText}>{formatDate(filters.endDate)}</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Filtres par statut */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Statut</Text>
              
              <View style={styles.statusFilterRow}>
                <Pressable
                  style={styles.statusFilterButton}
                  onPress={async () => {
                    try {
                      setLoading(true);
                      // Filtrer les proformas expirés localement
                      const expiredProformas = (Array.isArray(proformas) ? proformas : []).filter(item => 
                        isProformaExpired(item)
                      );
                      setFilteredProformas(expiredProformas);
                      setShowFilters(false);
                    } catch (error) {
                      console.error("Erreur filtrage proformas expirés:", error);
                      Alert.alert("Erreur", "Impossible de filtrer les proformas expirés");
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
                  <Text style={styles.statusFilterButtonText}>Expirés</Text>
                </Pressable>
                
                <Pressable
                  style={styles.statusFilterButton}
                  onPress={() => {
                    // Afficher tous les proformas
                    setFilters({
                      searchText: '',
                      startDate: null,
                      endDate: null,
                    });
                    setShowFilters(false);
                  }}
                >
                  <Ionicons name="list-outline" size={20} color="#4F46E5" />
                  <Text style={styles.statusFilterButtonText}>Tous</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Pressable 
              style={styles.clearButton}
              onPress={clearFilters}
            >
              <Text style={styles.clearButtonText}>Effacer tout</Text>
            </Pressable>
            
            <Pressable 
              style={styles.applyButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyButtonText}>Appliquer</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading && (!Array.isArray(proformas) || proformas.length === 0)) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Proformas</Text>
        <View style={styles.loadingContainer}>
          <Text>Chargement des proformas...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { position: 'relative' }]}>
      <Text style={styles.title}>Proformas</Text>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un proforma..."
            value={filters.searchText}
            onChangeText={(text) => setFilters(prev => ({ ...prev, searchText: text }))}
          />
          {filters.searchText ? (
            <Pressable onPress={() => setFilters(prev => ({ ...prev, searchText: '' }))}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </Pressable>
          ) : null}
        </View>
        
        <Pressable 
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="filter" size={20} color="#4F46E5" />
          {(filters.startDate || filters.endDate) && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>!</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Compteur de résultats */}
      <View style={styles.resultCounter}>
        <Text style={styles.resultText}>
          {Array.isArray(filteredProformas) ? filteredProformas.length : 0} {filteredProformas.length === 1 ? 'proforma' : 'proformas'}
        </Text>
        {(filters.searchText || filters.startDate || filters.endDate) && (
          <Pressable onPress={clearFilters} style={styles.clearFilterButton}>
            <Text style={styles.clearFilterText}>Effacer filtres</Text>
            <Ionicons name="close" size={14} color="#4F46E5" />
          </Pressable>
        )}
      </View>

      {/* Liste des proformas */}
      {!Array.isArray(filteredProformas) || filteredProformas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyText}>
            {filters.searchText || filters.startDate || filters.endDate
              ? "Aucun proforma ne correspond aux critères"
              : "Aucun proforma enregistré"}
          </Text>
          {(filters.searchText || filters.startDate || filters.endDate) && (
            <Pressable onPress={clearFilters} style={styles.suggestClearButton}>
              <Text style={styles.suggestClearText}>Effacer les filtres</Text>
            </Pressable>
          )}
          <Pressable 
            onPress={() => navigation.navigate('NewProforma' as any)}
            style={styles.createFirstButton}
          >
            <Ionicons name="add" size={20} color="#4F46E5" />
            <Text style={styles.createFirstButtonText}>Créer un premier proforma</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filteredProformas}
          keyExtractor={(item) => item.ref_facture || Math.random().toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          scrollEnabled={true}
          refreshing={loading}
          onRefresh={loadProformas}
        />
      )}

      {/* Bouton FAB */}
      <TouchableOpacity
        style={productStyles.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('NewProforma')}
      >
        <Ionicons name="add" size={26} color="#fff" />
      </TouchableOpacity>

      {/* Modale des filtres */}
      {renderFilterModal()}

      {/* DatePicker */}
      {showDatePicker && (
        <DateTimePicker
          value={filters[showDatePicker === 'start' ? 'startDate' : 'endDate'] || new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => handleDateChange(event, date, showDatePicker)}
        />
      )}
    </View>
  );
}