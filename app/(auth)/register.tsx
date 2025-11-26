import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert,
} from "react-native";
import { styles } from "../../styles/registerStyles";
import { useRouter } from "expo-router";
import { authService } from "../../services/authService";

const RegisterScreen = () => {
  const router = useRouter();
  
  // États pour les champs du formulaire
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // États pour l'UI
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullNameFocused, setFullNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Références pour les inputs
  const fullNameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  // Validation du formulaire
  const isFormValid = fullName.trim().length > 0 && 
                     email.trim().length > 0 && 
                     password.trim().length >= 6 && 
                     confirmPassword.trim().length > 0 &&
                     password === confirmPassword;

  // Fonction pour gérer l'inscription
  const handleRegister = async () => {
    // Validation côté client
    if (!fullName.trim()) {
      setMessageType("error");
      setMessage("Veuillez entrer votre nom complet.");
      return;
    }

    if (!email.trim()) {
      setMessageType("error");
      setMessage("Veuillez entrer votre email.");
      return;
    }

    if (!isValidEmail(email)) {
      setMessageType("error");
      setMessage("Veuillez entrer un email valide.");
      return;
    }

    if (password.length < 6) {
      setMessageType("error");
      setMessage("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setMessageType("error");
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      // Préparation des données pour l'API
      const userData = {
        nom: fullName.trim(),
        email: email.trim().toLowerCase(),
        mot_de_passe: password,
      };

      console.log("Tentative d'inscription avec:", userData);

      // Appel à l'API
      const response = await authService.register(userData);
      
      console.log("Réponse d'inscription:", response);

      if (response.success) {
        setMessageType("success");
        setMessage(response.message || "Compte créé avec succès !");
        
        // Redirection vers la page de connexion après 2 secondes
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setMessageType("error");
        setMessage(response.message || "Erreur lors de la création du compte");
      }
      
    } catch (error: any) {
      console.error("Erreur détaillée:", error);
      setMessageType("error");
      setMessage(error.message || "Une erreur est survenue lors de l'inscription");
      
      // Afficher une alerte pour les erreurs critiques
      if (error.code === 500 || error.message.includes("serveur")) {
        Alert.alert(
          "Erreur de connexion",
          "Impossible de contacter le serveur. Veuillez vérifier votre connexion internet."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de validation d'email
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Fonction pour l'inscription Google (placeholder)
  const handleGoogleRegister = () => {
    // Pour Google, on utilise "success" au lieu de "info"
    setMessageType("success");
    setMessage("Fonctionnalité Google en cours de développement");
  };

  // Navigation vers la page de connexion
  const handleLogin = () => {
    if (!isLoading) {
      router.push("/login");
    }
  };

  // Fonctions pour afficher/masquer les mots de passe
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Fonctions pour focus les inputs
  const focusFullNameInput = () => {
    fullNameInputRef.current?.focus();
  };

  const focusEmailInput = () => {
    emailInputRef.current?.focus();
  };

  const focusPasswordInput = () => {
    passwordInputRef.current?.focus();
  };

  const focusConfirmPasswordInput = () => {
    confirmPasswordInputRef.current?.focus();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo en haut */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/icons/softio-Dark.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Formulaire au centre */}
        <View style={styles.formContainer}>
          {/* Texte d'instruction */}
          <Text style={styles.instructionText}>
            Créer votre compte
          </Text>

          {/* Champ Nom complet */}
          <TouchableWithoutFeedback onPress={focusFullNameInput}>
            <View style={[
              styles.inputContainer,
              fullNameFocused && styles.inputContainerFocused
            ]}>
              <Image 
                source={require('../../assets/icons/person.png')}
                style={styles.icon}
                resizeMode="contain"
              />
              <TextInput
                ref={fullNameInputRef}
                placeholder="Nom complet"
                placeholderTextColor="#888"
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                autoComplete="name"
                onFocus={() => setFullNameFocused(true)}
                onBlur={() => setFullNameFocused(false)}
                selectionColor="#007bff"
                cursorColor="#007bff"
                editable={!isLoading}
                returnKeyType="next"
                onSubmitEditing={focusEmailInput}
              />
            </View>
          </TouchableWithoutFeedback>

          {/* Champ Email */}
          <TouchableWithoutFeedback onPress={focusEmailInput}>
            <View style={[
              styles.inputContainer,
              emailFocused && styles.inputContainerFocused
            ]}>
              <Image 
                source={require('../../assets/icons/mail.png')} 
                style={styles.icon}
                resizeMode="contain"
              />
              <TextInput
                ref={emailInputRef}
                placeholder="Email"
                placeholderTextColor="#888"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                selectionColor="#007bff"
                cursorColor="#007bff"
                editable={!isLoading}
                returnKeyType="next"
                onSubmitEditing={focusPasswordInput}
              />
            </View>
          </TouchableWithoutFeedback>

          {/* Champ Mot de passe */}
          <TouchableWithoutFeedback onPress={focusPasswordInput}>
            <View style={[
              styles.inputContainer,
              passwordFocused && styles.inputContainerFocused
            ]}>
              <Image 
                source={require('../../assets/icons/lock.png')} 
                style={styles.icon}
                resizeMode="contain"
              />
              <TextInput
                ref={passwordInputRef}
                placeholder="Mot de passe (min. 6 caractères)"
                placeholderTextColor="#888"
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password-new"
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                selectionColor="#007bff"
                cursorColor="#007bff"
                editable={!isLoading}
                returnKeyType="next"
                onSubmitEditing={focusConfirmPasswordInput}
              />
              <TouchableOpacity 
                onPress={toggleShowPassword}
                style={styles.eyeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                disabled={isLoading}
              >
                <Image 
                  source={
                    showPassword 
                      ? require('../../assets/icons/eye-open.png') 
                      : require('../../assets/icons/eye-closed.png')
                  } 
                  style={styles.eyeIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>

          {/* Champ Confirmation mot de passe */}
          <TouchableWithoutFeedback onPress={focusConfirmPasswordInput}>
            <View style={[
              styles.inputContainer,
              confirmPasswordFocused && styles.inputContainerFocused
            ]}>
              <Image 
                source={require('../../assets/icons/lock.png')} 
                style={styles.icon}
                resizeMode="contain"
              />
              <TextInput
                ref={confirmPasswordInputRef}
                placeholder="Confirmer le mot de passe"
                placeholderTextColor="#888"
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoComplete="password-new"
                onFocus={() => setConfirmPasswordFocused(true)}
                onBlur={() => setConfirmPasswordFocused(false)}
                selectionColor="#007bff"
                cursorColor="#007bff"
                editable={!isLoading}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
              <TouchableOpacity 
                onPress={toggleShowConfirmPassword}
                style={styles.eyeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                disabled={isLoading}
              >
                <Image 
                  source={
                    showConfirmPassword 
                      ? require('../../assets/icons/eye-open.png') 
                      : require('../../assets/icons/eye-closed.png')
                  } 
                  style={styles.eyeIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>

          {/* Bouton d'inscription */}
          <TouchableOpacity 
            style={[
              styles.button,
              (!isFormValid || isLoading) && styles.buttonDisabled
            ]} 
            onPress={handleRegister}
            activeOpacity={isFormValid && !isLoading ? 0.8 : 1}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={[
                styles.buttonText,
                (!isFormValid || isLoading) && styles.buttonTextDisabled
              ]}>
                Créer un compte
              </Text>
            )}
          </TouchableOpacity>

          {/* Séparateur */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Bouton Google */}
          <TouchableOpacity 
            style={[styles.googleButton, isLoading && styles.buttonDisabled]}
            onPress={handleGoogleRegister}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            <Image 
              source={require('../../assets/icons/google-icon.png')} 
              style={styles.googleIcon}
              resizeMode="contain"
            />
            <Text style={styles.googleButtonText}>
              S'inscrire avec Google
            </Text>
          </TouchableOpacity>

          {/* Affichage des messages */}
          {message ? (
            <View style={[
              styles.messageContainer,
              messageType === "error" ? styles.errorContainer : styles.successContainer
            ]}>
              <Text style={[
                styles.messageText,
                messageType === "error" ? styles.errorText : styles.successText,
              ]}>
                {message}
              </Text>
            </View>
          ) : null}

          {/* Liens en bas */}
          <View style={styles.bottomLinksContainer}>
            <Text style={styles.bottomText}>
              Vous avez déjà un compte ?{" "}
            </Text>
            <TouchableOpacity onPress={handleLogin} disabled={isLoading}>
              <Text style={[styles.link, isLoading && styles.linkDisabled]}>
                Se connecter
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;