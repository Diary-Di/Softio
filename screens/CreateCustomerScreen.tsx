import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useState, useRef, useEffect } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
    TouchableWithoutFeedback,
    Animated
} from 'react-native';
import styles from '../styles/CreateCustomerStyles';
import { customerService } from '../services/customerService';

export default function CreateCustomerScreen() {
  const router = useRouter();

  // États pour les données du formulaire
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

  // Animation pour le banner
  const bannerAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

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

  // Gérer l'affichage/la disparition du banner
  useEffect(() => {
    if (message) {
      // Afficher le banner avec animation
      Animated.parallel([
        Animated.spring(bannerAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 300,
          friction: 25,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start();

      // Si c'est un succès, cacher automatiquement après 3 secondes
      if (messageType === 'success') {
        const timer = setTimeout(() => {
          hideBanner();
        }, 3000);
        return () => clearTimeout(timer);
      }
    } else {
      hideBanner();
    }
  }, [message, messageType]);

  const hideBanner = () => {
    Animated.parallel([
      Animated.spring(bannerAnim, {
        toValue: -100,
        useNativeDriver: true,
        tension: 300,
        friction: 25,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      setMessage('');
      setMessageType('');
    });
  };

  const handleCloseBanner = () => {
    hideBanner();
  };

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

    // Préparer le payload selon le type de client
    const payload: any = {
      type: customerType,
      adresse: adresse.trim() || undefined,
      telephone: telephone.trim() || undefined,
      email: email.trim() || undefined,
    };

    if (customerType === 'entreprise') {
      payload.sigle = sigle.trim();
      if (nif.trim()) payload.nif = nif.trim();
      if (stat.trim()) payload.stat = stat.trim();
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
        // Rediriger vers la liste des clients après un délai
        setTimeout(() => {
          router.back();
        }, 500);
      }, 1500);
    } catch (error: any) {
      console.error('❌ Erreur création client :', error);
      
      let errorMessage = error.message || 'Erreur lors de l\'ajout du client';
      
      // Gestion spécifique des erreurs de validation
      if (error.code === 409) {
        errorMessage = "Cet email est déjà utilisé par un autre client";
      } else if (error.code === 400) {
        errorMessage = "Données invalides. Vérifiez les informations saisies";
      } else if (error.code === 500) {
        errorMessage = "Erreur serveur. Veuillez réessayer plus tard";
      }
      
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCustomerType('particulier');
    setSigle('');
    setNom('');
    setPrenoms('');
    setAdresse('');
    setTelephone('');
    setEmail('');
    setNif('');
    setStat('');
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
      {/* BANNER SIMPLE ET MODERNE */}
      {message ? (
        <Animated.View 
          style={[
            styles.banner,
            messageType === 'error' ? styles.errorBanner : styles.successBanner,
            {
              transform: [{ translateY: bannerAnim }],
              opacity: opacityAnim,
            }
          ]}
        >
          <View style={styles.bannerContent}>
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerText}>
                {message}
              </Text>
            </View>
            
            <TouchableOpacity 
              onPress={handleCloseBanner}
              style={styles.bannerCloseButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      ) : null}

      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          message ? { paddingTop: Platform.OS === 'ios' ? 90 : 70 } : {}
        ]}
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
                    setSigle(''); // Réinitialiser sigle si on passe de entreprise à particulier
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
                    setNom(''); // Réinitialiser nom et prénom si on passe de particulier à entreprise
                    setPrenoms('');
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}