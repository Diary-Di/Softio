import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';
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
} from 'react-native';
import { validationStyles } from '../styles/CartValidationStyles';
import { Ionicons } from '@expo/vector-icons';

// Types
type CartItem = {
  id: string;
  reference: string;
  designation: string;
  prixUnitaire: number;
  quantiteDisponible: number;
  quantiteAcheter: number;
  montant: number;
};

type Customer = {
  id: string;
  name: string;
  phone: string;
};

type NewCustomerForm = {
  name: string;
  phone: string;
};

// Mock customers
const MOCK_CUSTOMERS: Customer[] = [
  { id: '1', name: 'Marie Dupont', phone: '+33 1 23 45 67 89' },
  { id: '2', name: 'Paul Martin', phone: '+33 1 98 76 54 32' },
  { id: '3', name: 'Sophie Bernard', phone: '+33 6 11 22 33 44' },
  { id: '4', name: 'Jean Leclerc', phone: '+33 7 55 66 77 88' },
];

export default function CartValidationScreen({ route, navigation }: any) {
  const { cart, totalAmount, totalItems } = route.params;

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [modalMode, setModalMode] = useState<'search' | 'create'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [newCustomer, setNewCustomer] = useState<NewCustomerForm>({ name: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtrer les clients selon la recherche
  const filteredCustomers = MOCK_CUSTOMERS.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  );

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
    setNewCustomer({ name: '', phone: '' });
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
  const createCustomer = useCallback(() => {
    if (!newCustomer.name.trim()) {
      Alert.alert('Erreur', 'Le nom du client est obligatoire');
      return;
    }

    const newId = `new_${Date.now()}`;
    const customer: Customer = {
      id: newId,
      name: newCustomer.name.trim(),
      phone: newCustomer.phone.trim(),
    };

    MOCK_CUSTOMERS.push(customer);
    setSelectedCustomer(customer);
    setShowCustomerModal(false);
    setNewCustomer({ name: '', phone: '' });
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [newCustomer]);

  // Valider la commande finale
  const handleFinalSubmit = useCallback(async () => {
    if (!selectedCustomer) {
      Alert.alert('Client requis', 'Veuillez sélectionner ou créer un client');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSubmitting(true);

    try {
      // Simuler l'API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert(
        'Succès',
        `Vente enregistrée avec succès\nClient: ${selectedCustomer.name}\nTotal: €${totalAmount.toFixed(2)}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Home')
          }
        ]
      );
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erreur', 'Impossible d\'enregistrer la vente');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedCustomer, cart, totalAmount, navigation]);

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
                  {selectedCustomer.phone && (
                    <View style={validationStyles.clientPhoneContainer}>
                      <Ionicons name="call" size={14} color="#8E8E93" style={{ marginRight: 4 }} />
                      <Text style={validationStyles.selectedClientPhone}>{selectedCustomer.phone}</Text>
                    </View>
                  )}
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
              <Text style={validationStyles.itemsCountText}>{totalItems} article(s)</Text>
            </View>
          </View>

          <View style={validationStyles.summaryCard}>
            {cart.map((item: CartItem, index: number) => (
              <View 
                key={item.id} 
                style={[
                  validationStyles.summaryItem,
                  index !== cart.length - 1 && validationStyles.summaryItemBorder
                ]}
              >
                <View style={validationStyles.summaryItemMain}>
                  <View style={validationStyles.summaryItemHeader}>
                    <Text style={validationStyles.summaryItemName} numberOfLines={1}>
                      {item.designation}
                    </Text>
                    <Text style={validationStyles.summaryItemPrice}>€ {item.montant.toFixed(2)}</Text>
                  </View>
                  <Text style={validationStyles.summaryItemRef}>{item.reference}</Text>
                  <View style={validationStyles.summaryItemDetails}>
                    <View style={validationStyles.quantityBadge}>
                      <Text style={validationStyles.quantityBadgeText}>{item.quantiteAcheter}</Text>
                    </View>
                    <Text style={validationStyles.summaryItemDetailText}>
                      × €{item.prixUnitaire.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Total */}
          <View style={validationStyles.totalCard}>
            <View style={validationStyles.totalRow}>
              <Text style={validationStyles.totalLabel}>Sous-total</Text>
              <Text style={validationStyles.totalValue}>€ {totalAmount.toFixed(2)}</Text>
            </View>
            <View style={validationStyles.totalDivider} />
            <View style={validationStyles.totalRow}>
              <Text style={validationStyles.totalLabelMain}>TOTAL À PAYER</Text>
              <Text style={validationStyles.totalValueMain}>€ {totalAmount.toFixed(2)}</Text>
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
          <Text style={validationStyles.footerTotalAmount}>€ {totalAmount.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={[
            validationStyles.validateButton,
            (!selectedCustomer || isSubmitting) && validationStyles.validateButtonDisabled
          ]}
          onPress={handleFinalSubmit}
          disabled={!selectedCustomer || isSubmitting}
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
                    placeholder="Rechercher par nom ou téléphone..."
                    placeholderTextColor="#999"
                    autoFocus
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity
                      style={validationStyles.clearSearchButton}
                      onPress={() => setSearchQuery('')}
                    >
                      <Ionicons name="close-circle" size={20} color="#8E8E93" />
                    </TouchableOpacity>
                  )}
                </View>

                <ScrollView style={validationStyles.customerList}>
                  {filteredCustomers.length === 0 ? (
                    <View style={validationStyles.noResults}>
                      <Ionicons name="search-outline" size={48} color="#D1D1D6" />
                      <Text style={validationStyles.noResultsText}>Aucun client trouvé</Text>
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
                          <View style={validationStyles.customerItemPhoneContainer}>
                            <Ionicons name="call" size={12} color="#8E8E93" style={{ marginRight: 4 }} />
                            <Text style={validationStyles.customerItemPhone}>{customer.phone}</Text>
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
              <View style={validationStyles.createForm}>
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
                      !newCustomer.name.trim() && validationStyles.formSubmitButtonDisabled
                    ]}
                    onPress={createCustomer}
                    disabled={!newCustomer.name.trim()}
                  >
                    <Ionicons name="checkmark" size={20} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={validationStyles.formSubmitText}>Créer le client</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}