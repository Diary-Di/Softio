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
import { salesService, Sale, formatSaleDate } from '../services/salesService';
import styles from "../styles/SalesScreenStyles";
import { productScreenStyles as productStyles } from '../styles/productScreenStyles';

type SalesScreenNavigationProp = StackNavigationProp<SalesStackParamList, 'SalesList'>;

interface SalesScreenProps {
  navigation?: SalesScreenNavigationProp;
  route?: any;
}

interface FilterOptions {
  searchText: string;
  startDate: Date | null;
  endDate: Date | null;
  minAmount: string;
  maxAmount: string;
  modePaiement: string;
}

export default function SalesScreen() {

  const navigation = useNavigation<SalesScreenNavigationProp>();
  // Enable LayoutAnimation on Android
  if (Platform.OS === "android") {
    UIManager.setLayoutAnimationEnabledExperimental?.(true);
  }

  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    searchText: '',
    startDate: null,
    endDate: null,
    minAmount: '',
    maxAmount: '',
    modePaiement: ''
  });

  useEffect(() => {
    loadSales();
  }, []);

  useEffect(() => {
    filterSales();
  }, [sales, filters]);

  const loadSales = async () => {
    try {
      setLoading(true);
      const salesData = await salesService.getSales();
      setSales(salesData);
    } catch (error) {
      console.error("Erreur chargement des ventes:", error);
      Alert.alert("Erreur", "Impossible de charger les ventes");
    } finally {
      setLoading(false);
    }
  };

  const filterSales = useCallback(() => {
    let result = [...sales];

    // Filtre par texte de recherche
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      result = result.filter(sale => 
        sale.ref_facture.toLowerCase().includes(searchLower) ||
        sale.email.toLowerCase().includes(searchLower) ||
        sale.ref_produit.toLowerCase().includes(searchLower) ||
        sale.mode_paiement.toLowerCase().includes(searchLower)
      );
    }

    // Filtre par date
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0);
      result = result.filter(sale => {
        const saleDate = new Date(sale.date_achat);
        return saleDate >= startDate;
      });
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      result = result.filter(sale => {
        const saleDate = new Date(sale.date_achat);
        return saleDate <= endDate;
      });
    }

    // Filtre par montant
    if (filters.minAmount) {
      const minAmount = parseFloat(filters.minAmount);
      if (!isNaN(minAmount)) {
        result = result.filter(sale => {
          const amount = typeof sale.montant_paye === 'string' ? 
            parseFloat(sale.montant_paye) : Number(sale.montant_paye);
          return amount >= minAmount;
        });
      }
    }

    if (filters.maxAmount) {
      const maxAmount = parseFloat(filters.maxAmount);
      if (!isNaN(maxAmount)) {
        result = result.filter(sale => {
          const amount = typeof sale.montant_paye === 'string' ? 
            parseFloat(sale.montant_paye) : Number(sale.montant_paye);
          return amount <= maxAmount;
        });
      }
    }

    // Filtre par mode de paiement
    if (filters.modePaiement) {
      result = result.filter(sale => 
        sale.mode_paiement === filters.modePaiement
      );
    }

    // Trier par date décroissante
    result.sort((a, b) => 
      new Date(b.date_achat).getTime() - new Date(a.date_achat).getTime()
    );

    setFilteredSales(result);
  }, [sales, filters]);

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
    const username = email.split('@')[0];
    const parts = username.split(/[._-]/);
    const initials = parts.map(part => part.charAt(0)).join('').toUpperCase();
    return initials.length > 2 ? initials.substring(0, 2) : initials || '??';
  };

  const formatTotal = (amount: any) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
    if (isNaN(numAmount)) {
      return "0.00 €";
    }
    return `${numAmount.toFixed(2)} €`;
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
      minAmount: '',
      maxAmount: '',
      modePaiement: ''
    });
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Sélectionner';
    return date.toLocaleDateString('fr-FR');
  };

  const renderItem = ({ item }: { item: Sale }) => {
    const isExpanded = expandedId === item.ref_facture;
    const initials = getInitials(item.email);
    const formattedDate = formatSaleDate(item.date_achat);

    return (
      <Pressable
        onPress={() => toggle(item.ref_facture)}
        style={styles.card}
        accessibilityLabel={`Vente ${item.ref_facture}`}
      >
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.invoiceRef}>Facture: {item.ref_facture}</Text>
            <Text style={styles.email}>{item.email}</Text>
            <Text style={styles.amountBadge}>{formatTotal(item.montant_paye)}</Text>
          </View>

          <Pressable
            onPress={() => toggle(item.ref_facture)}
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
            {item.ref_produit && renderField("Produits", item.ref_produit)}
            {item.qte_vendu && renderField("Quantités vendues", item.qte_vendu)}
            {renderField("Mode paiement", item.mode_paiement)}
            {renderField("Montant payé", formatTotal(item.montant_paye))}
            {item.condition_paiement && renderField("Condition", item.condition_paiement)}
            {item.remise && renderField("Remise", item.remise)}
            {renderField("Date achat", formattedDate)}
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
            <Text style={styles.modalTitle}>Filtres</Text>
            <Pressable onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color="#4F46E5" />
            </Pressable>
          </View>

          <ScrollView style={styles.filterContainer}>
            {/* Filtres par date */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Date d'achat</Text>
              
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

            {/* Filtres par montant */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Montant</Text>
              
              <View style={styles.amountFilterRow}>
                <View style={styles.amountFilterItem}>
                  <Text style={styles.filterLabel}>Min (€)</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={filters.minAmount}
                    onChangeText={(text) => setFilters(prev => ({ ...prev, minAmount: text }))}
                    placeholder="0"
                    keyboardType="decimal-pad"
                  />
                </View>

                <View style={styles.amountFilterItem}>
                  <Text style={styles.filterLabel}>Max (€)</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={filters.maxAmount}
                    onChangeText={(text) => setFilters(prev => ({ ...prev, maxAmount: text }))}
                    placeholder="1000"
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            </View>

            {/* Filtre par mode de paiement */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Mode de paiement</Text>
              <View style={styles.paymentFilterRow}>
                {['cash', 'card', 'transfer', 'check'].map((mode) => (
                  <Pressable
                    key={mode}
                    style={[
                      styles.paymentButton,
                      filters.modePaiement === mode && styles.paymentButtonActive
                    ]}
                    onPress={() => setFilters(prev => ({ 
                      ...prev, 
                      modePaiement: filters.modePaiement === mode ? '' : mode 
                    }))}
                  >
                    <Text style={[
                      styles.paymentButtonText,
                      filters.modePaiement === mode && styles.paymentButtonTextActive
                    ]}>
                      {mode === 'cash' ? 'Espèces' : 
                       mode === 'card' ? 'Carte' : 
                       mode === 'transfer' ? 'Virement' : 'Chèque'}
                    </Text>
                  </Pressable>
                ))}
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

  if (loading && sales.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Ventes</Text>
        <View style={styles.loadingContainer}>
          <Text>Chargement des ventes...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { position: 'relative' }]}>
      <Text style={styles.title}>Ventes</Text>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une vente..."
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
          {(filters.startDate || filters.endDate || filters.minAmount || filters.maxAmount || filters.modePaiement) && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>!</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Compteur de résultats */}
      <View style={styles.resultCounter}>
        <Text style={styles.resultText}>
          {filteredSales.length} {filteredSales.length === 1 ? 'vente' : 'ventes'}
        </Text>
        {(filters.searchText || filters.startDate || filters.endDate || filters.minAmount || filters.maxAmount || filters.modePaiement) && (
          <Pressable onPress={clearFilters} style={styles.clearFilterButton}>
            <Text style={styles.clearFilterText}>Effacer filtres</Text>
            <Ionicons name="close" size={14} color="#4F46E5" />
          </Pressable>
        )}
      </View>

      {/* Liste des ventes */}
      {filteredSales.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyText}>
            {filters.searchText || filters.startDate || filters.endDate || filters.minAmount || filters.maxAmount || filters.modePaiement
              ? "Aucune vente ne correspond aux critères"
              : "Aucune vente enregistrée"}
          </Text>
          {(filters.searchText || filters.startDate || filters.endDate || filters.minAmount || filters.maxAmount || filters.modePaiement) && (
            <Pressable onPress={clearFilters} style={styles.suggestClearButton}>
              <Text style={styles.suggestClearText}>Effacer les filtres</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredSales}
          keyExtractor={(item) => item.ref_facture}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          scrollEnabled={true}
          refreshing={loading}
          onRefresh={loadSales}
        />
      )}

      {/* Bouton FAB */}
      <TouchableOpacity
        style={productStyles.fab}
        activeOpacity={0.85}
        onPress={() => navigation?.navigate('NewSales')}
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