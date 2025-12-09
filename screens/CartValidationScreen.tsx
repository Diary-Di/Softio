// screens/CartValidationScreen.tsx
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
import { cartService, CartItem, SaleCreationData, PaymentMethod } from '../services/cartService';
import { customerService, Customer } from '../services/customerService';
import CustomerCreateModal from '../components/CustomerCreateModal';
import CustomerSearchModal from '../components/customerSearchModal';


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
const getItemPrice = (item: CartItem): number => {
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
  return customer.email || `Client #${customer.identifiant}`;
};

// Méthodes de paiement
const PAYMENT_METHODS = [
  { id: 'cash' as PaymentMethod, name: 'Espèces', icon: 'cash-outline', color: '#34C759', description: 'Paiement en espèces' },
  { id: 'card' as PaymentMethod, name: 'Carte bancaire', icon: 'card-outline', color: '#007AFF', description: 'Paiement par carte' },
  { id: 'mobile' as PaymentMethod, name: 'Mobile', icon: 'phone-portrait-outline', color: '#5856D6', description: 'Paiement mobile' },
  { id: 'transfer' as PaymentMethod, name: 'Virement', icon: 'swap-horizontal-outline', color: '#FF9500', description: 'Virement bancaire' },
  { id: 'check' as PaymentMethod, name: 'Chèque', icon: 'document-text-outline', color: '#FF3B30', description: 'Paiement par chèque' }
];

