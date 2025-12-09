// components/CustomerCreateModal.tsx
import React, { useState, useRef, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { validationStyles } from '../styles/CartValidationStyles';
import { customerService, Customer as CustomerType, CreateCustomerData } from '../services/customerService';

type Customer = CustomerType;

type CustomerCreateModalProps = {
  visible: boolean;
  onClose: () => void;
  onCustomerCreated: (customer: Customer) => void;
  onSwitchToSearch: () => void;
  existingCustomers: Customer[];
};

type NewCustomerForm = CreateCustomerData & {
  email: string; // Rendre email obligatoire pour la création
};

export default function CustomerCreateModal({
  visible,
  onClose,
  onCustomerCreated,
  onSwitchToSearch,
  existingCustomers,
}: CustomerCreateModalProps) {
  const [newCustomer, setNewCustomer] = useState<NewCustomerForm>({ 
    type: 'particulier',
    email: '', 
    sigle: '',
    nom: '',
    prenoms: '',
    adresse: '',
    telephone: '',
    nif: '',
    stat: '',
  });
  const [isCreating, setIsCreating] = useState(false);
  const emailInputRef = useRef<TextInput>(null);

  // Focus sur l'email input quand le modal s'ouvre
  React.useEffect(() => {
    if (visible && emailInputRef.current) {
      setTimeout(() => {
        emailInputRef.current?.focus();
      }, 100);
    }
  }, [visible]);

  // Gérer le changement de type de client
  const handleCustomerTypeChange = useCallback((type: 'particulier' | 'entreprise') => {
    setNewCustomer(prev => ({ 
      ...prev, 
      type,
      // Réinitialiser les champs spécifiques au type
      sigle: type === 'entreprise' ? prev.sigle : '',
      nif: type === 'entreprise' ? prev.nif : '',
      stat: type === 'entreprise' ? prev.stat : '',
      nom: type === 'particulier' ? prev.nom : '',
      prenoms: type === 'particulier' ? prev.prenoms : '',
    }));
  }, []);

  // Créer un nouveau client
  const createCustomer = useCallback(async () => {

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (newCustomer.email && !emailRegex.test(newCustomer.email)) {
       alert('Veuillez entrer une adresse email valide');
    return;
  }

    if (newCustomer.type === 'entreprise' && !newCustomer.sigle?.trim()) {
      alert('Le sigle de l\'entreprise est obligatoire');
      return;
    }

    // Vérifier si le client existe déjà (par email)
    const customerExists = existingCustomers.some(
      c => c.email?.toLowerCase() === newCustomer.email.toLowerCase()
    );
    if (customerExists) {
      alert('Un client avec cet email existe déjà');
      return;
    }

    try {
      setIsCreating(true);
      
      // Préparer les données pour l'API
      const customerData: CreateCustomerData = {
        type: newCustomer.type,
        email: newCustomer.email.trim(),
        ...(newCustomer.type === 'entreprise' && { 
          sigle: newCustomer.sigle?.trim(),
          nom: newCustomer.sigle?.trim(), // Utiliser sigle comme nom par défaut
          nif: newCustomer.nif?.trim(),
          stat: newCustomer.stat?.trim()
        }),
        ...(newCustomer.type === 'particulier' && { 
          nom: newCustomer.nom?.trim(),
          prenoms: newCustomer.prenoms?.trim()
        }),
        adresse: newCustomer.adresse?.trim(),
        telephone: newCustomer.telephone?.trim(),
      };

      // Appeler le service pour créer le client
      const response = await customerService.createCustomer(customerData);
      
      // Construire l'objet customer avec l'identifiant retourné
      const createdCustomer: Customer = {
        identifiant: response.identifiant || response.id, // S'adapter à la réponse de l'API
        type: newCustomer.type,
        email: newCustomer.email.trim(),
        sigle: newCustomer.sigle?.trim(),
        nom: newCustomer.type === 'entreprise' 
          ? newCustomer.sigle?.trim() // Pour entreprise, utiliser sigle comme nom
          : newCustomer.nom?.trim(),
        prenoms: newCustomer.prenoms?.trim(),
        adresse: newCustomer.adresse?.trim(),
        telephone: newCustomer.telephone?.trim(),
        nif: newCustomer.nif?.trim(),
        stat: newCustomer.stat?.trim(),
      };

      // Appeler le callback avec le client créé
      onCustomerCreated(createdCustomer);
      
      // Réinitialiser le formulaire
      setNewCustomer({ 
        type: 'particulier',
        email: '', 
        sigle: '',
        nom: '',
        prenoms: '',
        adresse: '',
        telephone: '',
        nif: '',
        stat: '',
      });
      
    } catch (error: any) {
      console.error('Erreur création client:', error);
      alert(error.message || 'Impossible de créer le client');
    } finally {
      setIsCreating(false);
    }
  }, [newCustomer, existingCustomers, onCustomerCreated]);

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
              Nouveau client
            </Text>
            <TouchableOpacity
              style={validationStyles.modalCloseButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Formulaire de création */}
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <ScrollView 
              style={validationStyles.createForm} 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Titre */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{
                  fontSize: 20,
                  fontWeight: '700',
                  color: '#000',
                  textAlign: 'center',
                  marginBottom: 8,
                }}>
                  Nouveau client
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: '#8E8E93',
                  textAlign: 'center',
                }}>
                  Remplissez les informations du client
                </Text>
              </View>

              {/* Sélection du type de client */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{
                  fontSize: 15,
                  fontWeight: '600',
                  color: '#000',
                  marginBottom: 12,
                }}>
                  Type de client *
                </Text>
                
                <View style={{
                  flexDirection: 'row',
                  backgroundColor: '#F8F9FA',
                  borderRadius: 16,
                  padding: 6,
                }}>
                  {/* Bouton Particulier */}
                  <TouchableOpacity
                    style={[
                      {
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 12,
                        paddingVertical: 16,
                        paddingHorizontal: 12,
                        marginRight: 6,
                      },
                      newCustomer.type === 'particulier' ? {
                        backgroundColor: '#FFFFFF',
                        shadowColor: '#007AFF',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        elevation: 3,
                        borderWidth: 1.5,
                        borderColor: '#007AFF',
                      } : {
                        backgroundColor: 'transparent',
                      }
                    ]}
                    onPress={() => handleCustomerTypeChange('particulier')}
                    activeOpacity={0.7}
                  >
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: newCustomer.type === 'particulier' ? '#E8F4FF' : '#F0F0F0',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 8,
                    }}>
                      <Ionicons 
                        name="person" 
                        size={20} 
                        color={newCustomer.type === 'particulier' ? '#007AFF' : '#8E8E93'} 
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 15,
                        fontWeight: '600',
                        color: newCustomer.type === 'particulier' ? '#007AFF' : '#8E8E93',
                        marginBottom: 2,
                      }}>
                        Particulier
                      </Text>
                      <Text style={{
                        fontSize: 12,
                        color: newCustomer.type === 'particulier' ? '#007AFF' : '#8E8E93',
                      }}>
                        Personne individuelle
                      </Text>
                    </View>
                    {newCustomer.type === 'particulier' && (
                      <View style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: '#007AFF',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginLeft: 8,
                      }}>
                        <Ionicons name="checkmark" size={16} color="#FFF" />
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Bouton Entreprise */}
                  <TouchableOpacity
                    style={[
                      {
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 12,
                        paddingVertical: 16,
                        paddingHorizontal: 12,
                        marginLeft: 6,
                      },
                      newCustomer.type === 'entreprise' ? {
                        backgroundColor: '#FFFFFF',
                        shadowColor: '#FF9500',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        elevation: 3,
                        borderWidth: 1.5,
                        borderColor: '#FF9500',
                      } : {
                        backgroundColor: 'transparent',
                      }
                    ]}
                    onPress={() => handleCustomerTypeChange('entreprise')}
                    activeOpacity={0.7}
                  >
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: newCustomer.type === 'entreprise' ? '#FFF4E6' : '#F0F0F0',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 8,
                    }}>
                      <Ionicons 
                        name="business" 
                        size={20} 
                        color={newCustomer.type === 'entreprise' ? '#FF9500' : '#8E8E93'} 
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 15,
                        fontWeight: '600',
                        color: newCustomer.type === 'entreprise' ? '#FF9500' : '#8E8E93',
                        marginBottom: 2,
                      }}>
                        Entreprise
                      </Text>
                      <Text style={{
                        fontSize: 12,
                        color: newCustomer.type === 'entreprise' ? '#FF9500' : '#8E8E93',
                      }}>
                        Société ou organisation
                      </Text>
                    </View>
                    {newCustomer.type === 'entreprise' && (
                      <View style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: '#FF9500',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginLeft: 8,
                      }}>
                        <Ionicons name="checkmark" size={16} color="#FFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Champ Email */}
              <View style={{ marginBottom: 20 }}>
                <Text style={validationStyles.formLabel}>
                  Adresse email *
                </Text>
                <View style={[
                  validationStyles.formInputContainer,
                  { borderColor: newCustomer.email ? '#007AFF' : '#E5E5EA' }
                ]}>
                  <Ionicons 
                    name="mail" 
                    size={20} 
                    color={newCustomer.email ? '#007AFF' : '#8E8E93'} 
                    style={validationStyles.formInputIcon} 
                  />
                  <TextInput
                    ref={emailInputRef}
                    style={validationStyles.formInput}
                    value={newCustomer.email}
                    onChangeText={(value) => setNewCustomer({ ...newCustomer, email: value })}
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                  />
                </View>
                {newCustomer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newCustomer.email) && (
                  <Text style={{ fontSize: 12, color: '#FF3B30', marginTop: 4 }}>
                    Format d'email invalide
                  </Text>
                )}
              </View>

              {/* Champs spécifiques selon le type */}
              {newCustomer.type === 'entreprise' ? (
                <>
                  <View style={{ marginBottom: 20 }}>
                    <Text style={validationStyles.formLabel}>
                      Sigle de l'entreprise *
                    </Text>
                    <View style={[
                      validationStyles.formInputContainer,
                      { borderColor: newCustomer.sigle ? '#FF9500' : '#E5E5EA' }
                    ]}>
                      <Ionicons 
                        name="business" 
                        size={20} 
                        color={newCustomer.sigle ? '#FF9500' : '#8E8E93'} 
                        style={validationStyles.formInputIcon} 
                      />
                      <TextInput
                        style={validationStyles.formInput}
                        value={newCustomer.sigle}
                        onChangeText={(value) => setNewCustomer({ ...newCustomer, sigle: value })}
                        placeholderTextColor="#999"
                        autoCapitalize="words"
                      />
                    </View>
                  </View>

                  <View style={{ marginBottom: 20 }}>
                    <Text style={validationStyles.formLabel}>
                      Nom complet (optionnel)
                    </Text>
                    <View style={validationStyles.formInputContainer}>
                      <Ionicons name="person" size={20} color="#8E8E93" style={validationStyles.formInputIcon} />
                      <TextInput
                        style={validationStyles.formInput}
                        value={newCustomer.nom}
                        onChangeText={(value) => setNewCustomer({ ...newCustomer, nom: value })}
                        placeholderTextColor="#999"
                      />
                    </View>
                  </View>

                  <View style={{ marginBottom: 20 }}>
                    <Text style={validationStyles.formLabel}>
                      NIF (optionnel)
                    </Text>
                    <View style={validationStyles.formInputContainer}>
                      <Ionicons name="document-text" size={20} color="#8E8E93" style={validationStyles.formInputIcon} />
                      <TextInput
                        style={validationStyles.formInput}
                        value={newCustomer.nif}
                        onChangeText={(value) => setNewCustomer({ ...newCustomer, nif: value })}
                        placeholderTextColor="#999"
                      />
                    </View>
                  </View>

                  <View style={{ marginBottom: 20 }}>
                    <Text style={validationStyles.formLabel}>
                      STAT (optionnel)
                    </Text>
                    <View style={validationStyles.formInputContainer}>
                      <Ionicons name="document" size={20} color="#8E8E93" style={validationStyles.formInputIcon} />
                      <TextInput
                        style={validationStyles.formInput}
                        value={newCustomer.stat}
                        onChangeText={(value) => setNewCustomer({ ...newCustomer, stat: value })}
                        placeholderTextColor="#999"
                      />
                    </View>
                  </View>
                </>
              ) : (
                <>
                  <View style={{ marginBottom: 20 }}>
                    <Text style={validationStyles.formLabel}>
                      Prénoms
                    </Text>
                    <View style={[
                      validationStyles.formInputContainer,
                      { borderColor: newCustomer.prenoms ? '#007AFF' : '#E5E5EA' }
                    ]}>
                      <Ionicons 
                        name="person" 
                        size={20} 
                        color={newCustomer.prenoms ? '#007AFF' : '#8E8E93'} 
                        style={validationStyles.formInputIcon} 
                      />
                      <TextInput
                        style={validationStyles.formInput}
                        value={newCustomer.prenoms}
                        onChangeText={(value) => setNewCustomer({ ...newCustomer, prenoms: value })}
                        placeholderTextColor="#999"
                        autoCapitalize="words"
                      />
                    </View>
                  </View>

                  <View style={{ marginBottom: 20 }}>
                    <Text style={validationStyles.formLabel}>
                      Nom
                    </Text>
                    <View style={[
                      validationStyles.formInputContainer,
                      { borderColor: newCustomer.nom ? '#007AFF' : '#E5E5EA' }
                    ]}>
                      <Ionicons 
                        name="person" 
                        size={20} 
                        color={newCustomer.nom ? '#007AFF' : '#8E8E93'} 
                        style={validationStyles.formInputIcon} 
                      />
                      <TextInput
                        style={validationStyles.formInput}
                        value={newCustomer.nom}
                        onChangeText={(value) => setNewCustomer({ ...newCustomer, nom: value })}
                        placeholderTextColor="#999"
                        autoCapitalize="words"
                      />
                    </View>
                  </View>
                </>
              )}

              {/* Champs communs */}
              <View style={{ marginBottom: 20 }}>
                <Text style={validationStyles.formLabel}>
                  Téléphone
                </Text>
                <View style={[
                  validationStyles.formInputContainer,
                  { borderColor: newCustomer.telephone ? '#34C759' : '#E5E5EA' }
                ]}>
                  <Ionicons 
                    name="call" 
                    size={20} 
                    color={newCustomer.telephone ? '#34C759' : '#8E8E93'} 
                    style={validationStyles.formInputIcon} 
                  />
                  <TextInput
                    style={validationStyles.formInput}
                    value={newCustomer.telephone}
                    onChangeText={(value) => setNewCustomer({ ...newCustomer, telephone: value })}
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View style={{ marginBottom: 32 }}>
                <Text style={validationStyles.formLabel}>
                  Adresse
                </Text>
                <View style={[
                  validationStyles.formInputContainer,
                  { 
                    borderColor: newCustomer.adresse ? '#5856D6' : '#E5E5EA',
                    minHeight: 80,
                    alignItems: 'flex-start',
                  }
                ]}>
                  <Ionicons 
                    name="location" 
                    size={20} 
                    color={newCustomer.adresse ? '#5856D6' : '#8E8E93'} 
                    style={[validationStyles.formInputIcon, { marginTop: 8 }]} 
                  />
                  <TextInput
                    style={[validationStyles.formInput, { height: 'auto', paddingTop: 8 }]}
                    value={newCustomer.adresse}
                    onChangeText={(value) => setNewCustomer({ ...newCustomer, adresse: value })}
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
              </View>

              {/* Boutons d'action */}
              <View style={validationStyles.formButtons}>
                <TouchableOpacity
                  style={[
                    validationStyles.formCancelButton,
                    { backgroundColor: '#F2F2F7' }
                  ]}
                  onPress={onSwitchToSearch}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-back" size={18} color="#8E8E93" style={{ marginRight: 6 }} />
                  <Text style={validationStyles.formCancelText}>
                    Retour
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    validationStyles.formSubmitButton,
                    (!newCustomer.email.trim() || 
                     (newCustomer.type === 'entreprise' && !newCustomer.sigle?.trim())) && 
                    validationStyles.formSubmitButtonDisabled
                  ]}
                  onPress={createCustomer}
                  disabled={(newCustomer.type === 'entreprise' && !newCustomer.sigle?.trim())}
                  activeOpacity={0.7}
                >
                  {isCreating ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color="#FFF" style={{ marginRight: 8 }} />
                      <Text style={validationStyles.formSubmitText}>
                        Créer le client
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
}