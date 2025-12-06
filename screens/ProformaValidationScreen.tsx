// screens/ProformaValidationScreen.tsx
import * as Haptics from 'expo-haptics';
import { useCallback, useState, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  Animated,
} from 'react-native';
import { validationStyles } from '../styles/CartValidationStyles';
import { Ionicons } from '@expo/vector-icons';
import { 
  proformaCartService, 
  ProformaItem, 
  ProformaCreationData 
} from '../services/proformaCartService';
import { customerService } from '../services/customerService';
import CustomerCreateModal from '../components/CustomerCreateModal';
import CustomerSearchModal from '../components/customerSearchModal';

// Types
type Customer = {
  type: 'particulier' | 'entreprise';
  email: string;
  sigle?: string;
  nom?: string;
  prenoms?: string;
  adresse?: string;
  telephone?: string;
};

// Fonction pour formater les prix avec séparateurs de milliers
const formatPrice = (price: number | undefined): string => {
  const value = price || 0;
  const formattedValue = value.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `€ ${formattedValue}`;
};

// Formater l'entrée numérique avec séparateurs
const formatNumberInput = (value: string): string => {
  if (!value) return '';
  const cleanValue = value.replace(/[^0-9.]/g, '');
  const numValue = parseFloat(cleanValue);
  if (isNaN(numValue)) return '';
  return numValue.toLocaleString('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
};

// Nettoyer la valeur numérique
const cleanNumberValue = (value: string): string => {
  return value.replace(/[^0-9.]/g, '');
};

// Obtenir le prix unitaire
const getItemPrice = (item: ProformaItem): number => {
  return item.prix_unitaire || item.prix_actuel || 0;
};

// Obtenir le nom d'affichage du client
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

export default function ProformaValidationScreen({ route, navigation }: any) {
  // États
  const { proformaItems = [], totalAmount = 0, totalItems = 0, onProformaCompleted } = route.params || {};
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [discount, setDiscount] = useState<string>('');
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>('percent');
  const [notes, setNotes] = useState<string>('');
  const [showCustomerSearchModal, setShowCustomerSearchModal] = useState(false);
  const [showCustomerCreateModal, setShowCustomerCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  const notesInputRef = useRef<TextInput>(null);

  // Initialisation
  const safeProformaItems: ProformaItem[] = Array.isArray(proformaItems) ? proformaItems : [];
  const subtotal = totalAmount || 0;
  const discountValue = parseFloat(discount) || 0;
  
  // Calculs
  const calculateDiscountAmount = () => {
    if (discountType === 'percent') {
      return subtotal * (discountValue / 100);
    } else {
      return Math.min(discountValue, subtotal);
    }
  };

  const discountAmount = calculateDiscountAmount();
  const netAmount = Math.max(0, subtotal - discountAmount);

  // Afficher le message de succès et préparer la navigation
  const showSuccessPopup = useCallback((message: string) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    
    // Animation d'entrée
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();

    // Planifier la disparition du message et la navigation
    setTimeout(() => {
      hideSuccessPopupAndNavigate();
    }, 2000); // 2 secondes
  }, [fadeAnim, slideAnim]);

  // Cacher le message de succès et naviguer
  const hideSuccessPopupAndNavigate = useCallback(() => {
    // Animation de sortie
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      setShowSuccessMessage(false);
      
      // Appeler le callback pour vider le proforma
      if (onProformaCompleted) {
        onProformaCompleted();
      }
      
      // Naviguer vers l'écran précédent (panier proforma)
      navigation.goBack();
    });
  }, [fadeAnim, slideAnim, navigation, onProformaCompleted]);

  // Gérer la fermeture manuelle du message
  const handleCloseSuccessPopup = useCallback(() => {
    hideSuccessPopupAndNavigate();
  }, [hideSuccessPopupAndNavigate]);

  // Charger les clients
  useEffect(() => {
    loadCustomers();
  }, []);

  // Focus sur champ notes
  useEffect(() => {
    if (selectedCustomer && notesInputRef.current) {
      setTimeout(() => {
        notesInputRef.current?.focus();
      }, 100);
    }
  }, [selectedCustomer]);

  // Fonctions
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

  const openSearchModal = useCallback(() => {
    setShowCustomerSearchModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const openCreateModal = useCallback(() => {
    setShowCustomerCreateModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const closeAllModals = useCallback(() => {
    setShowCustomerSearchModal(false);
    setShowCustomerCreateModal(false);
  }, []);

  const handleSelectCustomer = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    closeAllModals();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [closeAllModals]);

  const handleCustomerCreated = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomers(prev => {
      const exists = prev.some(c => c.email === customer.email);
      if (exists) return prev.map(c => c.email === customer.email ? customer : c);
      return [customer, ...prev];
    });
    closeAllModals();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Succès', 'Client créé avec succès');
  }, [closeAllModals]);

  const switchToCreate = useCallback(() => {
    setShowCustomerSearchModal(false);
    setShowCustomerCreateModal(true);
  }, []);

  const switchToSearch = useCallback(() => {
    setShowCustomerCreateModal(false);
    setShowCustomerSearchModal(true);
  }, []);

  const handleOpenSearchModal = useCallback(() => {
    loadCustomers();
    setShowCustomerSearchModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleDiscountTypeChange = useCallback((type: 'percent' | 'amount') => {
    setDiscountType(type);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDiscount('');
  }, []);

  // Vérifier les stocks insuffisants
  const getInsufficientStockItems = (): ProformaItem[] => {
    return safeProformaItems.filter(item => {
      const availableStock = item.quantiteDisponible || item.qte_disponible || 0;
      const requestedQuantity = item.quantiteAcheter || 0;
      return requestedQuantity > availableStock;
    });
  };

  const hasInsufficientStock = getInsufficientStockItems().length > 0;

  // Validation finale du proforma
  const handleFinalSubmit = useCallback(async () => {
    if (!selectedCustomer) {
      Alert.alert('Client requis', 'Veuillez sélectionner ou créer un client');
      return;
    }
    if (safeProformaItems.length === 0) {
      Alert.alert('Proforma vide', 'Ajoutez des produits avant de valider');
      return;
    }

    // Avertissement pour les stocks insuffisants (mais permettre quand même)
    if (hasInsufficientStock) {
      const insufficientItems = getInsufficientStockItems();
      const itemNames = insufficientItems.map(item => 
        `${item.designation}: ${item.quantiteAcheter} demandés, ${item.quantiteDisponible || item.qte_disponible} disponibles`
      ).join('\n');

      Alert.alert(
        'Attention - Stocks insuffisants',
        `Certains produits demandent plus que le stock disponible:\n\n${itemNames}\n\nVoulez-vous quand même créer le proforma?`,
        [
          { text: 'Annuler', style: 'cancel' },
          { 
            text: 'Créer quand même', 
            style: 'default',
            onPress: () => createProforma()
          }
        ]
      );
    } else {
      createProforma();
    }
  }, [selectedCustomer, safeProformaItems, hasInsufficientStock, discountValue, discountType, notes, subtotal, netAmount]);

  const createProforma = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSubmitting(true);

    try {
      // Création des données du proforma
      const proformaData: ProformaCreationData = {
        cartItems: safeProformaItems,
        clientEmail: selectedCustomer!.email,
        discountInfo: {
          discount_amount: discountValue,
          discount_type: discountType,
        },
        notes: notes,
        subtotal: subtotal,
        net_amount: netAmount
      };

      // Création du proforma
      const proformaResponse = await proformaCartService.createProforma(proformaData);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // AFFICHER LE MESSAGE DE SUCCÈS POPUP
      showSuccessPopup('Proforma créé avec succès!');

    } catch (error: any) {
      console.error('Erreur création proforma:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erreur', error.message || 'Impossible de créer le proforma');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modal pour afficher les détails des stocks insuffisants
  const renderStockWarningModal = () => {
    const insufficientItems = getInsufficientStockItems();
    if (insufficientItems.length === 0) return null;

    return (
      <View style={validationStyles.warningCard}>
        <View style={validationStyles.warningHeader}>
          <Ionicons name="alert-circle-outline" size={24} color="#FF9500" />
          <Text style={validationStyles.warningTitle}>Attention - Stocks insuffisants</Text>
        </View>
        <View style={validationStyles.warningContent}>
          <Text style={validationStyles.warningText}>
            Certains produits demandent plus que le stock disponible.
          </Text>
          <ScrollView style={validationStyles.warningItemsList}>
            {insufficientItems.map((item, index) => (
              <View key={item.id || index} style={validationStyles.warningItem}>
                <Text style={validationStyles.warningItemName}>{item.designation}</Text>
                <View style={validationStyles.warningItemDetails}>
                  <Text style={validationStyles.warningItemStock}>
                    Stock: {item.quantiteDisponible || item.qte_disponible}
                  </Text>
                  <Text style={validationStyles.warningItemRequested}>
                    Demandé: {item.quantiteAcheter}
                  </Text>
                  <Text style={validationStyles.warningItemDiff}>
                    Différence: {item.quantiteAcheter - (item.quantiteDisponible || item.qte_disponible)}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
          <Text style={validationStyles.warningNote}>
            Note: Ce proforma est une commande future qui nécessitera une réapprovisionnement.
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={validationStyles.safeArea}>
      {/* Header */}
      <View style={validationStyles.header}>
        <TouchableOpacity style={validationStyles.backButton} onPress={() => navigation.goBack()} disabled={isSubmitting}>
          <Ionicons name="arrow-back" size={24} color="#6B7280" />
        </TouchableOpacity>
        <View style={validationStyles.headerTitleContainer}>
          <Text style={validationStyles.headerTitle}>Validation Proforma</Text>
          <View style={[validationStyles.headerBadge, { backgroundColor: '#6B7280' }]}>
            <Text style={validationStyles.headerBadgeText}>{totalItems}</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Contenu principal */}
      <ScrollView style={validationStyles.container} contentContainerStyle={validationStyles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        
        {/* Section Client */}
        <View style={validationStyles.section}>
          <Text style={validationStyles.sectionTitle}>CLIENT</Text>
          <View style={validationStyles.clientButtonsContainer}>
            <TouchableOpacity style={validationStyles.clientButton} onPress={handleOpenSearchModal} disabled={isSubmitting}>
              <Ionicons name="search" size={24} color="#6B7280" />
              <Text style={validationStyles.clientButtonText}>Rechercher</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[validationStyles.clientButton, validationStyles.clientButtonPrimary]} onPress={openCreateModal} disabled={isSubmitting}>
              <Ionicons name="person-add" size={24} color="#FFF" />
              <Text style={validationStyles.clientButtonTextPrimary}>Nouveau</Text>
            </TouchableOpacity>
          </View>

          {/* Client sélectionné */}
          {selectedCustomer ? (
            <View style={validationStyles.selectedClientCard}>
              <View style={validationStyles.selectedClientHeader}>
                <View style={[validationStyles.clientAvatar, { backgroundColor: selectedCustomer.type === 'entreprise' ? '#E8F4FF' : '#F0F8FF' }]}>
                  <Ionicons name={selectedCustomer.type === 'entreprise' ? 'business' : 'person'} size={24} color={selectedCustomer.type === 'entreprise' ? '#0056B3' : '#6B7280'} />
                </View>
                <View style={validationStyles.selectedClientInfo}>
                  <Text style={validationStyles.selectedClientName}>{getCustomerDisplayName(selectedCustomer)}</Text>
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
                <TouchableOpacity style={validationStyles.changeClientButton} onPress={handleOpenSearchModal}>
                  <Ionicons name="create" size={18} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={validationStyles.noClientCard}>
              <View style={validationStyles.noClientIconContainer}>
                <Ionicons name="person-outline" size={48} color="#D1D1D6" />
              </View>
              <Text style={validationStyles.noClientText}>Aucun client sélectionné</Text>
              <Text style={validationStyles.noClientSubtext}>Choisissez un client existant ou créez-en un nouveau</Text>
            </View>
          )}
        </View>

        {/* Section Récapitulatif */}
        <View style={validationStyles.section}>
          <View style={validationStyles.sectionHeader}>
            <Text style={validationStyles.sectionTitle}>RÉCAPITULATIF PROFORMA</Text>
            <View style={[validationStyles.itemsCountBadge, { backgroundColor: '#6B7280' }]}>
              <Text style={validationStyles.itemsCountText}>{safeProformaItems.length} article(s)</Text>
            </View>
          </View>

          {/* Articles */}
          <View style={validationStyles.summaryCard}>
            {safeProformaItems.map((item: ProformaItem, index: number) => {
              const itemPrice = getItemPrice(item);
              const itemAmount = item.montant || 0;
              const itemQuantity = item.quantiteAcheter || 0;
              const availableStock = item.quantiteDisponible || item.qte_disponible || 0;
              const hasSufficientStock = itemQuantity <= availableStock;
              
              return (
                <View key={item.id || index} style={[validationStyles.summaryItem, index !== safeProformaItems.length - 1 && validationStyles.summaryItemBorder]}>
                  <View style={validationStyles.summaryItemMain}>
                    <View style={validationStyles.summaryItemHeader}>
                      <Text style={validationStyles.summaryItemName} numberOfLines={1}>{item.designation || 'Produit sans nom'}</Text>
                      <Text style={validationStyles.summaryItemPrice}>{formatPrice(itemAmount)}</Text>
                    </View>
                    <Text style={validationStyles.summaryItemRef}>{item.ref_produit || 'N/A'}</Text>
                    <View style={validationStyles.summaryItemDetails}>
                      <View style={[validationStyles.quantityBadge, hasSufficientStock ? { backgroundColor: '#34C759' } : { backgroundColor: '#FF9500' }]}>
                        <Text style={validationStyles.quantityBadgeText}>{itemQuantity.toLocaleString('fr-FR')}</Text>
                      </View>
                      <Text style={validationStyles.summaryItemDetailText}>× {formatPrice(itemPrice)}</Text>
                      {!hasSufficientStock && (
                        <View style={validationStyles.stockWarningBadge}>
                          <Ionicons name="alert-circle" size={12} color="#FF9500" />
                          <Text style={validationStyles.stockWarningText}>Stock insuffisant</Text>
                        </View>
                      )}
                    </View>
                    {!hasSufficientStock && (
                      <View style={validationStyles.stockInfoRow}>
                        <Text style={validationStyles.stockInfoText}>
                          Stock disponible: {availableStock} unités
                        </Text>
                        <Text style={[validationStyles.stockInfoText, { color: '#FF9500' }]}>
                          Manquant: {itemQuantity - availableStock} unités
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {/* Avertissement stocks insuffisants */}
          {hasInsufficientStock && renderStockWarningModal()}

          {/* Totaux avec remise */}
          <View style={validationStyles.totalCard}>
            {/* Sous-total */}
            <View style={validationStyles.totalRow}>
              <Text style={validationStyles.totalLabel}>Sous-total</Text>
              <Text style={validationStyles.totalValue}>{formatPrice(subtotal)}</Text>
            </View>

            {/* Remise */}
            <View style={validationStyles.totalRow}>
              <View style={validationStyles.discountContainer}>
                <Text style={validationStyles.totalLabel}>Remise</Text>
                <View style={validationStyles.discountControls}>
                  <View style={validationStyles.discountTypeButtons}>
                    <TouchableOpacity style={[validationStyles.discountTypeButton, discountType === 'percent' && validationStyles.discountTypeButtonActive]} onPress={() => handleDiscountTypeChange('percent')}>
                      <Text style={[validationStyles.discountTypeButtonText, discountType === 'percent' && validationStyles.discountTypeButtonTextActive]}>%</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[validationStyles.discountTypeButton, discountType === 'amount' && validationStyles.discountTypeButtonActive]} onPress={() => handleDiscountTypeChange('amount')}>
                      <Text style={[validationStyles.discountTypeButtonText, discountType === 'amount' && validationStyles.discountTypeButtonTextActive]}>€</Text>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={validationStyles.discountInput}
                    value={formatNumberInput(discount)}
                    onChangeText={(value) => {
                      const numericValue = cleanNumberValue(value);
                      const parts = numericValue.split('.');
                      if (parts.length > 1) {
                        parts[1] = parts[1].slice(0, 2);
                        setDiscount(parts.join('.'));
                      } else {
                        setDiscount(numericValue);
                      }
                    }}
                    placeholder={discountType === 'percent' ? "0,00" : "0,00"}
                    keyboardType="decimal-pad"
                    textAlign="right"
                    maxLength={discountType === 'percent' ? 10 : 15}
                  />
                </View>
              </View>
              <Text style={[validationStyles.totalValue, { color: '#FF9500' }]}>-{formatPrice(discountAmount)}</Text>
            </View>

            {/* Séparateur */}
            <View style={validationStyles.totalDivider} />

            {/* Montant total estimé */}
            <View style={validationStyles.totalRow}>
              <Text style={validationStyles.totalLabelMain}>MONTANT TOTAL ESTIMÉ</Text>
              <Text style={[validationStyles.totalValueMain, { color: '#6B7280' }]}>{formatPrice(netAmount)}</Text>
            </View>
          </View>
        </View>

        {/* Section Notes */}
        <View style={validationStyles.section}>
          <View style={validationStyles.sectionHeader}>
            <Text style={validationStyles.sectionTitle}>NOTES & INFORMATIONS</Text>
          </View>

          <View style={validationStyles.notesSection}>
            <Text style={validationStyles.notesLabel}>Notes additionnelles</Text>
            <TextInput
              ref={notesInputRef}
              style={validationStyles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Notes pour ce proforma (conditions de livraison, délais, etc.)..."
              multiline
              numberOfLines={4}
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={validationStyles.notesHelpText}>
              Ces notes seront incluses dans le proforma pour référence.
            </Text>
          </View>

          {/* Informations sur le proforma */}
          <View style={validationStyles.infoCard}>
            <View style={validationStyles.infoRow}>
              <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
              <Text style={validationStyles.infoText}>
                Ce proforma est une commande future qui servira de devis pour le client.
              </Text>
            </View>
            <View style={validationStyles.infoRow}>
              <Ionicons name="time-outline" size={20} color="#6B7280" />
              <Text style={validationStyles.infoText}>
                Validité recommandée: 30 jours à partir de la date de création.
              </Text>
            </View>
            {hasInsufficientStock && (
              <View style={validationStyles.infoRow}>
                <Ionicons name="alert-circle-outline" size={20} color="#FF9500" />
                <Text style={[validationStyles.infoText, { color: '#FF9500' }]}>
                  Ce proforma nécessitera une réapprovisionnement avant livraison.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={validationStyles.footer}>
        <View style={validationStyles.footerTotal}>
          <Text style={validationStyles.footerTotalLabel}>Montant estimé</Text>
          <Text style={[validationStyles.footerTotalAmount, { color: '#6B7280' }]}>{formatPrice(netAmount)}</Text>
        </View>
        <TouchableOpacity
          style={[
            validationStyles.validateButton,
            (!selectedCustomer || isSubmitting || safeProformaItems.length === 0) && 
            validationStyles.validateButtonDisabled,
            { backgroundColor: '#6B7280' }
          ]}
          onPress={handleFinalSubmit}
          disabled={!selectedCustomer || isSubmitting || safeProformaItems.length === 0}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Text style={validationStyles.validateButtonText}>
                Créer le proforma
              </Text>
              <Ionicons name="document-text-outline" size={20} color="#FFF" style={{ marginLeft: 8 }} />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Message de succès UNIQUEMENT après création de proforma */}
      {showSuccessMessage && (
        <Animated.View 
          style={[
            validationStyles.successToast,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={validationStyles.successToastContent}>
            <View style={[validationStyles.successToastIcon, { backgroundColor: '#6B7280' }]}>
              <Ionicons name="document-text" size={24} color="#FFF" />
            </View>
            <Text style={validationStyles.successToastText}>{successMessage}</Text>
            <TouchableOpacity 
              style={validationStyles.successToastClose}
              onPress={handleCloseSuccessPopup}
            >
              <Ionicons name="close" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Modals */}
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