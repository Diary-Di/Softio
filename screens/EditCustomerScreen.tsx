import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator // Ajouter ActivityIndicator
    ,
    Animated,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { customerService, UpdateCustomerData } from '../services/customerService';
import styles from '../styles/CreateCustomerStyles';

// Définir le type des paramètres
type EditCustomerParams = {
  id: string;
  type: 'particulier' | 'entreprise';
  nom: string;
  prenoms: string;
  sigle: string;
  adresse: string;
  telephone: string;
  email: string;
  nif: string;
  stat: string;
};

type RootStackParamList = {
  EditCustomer: EditCustomerParams;
};

type EditCustomerRouteProp = RouteProp<RootStackParamList, 'EditCustomer'>;

export default function EditCustomerScreen() {
    const navigation = useNavigation();
    const route = useRoute<EditCustomerRouteProp>();
    
    // États pour le banner (même système que CreateCustomerScreen)
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'error' | 'success' | ''>('');
    const [isLoading, setIsLoading] = useState(false);

    // Animation pour le banner (même que CreateCustomerScreen)
    const bannerAnim = useRef(new Animated.Value(-100)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    // Pour le débogage
    useEffect(() => {
        console.log('=== ROUTE PARAMS RECEIVED ===');
        
        if (route.params) {
            console.log('ID du client:', route.params.id);
            console.log('Type:', route.params.type);
            console.log('Nom:', route.params.nom);
            console.log('Prénom:', route.params.prenoms);
            console.log('Sigle:', route.params.sigle);
            console.log('Adresse:', route.params.adresse);
            console.log('Téléphone:', route.params.telephone);
            console.log('Email:', route.params.email);
            console.log('NIF:', route.params.nif);
            console.log('STAT:', route.params.stat);
        } else {
            console.log('No params received');
            showError('Aucune donnée reçue pour la modification');
        }
    }, [route.params]);

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
                    // Revenir à l'écran précédent après le délai
                    setTimeout(() => {
                        navigation.goBack();
                    }, 300);
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
        // Si c'est un succès, revenir en arrière
        if (messageType === 'success') {
            navigation.goBack();
        }
    };

    // États pour les données du formulaire - initialiser avec les paramètres
    const [customerType, setCustomerType] = useState<'particulier' | 'entreprise'>(
        route.params?.type || 'particulier'
    );
    const [sigle, setSigle] = useState(route.params?.sigle || '');
    const [showTypePicker, setShowTypePicker] = useState(false);
    const [nom, setNom] = useState(route.params?.nom || '');
    const [prenoms, setPrenoms] = useState(route.params?.prenoms || '');
    const [adresse, setAdresse] = useState(route.params?.adresse || '');
    const [telephone, setTelephone] = useState(route.params?.telephone || '');
    const [email, setEmail] = useState(route.params?.email || '');
    const [nif, setNif] = useState(route.params?.nif || '');
    const [stat, setStat] = useState(route.params?.stat || '');

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
            if (!nom.trim()) {
                showError('Veuillez renseigner le nom.');
                nomRef.current?.focus();
                return false;
            }
            if (!prenoms.trim()) {
                showError('Veuillez renseigner le prénom.');
                prenomsRef.current?.focus();
                return false;
            }
        } else {
            if (!sigle.trim()) {
                showError('Veuillez renseigner le SIGLE de l\'entreprise.');
                sigleRef.current?.focus();
                return false;
            }
        }
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showError('Veuillez entrer une adresse email valide.');
            emailRef.current?.focus();
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        // Récupérer l'ID du client
        const customerId = route.params?.id;
        
        if (!customerId) {
            showError('ID du client manquant');
            return;
        }

        // Préparer les données pour l'API
        const updateData: UpdateCustomerData = {
            type: customerType,
            adresse: adresse.trim() || undefined,
            telephone: telephone.trim() || undefined,
            email: email.trim() || undefined,
        };

        // Ajouter les champs spécifiques au type
        if (customerType === 'particulier') {
            updateData.nom = nom.trim();
            updateData.prenoms = prenoms.trim();
        } else {
            updateData.sigle = sigle.trim();
            updateData.nif = nif.trim() || undefined;
            updateData.stat = stat.trim() || undefined;
        }

        console.log('Données à modifier (ID:', customerId, '):', updateData);

        try {
            setIsLoading(true);
            
            // Appeler l'API pour mettre à jour le client
            await customerService.updateCustomer(parseInt(customerId), updateData);
            
            // Afficher le message de succès
            setMessageType('success');
            setMessage(
                customerType === 'particulier' 
                    ? `${nom} ${prenoms} modifié avec succès !`
                    : `${sigle} modifié avec succès !`
            );

        } catch (error: any) {
            console.error('❌ Erreur lors de la modification:', error);
            
            let errorMessage = error.message || 'Erreur lors de la modification du client';
            
            // Gestion spécifique des erreurs
            if (error.code === 409) {
                errorMessage = "Cet email est déjà utilisé par un autre client";
            } else if (error.code === 400) {
                errorMessage = "Données invalides. Vérifiez les informations saisies";
            } else if (error.code === 404) {
                errorMessage = "Client introuvable";
            } else if (error.code === 500) {
                errorMessage = "Erreur serveur. Veuillez réessayer plus tard";
            }
            
            showError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const showError = (msg: string) => {
        setMessageType('error');
        setMessage(msg);
    };

    const resetForm = () => {
        if (route.params) {
            // Réinitialiser avec les valeurs originales
            setCustomerType(route.params.type);
            setNom(route.params.nom);
            setPrenoms(route.params.prenoms);
            setSigle(route.params.sigle);
            setAdresse(route.params.adresse);
            setTelephone(route.params.telephone);
            setEmail(route.params.email);
            setNif(route.params.nif);
            setStat(route.params.stat);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
        >
            {/* BANNER SIMPLE ET MODERNE (même que CreateCustomerScreen) */}
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

            <KeyboardAwareScrollView
                enableOnAndroid
                extraScrollHeight={Platform.OS === 'ios' ? 20 : 120}
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} accessibilityLabel="Retour">
                        <Ionicons name="arrow-back" size={24} color="#111" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.title}>Modifier le client</Text>
                    </View>
                    <View style={{ width: 32 }} />
                </View>

                {/* TYPE DE CLIENT (NON ÉDITABLE) */}
                <View style={{ marginBottom: 16 }}>
                    <Text style={styles.label}>Type de client *</Text>
                    <View style={{
                        backgroundColor: '#f5f5f5',
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderRadius: 8,
                        marginBottom: 4
                    }}>
                        <Text style={{ color: '#111', fontSize: 16 }}>
                            {customerType === 'particulier' ? 'Particulier' : 'Entreprise'}
                        </Text>
                    </View>
                    <Text style={styles.hintText}>
                     Le type de client ne peut pas être modifié
                    </Text>
                </View>

                {/* CHAMPS SPÉCIFIQUES SELON LE TYPE */}
                {customerType === 'particulier' ? (
                    <>
                        {/* NOM */}
                        <View style={{ marginBottom: 8 }}>
                            <Text style={styles.label}>Nom *</Text>
                            <TouchableWithoutFeedback onPress={() => nomRef.current?.focus()}>
                                <View style={[styles.inputContainer, nomFocused && styles.inputFocused]}>
                                    <TextInput
                                        ref={nomRef}
                                        placeholder="Entrez le nom"
                                        placeholderTextColor="#777"
                                        value={nom}
                                        style={styles.input}
                                        onChangeText={setNom}
                                        onFocus={() => setNomFocused(true)}
                                        onBlur={() => setNomFocused(false)}
                                        returnKeyType="next"
                                        onSubmitEditing={() => prenomsRef.current?.focus()}
                                        editable={!isLoading}
                                    />
                                </View>
                            </TouchableWithoutFeedback>
                        </View>

                        {/* PRÉNOMS */}
                        <View style={{ marginBottom: 8 }}>
                            <Text style={styles.label}>Prénom *</Text>
                            <TouchableWithoutFeedback onPress={() => prenomsRef.current?.focus()}>
                                <View style={[styles.inputContainer, prenomsFocused && styles.inputFocused]}>
                                    <TextInput
                                        ref={prenomsRef}
                                        placeholder="Entrez le prénom"
                                        placeholderTextColor="#777"
                                        value={prenoms}
                                        style={styles.input}
                                        onChangeText={setPrenoms}
                                        onFocus={() => setPrenomsFocused(true)}
                                        onBlur={() => setPrenomsFocused(false)}
                                        returnKeyType="next"
                                        onSubmitEditing={() => adresseRef.current?.focus()}
                                        editable={!isLoading}
                                    />
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </>
                ) : (
                    <>
                        {/* SIGLE */}
                        <View style={{ marginBottom: 8 }}>
                            <Text style={styles.label}>SIGLE de l'entreprise *</Text>
                            <TouchableWithoutFeedback onPress={() => sigleRef.current?.focus()}>
                                <View style={[styles.inputContainer, sigleFocused && styles.inputFocused]}>
                                    <TextInput
                                        ref={sigleRef}
                                        placeholder="Entrez le SIGLE"
                                        placeholderTextColor="#777"
                                        value={sigle}
                                        style={styles.input}
                                        onChangeText={setSigle}
                                        onFocus={() => setSigleFocused(true)}
                                        onBlur={() => setSigleFocused(false)}
                                        returnKeyType="next"
                                        onSubmitEditing={() => adresseRef.current?.focus()}
                                        editable={!isLoading}
                                    />
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </>
                )}

                {/* ADRESSE */}
                <View style={{ marginBottom: 8 }}>
                    <Text style={styles.label}>Adresse</Text>
                    <TouchableWithoutFeedback onPress={() => adresseRef.current?.focus()}>
                        <View style={[styles.inputContainer, adresseFocused && styles.inputFocused]}>
                            <TextInput
                                ref={adresseRef}
                                placeholder="Entrez l'adresse"
                                placeholderTextColor="#777"
                                value={adresse}
                                style={[styles.input, { height: 80 }]}
                                onChangeText={setAdresse}
                                multiline
                                onFocus={() => setAdresseFocused(true)}
                                onBlur={() => setAdresseFocused(false)}
                                returnKeyType="next"
                                onSubmitEditing={() => telephoneRef.current?.focus()}
                                editable={!isLoading}
                            />
                        </View>
                    </TouchableWithoutFeedback>
                </View>

                {/* TÉLÉPHONE */}
                <View style={{ marginBottom: 8 }}>
                    <Text style={styles.label}>Téléphone</Text>
                    <TouchableWithoutFeedback onPress={() => telephoneRef.current?.focus()}>
                        <View style={[styles.inputContainer, telephoneFocused && styles.inputFocused]}>
                            <TextInput
                                ref={telephoneRef}
                                placeholder="Entrez le numéro de téléphone"
                                placeholderTextColor="#777"
                                value={telephone}
                                style={styles.input}
                                onChangeText={setTelephone}
                                keyboardType="phone-pad"
                                onFocus={() => setTelephoneFocused(true)}
                                onBlur={() => setTelephoneFocused(false)}
                                returnKeyType="next"
                                onSubmitEditing={() => emailRef.current?.focus()}
                                editable={!isLoading}
                            />
                        </View>
                    </TouchableWithoutFeedback>
                </View>

                {/* EMAIL */}
                <View style={{ marginBottom: 8 }}>
                    <Text style={styles.label}>Email</Text>
                    <TouchableWithoutFeedback onPress={() => emailRef.current?.focus()}>
                        <View style={[styles.inputContainer, emailFocused && styles.inputFocused]}>
                            <TextInput
                                ref={emailRef}
                                placeholder="Entrez l'adresse email"
                                placeholderTextColor="#777"
                                value={email}
                                style={styles.input}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                onFocus={() => setEmailFocused(true)}
                                onBlur={() => setEmailFocused(false)}
                                returnKeyType={customerType === 'entreprise' ? 'next' : 'done'}
                                onSubmitEditing={() => {
                                    if (customerType === 'entreprise') {
                                        nifRef.current?.focus();
                                    } else {
                                        handleSubmit();
                                    }
                                }}
                                editable={!isLoading}
                            />
                        </View>
                    </TouchableWithoutFeedback>
                </View>

                {/* CHAMPS ENTREPRISE UNIQUEMENT */}
                {customerType === 'entreprise' && (
                    <>
                        {/* NIF */}
                        <View style={{ marginBottom: 8 }}>
                            <Text style={styles.label}>NIF</Text>
                            <TouchableWithoutFeedback onPress={() => nifRef.current?.focus()}>
                                <View style={[styles.inputContainer, nifFocused && styles.inputFocused]}>
                                    <TextInput
                                        ref={nifRef}
                                        placeholder="Entrez le NIF"
                                        placeholderTextColor="#777"
                                        value={nif}
                                        style={styles.input}
                                        onChangeText={setNif}
                                        onFocus={() => setNifFocused(true)}
                                        onBlur={() => setNifFocused(false)}
                                        returnKeyType="next"
                                        onSubmitEditing={() => statRef.current?.focus()}
                                        editable={!isLoading}
                                    />
                                </View>
                            </TouchableWithoutFeedback>
                        </View>

                        {/* STAT */}
                        <View style={{ marginBottom: 8 }}>
                            <Text style={styles.label}>STAT</Text>
                            <TouchableWithoutFeedback onPress={() => statRef.current?.focus()}>
                                <View style={[styles.inputContainer, statFocused && styles.inputFocused]}>
                                    <TextInput
                                        ref={statRef}
                                        placeholder="Entrez le STAT"
                                        placeholderTextColor="#777"
                                        value={stat}
                                        style={styles.input}
                                        onChangeText={setStat}
                                        onFocus={() => setStatFocused(true)}
                                        onBlur={() => setStatFocused(false)}
                                        returnKeyType="done"
                                        onSubmitEditing={handleSubmit}
                                        editable={!isLoading}
                                    />
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </>
                )}

                {/* BOUTON ENREGISTRER */}
                <TouchableOpacity
                    style={[
                        styles.button,
                        isLoading && styles.buttonDisabled,
                    ]}
                    disabled={isLoading}
                    onPress={handleSubmit}
                    activeOpacity={0.9}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Mettre à jour</Text>
                    )}
                </TouchableOpacity>
            </KeyboardAwareScrollView>
        </KeyboardAvoidingView>
    );
}