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

  // Champs
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fullNameFocused, setFullNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // Refs
  const fullNameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  // Validation rapide
  const isFormValid =
    fullName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 6 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  /** Validation email */
  const isValidEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  /** 👉 Handler d’inscription corrigé */
  const handleRegister = async () => {
    // Validation client
    if (!fullName.trim()) return showError("Veuillez entrer votre nom complet.");
    if (!email.trim()) return showError("Veuillez entrer votre email.");
    if (!isValidEmail(email)) return showError("Veuillez entrer un email valide.");
    if (password.length < 6) return showError("Le mot de passe doit contenir au moins 6 caractères.");
    if (password !== confirmPassword) return showError("Les mots de passe ne correspondent pas.");

    setIsLoading(true);
    setMessage("");

    const userData = {
      nom: fullName.trim(),
      email: email.trim().toLowerCase(),
      mot_de_passe: password,
    };

    try {
      const response = await authService.register(userData);

      if (response.success) {
        setMessageType("success");
        setMessage(response.message || "Compte créé avec succès !");
        
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        showError(response.message || "Erreur lors de la création du compte");
      }
    } catch (error: any) {
      console.log("❌ Erreur détaillée:", error);
      showError(error.message || "Une erreur est survenue lors de l'inscription");

      if (error.code === 500) {
        Alert.alert("Erreur serveur", "Impossible de contacter le serveur. Vérifiez votre connexion.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  /** Affiche un message d'erreur proprement */
  const showError = (msg: string) => {
    setMessageType("error");
    setMessage(msg);
  };

  /** Toggle affichage mot de passe */
  const toggleShowPassword = () => setShowPassword((prev) => !prev);
  const toggleShowConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

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
        {/* LOGO */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/icons/softio-Dark.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* FORM */}
        <View style={styles.formContainer}>
          <Text style={styles.instructionText}>Créer votre compte</Text>

          {/* NOM */}
          <TouchableWithoutFeedback onPress={() => fullNameInputRef.current?.focus()}>
            <View style={[styles.inputContainer, fullNameFocused && styles.inputContainerFocused]}>
              <Image source={require("../../assets/icons/person.png")} style={styles.icon} />
              <TextInput
                ref={fullNameInputRef}
                placeholder="Nom complet"
                placeholderTextColor="#888"
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                onFocus={() => setFullNameFocused(true)}
                onBlur={() => setFullNameFocused(false)}
                editable={!isLoading}
                returnKeyType="next"
                onSubmitEditing={() => emailInputRef.current?.focus()}
              />
            </View>
          </TouchableWithoutFeedback>

          {/* EMAIL */}
          <TouchableWithoutFeedback onPress={() => emailInputRef.current?.focus()}>
            <View style={[styles.inputContainer, emailFocused && styles.inputContainerFocused]}>
              <Image source={require("../../assets/icons/mail.png")} style={styles.icon} />
              <TextInput
                ref={emailInputRef}
                placeholder="Email"
                placeholderTextColor="#888"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                editable={!isLoading}
                returnKeyType="next"
                onSubmitEditing={() => passwordInputRef.current?.focus()}
              />
            </View>
          </TouchableWithoutFeedback>

          {/* PASSWORD */}
          <TouchableWithoutFeedback onPress={() => passwordInputRef.current?.focus()}>
            <View style={[styles.inputContainer, passwordFocused && styles.inputContainerFocused]}>
              <Image source={require("../../assets/icons/lock.png")} style={styles.icon} />
              <TextInput
                ref={passwordInputRef}
                placeholder="Mot de passe (min. 6 caractères)"
                placeholderTextColor="#888"
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                editable={!isLoading}
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
              />
              <TouchableOpacity onPress={toggleShowPassword} style={styles.eyeButton} disabled={isLoading}>
                <Image
                  source={
                    showPassword
                      ? require("../../assets/icons/eye-open.png")
                      : require("../../assets/icons/eye-closed.png")
                  }
                  style={styles.eyeIcon}
                />
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>

          {/* CONFIRM PASSWORD */}
          <TouchableWithoutFeedback onPress={() => confirmPasswordInputRef.current?.focus()}>
            <View
              style={[
                styles.inputContainer,
                confirmPasswordFocused && styles.inputContainerFocused,
              ]}
            >
              <Image source={require("../../assets/icons/lock.png")} style={styles.icon} />
              <TextInput
                ref={confirmPasswordInputRef}
                placeholder="Confirmer le mot de passe"
                placeholderTextColor="#888"
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                onFocus={() => setConfirmPasswordFocused(true)}
                onBlur={() => setConfirmPasswordFocused(false)}
                editable={!isLoading}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
              <TouchableOpacity
                onPress={toggleShowConfirmPassword}
                style={styles.eyeButton}
                disabled={isLoading}
              >
                <Image
                  source={
                    showConfirmPassword
                      ? require("../../assets/icons/eye-open.png")
                      : require("../../assets/icons/eye-closed.png")
                  }
                  style={styles.eyeIcon}
                />
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>

          {/* BOUTON */}
          <TouchableOpacity
            style={[styles.button, (!isFormValid || isLoading) && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Créer un compte</Text>
            )}
          </TouchableOpacity>

          {/* MESSAGE */}
          {message ? (
            <View
              style={[
                styles.messageContainer,
                messageType === "error" ? styles.errorContainer : styles.successContainer,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  messageType === "error" ? styles.errorText : styles.successText,
                ]}
              >
                {message}
              </Text>
            </View>
          ) : null}

          {/* Lien login */}
          <View style={styles.bottomLinksContainer}>
            <Text style={styles.bottomText}>Vous avez déjà un compte ?</Text>
            <TouchableOpacity disabled={isLoading} onPress={() => router.push("/login")}>
              <Text style={styles.link}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
