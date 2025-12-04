// CartValidationScreen.tsx
import * as Haptics from 'expo-haptics';
import { useCallback, useState, useEffect } from 'react';
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

// Types
type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
};

type NewCustomerForm = {
  name: string;
  email: string;
  phone: string;
  address?: string;
};

// Mock customers avec emails
const MOCK_CUSTOMERS: Customer[] = [
  { id: '1', name: 'Marie Dupont', email: 'marie.dupont@example.com', phone: '+33 1 23 45 67 89', address: '123 Rue de Paris, 75001 Paris' },
  { id: '2', name: 'Paul Martin', email: 'paul.martin@entreprise.com', phone: '+33 1 98 76 54 32', address: '456 Avenue des Champs, 75008 Paris' },
  { id: '3', name: 'Sophie Bernard', email: 'sophie.bernard@gmail.com', phone: '+33 6 11 22 33 44', address: '789 Boulevard Saint-Germain, 75006 Paris' },
  { id: '4', name: 'Jean Leclerc', email: 'jean.leclerc@outlook.com', phone: '+33 7 55 66 77 88', address: '321 Rue de Rivoli, 75004 Paris' },
  { id: '5', name: 'Alice Dubois', email: 'alice.dubois@company.fr', phone: '+33 6 44 55 66 77', address: '654 Rue de la Paix, 75002 Paris' },
  { id: '6', name: 'Thomas Moreau', email: 'thomas.moreau@yahoo.fr', phone: '+33 7 88 99 00 11', address: '987 Rue du Faubourg, 75010 Paris' },
];

// Fonction utilitaire pour formater les prix
const formatPrice = (price: number | undefined): string => {
  const value = price || 0;
  return `€ ${value.toFixed(2)}`;
};

