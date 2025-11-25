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

      // Replace with actual API call:
      // const response = await api.post('/sales', {
      //   customerId: selectedCustomer.id,
      //   items: cart,
      //   total: totalAmount
      // });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert(
        'Succès',
        `Vente enregistrée avec succès\nClient: ${selectedCustomer.name}\nTotal: €${totalAmount.toFixed(2)}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Home') // ou navigation.goBack() selon votre navigation
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
          <Text style={validationStyles.backButtonText}>← Retour</Text>
        </TouchableOpacity>

        <Text style={validationStyles.headerTitle}>Validation</Text>

        <View style={{ width: 80 }} />
      </View>

      <ScrollView
        style={validationStyles.container}
        contentContainerStyle={validationStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Boutons Client */}
        <View style={validationStyles.clientButtonsContainer}>
          <TouchableOpacity
            style={validationStyles.clientActionButton}
            onPress={openSearchModal}
            disabled={isSubmitting}
          >
            <Text style={validationStyles.clientActionIcon}>🔍</Text>
            <Text style={validationStyles.clientActionText}>Rechercher</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[validationStyles.clientActionButton, validationStyles.clientActionButtonPrimary]}
            onPress={openCreateModal}
            disabled={isSubmitting}
          >
            <Text style={validationStyles.clientActionIcon}>➕</Text>
            <Text style={[validationStyles.clientActionText, validationStyles.clientActionTextPrimary]}>
              Nouveau Client
            </Text>
          </TouchableOpacity>
        </View>

        {/* Client sélectionné */}
        {selectedCustomer ? (
          <View style={validationStyles.selectedClientCard}>
            <View style={validationStyles.selectedClientHeader}>
              <View style={validationStyles.clientIconContainer}>
                <Text style={validationStyles.clientIcon}>👤</Text>
              </View>
              <View style={validationStyles.selectedClientInfo}>
                <Text style={validationStyles.selectedClientName}>{selectedCustomer.name}</Text>
                {selectedCustomer.phone && (
                  <Text style={validationStyles.selectedClientPhone}>{selectedCustomer.phone}</Text>
                )}
              </View>
              <TouchableOpacity
                style={validationStyles.changeClientButton}
                onPress={openSearchModal}
              >
                <Text style={validationStyles.changeClientText}>Modifier</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={validationStyles.noClientCard}>
            <Text style={validationStyles.noClientIcon}>⚠️</Text>
            <Text style={validationStyles.noClientText}>Aucun client sélectionné</Text>
            <Text style={validationStyles.noClientSubtext}>
              Recherchez ou créez un client pour continuer
            </Text>
          </View>
        )}

        {/* Récapitulatif de la commande */}
        <View style={validationStyles.section}>
          <Text style={validationStyles.sectionTitle}>RÉCAPITULATIF DE LA COMMANDE</Text>

          <View style={validationStyles.summaryCard}>
            <View style={validationStyles.summaryHeader}>
              <Text style={validationStyles.summaryHeaderText}>Articles ({totalItems})</Text>
            </View>

            {cart.map((item: CartItem, index: number) => (
              <View 
                key={item.id} 
                style={[
                  validationStyles.summaryItem,
                  index !== cart.length - 1 && validationStyles.summaryItemBorder
                ]}
              >
                <View style={validationStyles.summaryItemHeader}>
                  <Text style={validationStyles.summaryItemRef}>{item.reference}</Text>
                  <Text style={validationStyles.summaryItemPrice}>€ {item.montant.toFixed(2)}</Text>
                </View>
                <Text style={validationStyles.summaryItemName}>{item.designation}</Text>
                <View style={validationStyles.summaryItemDetails}>
                  <Text style={validationStyles.summaryItemDetailText}>
                    {item.quantiteAcheter} × €{item.prixUnitaire.toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Total */}
          <View style={validationStyles.totalCard}>
            <View style={validationStyles.totalRow}>
              <Text style={validationStyles.totalLabel}>Sous-total:</Text>
              <Text style={validationStyles.totalValue}>€ {totalAmount.toFixed(2)}</Text>
            </View>
            <View style={validationStyles.totalDivider} />
            <View style={validationStyles.totalRow}>
              <Text style={validationStyles.totalLabelMain}>TOTAL À PAYER:</Text>
              <Text style={validationStyles.totalValueMain}>€ {totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer avec validation */}
      <View style={validationStyles.footer}>
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
              <Text style={validationStyles.validateButtonPrice}>€ {totalAmount.toFixed(2)}</Text>
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
                <Text style={validationStyles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {modalMode === 'search' ? (
              // Mode Recherche
              <>
                <View style={validationStyles.searchContainer}>
                  <Text style={validationStyles.searchIcon}>🔍</Text>
                  <TextInput
                    style={validationStyles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Rechercher par nom ou téléphone..."
                    placeholderTextColor="#999"
                    autoFocus
                  />
                </View>

                <ScrollView style={validationStyles.customerList}>
                  {filteredCustomers.length === 0 ? (
                    <View style={validationStyles.noResults}>
                      <Text style={validationStyles.noResultsText}>Aucun client trouvé</Text>
                      <TouchableOpacity
                        style={validationStyles.createFromSearchButton}
                        onPress={() => setModalMode('create')}
                      >
                        <Text style={validationStyles.createFromSearchText}>+ Créer un nouveau client</Text>
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
                          <Text style={validationStyles.customerItemIconText}>👤</Text>
                        </View>
                        <View style={validationStyles.customerItemInfo}>
                          <Text style={validationStyles.customerItemName}>{customer.name}</Text>
                          <Text style={validationStyles.customerItemPhone}>{customer.phone}</Text>
                        </View>
                        <Text style={validationStyles.customerItemArrow}>›</Text>
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
                  <TextInput
                    style={validationStyles.formInput}
                    value={newCustomer.name}
                    onChangeText={(value) => setNewCustomer({ ...newCustomer, name: value })}
                    placeholder="Ex: Jean Dupont"
                    placeholderTextColor="#999"
                    autoFocus
                  />
                </View>

                <View style={validationStyles.formGroup}>
                  <Text style={validationStyles.formLabel}>Téléphone</Text>
                  <TextInput
                    style={validationStyles.formInput}
                    value={newCustomer.phone}
                    onChangeText={(value) => setNewCustomer({ ...newCustomer, phone: value })}
                    placeholder="+33 1 23 45 67 89"
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={validationStyles.formButtons}>
                  <TouchableOpacity
                    style={validationStyles.formCancelButton}
                    onPress={() => setModalMode('search')}
                  >
                    <Text style={validationStyles.formCancelText}>Annuler</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      validationStyles.formSubmitButton,
                      !newCustomer.name.trim() && validationStyles.formSubmitButtonDisabled
                    ]}
                    onPress={createCustomer}
                    disabled={!newCustomer.name.trim()}
                  >
                    <Text style={validationStyles.formSubmitText}>Créer</Text>
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