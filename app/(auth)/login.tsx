import React, { useState, useRef, useEffect } from "react";
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
import { styles } from "../../styles/loginStyles";
import { useRouter } from "expo-router";
import { useAuth } from "../../hooks/useAuth";

const LoginScreen = () => {
  const router = useRouter();
  const { login, loading, error } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  // Check if all fields are filled
  const isFormValid = email.trim().length > 0 && password.trim().length > 0;

  const handleLogin = async () => {
    if (!isFormValid) {
      setMessageType("error");
      setMessage("Veuillez saisir l'email et le mot de passe.");
      return;
    }

    if (!isValidEmail(email)) {
      setMessageType("error");
      setMessage("Veuillez saisir un email valide.");
      return;
    }

    setMessage("");
    
    try {
      const credentials = {
        email: email.trim().toLowerCase(),
        mot_de_passe: password,
      };

      await login(credentials);
      
      setMessageType("success");
      setMessage("Connexion réussie !");
      
      // Redirection vers la page d'accueil
      setTimeout(() => {
        router.replace("/");
      }, 1000);
      
    } catch (error: any) {
      setMessageType("error");
      setMessage(error.message || "Erreur lors de la connexion");
    }
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleGoogleLogin = () => {
    setMessageType("success");
    setMessage("Connexion Google sélectionnée");
  };

  const handleCreateAccount = () => {
    router.push("/register");
  };

  const handleForgotPassword = () => {
    router.push("/forgot-password");
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const focusEmailInput = () => {
    emailInputRef.current?.focus();
  };

  const focusPasswordInput = () => {
    passwordInputRef.current?.focus();
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
        {/* Logo at the top */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/icons/softio-Dark.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Form inputs in the center */}
        <View style={styles.formContainer}>
          {/* Instruction text above inputs */}
          <Text style={styles.instructionText}>
            Veuillez saisir vos informations de connexion
          </Text>

          {/* Email Input Container */}
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
                editable={!loading}
                returnKeyType="next"
                onSubmitEditing={focusPasswordInput}
              />
            </View>
          </TouchableWithoutFeedback>

          {/* Password Input Container */}
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
                placeholder="Mot de passe"
                placeholderTextColor="#888"
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                selectionColor="#007bff"
                cursorColor="#007bff"
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              {/* Show/Hide Password Button */}
              <TouchableOpacity 
                onPress={toggleShowPassword}
                style={styles.eyeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                disabled={loading}
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

          {/* Forgot Password Link */}
          <TouchableOpacity 
            style={styles.forgotPasswordContainer}
            onPress={handleForgotPassword}
            disabled={loading}
          >
            <Text style={[styles.forgotPasswordText, loading && styles.disabledText]}>
              Mot de passe oublié ?
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity 
            style={[
              styles.button,
              (!isFormValid || loading) && styles.buttonDisabled
            ]} 
            onPress={handleLogin}
            activeOpacity={isFormValid && !loading ? 0.8 : 1}
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={[
                styles.buttonText,
                (!isFormValid || loading) && styles.buttonTextDisabled
              ]}>
                Se connecter
              </Text>
            )}
          </TouchableOpacity>

          {/* Message Display */}
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

          {/* Bottom Links */}
          <View style={styles.bottomLinksContainer}>
            <Text style={styles.bottomText}>
              Vous n'avez pas de compte ?{" "}
            </Text>
            <TouchableOpacity onPress={handleCreateAccount} disabled={loading}>
              <Text style={[styles.link, loading && styles.disabledText]}>
                Créer un compte
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;