// Fonction pour obtenir le prix unitaire
const getItemPrice = (item: CartItem): number => {
  return item.prix_unitaire || item.prix_actuel || 0;
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
    name: '', 
    email: '', 
    phone: '', 
    address: '' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [modalHeight, setModalHeight] = useState(SCREEN_HEIGHT * 0.8); // 80% de l'écran

  // S'assurer que cart est un tableau
  const safeCart: CartItem[] = Array.isArray(cart) ? cart : [];

  // Filtrer les clients selon la recherche (nom ou email)
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  );

  // Simuler le chargement des clients depuis une API
  useEffect(() => {
    if (showCustomerModal && modalMode === 'search') {
      setIsLoadingCustomers(true);
      // Simuler un appel API
      setTimeout(() => {
        setCustomers(MOCK_CUSTOMERS);
        setIsLoadingCustomers(false);
      }, 500);
    }
  }, [showCustomerModal, modalMode]);

  // Ouvrir modal en mode recherche
  const openSearchModal = useCallback(() => {
    setModalMode('search');
    setSearchQuery('');
    setModalHeight(SCREEN_HEIGHT * 0.8); // Réinitialiser la hauteur
    setShowCustomerModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [SCREEN_HEIGHT]);

  // Ouvrir modal en mode création
  const openCreateModal = useCallback(() => {
    setModalMode('create');
    setNewCustomer({ name: '', email: '', phone: '', address: '' });
    setModalHeight(SCREEN_HEIGHT * 0.7); // Un peu moins haut pour le formulaire
    setShowCustomerModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [SCREEN_HEIGHT]);

  // Sélectionner un client
  const selectCustomer = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  // Créer un nouveau client
  const createCustomer = useCallback(() => {
    if (!newCustomer.name.trim()) {
      Alert.alert('Erreur', 'Le nom du client est obligatoire');
      return;
    }

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

    // Vérifier si l'email existe déjà
    const emailExists = customers.some(c => c.email.toLowerCase() === newCustomer.email.toLowerCase());
    if (emailExists) {
      Alert.alert('Erreur', 'Un client avec cet email existe déjà');
      return;
    }

    const newId = `new_${Date.now()}`;
    const customer: Customer = {
      id: newId,
      name: newCustomer.name.trim(),
      email: newCustomer.email.trim(),
      phone: newCustomer.phone.trim(),
      address: newCustomer.address?.trim() || undefined
    };

    // Ajouter au tableau des clients
    const updatedCustomers = [...customers, customer];
    setCustomers(updatedCustomers);
    setSelectedCustomer(customer);
    setShowCustomerModal(false);
    setNewCustomer({ name: '', email: '', phone: '', address: '' });
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
        selectedCustomer.id, 
        '' // notes optionnelles
      );

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert(
        'Succès',
        `Vente enregistrée avec succès\n` +
        `Client: ${selectedCustomer.name}\n` +
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
  }, []);

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
                  <Ionicons name="person" size={24} color="#007AFF" />
                </View>
                <View style={validationStyles.selectedClientInfo}>
                  <Text style={validationStyles.selectedClientName}>{selectedCustomer.name}</Text>
                  <View style={validationStyles.selectedClientDetails}>
                    <View style={validationStyles.clientDetailRow}>
                      <Ionicons name="mail" size={14} color="#8E8E93" style={{ marginRight: 4 }} />
                      <Text style={validationStyles.selectedClientEmail}>{selectedCustomer.email}</Text>
                    </View>
                    {selectedCustomer.phone && (
                      <View style={validationStyles.clientDetailRow}>
                        <Ionicons name="call" size={14} color="#8E8E93" style={{ marginRight: 4 }} />
                        <Text style={validationStyles.selectedClientPhone}>{selectedCustomer.phone}</Text>
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

      {/* Modal Client - AFFICHÉ PLUS HAUT */}
      <Modal
        visible={showCustomerModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCustomerModal(false)}
      >
        <View style={validationStyles.modalOverlay}>
          <View style={[validationStyles.modalContent, { 
            height: modalHeight,
            marginTop: 50, // Afficher plus haut
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
          }]}>
            {/* Header Modal avec poignée */}
            <View style={validationStyles.modalHeader}>
              {/* Poignée pour le modal */}
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
                    onChangeText={setSearchQuery}
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
                  style={validationStyles.customerList}
                  showsVerticalScrollIndicator={true}
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
                    filteredCustomers.map((customer) => (
                      <TouchableOpacity
                        key={customer.id}
                        style={validationStyles.customerItem}
                        onPress={() => selectCustomer(customer)}
                      >
                        <View style={validationStyles.customerItemIcon}>
                          <Ionicons name="person" size={24} color="#007AFF" />
                        </View>
                        <View style={validationStyles.customerItemInfo}>
                          <Text style={validationStyles.customerItemName}>{customer.name}</Text>
                          <View style={validationStyles.customerItemDetails}>
                            <View style={validationStyles.customerDetailRow}>
                              <Ionicons name="mail" size={12} color="#8E8E93" style={validationStyles.customerDetailIcon} />
                              <Text style={validationStyles.customerItemEmail}>{customer.email}</Text>
                            </View>
                            {customer.phone && (
                              <View style={validationStyles.customerDetailRow}>
                                <Ionicons name="call" size={12} color="#8E8E93" style={validationStyles.customerDetailIcon} />
                                <Text style={validationStyles.customerItemPhone}>{customer.phone}</Text>
                              </View>
                            )}
                          </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </>
            ) : (
              // Mode Création
              <ScrollView style={validationStyles.createForm}>
                <View style={validationStyles.formGroup}>
                  <Text style={validationStyles.formLabel}>Nom complet *</Text>
                  <View style={validationStyles.formInputContainer}>
                    <Ionicons name="person" size={20} color="#8E8E93" style={validationStyles.formInputIcon} />
                    <TextInput
                      style={validationStyles.formInput}
                      value={newCustomer.name}
                      onChangeText={(value) => setNewCustomer({ ...newCustomer, name: value })}
                      placeholder="Ex: Jean Dupont"
                      placeholderTextColor="#999"
                      autoFocus
                    />
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
                    L'email sera utilisé pour l'envoi du reçu
                  </Text>
                </View>

                <View style={validationStyles.formGroup}>
                  <Text style={validationStyles.formLabel}>Téléphone</Text>
                  <View style={validationStyles.formInputContainer}>
                    <Ionicons name="call" size={20} color="#8E8E93" style={validationStyles.formInputIcon} />
                    <TextInput
                      style={validationStyles.formInput}
                      value={newCustomer.phone}
                      onChangeText={(value) => setNewCustomer({ ...newCustomer, phone: value })}
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
                      value={newCustomer.address}
                      onChangeText={(value) => setNewCustomer({ ...newCustomer, address: value })}
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
                      (!newCustomer.name.trim() || !newCustomer.email.trim()) && 
                      validationStyles.formSubmitButtonDisabled
                    ]}
                    onPress={createCustomer}
                    disabled={!newCustomer.name.trim() || !newCustomer.email.trim()}
                  >
                    <Ionicons name="checkmark" size={20} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={validationStyles.formSubmitText}>Créer le client</Text>
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