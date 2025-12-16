/******************************************************************
 *  SalesScreen.tsx  –  Liste des ventes avec pagination
 ******************************************************************/
import { useSaleCustomers } from "@/hooks/useSaleCustomers";
import { getCustomerInitials } from "@/utils/customerInitials";
import { formatAmount } from '@/utils/formatAmount';
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useCallback, useEffect, useState } from "react";
import { useRef } from 'react';
import {
    Alert,
    FlatList,
    LayoutAnimation,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    UIManager,
    View
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { SalesStackParamList } from '../navigation/SalesStackNavigator';
import { Sale, formatSaleDate, salesService } from '../services/salesService';
import styles from "../styles/SalesScreenStyles";
import { productScreenStyles as productStyles } from '../styles/productScreenStyles';
import Pagination, { usePagination } from '../components/Pagination';

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

  // Utilisation du hook de pagination réutilisable
  const { currentPage, itemsPerPage, paginateData, goToPage, resetPage } = usePagination(10);
  const flatListRef = useRef<FlatList>(null);

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  useEffect(() => { loadSales(); }, []);
  useEffect(() => { 
    filterSales(); 
    resetPage(); // Réinitialiser la pagination quand les filtres changent
    scrollToTop();
  }, [sales, filters, resetPage]);

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

    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      result = result.filter(sale =>
        sale.ref_facture.toLowerCase().includes(searchLower) ||
        sale.email.toLowerCase().includes(searchLower) ||
        sale.ref_produit.toLowerCase().includes(searchLower) ||
        sale.mode_paiement.toLowerCase().includes(searchLower)
      );
    }

    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0);
      result = result.filter(sale => new Date(sale.date_achat) >= startDate);
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      result = result.filter(sale => new Date(sale.date_achat) <= endDate);
    }

    if (filters.minAmount) {
      const min = parseFloat(filters.minAmount);
      if (!isNaN(min)) result = result.filter(s => (typeof s.montant_paye === 'string' ? parseFloat(s.montant_paye) : s.montant_paye) >= min);
    }

    if (filters.maxAmount) {
      const max = parseFloat(filters.maxAmount);
      if (!isNaN(max)) result = result.filter(s => (typeof s.montant_paye === 'string' ? parseFloat(s.montant_paye) : s.montant_paye) <= max);
    }

    if (filters.modePaiement) {
      result = result.filter(sale => sale.mode_paiement === filters.modePaiement);
    }

    result.sort((a, b) => new Date(b.date_achat).getTime() - new Date(a.date_achat).getTime());
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
    setExpandedId(prev => (prev === ref_facture ? null : ref_facture));
  };

  const handleDateChange = (event: any, selectedDate: Date | undefined, type: 'start' | 'end') => {
    setShowDatePicker(null);
    if (selectedDate) setFilters(prev => ({ ...prev, [type === 'start' ? 'startDate' : 'endDate']: selectedDate }));
  };

  const clearFilters = () => setFilters({
    searchText: '', startDate: null, endDate: null, minAmount: '', maxAmount: '', modePaiement: ''
  });

  const formatDate = (date: Date | null) => (date ? date.toLocaleDateString('fr-FR') : 'Sélectionner');

  const customersMap = useSaleCustomers(sales);


  const renderItem = ({ item }: { item: Sale }) => {
    const isExpanded = expandedId === item.ref_facture;
    const customer = customersMap[item.client_id || -1];
    const initials = getCustomerInitials(customer);
    const formattedDate = formatSaleDate(item.date_achat);

    return (
      <Pressable onPress={() => toggle(item.ref_facture)} style={styles.card} accessibilityLabel={`Vente ${item.ref_facture}`}>
        <View style={styles.headerRow}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>

          <View style={styles.headerInfo}>
            <Text style={styles.invoiceRef}>Facture: {item.ref_facture}</Text>
            <Text style={styles.email}>{item.email}</Text>
            {/* MONTANT BADGE : séparateurs milliers */}
            <Text style={styles.amountBadge}>{formatAmount(item.montant_paye)}</Text>
          </View>

          <Pressable onPress={() => toggle(item.ref_facture)} style={({ pressed }) => [styles.chevronButton, { opacity: pressed ? 0.85 : 1, transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }]}>
            <Ionicons name="chevron-down" size={20} color="#4F46E5" />
          </Pressable>
        </View>

        {isExpanded && (
          <View style={styles.expanded}>
            {customer && (
              <>
                {customer.type === 'entreprise' && customer.sigle
                  ? renderField('Client (sigle)', customer.sigle)
                  : renderField('Client', `${customer.prenoms || ''} ${customer.nom || ''}`.trim() || customer.email || 'Non renseigné')}
              </>
            )}
            {item.ref_produit && renderField('Produits', item.ref_produit)}
            {item.qte_vendu && renderField('Quantités vendues', item.qte_vendu)}
            {renderField('Mode paiement', item.mode_paiement)}
            {/* MONTANT PAYE : séparateurs milliers */}
            {renderField('Montant payé', formatAmount(item.montant_paye))}
            {item.condition_paiement && renderField('Condition', item.condition_paiement)}
            {item.remise && renderField('Remise', item.remise)}
            {renderField('Date achat', formattedDate)}
          </View>
        )}
      </Pressable>
    );
  };

  /* ---------------  MODALE FILTRES  --------------- */
  const renderFilterModal = () => (
    <Modal visible={showFilters} transparent animationType="slide" onRequestClose={() => setShowFilters(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtres</Text>
            <Pressable onPress={() => setShowFilters(false)}><Ionicons name="close" size={24} color="#4F46E5" /></Pressable>
          </View>

          <ScrollView style={styles.filterContainer}>
            {/* Dates */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Date d'achat</Text>
              <View style={styles.dateFilterRow}>
                <View style={styles.dateFilterItem}>
                  <Text style={styles.filterLabel}>Du</Text>
                  <Pressable style={styles.dateButton} onPress={() => setShowDatePicker('start')}>
                    <Ionicons name="calendar" size={20} color="#4F46E5" />
                    <Text style={styles.dateButtonText}>{formatDate(filters.startDate)}</Text>
                  </Pressable>
                </View>
                <View style={styles.dateFilterItem}>
                  <Text style={styles.filterLabel}>Au</Text>
                  <Pressable style={styles.dateButton} onPress={() => setShowDatePicker('end')}>
                    <Ionicons name="calendar" size={20} color="#4F46E5" />
                    <Text style={styles.dateButtonText}>{formatDate(filters.endDate)}</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Montants */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Montant</Text>
              <View style={styles.amountFilterRow}>
                <View style={styles.amountFilterItem}>
                  <Text style={styles.filterLabel}>Min (ar)</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={filters.minAmount}
                    onChangeText={t => setFilters(p => ({ ...p, minAmount: t }))}
                    placeholder="0"
                    keyboardType="decimal-pad"
                  />
                  {/* AFFICHAGE AVEC SEPARATEURS */}
                  <Text style={styles.hint}>{filters.minAmount ? formatAmount(filters.minAmount) : ''}</Text>
                </View>
                <View style={styles.amountFilterItem}>
                  <Text style={styles.filterLabel}>Max (ar)</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={filters.maxAmount}
                    onChangeText={t => setFilters(p => ({ ...p, maxAmount: t }))}
                    placeholder="1 000"
                    keyboardType="decimal-pad"
                  />
                  {/* AFFICHAGE AVEC SEPARATEURS */}
                  <Text style={styles.hint}>{filters.maxAmount ? formatAmount(filters.maxAmount) : ''}</Text>
                </View>
              </View>
            </View>

            {/* Mode paiement */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Mode de paiement</Text>
              <View style={styles.paymentFilterRow}>
                {(['cash', 'card', 'transfer', 'check'] as const).map(mode => (
                  <Pressable
                    key={mode}
                    style={[styles.paymentButton, filters.modePaiement === mode && styles.paymentButtonActive]}
                    onPress={() => setFilters(p => ({ ...p, modePaiement: p.modePaiement === mode ? '' : mode }))}
                  >
                    <Text style={[styles.paymentButtonText, filters.modePaiement === mode && styles.paymentButtonTextActive]}>
                      {mode === 'cash' ? 'Espèces' : mode === 'card' ? 'Carte' : mode === 'transfer' ? 'Virement' : 'Chèque'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Pressable style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Effacer tout</Text>
            </Pressable>
            <Pressable style={styles.applyButton} onPress={() => setShowFilters(false)}>
              <Text style={styles.applyButtonText}>Appliquer</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );

  /* ---------------  RENDU PRINCIPAL  --------------- */
  if (loading && sales.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Ventes</Text>
        <View style={styles.loadingContainer}>
          <Text>Chargement des ventes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { position: 'relative' }]} edges={['bottom', 'left', 'right']}>
      <Text style={styles.title}>Ventes</Text>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une vente..."
            value={filters.searchText}
            onChangeText={t => setFilters(p => ({ ...p, searchText: t }))}
          />
          {filters.searchText ? (
            <Pressable onPress={() => setFilters(p => ({ ...p, searchText: '' }))}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </Pressable>
          ) : null}
        </View>

        <Pressable style={styles.filterButton} onPress={() => setShowFilters(true)}>
          <Ionicons name="filter" size={20} color="#4F46E5" />
          {(filters.startDate || filters.endDate || filters.minAmount || filters.maxAmount || filters.modePaiement) && (
            <View style={styles.filterBadge}><Text style={styles.filterBadgeText}>!</Text></View>
          )}
        </Pressable>
      </View>

      {/* Compteur de résultats */}
      <View style={styles.resultCounter}>
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
    ref={flatListRef}
    data={paginateData(filteredSales)} // Utilisation du hook de pagination
    keyExtractor={item => item.ref_facture}
    renderItem={renderItem}
    contentContainerStyle={styles.listContainer}
    showsVerticalScrollIndicator={false}
    scrollEnabled
    refreshing={loading}
    onRefresh={loadSales}
    keyboardShouldPersistTaps="handled"
    ListFooterComponent={() => {
      if (filteredSales.length <= itemsPerPage) return null;
      
      return (
        <View style={{ paddingVertical: 20 }}>
          <Pagination
            currentPage={currentPage}
            totalItems={filteredSales.length}
            itemsPerPage={itemsPerPage}
            onPageChange={goToPage}
            variant="default"
            showInfo={true}
            hapticFeedback={true}
          />
        </View>
      );
    }}
  />
)}

      {/* Bouton FAB */}
      <TouchableOpacity style={productStyles.fab} activeOpacity={0.85} onPress={() => navigation?.navigate('NewSales')}>
        <Ionicons name="add" size={26} color="#fff" />
      </TouchableOpacity>

      {/* Modale & DatePicker */}
      {renderFilterModal()}
      {showDatePicker && (
        <DateTimePicker
          value={filters[showDatePicker === 'start' ? 'startDate' : 'endDate'] || new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => handleDateChange(event, date, showDatePicker)}
        />
      )}
    </SafeAreaView>
  );
}