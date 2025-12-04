// components/CustomerSearchModal.tsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { validationStyles } from '../styles/CartValidationStyles';

type Customer = {
  type: 'particulier' | 'entreprise';
  email: string;
  sigle?: string;
  nom?: string;
  prenoms?: string;
  adresse?: string;
  telephone?: string;
};

type CustomerSearchModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelectCustomer: (customer: Customer) => void;
  onSwitchToCreate: () => void;
  initialCustomers: Customer[];
  isLoading?: boolean;
};

export default function CustomerSearchModal({
  visible,
  onClose,
  onSelectCustomer,
  onSwitchToCreate,
  initialCustomers,
  isLoading = false,
}: CustomerSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mettre à jour les clients quand initialCustomers change
  useEffect(() => {
    setCustomers(initialCustomers);
  }, [initialCustomers]);

  // Nettoyer le timeout
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Obtenir le nom d'affichage d'un client
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

  // Filtrer les clients selon la recherche
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
        // Recherche côté client
      }, 300);
    }
  };

  // Effacer la recherche
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  }, []);

  // Rendre un client dans la liste
  const renderCustomerItem = (customer: Customer) => (
    <TouchableOpacity
      key={customer.email}
      style={validationStyles.customerItem}
      onPress={() => onSelectCustomer(customer)}
    >
      <View style={[
        validationStyles.customerItemIcon,
        { backgroundColor: customer.type === 'entreprise' ? '#E8F4FF' : '#F0F8FF' }
      ]}>
        <Ionicons 
          name={customer.type === 'entreprise' ? 'business' : 'person'} 
          size={24} 
          color={customer.type === 'entreprise' ? '#0056B3' : '#007AFF'} 
        />
      </View>
      <View style={validationStyles.customerItemInfo}>
        <Text style={validationStyles.customerItemName}>
          {getCustomerDisplayName(customer)}
        </Text>
        <View style={validationStyles.customerItemDetails}>
          <View style={validationStyles.customerDetailRow}>
            <Ionicons name="mail" size={12} color="#8E8E93" style={validationStyles.customerDetailIcon} />
            <Text style={validationStyles.customerItemEmail}>{customer.email}</Text>
          </View>
          {customer.telephone && (
            <View style={validationStyles.customerDetailRow}>
              <Ionicons name="call" size={12} color="#8E8E93" style={validationStyles.customerDetailIcon} />
              <Text style={validationStyles.customerItemPhone}>{customer.telephone}</Text>
            </View>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={validationStyles.modalOverlay}>
        <View style={validationStyles.modalContent}>
          {/* Header Modal */}
          <View style={validationStyles.modalHeader}>
            <View style={validationStyles.modalHandle}>
              <View style={validationStyles.modalHandle} />
            </View>
            
            <Text style={validationStyles.modalTitle}>
              Rechercher un client
            </Text>
            <TouchableOpacity
              style={validationStyles.modalCloseButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Zone de recherche */}
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

          {/* Liste des clients */}
          <ScrollView 
            style={validationStyles.customerList}
            showsVerticalScrollIndicator={true}
          >
            {isLoading ? (
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
                  onPress={onSwitchToCreate}
                >
                  <Ionicons name="person-add" size={18} color="#007AFF" style={{ marginRight: 6 }} />
                  <Text style={validationStyles.createFromSearchText}>Créer un nouveau client</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {filteredCustomers.map((customer) => renderCustomerItem(customer))}
                {filteredCustomers.length > 0 && (
                  <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                    <Text style={{ fontSize: 13, color: '#8E8E93' }}>
                      {filteredCustomers.length} client(s) trouvé(s)
                    </Text>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}