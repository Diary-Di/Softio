// screens/CartValidationScreen.tsx
import * as Haptics from 'expo-haptics';
import { useCallback, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { validationStyles } from '../styles/CartValidationStyles';
import { Ionicons } from '@expo/vector-icons';
import { cartService, CartItem } from '../services/cartService';
import { customerService } from '../services/customerService';
//import CustomerSearchModal from '../components/CustomerSearchModal';
import CustomerCreateModal from '../components/CustomerCreateModal';
import CustomerSearchModal from '@/components/customerSearchModal';

type Customer = {
  type: 'particulier' | 'entreprise';
  email: string;
  sigle?: string;
  nom?: string;
  prenoms?: string;
  adresse?: string;
  telephone?: string;
};

type PaymentMethod = 'cash' | 'card' | 'mobile' | 'transfer' | 'check';

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
  
  return customer.email;
};

// Configuration des méthodes de paiement
const PAYMENT_METHODS = [
  {
    id: 'cash' as PaymentMethod,
    name: 'Espèces',
    icon: 'cash-outline',
    color: '#34C759',
    description: 'Paiement en espèces'
  },
  {
    id: 'card' as PaymentMethod,
    name: 'Carte bancaire',
    icon: 'card-outline',
    color: '#007AFF',
    description: 'Paiement par carte'
  },
  {
    id: 'mobile' as PaymentMethod,
    name: 'Mobile',
    icon: 'phone-portrait-outline',
    color: '#5856D6',
    description: 'Paiement mobile'
  },
  {
    id: 'transfer' as PaymentMethod,
    name: 'Virement',
    icon: 'swap-horizontal-outline',
    color: '#FF9500',
    description: 'Virement bancaire'
  },
  {
    id: 'check' as PaymentMethod,
    name: 'Chèque',
    icon: 'document-text-outline',
    color: '#FF3B30',
    description: 'Paiement par chèque'
  }
];