export default function CartValidationScreen({ route, navigation }: any) {
  // États
  const { cart = [], totalAmount = 0, totalItems = 0, onSaleCompleted } = route.params || {};
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [discount, setDiscount] = useState<string>('');
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>('percent');
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [condition, setCondition] = useState<string>('');
  const [showCustomerSearchModal, setShowCustomerSearchModal] = useState(false);
  const [showCustomerCreateModal, setShowCustomerCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  const amountPaidInputRef = useRef<TextInput>(null);
  const conditionInputRef = useRef<TextInput>(null);

  // Initialisation
  const safeCart: CartItem[] = Array.isArray(cart) ? cart : [];
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
  const paidAmount = parseFloat(amountPaid) || 0;
  const changeAmount = Math.max(0, paidAmount - netAmount);
  const remainingAmount = Math.max(0, netAmount - paidAmount);

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
      
      // Appeler le callback pour vider le panier
      if (onSaleCompleted) {
        onSaleCompleted();
      }
      
      // Naviguer vers l'écran précédent (panier)
      navigation.goBack();
    });
  }, [fadeAnim, slideAnim, navigation, onSaleCompleted]);

  // Gérer la fermeture manuelle du message
  const handleCloseSuccessPopup = useCallback(() => {
    hideSuccessPopupAndNavigate();
  }, [hideSuccessPopupAndNavigate]);

  // Charger les clients
  useEffect(() => {
    loadCustomers();
  }, []);

  // Focus sur champ montant payé et condition
  useEffect(() => {
    if (selectedPaymentMethod && amountPaidInputRef.current && netAmount > 0) {
      setTimeout(() => {
        amountPaidInputRef.current?.focus();
        setAmountPaid(netAmount.toFixed(2));
        setCondition(paidAmount >= netAmount ? 'Payé comptant' : 'À crédit');
      }, 100);
    }
  }, [selectedPaymentMethod, netAmount]);

  // Mettre à jour la condition quand le montant payé change
  useEffect(() => {
    if (paidAmount >= netAmount) {
      setCondition('Payé comptant');
    } else {
      setCondition('À crédit');
    }
  }, [paidAmount, netAmount]);

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

  const openPaymentModal = useCallback(() => {
    setShowPaymentModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const closeAllModals = useCallback(() => {
    setShowCustomerSearchModal(false);
    setShowCustomerCreateModal(false);
    setShowPaymentModal(false);
  }, []);

  const handleSelectCustomer = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    closeAllModals();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [closeAllModals]);

  const handleCustomerCreated = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomers(prev => {
      const exists = prev.some(c => c.identifiant === customer.identifiant);
      if (exists) return prev.map(c => c.identifiant === customer.identifiant ? customer : c);
      return [customer, ...prev];
    });
    closeAllModals();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Succès', 'Client créé avec succès');
  }, [closeAllModals]);

  const handlePaymentMethodSelect = useCallback((method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowPaymentModal(false);
  }, []);

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

  const getPaymentMethodName = (method: PaymentMethod | null): string => {
    if (!method) return 'Non spécifié';
    const payment = PAYMENT_METHODS.find(p => p.id === method);
    return payment?.name || 'Non spécifié';
  };

  // Validation finale
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
    if (!condition.trim()) {
      Alert.alert('Condition requise', 'Veuillez saisir la condition de paiement');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSubmitting(true);

    try {
      // Validation stock
      const stockValidation = await cartService.validateStock(safeCart);
      if (!stockValidation.valid) {
        const errorMessages = stockValidation.results.filter(r => !r.valid).map(r => r.message).join('\n');
        Alert.alert('Stock insuffisant', errorMessages);
        setIsSubmitting(false);
        return;
      }

      // Notes de vente
      const notes = [
        `Condition: ${condition}`,
        paidAmount >= netAmount 
          ? `Monnaie rendue: ${formatPrice(changeAmount)}`
          : `Reste dû: ${formatPrice(remainingAmount)}`,
      ];

      // Création des données de vente
      const saleData: SaleCreationData = {
        cartItems: safeCart,
        clientId: selectedCustomer.identifiant, // Utilisation de identifiant
        paymentInfo: {
          method: selectedPaymentMethod,
          amount_paid: paidAmount,
          discount_amount: discountValue,
          discount_type: discountType,
          condition: condition,
          change_amount: changeAmount,
          remaining_amount: remainingAmount
        },
        notes: notes.join('\n'),
        subtotal: subtotal,
        net_amount: netAmount
      };

      // Création vente
      const saleResponse = await cartService.createSale(saleData);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // AFFICHER LE MESSAGE DE SUCCÈS POPUP UNIQUEMENT ICI
      showSuccessPopup('Vente enregistrée avec succès!');

    } catch (error: any) {
      console.error('Erreur création vente:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erreur', error.message || 'Impossible d\'enregistrer la vente');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedCustomer, selectedPaymentMethod, safeCart, netAmount, paidAmount, changeAmount, remainingAmount, condition, subtotal, discountValue, discountType, showSuccessPopup]);

  // Modal paiement
  const renderPaymentModal = () => (
    <Modal visible={showPaymentModal} transparent animationType="slide" onRequestClose={() => setShowPaymentModal(false)}>
      <View style={validationStyles.modalOverlay}>
        <View style={validationStyles.modalContent}>
          <View style={validationStyles.modalHeader}>
            <View style={validationStyles.modalHandle}><View style={validationStyles.modalHandle} /></View>
            <Text style={validationStyles.modalTitle}>Sélectionner le mode de paiement</Text>
            <TouchableOpacity style={validationStyles.modalCloseButton} onPress={() => setShowPaymentModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <ScrollView style={validationStyles.paymentMethodsList}>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[validationStyles.paymentMethodItem, selectedPaymentMethod === method.id && validationStyles.paymentMethodItemSelected]}
                onPress={() => handlePaymentMethodSelect(method.id)}
                activeOpacity={0.7}
              >
                <View style={[validationStyles.paymentMethodIconContainer, { backgroundColor: method.color }]}>
                  <Ionicons name={method.icon as any} size={24} color="#FFFFFF" />
                </View>
                <View style={validationStyles.paymentMethodInfo}>
                  <Text style={validationStyles.paymentMethodName}>{method.name}</Text>
                  <Text style={validationStyles.paymentMethodDescription}>{method.description}</Text>
                </View>
                {selectedPaymentMethod === method.id && (
                  <View style={validationStyles.paymentMethodCheckmark}>
                    <Ionicons name="checkmark" size={20} color="#007AFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={validationStyles.safeArea}>
      {/* Header */}
      <View style={validationStyles.header}>
        <TouchableOpacity style={validationStyles.backButton} onPress={() => navigation.goBack()} disabled={isSubmitting}>
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

      {/* Contenu principal */}
      <ScrollView style={validationStyles.container} contentContainerStyle={validationStyles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        
        {/* Section Client */}
        <View style={validationStyles.section}>
          <Text style={validationStyles.sectionTitle}>CLIENT</Text>
          <View style={validationStyles.clientButtonsContainer}>
            <TouchableOpacity style={validationStyles.clientButton} onPress={handleOpenSearchModal} disabled={isSubmitting}>
              <Ionicons name="search" size={24} color="#007AFF" />
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
                  <Ionicons name={selectedCustomer.type === 'entreprise' ? 'business' : 'person'} size={24} color={selectedCustomer.type === 'entreprise' ? '#0056B3' : '#007AFF'} />
                </View>
                
                <View style={validationStyles.selectedClientInfo}>
                  <Text style={validationStyles.selectedClientName}>{getCustomerDisplayName(selectedCustomer)}</Text>
                  <View style={validationStyles.selectedClientDetails}>
                    <View style={validationStyles.clientDetailRow}>
                      <Ionicons name="mail" size={14} color="#8E8E93" style={{ marginRight: 4 }} />
                      <Text style={validationStyles.selectedClientEmail}>
                          {selectedCustomer.email || 'Aucun email'}
                      </Text>
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
              <Text style={validationStyles.noClientSubtext}>Choisissez un client existant ou créez-en un nouveau</Text>
            </View>
          )}
        </View>

        {/* Section Récapitulatif */}
        <View style={validationStyles.section}>
          <View style={validationStyles.sectionHeader}>
            <Text style={validationStyles.sectionTitle}>RÉCAPITULATIF</Text>
            <View style={validationStyles.itemsCountBadge}>
              <Text style={validationStyles.itemsCountText}>{safeCart.length} article(s)</Text>
            </View>
          </View>

          {/* Articles */}
          <View style={validationStyles.summaryCard}>
            {safeCart.map((item: CartItem, index: number) => {
              const itemPrice = getItemPrice(item);
              const itemAmount = item.montant || 0;
              const itemQuantity = item.quantiteAcheter || 0;
              
              return (
                <View key={item.id || index} style={[validationStyles.summaryItem, index !== safeCart.length - 1 && validationStyles.summaryItemBorder]}>
                  <View style={validationStyles.summaryItemMain}>
                    <View style={validationStyles.summaryItemHeader}>
                      <Text style={validationStyles.summaryItemName} numberOfLines={1}>{item.designation || 'Produit sans nom'}</Text>
                      <Text style={validationStyles.summaryItemPrice}>{formatPrice(itemAmount)}</Text>
                    </View>
                    <Text style={validationStyles.summaryItemRef}>{item.ref_produit || 'N/A'}</Text>
                    <View style={validationStyles.summaryItemDetails}>
                      <View style={validationStyles.quantityBadge}>
                        <Text style={validationStyles.quantityBadgeText}>{itemQuantity.toLocaleString('fr-FR')}</Text>
                      </View>
                      <Text style={validationStyles.summaryItemDetailText}>× {formatPrice(itemPrice)}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

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

            {/* Net à payer */}
            <View style={validationStyles.totalRow}>
              <Text style={validationStyles.totalLabelMain}>NET À PAYER</Text>
              <Text style={[validationStyles.totalValueMain, { color: discountAmount > 0 ? '#FF9500' : '#007AFF' }]}>{formatPrice(netAmount)}</Text>
            </View>
          </View>
        </View>

        {/* Section Paiement */}
        <View style={validationStyles.section}>
          <View style={validationStyles.sectionHeader}>
            <Text style={validationStyles.sectionTitle}>PAIEMENT</Text>
          </View>

          {/* Mode de paiement */}
          <View style={validationStyles.paymentSection}>
            <Text style={validationStyles.paymentLabel}>Mode de paiement *</Text>
            {selectedPaymentMethod ? (
              <TouchableOpacity style={validationStyles.selectedPaymentMethodCard} onPress={openPaymentModal} activeOpacity={0.7}>
                <View style={[validationStyles.selectedPaymentIcon, { backgroundColor: PAYMENT_METHODS.find(p => p.id === selectedPaymentMethod)?.color || '#007AFF' }]}>
                  <Ionicons name={PAYMENT_METHODS.find(p => p.id === selectedPaymentMethod)?.icon as any || 'card-outline'} size={20} color="#FFFFFF" />
                </View>
                <View style={validationStyles.selectedPaymentInfo}>
                  <Text style={validationStyles.selectedPaymentName}>{getPaymentMethodName(selectedPaymentMethod)}</Text>
                  <Text style={validationStyles.selectedPaymentDescription}>{PAYMENT_METHODS.find(p => p.id === selectedPaymentMethod)?.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={validationStyles.selectPaymentMethodButton} onPress={openPaymentModal} activeOpacity={0.7}>
                <Ionicons name="card-outline" size={24} color="#007AFF" style={{ marginRight: 8 }} />
                <Text style={validationStyles.selectPaymentMethodText}>Sélectionner le mode de paiement</Text>
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
              </TouchableOpacity>
            )}
          </View>

          {/* Montant payé par le client */}
          {selectedPaymentMethod && netAmount > 0 && (
            <View style={validationStyles.amountPaidSection}>
              <Text style={validationStyles.amountPaidLabel}>Montant payé par le client *</Text>
              <View style={validationStyles.amountPaidContainer}>
                <Text style={validationStyles.amountPaidSymbol}>€</Text>
                <TextInput
                  ref={amountPaidInputRef}
                  style={validationStyles.amountPaidInput}
                  value={formatNumberInput(amountPaid)}
                  onChangeText={(value) => {
                    const numericValue = cleanNumberValue(value);
                    const parts = numericValue.split('.');
                    if (parts.length > 1) {
                      parts[1] = parts[1].slice(0, 2);
                      setAmountPaid(parts.join('.'));
                    } else {
                      setAmountPaid(numericValue);
                    }
                  }}
                  placeholder="0,00"
                  keyboardType="decimal-pad"
                  textAlign="right"
                  maxLength={15}
                />
              </View>

              {/* Monnaie à rendre ou Reste dû */}
              {paidAmount > 0 && (
                <View style={validationStyles.changeSection}>
                  {paidAmount >= netAmount ? (
                    // Cas 1: Client a payé suffisamment - Monnaie à rendre
                    <>
                      <View style={validationStyles.changeRow}>
                        <Text style={validationStyles.changeLabel}>Monnaie à rendre</Text>
                        <Text style={[validationStyles.changeValue, { color: '#34C759' }]}>
                          {formatPrice(changeAmount)}
                        </Text>
                      </View>
                      {changeAmount > 0 && (
                        <View style={validationStyles.changeBreakdown}>
                          <Text style={validationStyles.changeBreakdownText}>
                            {`Client paye ${formatPrice(paidAmount)} - Net à payer ${formatPrice(netAmount)} = `}
                            <Text style={{ color: '#34C759', fontWeight: '600' }}>
                              {formatPrice(changeAmount)} à rendre
                            </Text>
                          </Text>
                        </View>
                      )}
                    </>
                  ) : (
                    // Cas 2: Client n'a pas payé suffisamment - Reste dû
                    <>
                      <View style={validationStyles.changeRow}>
                        <Text style={[validationStyles.changeLabel, { color: '#FF3B30' }]}>Reste dû</Text>
                        <Text style={[validationStyles.changeValue, { color: '#FF3B30' }]}>
                          {formatPrice(remainingAmount)}
                        </Text>
                      </View>
                      <View style={validationStyles.changeBreakdown}>
                        <Text style={[validationStyles.changeBreakdownText, { color: '#FF3B30' }]}>
                          {`Net à payer ${formatPrice(netAmount)} - Client paye ${formatPrice(paidAmount)} = `}
                          <Text style={{ color: '#FF3B30', fontWeight: '600' }}>
                            {formatPrice(remainingAmount)} restant à payer
                          </Text>
                        </Text>
                      </View>
                    </>
                  )}
                  
                  {/* Champ Condition - TextInput */}
                  <View style={validationStyles.conditionSection}>
                    <Text style={validationStyles.conditionLabel}>Condition *</Text>
                    <TextInput
                      ref={conditionInputRef}
                      style={validationStyles.conditionInput}
                      value={condition}
                      onChangeText={setCondition}
                      placeholder="Ex: Payé comptant, À crédit, 50% d'acompte..."
                      multiline
                      maxLength={200}
                      textAlignVertical="top"
                    />
                    <Text style={validationStyles.conditionHelpText}>
                      {paidAmount >= netAmount 
                        ? 'Le client a réglé la totalité de la commande'
                        : 'Le client devra régler le reste ultérieurement'}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={validationStyles.footer}>
        <View style={validationStyles.footerTotal}>
          <Text style={validationStyles.footerTotalLabel}>Net à payer</Text>
          <Text style={validationStyles.footerTotalAmount}>{formatPrice(netAmount)}</Text>
        </View>
        <TouchableOpacity
          style={[
            validationStyles.validateButton,
            (!selectedCustomer || !selectedPaymentMethod || !condition.trim() || isSubmitting || safeCart.length === 0) && 
            validationStyles.validateButtonDisabled
          ]}
          onPress={handleFinalSubmit}
          disabled={!selectedCustomer || !selectedPaymentMethod || !condition.trim() || isSubmitting || safeCart.length === 0}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Text style={validationStyles.validateButtonText}>
                {paidAmount >= netAmount ? 'Confirmer la vente' : 'Confirmer le crédit'}
              </Text>
              <Ionicons name="checkmark-circle" size={20} color="#FFF" style={{ marginLeft: 8 }} />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Message de succès UNIQUEMENT après validation de vente */}
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
            <View style={validationStyles.successToastIcon}>
              <Ionicons name="checkmark-circle" size={24} color="#FFF" />
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

      {renderPaymentModal()}
    </SafeAreaView>
  );
}