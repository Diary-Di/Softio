import * as Haptics from 'expo-haptics';
import { useCallback, useState, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { validationStyles } from '../styles/CartValidationStyles';
import { Ionicons } from '@expo/vector-icons';
import { cartService, CartItem } from '../services/cartService';
import { customerService } from '../services/customerService';

// Types
type Customer = {
  type: 'particulier' | 'entreprise';
  email: string;
  sigle?: string;
  nom?: string;
  prenoms?: string;
  adresse?: string;
  telephone?: string;
  nif?: string;
  stat?: string;
};

type NewCustomerForm = {
  type: 'particulier' | 'entreprise';
  email: string;
  sigle?: string;
  nom?: string;
  prenoms?: string;
  adresse?: string;
  telephone?: string;
};

// Fonction utilitaire pour formater les prix
const formatPrice = (price: number | undefined): string => {
  const value = price || 0;
  return `€ ${value.toFixed(2)}`;
};

// Fonction pour obtenir le prix unitaire
const getItemPrice = (item: CartItem): number => {
  return item.prix_unitaire || item.prix_actuel || 0;
};

// Fonction pour obtenir le nom complet d'un client
const getCustomerDisplayName = (customer: Customer): string => {
  if (customer.type === 'entreprise' && customer.sigle) {
    return customer.sigle;
  }
  
  if (customer.nom && customer.prenoms) {
    return `${customer.prenoms} ${customer.nom}`;
  }
  
  if (customer.nom) {
    return customer.nom;
  }
  
  if (customer.prenoms) {
    return customer.prenoms;
  }
  
  return customer.email; // Fallback à l'email
};

// Obtenir la hauteur de l'écran
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function CartValidationScreen({ route, navigation }: any) {
  // Ajouter des valeurs par défaut
  const { cart = [], totalAmount = 0, totalItems = 0 } = route.params || {};

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [modalMode, setModalMode] = useState<'search' | 'create'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [newCustomer, setNewCustomer] = useState<NewCustomerForm>({ 
    type: 'particulier',
    email: '', 
    sigle: '',
    nom: '',
    prenoms: '',
    adresse: '',
    telephone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalCustomers, setTotalCustomers] = useState(0);
  
  // CORRECTION ICI : Utiliser ReturnType<typeof setTimeout> au lieu de NodeJS.Timeout
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const scrollViewRef = useRef<ScrollView>(null);

  // S'assurer que cart est un tableau
  const safeCart: CartItem[] = Array.isArray(cart) ? cart : [];

  // Charger les clients au démarrage du modal
  useEffect(() => {
    if (showCustomerModal && modalMode === 'search') {
      loadCustomers(1, true);
    }
  }, [showCustomerModal, modalMode]);

  // Nettoyer le timeout lors du démontage du composant
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Charger les clients depuis l'API
  const loadCustomers = async (pageNumber: number, reset: boolean = false) => {
    if (isLoadingCustomers || (isLoadingMore && !reset)) return;

    if (reset) {
      setIsLoadingCustomers(true);
      setPage(1);
      setHasMore(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      // Note: Votre API actuelle ne semble pas supporter la pagination
      // Vous devrez adapter l'API ou charger tous les clients
      const allCustomers = await customerService.getCustomers();
      
      // Simuler la pagination côté client (10 par page)
      const startIndex = (pageNumber - 1) * 10;
      const endIndex = startIndex + 10;
      const paginatedCustomers = allCustomers.slice(startIndex, endIndex);
      
      if (reset) {
        setCustomers(paginatedCustomers);
      } else {
        setCustomers(prev => [...prev, ...paginatedCustomers]);
      }
      
      // Vérifier s'il reste des clients à charger
      setHasMore(endIndex < allCustomers.length);
      setTotalCustomers(allCustomers.length);
      setPage(pageNumber);
      
    } catch (error: any) {
      console.error('Erreur chargement clients:', error);
      Alert.alert('Erreur', 'Impossible de charger les clients');
    } finally {
      setIsLoadingCustomers(false);
      setIsLoadingMore(false);
    }
  };

  // Filtrer les clients selon la recherche (nom, prénom, sigle ou email)
  const filteredCustomers = customers.filter(customer => {
    if (!searchQuery.trim()) return true;
    
    const searchLower = searchQuery.toLowerCase();
    const displayName = getCustomerDisplayName(customer).toLowerCase();
    const email = customer.email.toLowerCase();
    
    return displayName.includes(searchLower) || 
           email.includes(searchLower) ||
           (customer.nom && customer.nom.toLowerCase().includes(searchLower)) ||
           (customer.prenoms && customer.prenoms.toLowerCase().includes(searchLower)) ||
           (customer.sigle && customer.sigle.toLowerCase().includes(searchLower));
  });

  // Recherche avec debounce
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (text.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        // Recherche côté client dans la liste déjà chargée
        // Pour une recherche API complète, vous devrez adapter customerService
      }, 300);
    }
  };

  // Charger plus de clients (scroll infini)
  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore && !searchQuery.trim()) {
      loadCustomers(page + 1);
    }
  };

  // Ouvrir modal en mode recherche
  const openSearchModal = useCallback(() => {
    setModalMode('search');
    setSearchQuery('');
    setShowCustomerModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Ouvrir modal en mode création
  const openCreateModal = useCallback(() => {
    setModalMode('create');
    setNewCustomer({ 
      type: 'particulier',
      email: '', 
      sigle: '',
      nom: '',
      prenoms: '',
      adresse: '',
      telephone: '',
    });
    setShowCustomerModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Sélectionner un client
  const selectCustomer = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  // Créer un nouveau client
  const createCustomer = useCallback(async () => {
    if (!newCustomer.email.trim()) {
      Alert.alert('Erreur', 'L\'email du client est obligatoire');
      return;
    }

    // Validation basique d'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newCustomer.email)) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse email valide');
      return;
    }

    // Vérifier si le client existe déjà
    const customerExists = customers.some(c => c.email.toLowerCase() === newCustomer.email.toLowerCase());
    if (customerExists) {
      Alert.alert('Erreur', 'Un client avec cet email existe déjà');
      return;
    }

    try {
      setIsLoadingCustomers(true);
      
      // Préparer les données pour l'API
      const customerData = {
        type: newCustomer.type,
        email: newCustomer.email.trim(),
        ...(newCustomer.type === 'entreprise' && { sigle: newCustomer.sigle?.trim() }),
        ...(newCustomer.type === 'particulier' && { 
          nom: newCustomer.nom?.trim(),
          prenoms: newCustomer.prenoms?.trim()
        }),
        adresse: newCustomer.adresse?.trim(),
        telephone: newCustomer.telephone?.trim(),
      };

      // Appeler l'API
      const response = await customerService.createCustomer(customerData);
      
      // Créer l'objet client pour l'état local
      const customer: Customer = {
        type: newCustomer.type,
        email: newCustomer.email.trim(),
        sigle: newCustomer.sigle?.trim(),
        nom: newCustomer.nom?.trim(),
        prenoms: newCustomer.prenoms?.trim(),
        adresse: newCustomer.adresse?.trim(),
        telephone: newCustomer.telephone?.trim(),
      };

      // Mettre à jour la liste locale
      setCustomers(prev => [customer, ...prev]);
      setSelectedCustomer(customer);
      setShowCustomerModal(false);
      setNewCustomer({ 
        type: 'particulier',
        email: '', 
        sigle: '',
        nom: '',
        prenoms: '',
        adresse: '',
        telephone: '',
      });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Succès', 'Client créé avec succès');
      
    } catch (error: any) {
      console.error('Erreur création client:', error);
      Alert.alert('Erreur', error.message || 'Impossible de créer le client');
    } finally {
      setIsLoadingCustomers(false);
    }
  }, [newCustomer, customers]);

  // Valider la commande finale
  const handleFinalSubmit = useCallback(async () => {
    if (!selectedCustomer) {
      Alert.alert('Client requis', 'Veuillez sélectionner ou créer un client');
      return;
    }

    if (safeCart.length === 0) {
      Alert.alert('Panier vide', 'Ajoutez des produits avant de valider');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSubmitting(true);

    try {
      // Valider le stock d'abord
      const stockValidation = await cartService.validateStock(safeCart);
      
      if (!stockValidation.valid) {
        const errorMessages = stockValidation.results
          .filter(r => !r.valid)
          .map(r => r.message)
          .join('\n');
        
        Alert.alert('Stock insuffisant', errorMessages);
        setIsSubmitting(false);
        return;
      }

      // Créer la vente
      const saleResponse = await cartService.createSale(
        safeCart, 
        selectedCustomer.email, // Utiliser l'email comme ID client
        '' // notes optionnelles
      );

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert(
        'Succès',
        `Vente enregistrée avec succès\n` +
        `Client: ${getCustomerDisplayName(selectedCustomer)}\n` +
        `Email: ${selectedCustomer.email}\n` +
        `Total: ${formatPrice(totalAmount)}\n` +
        `Référence: ${saleResponse.data?.id || 'N/A'}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Home')
          },
          {
            text: 'Voir le reçu',
            onPress: () => navigation.navigate('Receipt', { saleId: saleResponse.data?.id })
          }
        ]
      );
    } catch (error: any) {
      console.error('Erreur création vente:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erreur', error.message || 'Impossible d\'enregistrer la vente');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedCustomer, safeCart, totalAmount, navigation]);

  // Effacer la recherche
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  }, []);

  // Rendre un client dans la liste
  const renderCustomerItem = ({ item, index }: { item: Customer; index: number }) => (
    <TouchableOpacity
      key={item.email}
      style={validationStyles.customerItem}
      onPress={() => selectCustomer(item)}
    >
      <View style={validationStyles.customerItemIcon}>
        <Ionicons 
          name={item.type === 'entreprise' ? 'business' : 'person'} 
          size={24} 
          color="#007AFF" 
        />
      </View>
      <View style={validationStyles.customerItemInfo}>
        <Text style={validationStyles.customerItemName}>
          {getCustomerDisplayName(item)}
        </Text>
        <View style={validationStyles.customerItemDetails}>
          <View style={validationStyles.customerDetailRow}>
            <Ionicons name="mail" size={12} color="#8E8E93" style={validationStyles.customerDetailIcon} />
            <Text style={validationStyles.customerItemEmail}>{item.email}</Text>
          </View>
          {item.telephone && (
            <View style={validationStyles.customerDetailRow}>
              <Ionicons name="call" size={12} color="#8E8E93" style={validationStyles.customerDetailIcon} />
              <Text style={validationStyles.customerItemPhone}>{item.telephone}</Text>
            </View>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
    </TouchableOpacity>
  );

  // Rendu du footer de chargement
  const renderFooter = () => {
    if (!isLoadingMore) return null;
    
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  };

  return (
    <SafeAreaView style={validationStyles.safeArea}>
      {/* Header */}
      <View style={validationStyles.header}>
        <TouchableOpacity
          style={validationStyles.backButton}
          onPress={() => navigation.goBack()}
          disabled={isSubmitting}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>

        <View style={validationStyles.headerTitleContainer}>
          <Text style={validationStyles.headerTitle}>Validation</Text>
          <View style={validationStyles.headerBadge}>
            <Text style={validationStyles.headerBadgeText}>{totalItems}</Text>
          </View>
        </View>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={validationStyles.container}
        contentContainerStyle={validationStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section Client */}
        <View style={validationStyles.section}>
          <Text style={validationStyles.sectionTitle}>CLIENT</Text>
          
          <View style={validationStyles.clientButtonsContainer}>
            <TouchableOpacity
              style={validationStyles.clientButton}
              onPress={openSearchModal}
              disabled={isSubmitting}
            >
              <Ionicons name="search" size={24} color="#007AFF" />
              <Text style={validationStyles.clientButtonText}>Rechercher</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[validationStyles.clientButton, validationStyles.clientButtonPrimary]}
              onPress={openCreateModal}
              disabled={isSubmitting}
            >
              <Ionicons name="person-add" size={24} color="#FFF" />
              <Text style={validationStyles.clientButtonTextPrimary}>Nouveau</Text>
            </TouchableOpacity>
          </View>

          {/* Client sélectionné */}
          {selectedCustomer ? (
            <View style={validationStyles.selectedClientCard}>
              <View style={validationStyles.selectedClientHeader}>
                <View style={validationStyles.clientAvatar}>
                  <Ionicons 
                    name={selectedCustomer.type === 'entreprise' ? 'business' : 'person'} 
                    size={24} 
                    color="#007AFF" 
                  />
                </View>
                <View style={validationStyles.selectedClientInfo}>
                  <Text style={validationStyles.selectedClientName}>
                    {getCustomerDisplayName(selectedCustomer)}
                  </Text>
                  <View style={validationStyles.selectedClientDetails}>
                    <View style={validationStyles.clientDetailRow}>
                      <Ionicons name="mail" size={14} color="#8E8E93" style={{ marginRight: 4 }} />
                      <Text style={validationStyles.selectedClientEmail}>{selectedCustomer.email}</Text>
                    </View>
                    {selectedCustomer.telephone && (
                      <View style={validationStyles.clientDetailRow}>
                        <Ionicons name="call" size={14} color="#8E8E93" style={{ marginRight: 4 }} />
                        <Text style={validationStyles.selectedClientPhone}>{selectedCustomer.telephone}</Text>
                      </View>
                    )}
                    {selectedCustomer.type === 'entreprise' && selectedCustomer.sigle && (
                      <View style={validationStyles.clientDetailRow}>
                        <Ionicons name="business" size={14} color="#8E8E93" style={{ marginRight: 4 }} />
                        <Text style={validationStyles.selectedClientPhone}>Entreprise</Text>
                      </View>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  style={validationStyles.changeClientButton}
                  onPress={openSearchModal}
                >
                  <Ionicons name="create" size={18} color="#007AFF" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={validationStyles.noClientCard}>
              <View style={validationStyles.noClientIconContainer}>
                <Ionicons name="person-outline" size={48} color="#D1D1D6" />
              </View>
              <Text style={validationStyles.noClientText}>Aucun client sélectionné</Text>
              <Text style={validationStyles.noClientSubtext}>
                Choisissez un client existant ou créez-en un nouveau
              </Text>
            </View>
          )}
        </View>

        {/* Récapitulatif de la commande */}
        <View style={validationStyles.section}>
          <View style={validationStyles.sectionHeader}>
            <Text style={validationStyles.sectionTitle}>RÉCAPITULATIF</Text>
            <View style={validationStyles.itemsCountBadge}>
              <Text style={validationStyles.itemsCountText}>{safeCart.length} article(s)</Text>
            </View>
          </View>

          <View style={validationStyles.summaryCard}>
            {safeCart.map((item: CartItem, index: number) => {
              const itemPrice = getItemPrice(item);
              const itemAmount = item.montant || 0;
              const itemQuantity = item.quantiteAcheter || 0;
              
              return (
                <View 
                  key={item.id || index} 
                  style={[
                    validationStyles.summaryItem,
                    index !== safeCart.length - 1 && validationStyles.summaryItemBorder
                  ]}
                >
                  <View style={validationStyles.summaryItemMain}>
                    <View style={validationStyles.summaryItemHeader}>
                      <Text style={validationStyles.summaryItemName} numberOfLines={1}>
                        {item.designation || 'Produit sans nom'}
                      </Text>
                      <Text style={validationStyles.summaryItemPrice}>
                        {formatPrice(itemAmount)}
                      </Text>
                    </View>
                    <Text style={validationStyles.summaryItemRef}>
                      {item.ref_produit || 'N/A'}
                    </Text>
                    <View style={validationStyles.summaryItemDetails}>
                      <View style={validationStyles.quantityBadge}>
                        <Text style={validationStyles.quantityBadgeText}>
                          {itemQuantity}
                        </Text>
                      </View>
                      <Text style={validationStyles.summaryItemDetailText}>
                        × {formatPrice(itemPrice)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Total */}
          <View style={validationStyles.totalCard}>
            <View style={validationStyles.totalRow}>
              <Text style={validationStyles.totalLabel}>Sous-total</Text>
              <Text style={validationStyles.totalValue}>
                {formatPrice(totalAmount)}
              </Text>
            </View>
            <View style={validationStyles.totalDivider} />
            <View style={validationStyles.totalRow}>
              <Text style={validationStyles.totalLabelMain}>TOTAL À PAYER</Text>
              <Text style={validationStyles.totalValueMain}>
                {formatPrice(totalAmount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Notes optionnelles */}
        <View style={validationStyles.section}>
          <Text style={validationStyles.sectionTitle}>NOTES (OPTIONNEL)</Text>
          <View style={validationStyles.notesCard}>
            <TextInput
              style={validationStyles.notesInput}
              placeholder="Ajouter une note pour cette vente..."
              placeholderTextColor="#8E8E93"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>

      {/* Footer avec validation */}
      <View style={validationStyles.footer}>
        <View style={validationStyles.footerTotal}>
          <Text style={validationStyles.footerTotalLabel}>Total</Text>
          <Text style={validationStyles.footerTotalAmount}>
            {formatPrice(totalAmount)}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            validationStyles.validateButton,
            (!selectedCustomer || isSubmitting || safeCart.length === 0) && 
            validationStyles.validateButtonDisabled
          ]}
          onPress={handleFinalSubmit}
          disabled={!selectedCustomer || isSubmitting || safeCart.length === 0}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Text style={validationStyles.validateButtonText}>Confirmer la vente</Text>
              <Ionicons name="checkmark-circle" size={20} color="#FFF" style={{ marginLeft: 8 }} />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal Client */}
      <Modal
        visible={showCustomerModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCustomerModal(false)}
      >
        <View style={validationStyles.modalOverlay}>
          <View style={validationStyles.modalContent}>
            {/* Header Modal */}
            <View style={validationStyles.modalHeader}>
              <View style={validationStyles.modalHandle}>
                <View style={validationStyles.modalHandle} />
              </View>
              
              <Text style={validationStyles.modalTitle}>
                {modalMode === 'search' ? 'Rechercher un client' : 'Nouveau client'}
              </Text>
              <TouchableOpacity
                style={validationStyles.modalCloseButton}
                onPress={() => setShowCustomerModal(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {modalMode === 'search' ? (
              // Mode Recherche
              <>
                <View style={validationStyles.searchContainer}>
                  <Ionicons name="search" size={20} color="#8E8E93" style={validationStyles.searchIcon} />
                  <TextInput
                    style={validationStyles.searchInput}
                    value={searchQuery}
                    onChangeText={handleSearchChange}
                    placeholder="Rechercher par nom, email ou téléphone..."
                    placeholderTextColor="#999"
                    autoFocus
                    autoCapitalize="none"
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity
                      style={validationStyles.clearSearchButton}
                      onPress={clearSearch}
                    >
                      <Ionicons name="close-circle" size={20} color="#8E8E93" />
                    </TouchableOpacity>
                  )}
                </View>

                <ScrollView 
                  ref={scrollViewRef}
                  style={validationStyles.customerList}
                  showsVerticalScrollIndicator={true}
                  onScroll={({ nativeEvent }) => {
                    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;
                    
                    if (isCloseToBottom && !searchQuery.trim()) {
                      handleLoadMore();
                    }
                  }}
                  scrollEventThrottle={400}
                >
                  {isLoadingCustomers ? (
                    <View style={validationStyles.loadingContainer}>
                      <ActivityIndicator size="large" color="#007AFF" />
                      <Text style={validationStyles.loadingText}>Chargement des clients...</Text>
                    </View>
                  ) : filteredCustomers.length === 0 ? (
                    <View style={validationStyles.noResults}>
                      <Ionicons name="search-outline" size={48} color="#D1D1D6" />
                      <Text style={validationStyles.noResultsText}>
                        {searchQuery ? 'Aucun client trouvé' : 'Aucun client disponible'}
                      </Text>
                      {searchQuery && (
                        <Text style={validationStyles.noResultsSubtext}>
                          Essayez avec un nom, email ou téléphone différent
                        </Text>
                      )}
                      <TouchableOpacity
                        style={validationStyles.createFromSearchButton}
                        onPress={() => setModalMode('create')}
                      >
                        <Ionicons name="person-add" size={18} color="#007AFF" style={{ marginRight: 6 }} />
                        <Text style={validationStyles.createFromSearchText}>Créer un nouveau client</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <>
                      {filteredCustomers.map((customer, index) => renderCustomerItem({ item: customer, index }))}
                      {renderFooter()}
                      {!hasMore && filteredCustomers.length > 0 && (
                        <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                          <Text style={{ fontSize: 13, color: '#8E8E93' }}>
                            {totalCustomers} client(s) au total
                          </Text>
                        </View>
                      )}
                    </>
                  )}
                </ScrollView>
              </>
            ) : (
              // Mode Création
              <ScrollView style={validationStyles.createForm} keyboardShouldPersistTaps="handled">
                <View style={validationStyles.formGroup}>
                  <Text style={validationStyles.formLabel}>Type de client *</Text>
                  <View style={{ flexDirection: 'row', gap: 12, marginBottom: 8 }}>
                    <TouchableOpacity
                      style={[
                        { 
                          flex: 1, 
                          flexDirection: 'row', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          backgroundColor: '#F8F8F8',
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: newCustomer.type === 'particulier' ? '#007AFF' : '#E5E5EA',
                          paddingVertical: 12,
                          paddingHorizontal: 16,
                          gap: 8,
                        }
                      ]}
                      onPress={() => setNewCustomer({ ...newCustomer, type: 'particulier' })}
                    >
                      <Ionicons 
                        name="person" 
                        size={20} 
                        color={newCustomer.type === 'particulier' ? '#007AFF' : '#8E8E93'} 
                      />
                      <Text style={{ 
                        fontSize: 15, 
                        fontWeight: '500', 
                        color: newCustomer.type === 'particulier' ? '#007AFF' : '#8E8E93' 
                      }}>
                        Particulier
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        { 
                          flex: 1, 
                          flexDirection: 'row', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          backgroundColor: '#F8F8F8',
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: newCustomer.type === 'entreprise' ? '#007AFF' : '#E5E5EA',
                          paddingVertical: 12,
                          paddingHorizontal: 16,
                          gap: 8,
                        }
                      ]}
                      onPress={() => setNewCustomer({ ...newCustomer, type: 'entreprise' })}
                    >
                      <Ionicons 
                        name="business" 
                        size={20} 
                        color={newCustomer.type === 'entreprise' ? '#007AFF' : '#8E8E93'} 
                      />
                      <Text style={{ 
                        fontSize: 15, 
                        fontWeight: '500', 
                        color: newCustomer.type === 'entreprise' ? '#007AFF' : '#8E8E93' 
                      }}>
                        Entreprise
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={validationStyles.formGroup}>
                  <Text style={validationStyles.formLabel}>Email *</Text>
                  <View style={validationStyles.formInputContainer}>
                    <Ionicons name="mail" size={20} color="#8E8E93" style={validationStyles.formInputIcon} />
                    <TextInput
                      style={validationStyles.formInput}
                      value={newCustomer.email}
                      onChangeText={(value) => setNewCustomer({ ...newCustomer, email: value })}
                      placeholder="client@exemple.com"
                      placeholderTextColor="#999"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                  <Text style={validationStyles.formHelpText}>
                    L'email sera utilisé comme identifiant unique
                  </Text>
                </View>

                {newCustomer.type === 'entreprise' ? (
                  <View style={validationStyles.formGroup}>
                    <Text style={validationStyles.formLabel}>Sigle de l'entreprise *</Text>
                    <View style={validationStyles.formInputContainer}>
                      <Ionicons name="business" size={20} color="#8E8E93" style={validationStyles.formInputIcon} />
                      <TextInput
                        style={validationStyles.formInput}
                        value={newCustomer.sigle}
                        onChangeText={(value) => setNewCustomer({ ...newCustomer, sigle: value })}
                        placeholder="Ex: ACME Corp"
                        placeholderTextColor="#999"
                      />
                    </View>
                  </View>
                ) : (
                  <>
                    <View style={validationStyles.formGroup}>
                      <Text style={validationStyles.formLabel}>Nom</Text>
                      <View style={validationStyles.formInputContainer}>
                        <Ionicons name="person" size={20} color="#8E8E93" style={validationStyles.formInputIcon} />
                        <TextInput
                          style={validationStyles.formInput}
                          value={newCustomer.nom}
                          onChangeText={(value) => setNewCustomer({ ...newCustomer, nom: value })}
                          placeholder="Ex: Dupont"
                          placeholderTextColor="#999"
                        />
                      </View>
                    </View>

                    <View style={validationStyles.formGroup}>
                      <Text style={validationStyles.formLabel}>Prénoms</Text>
                      <View style={validationStyles.formInputContainer}>
                        <Ionicons name="person" size={20} color="#8E8E93" style={validationStyles.formInputIcon} />
                        <TextInput
                          style={validationStyles.formInput}
                          value={newCustomer.prenoms}
                          onChangeText={(value) => setNewCustomer({ ...newCustomer, prenoms: value })}
                          placeholder="Ex: Jean"
                          placeholderTextColor="#999"
                        />
                      </View>
                    </View>
                  </>
                )}

                <View style={validationStyles.formGroup}>
                  <Text style={validationStyles.formLabel}>Téléphone</Text>
                  <View style={validationStyles.formInputContainer}>
                    <Ionicons name="call" size={20} color="#8E8E93" style={validationStyles.formInputIcon} />
                    <TextInput
                      style={validationStyles.formInput}
                      value={newCustomer.telephone}
                      onChangeText={(value) => setNewCustomer({ ...newCustomer, telephone: value })}
                      placeholder="+33 1 23 45 67 89"
                      placeholderTextColor="#999"
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                <View style={validationStyles.formGroup}>
                  <Text style={validationStyles.formLabel}>Adresse</Text>
                  <View style={validationStyles.formInputContainer}>
                    <Ionicons name="location" size={20} color="#8E8E93" style={validationStyles.formInputIcon} />
                    <TextInput
                      style={validationStyles.formInput}
                      value={newCustomer.adresse}
                      onChangeText={(value) => setNewCustomer({ ...newCustomer, adresse: value })}
                      placeholder="123 Rue de Paris, 75001 Paris"
                      placeholderTextColor="#999"
                      multiline
                      numberOfLines={2}
                      textAlignVertical="top"
                    />
                  </View>
                </View>

                <View style={validationStyles.formButtons}>
                  <TouchableOpacity
                    style={validationStyles.formCancelButton}
                    onPress={() => setModalMode('search')}
                  >
                    <Text style={validationStyles.formCancelText}>Retour</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      validationStyles.formSubmitButton,
                      (!newCustomer.email.trim() || 
                       (newCustomer.type === 'entreprise' && !newCustomer.sigle?.trim())) && 
                      validationStyles.formSubmitButtonDisabled
                    ]}
                    onPress={createCustomer}
                    disabled={!newCustomer.email.trim() || 
                             (newCustomer.type === 'entreprise' && !newCustomer.sigle?.trim())}
                  >
                    {isLoadingCustomers ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <>
                        <Ionicons name="checkmark" size={20} color="#FFF" style={{ marginRight: 6 }} />
                        <Text style={validationStyles.formSubmitText}>Créer le client</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}