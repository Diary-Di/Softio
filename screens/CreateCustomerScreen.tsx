import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useNavigation } from '@react-navigation/native';
import { useState, useRef } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
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
import CustomerScreen from './CustomerScreen';

export default function CreateCustomerScreen() {
  const router = useRouter();

  // États pour les données du formulaire
  const [raisonSocial, setRaisonSocial] = useState('');
  const [customerType, setCustomerType] = useState<'particulier' | 'entreprise'>('particulier');
  const [sigle, setSigle] = useState('');
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [nom, setNom] = useState('');
  const [prenoms, setPrenoms] = useState('');
  const [adresse, setAdresse] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [nif, setNif] = useState('');
  const [stat, setStat] = useState('');

  // États UI
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | ''>('');
  const [isLoading, setIsLoading] = useState(false);

  // États de focus pour les champs
  const [nomFocused, setNomFocused] = useState(false);
  const [prenomsFocused, setPrenomsFocused] = useState(false);
  const [sigleFocused, setSigleFocused] = useState(false);
  const [adresseFocused, setAdresseFocused] = useState(false);
  const [telephoneFocused, setTelephoneFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [nifFocused, setNifFocused] = useState(false);
  const [statFocused, setStatFocused] = useState(false);

  // Refs pour la navigation entre champs
  const nomRef = useRef<TextInput>(null);
  const prenomsRef = useRef<TextInput>(null);
  const sigleRef = useRef<TextInput>(null);
  const adresseRef = useRef<TextInput>(null);
  const telephoneRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const nifRef = useRef<TextInput>(null);
  const statRef = useRef<TextInput>(null);

  // Validation du formulaire
  const validate = () => {
    if (customerType === 'particulier') {
      if (!nom.trim() || !prenoms.trim()) {
        showError('Veuillez renseigner le nom et le prénom.');
        return false;
      }
    } else {
      if (!sigle.trim()) {
        showError('Veuillez renseigner le SIGLE de l\'entreprise.');
        return false;
      }
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError('Veuillez entrer une adresse email valide.');
      return false;
    }
    return true;
  };

  // Vérifie si le formulaire est valide
  const isFormValid = customerType === 'particulier' 
    ? nom.trim().length > 0 && prenoms.trim().length > 0
    : sigle.trim().length > 0;

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    setMessage('');

    const payload: any = {
      type: customerType,
      raisonSocial: customerType === 'particulier' ? 'Particulier' : 'Entreprise',
      adresse: adresse.trim(),
      telephone: telephone.trim(),
      email: email.trim(),
    };

    if (customerType === 'entreprise') {
      payload.sigle = sigle.trim();
      payload.nif = nif.trim();
      payload.stat = stat.trim();
    } else {
      payload.nom = nom.trim();
      payload.prenoms = prenoms.trim();
    }

    try {
      const response = await customerService.createCustomer(payload);
      
      setMessageType('success');
      setMessage(response.message || `Client ${customerType === 'particulier' ? `${prenoms} ${nom}` : sigle} créé avec succès !`);

      // Réinitialiser le formulaire après succès
      setTimeout(() => {
        resetForm();
        router.back();
        CustomerScreen

      }, 1500);
    } catch (error: any) {
      console.error('❌ Erreur création client :', error);
      showError(error.message || 'Erreur lors de l\'ajout du client');

      if (error.code === 500) {
        Alert.alert('Erreur serveur', 'Impossible de contacter le serveur.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setRaisonSocial('');
    setCustomerType('particulier');
    setSigle('');
    setNom('');
    setPrenoms('');
    setAdresse('');
    setTelephone('');
    setEmail('');
    setNif('');
    setStat('');
    setMessage('');
    setMessageType('');
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
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} accessibilityLabel="Retour">
            <Ionicons name="arrow-back" size={24} color="#111" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>Ajouter un client</Text>
          </View>
          <View style={{ width: 32 }} />
        </View>

        {/* TYPE DE CLIENT */}
        <View style={{ marginBottom: 16 }}>
          <Text style={styles.label}>Type de client *</Text>
          <TouchableOpacity 
            style={[styles.inputContainer, showTypePicker && styles.inputFocused]}
            onPress={() => setShowTypePicker(true)}
            disabled={isLoading}
          >
            <View style={{ paddingVertical: 12 }}>
              <Text style={[styles.input, { color: '#111' }]}>
                {customerType === 'particulier' ? 'Particulier' : 'Entreprise'}
              </Text>
            </View>
          </TouchableOpacity>

          <Modal transparent visible={showTypePicker} animationType="fade" onRequestClose={() => setShowTypePicker(false)}>
            <TouchableOpacity 
              style={styles.modalOverlay} 
              activeOpacity={1} 
              onPress={() => setShowTypePicker(false)}
            >
              <View style={styles.pickerContainer}>
                <TouchableOpacity 
                  style={styles.pickerOption} 
                  onPress={() => { 
                    setCustomerType('particulier'); 
                    setShowTypePicker(false); 
                    setRaisonSocial('Particulier');
                    setNif('');
                    setStat('');
                  }}
                >
                  <Text style={styles.pickerOptionText}>Particulier</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.pickerOption} 
                  onPress={() => { 
                    setCustomerType('entreprise'); 
                    setShowTypePicker(false); 
                    setRaisonSocial('Entreprise');
                  }}
                >
                  <Text style={styles.pickerOptionText}>Entreprise</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>

        {/* CHAMPS SPÉCIFIQUES SELON LE TYPE */}
        {customerType === 'particulier' ? (
          <>
            {/* NOM */}
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
                  onSubmitEditing={() => prenomsRef.current?.focus()}
                />
              </View>
            </TouchableWithoutFeedback>

            {/* PRÉNOMS */}
            <TouchableWithoutFeedback onPress={() => prenomsRef.current?.focus()}>
              <View style={[styles.inputContainer, prenomsFocused && styles.inputFocused]}>
                <TextInput
                  ref={prenomsRef}
                  placeholder="Prénom *"
                  placeholderTextColor="#777"
                  value={prenoms}
                  style={styles.input}
                  onChangeText={setPrenoms}
                  onFocus={() => setPrenomsFocused(true)}
                  onBlur={() => setPrenomsFocused(false)}
                  editable={!isLoading}
                  returnKeyType="next"
                  onSubmitEditing={() => adresseRef.current?.focus()}
                />
              </View>
            </TouchableWithoutFeedback>
          </>
        ) : (
          <>
            {/* SIGLE */}
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
          </>
        )}

        {/* ADRESSE */}
        <TouchableWithoutFeedback onPress={() => adresseRef.current?.focus()}>
          <View style={[styles.inputContainer, adresseFocused && styles.inputFocused]}>
            <TextInput
              ref={adresseRef}
              placeholder="Adresse"
              placeholderTextColor="#777"
              value={adresse}
              style={[styles.input, { height: 80 }]}
              onChangeText={setAdresse}
              multiline
              onFocus={() => setAdresseFocused(true)}
              onBlur={() => setAdresseFocused(false)}
              editable={!isLoading}
              returnKeyType="next"
              onSubmitEditing={() => telephoneRef.current?.focus()}
            />
          </View>
        </TouchableWithoutFeedback>

        {/* TÉLÉPHONE */}
        <TouchableWithoutFeedback onPress={() => telephoneRef.current?.focus()}>
          <View style={[styles.inputContainer, telephoneFocused && styles.inputFocused]}>
            <TextInput
              ref={telephoneRef}
              placeholder="Téléphone"
              placeholderTextColor="#777"
              value={telephone}
              style={styles.input}
              onChangeText={setTelephone}
              keyboardType="phone-pad"
              onFocus={() => setTelephoneFocused(true)}
              onBlur={() => setTelephoneFocused(false)}
              editable={!isLoading}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
            />
          </View>
        </TouchableWithoutFeedback>

        {/* EMAIL */}
        <TouchableWithoutFeedback onPress={() => emailRef.current?.focus()}>
          <View style={[styles.inputContainer, emailFocused && styles.inputFocused]}>
            <TextInput
              ref={emailRef}
              placeholder="Email"
              placeholderTextColor="#777"
              value={email}
              style={styles.input}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              editable={!isLoading}
              returnKeyType={customerType === 'entreprise' ? 'next' : 'done'}
              onSubmitEditing={() => {
                if (customerType === 'entreprise') {
                  nifRef.current?.focus();
                } else {
                  handleSubmit();
                }
              }}
            />
          </View>
        </TouchableWithoutFeedback>

        {/* CHAMPS ENTREPRISE UNIQUEMENT */}
        {customerType === 'entreprise' && (
          <>
            {/* NIF */}
            <TouchableWithoutFeedback onPress={() => nifRef.current?.focus()}>
              <View style={[styles.inputContainer, nifFocused && styles.inputFocused]}>
                <TextInput
                  ref={nifRef}
                  placeholder="NIF"
                  placeholderTextColor="#777"
                  value={nif}
                  style={styles.input}
                  onChangeText={setNif}
                  onFocus={() => setNifFocused(true)}
                  onBlur={() => setNifFocused(false)}
                  editable={!isLoading}
                  returnKeyType="next"
                  onSubmitEditing={() => statRef.current?.focus()}
                />
              </View>
            </TouchableWithoutFeedback>

            {/* STAT */}
            <TouchableWithoutFeedback onPress={() => statRef.current?.focus()}>
              <View style={[styles.inputContainer, statFocused && styles.inputFocused]}>
                <TextInput
                  ref={statRef}
                  placeholder="STAT"
                  placeholderTextColor="#777"
                  value={stat}
                  style={styles.input}
                  onChangeText={setStat}
                  onFocus={() => setStatFocused(true)}
                  onBlur={() => setStatFocused(false)}
                  editable={!isLoading}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
              </View>
            </TouchableWithoutFeedback>
          </>
        )}

        {/* BOUTON ENREGISTRER */}
        <TouchableOpacity
          style={[
            styles.button,
            (!isFormValid || isLoading) && styles.buttonDisabled,
          ]}
          disabled={!isFormValid || isLoading}
          onPress={handleSubmit}
          activeOpacity={0.9}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Enregistrer</Text>
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