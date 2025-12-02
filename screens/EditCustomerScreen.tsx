import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useState, useEffect, useRef } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
    TouchableWithoutFeedback
} from 'react-native';
import styles from '../styles/CreateCustomerStyles';
import { customerService } from '../services/customerService';

export default function EditCustomerScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { customer } = route.params as { customer: any };

  // États pour les données du formulaire
  const [customerType, setCustomerType] = useState<'particulier' | 'entreprise'>(customer.type);
  const [sigle, setSigle] = useState(customer.sigle || '');
  const [nom, setNom] = useState(customer.nom || '');
  const [prenom, setPrenom] = useState(customer.prenom || '');
  const [adresse, setAdresse] = useState(customer.adresse || '');
  const [telephone, setTelephone] = useState(customer.telephone || '');
  const [email, setEmail] = useState(customer.email);
  const [nif, setNif] = useState(customer.nif || '');
  const [stat, setStat] = useState(customer.stat || '');

  // États UI
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | ''>('');
  const [isLoading, setIsLoading] = useState(false);

  // États de focus pour les champs
  const [nomFocused, setNomFocused] = useState(false);
  const [prenomFocused, setPrenomFocused] = useState(false);
  const [sigleFocused, setSigleFocused] = useState(false);
  const [adresseFocused, setAdresseFocused] = useState(false);
  const [telephoneFocused, setTelephoneFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [nifFocused, setNifFocused] = useState(false);
  const [statFocused, setStatFocused] = useState(false);

  // Refs
  const nomRef = useRef<TextInput>(null);
  const prenomRef = useRef<TextInput>(null);
  const sigleRef = useRef<TextInput>(null);
  const adresseRef = useRef<TextInput>(null);
  const telephoneRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const nifRef = useRef<TextInput>(null);
  const statRef = useRef<TextInput>(null);

  // Validation
  const isFormValid = customerType === 'particulier' 
    ? nom.trim().length > 0 && prenom.trim().length > 0
    : sigle.trim().length > 0;

  const handleUpdate = async () => {
    if (customerType === 'particulier') {
      if (!nom.trim() || !prenom.trim()) {
        showError('Veuillez renseigner le nom et le prénom.');
        return;
      }
    } else {
      if (!sigle.trim()) {
        showError('Veuillez renseigner le SIGLE de l\'entreprise.');
        return;
      }
    }

    if (!email.trim()) {
      showError('L\'email est requis.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError('Veuillez entrer une adresse email valide.');
      return;
    }

    setIsLoading(true);
    setMessage('');

    const payload: any = {
      type: customerType,
      sigle: sigle.trim(),
      nom: nom.trim(),
      prenom: prenom.trim(),
      adresse: adresse.trim(),
      telephone: telephone.trim(),
      email: email.trim(),
    };

    if (customerType === 'entreprise') {
      payload.nif = nif.trim();
      payload.stat = stat.trim();
    }

    try {
      const response = await customerService.updateCustomer(customer.email, payload);
      
      setMessageType('success');
      setMessage(response.message || 'Client mis à jour avec succès !');

      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error: any) {
      console.error('❌ Erreur mise à jour client :', error);
      showError(error.message || 'Erreur lors de la mise à jour du client');
    } finally {
      setIsLoading(false);
    }
  };

  const showError = (msg: string) => {
    setMessageType('error');
    setMessage(msg);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>Modifier le client</Text>
          </View>
          <View style={{ width: 32 }} />
        </View>

        {/* TYPE DE CLIENT (non modifiable) */}
        <View style={{ marginBottom: 16 }}>
          <Text style={styles.label}>Type de client</Text>
          <View style={[styles.inputContainer]}>
            <View style={{ paddingVertical: 12, paddingHorizontal: 12 }}>
              <Text style={[styles.input, { color: '#111' }]}>
                {customerType === 'particulier' ? 'Particulier' : 'Entreprise'}
              </Text>
            </View>
          </View>
        </View>

        {/* CHAMPS SPÉCIFIQUES */}
        {customerType === 'particulier' ? (
          <>
            <TouchableWithoutFeedback onPress={() => nomRef.current?.focus()}>
              <View style={[styles.inputContainer, nomFocused && styles.inputFocused]}>
                <TextInput
                  ref={nomRef}
                  placeholder="Nom *"
                  placeholderTextColor="#777"
                  value={nom}
                  style={styles.input}
                  onChangeText={setNom}
                  onFocus={() => setNomFocused(true)}
                  onBlur={() => setNomFocused(false)}
                  editable={!isLoading}
                  returnKeyType="next"
                  onSubmitEditing={() => prenomRef.current?.focus()}
                />
              </View>
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback onPress={() => prenomRef.current?.focus()}>
              <View style={[styles.inputContainer, prenomFocused && styles.inputFocused]}>
                <TextInput
                  ref={prenomRef}
                  placeholder="Prénom *"
                  placeholderTextColor="#777"
                  value={prenom}
                  style={styles.input}
                  onChangeText={setPrenom}
                  onFocus={() => setPrenomFocused(true)}
                  onBlur={() => setPrenomFocused(false)}
                  editable={!isLoading}
                  returnKeyType="next"
                  onSubmitEditing={() => adresseRef.current?.focus()}
                />
              </View>
            </TouchableWithoutFeedback>
          </>
        ) : (
          <TouchableWithoutFeedback onPress={() => sigleRef.current?.focus()}>
            <View style={[styles.inputContainer, sigleFocused && styles.inputFocused]}>
              <TextInput
                ref={sigleRef}
                placeholder="SIGLE de l'entreprise *"
                placeholderTextColor="#777"
                value={sigle}
                style={styles.input}
                onChangeText={setSigle}
                onFocus={() => setSigleFocused(true)}
                onBlur={() => setSigleFocused(false)}
                editable={!isLoading}
                returnKeyType="next"
                onSubmitEditing={() => adresseRef.current?.focus()}
              />
            </View>
          </TouchableWithoutFeedback>
        )}

        {/* Autres champs similaires à CreateCustomerScreen */}
        {/* ... copiez les autres champs de CreateCustomerScreen ici ... */}

        {/* BOUTON MISE À JOUR */}
        <TouchableOpacity
          style={[
            styles.button,
            (!isFormValid || isLoading) && styles.buttonDisabled,
          ]}
          disabled={!isFormValid || isLoading}
          onPress={handleUpdate}
          activeOpacity={0.9}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Mettre à jour</Text>
          )}
        </TouchableOpacity>

        {/* MESSAGE */}
        {message ? (
          <View
            style={[
              styles.messageBox,
              messageType === 'error' ? styles.errorBox : styles.successBox,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                messageType === 'error' ? styles.errorText : styles.successText,
              ]}
            >
              {message}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}