export default function CartValidationScreen({ route, navigation }: any) {
  const { cart = [], totalAmount = 0, totalItems = 0 } = route.params || {};
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [showCustomerSearchModal, setShowCustomerSearchModal] = useState(false);
  const [showCustomerCreateModal, setShowCustomerCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

  // S'assurer que cart est un tableau
  const safeCart: CartItem[] = Array.isArray(cart) ? cart : [];

  // Charger les clients au démarrage
  useEffect(() => {
    loadCustomers();
  }, []);

  // Charger les clients depuis l'API
  const loadCustomers = async () => {
    try {
      setIsLoadingCustomers(true);
      const allCustomers = await customerService.getCustomers();
      setCustomers(allCustomers);
    } catch (error) {
      console.error('Erreur chargement clients:', error);
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  // Ouvrir modal de recherche
  const openSearchModal = useCallback(() => {
    setShowCustomerSearchModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Ouvrir modal de création
  const openCreateModal = useCallback(() => {
    setShowCustomerCreateModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Fermer tous les modals
  const closeAllModals = useCallback(() => {
    setShowCustomerSearchModal(false);
    setShowCustomerCreateModal(false);
  }, []);

  // Gérer la sélection d'un client
  const handleSelectCustomer = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    closeAllModals();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [closeAllModals]);

  // Gérer la création d'un client
  const handleCustomerCreated = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    // Ajouter le nouveau client à la liste existante
    setCustomers(prev => {
      // Vérifier si le client n'existe pas déjà
      const exists = prev.some(c => c.email === customer.email);
      if (exists) {
        return prev.map(c => c.email === customer.email ? customer : c);
      }
      return [customer, ...prev];
    });
    closeAllModals();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Succès', 'Client créé avec succès');
  }, [closeAllModals]);

  // Gérer la sélection du mode de paiement
  const handlePaymentMethodSelect = useCallback((method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Basculer vers la création
  const switchToCreate = useCallback(() => {
    setShowCustomerSearchModal(false);
    setShowCustomerCreateModal(true);
  }, []);

  // Basculer vers la recherche
  const switchToSearch = useCallback(() => {
    setShowCustomerCreateModal(false);
    setShowCustomerSearchModal(true);
  }, []);

  // Recharger les clients quand on ouvre le modal de recherche
  const handleOpenSearchModal = useCallback(() => {
    loadCustomers();
    setShowCustomerSearchModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Valider la commande finale
  const handleFinalSubmit = useCallback(async () => {
    if (!selectedCustomer) {
      Alert.alert('Client requis', 'Veuillez sélectionner ou créer un client');
      return;
    }

    if (!selectedPaymentMethod) {
      Alert.alert('Mode de paiement requis', 'Veuillez sélectionner un mode de paiement');
      return;
    }

    if (safeCart.length === 0) {
      Alert.alert('Panier vide', 'Ajoutez des produits avant de valider');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSubmitting(true);

    try {
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

      // Inclure le mode de paiement dans les données de vente
      const saleResponse = await cartService.createSale(
        safeCart, 
        selectedCustomer.email,
        `Mode de paiement: ${getPaymentMethodName(selectedPaymentMethod)}`
      );

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert(
        'Succès',
        `Vente enregistrée avec succès\n` +
        `Client: ${getCustomerDisplayName(selectedCustomer)}\n` +
        `Mode de paiement: ${getPaymentMethodName(selectedPaymentMethod)}\n` +
        `Total: ${formatPrice(totalAmount)}\n` +
        `Référence: ${saleResponse.data?.id || 'N/A'}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Home')
          },
          {
            text: 'Voir le reçu',
            onPress: () => navigation.navigate('Receipt', { 
              saleId: saleResponse.data?.id,
              paymentMethod: selectedPaymentMethod 
            })
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
  }, [selectedCustomer, selectedPaymentMethod, safeCart, totalAmount, navigation]);

  // Obtenir le nom du mode de paiement
  const getPaymentMethodName = (method: PaymentMethod | null): string => {
    if (!method) return 'Non spécifié';
    const payment = PAYMENT_METHODS.find(p => p.id === method);
    return payment?.name || 'Non spécifié';
  };

  // Rendu d'une méthode de paiement
  const renderPaymentMethod = (method: typeof PAYMENT_METHODS[0]) => (
    <TouchableOpacity
      key={method.id}
      style={[
        validationStyles.paymentMethodItem,
        selectedPaymentMethod === method.id && validationStyles.paymentMethodItemSelected
      ]}
      onPress={() => handlePaymentMethodSelect(method.id)}
      activeOpacity={0.7}
    >
      <View style={[
        validationStyles.paymentMethodIconContainer,
        { backgroundColor: selectedPaymentMethod === method.id ? method.color : '#F2F2F7' }
      ]}>
        <Ionicons 
          name={method.icon as any} 
          size={24} 
          color={selectedPaymentMethod === method.id ? '#FFFFFF' : method.color} 
        />
      </View>
      <View style={validationStyles.paymentMethodInfo}>
        <Text style={[
          validationStyles.paymentMethodName,
          selectedPaymentMethod === method.id && { color: method.color }
        ]}>
          {method.name}
        </Text>
        <Text style={validationStyles.paymentMethodDescription}>
          {method.description}
        </Text>
      </View>
      {selectedPaymentMethod === method.id && (
        <View style={[
          validationStyles.paymentMethodCheckmark,
          { backgroundColor: method.color }
        ]}>
          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
        </View>
      )}
    </TouchableOpacity>
  );

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
              onPress={handleOpenSearchModal}
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
                <View style={[
                  validationStyles.clientAvatar,
                  { backgroundColor: selectedCustomer.type === 'entreprise' ? '#E8F4FF' : '#F0F8FF' }
                ]}>
                  <Ionicons 
                    name={selectedCustomer.type === 'entreprise' ? 'business' : 'person'} 
                    size={24} 
                    color={selectedCustomer.type === 'entreprise' ? '#0056B3' : '#007AFF'} 
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
                  </View>
                </View>
                <TouchableOpacity
                  style={validationStyles.changeClientButton}
                  onPress={handleOpenSearchModal}
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

        {/* Section Mode de paiement */}
        <View style={validationStyles.section}>
          <View style={validationStyles.sectionHeader}>
            <Text style={validationStyles.sectionTitle}>MODE DE PAIEMENT *</Text>
          </View>

          <View style={validationStyles.paymentMethodsContainer}>
            {PAYMENT_METHODS.map(renderPaymentMethod)}
          </View>

          {selectedPaymentMethod && (
            <View style={validationStyles.selectedPaymentCard}>
              <View style={validationStyles.selectedPaymentHeader}>
                <View style={[
                  validationStyles.selectedPaymentIcon,
                  { backgroundColor: PAYMENT_METHODS.find(p => p.id === selectedPaymentMethod)?.color || '#007AFF' }
                ]}>
                  <Ionicons 
                    name={PAYMENT_METHODS.find(p => p.id === selectedPaymentMethod)?.icon as any || 'card-outline'} 
                    size={20} 
                    color="#FFFFFF" 
                  />
                </View>
                <View style={validationStyles.selectedPaymentInfo}>
                  <Text style={validationStyles.selectedPaymentName}>
                    {getPaymentMethodName(selectedPaymentMethod)} sélectionné
                  </Text>
                  <Text style={validationStyles.selectedPaymentDescription}>
                    {PAYMENT_METHODS.find(p => p.id === selectedPaymentMethod)?.description}
                  </Text>
                </View>
                <TouchableOpacity
                  style={validationStyles.changePaymentButton}
                  onPress={() => setSelectedPaymentMethod(null)}
                >
                  <Ionicons name="close" size={18} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
          )}
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
            (!selectedCustomer || !selectedPaymentMethod || isSubmitting || safeCart.length === 0) && 
            validationStyles.validateButtonDisabled
          ]}
          onPress={handleFinalSubmit}
          disabled={!selectedCustomer || !selectedPaymentMethod || isSubmitting || safeCart.length === 0}
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

      {/* Modals séparés */}
      <CustomerSearchModal
        visible={showCustomerSearchModal}
        onClose={closeAllModals}
        onSelectCustomer={handleSelectCustomer}
        onSwitchToCreate={switchToCreate}
        initialCustomers={customers}
        isLoading={isLoadingCustomers}
      />

      <CustomerCreateModal
        visible={showCustomerCreateModal}
        onClose={closeAllModals}
        onCustomerCreated={handleCustomerCreated}
        onSwitchToSearch={switchToSearch}
        existingCustomers={customers}
      />
    </SafeAreaView>
  );
}