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
import { cartService, CartItem } from '../services/cartService';

// Types
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

// Fonction utilitaire pour formater les prix
const formatPrice = (price: number | undefined): string => {
  const value = price || 0;
  return `€ ${value.toFixed(2)}`;
};

// Fonction pour obtenir le prix unitaire d'un item
const getItemPrice = (item: CartItem): number => {
  return item.prix_unitaire || item.prix_actuel || 0;
};

export default function CartValidationScreen({ route, navigation }: any) {
  // Ajouter des valeurs par défaut CRITIQUE
  const { cart = [], totalAmount = 0, totalItems = 0 } = route.params || {};

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [modalMode, setModalMode] = useState<'search' | 'create'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [newCustomer, setNewCustomer] = useState<NewCustomerForm>({ name: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // S'assurer que cart est un tableau
  const safeCart: CartItem[] = Array.isArray(cart) ? cart : [];

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

    // S'assurer que le panier n'est pas vide
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

        {/* Récapitulatif de la commande - CORRIGÉ */}
        <View style={validationStyles.section}>
          <View style={validationStyles.sectionHeader}>
            <Text style={validationStyles.sectionTitle}>RÉCAPITULATIF</Text>
            <View style={validationStyles.itemsCountBadge}>
              <Text style={validationStyles.itemsCountText}>{safeCart.length} article(s)</Text>
            </View>
          </View>

          <View style={validationStyles.summaryCard}>
            {safeCart.map((item: CartItem, index: number) => {
              // Utiliser des valeurs sécurisées
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

          {/* Total - CORRIGÉ */}
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

      {/* Footer avec validation - CORRIGÉ */}
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

      {/* Modal Client (inchangé) */}
      <Modal
        visible={showCustomerModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCustomerModal(false)}
      >
        {/* ... modal content inchangé ... */}
      </Modal>
    </SafeAreaView>
  );
}