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
} from "react-native";
import { styles } from "../../styles/loginStyles";
import { useRouter } from "expo-router";
import { useAuth } from "../../hooks/useAuth";

const LoginScreen = () => {
  const router = useRouter();
  const { login, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

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

      const response = await login(credentials);

      if (response.success) {
        setMessageType("success");
        setMessage("Connexion réussie !");

        setTimeout(() => {
          router.replace("/"); // Redirection vers la page d'accueil
        }, 500);
      } else {
        setMessageType("error");
        setMessage(response.message || "Échec de la connexion");
      }
    } catch (err: any) {
      setMessageType("error");
      setMessage(err.message || "Erreur lors de la connexion");
    }
  };

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const toggleShowPassword = () => setShowPassword(!showPassword);
  const focusEmailInput = () => emailInputRef.current?.focus();
  const focusPasswordInput = () => passwordInputRef.current?.focus();

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
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/icons/softio-Dark.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.instructionText}>
            Veuillez saisir vos informations de connexion
          </Text>

          {/* Email Input */}
          <TouchableWithoutFeedback onPress={focusEmailInput}>
            <View style={[styles.inputContainer, emailFocused && styles.inputContainerFocused]}>
              <Image source={require('../../assets/icons/mail.png')} style={styles.icon} resizeMode="contain" />
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

          {/* Password Input */}
          <TouchableWithoutFeedback onPress={focusPasswordInput}>
            <View style={[styles.inputContainer, passwordFocused && styles.inputContainerFocused]}>
              <Image source={require('../../assets/icons/lock.png')} style={styles.icon} resizeMode="contain" />
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
              <TouchableOpacity onPress={toggleShowPassword} style={styles.eyeButton} disabled={loading}>
                <Image
                  source={showPassword
                    ? require('../../assets/icons/eye-open.png')
                    : require('../../assets/icons/eye-closed.png')}
                  style={styles.eyeIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.button, (!isFormValid || loading) && styles.buttonDisabled]}
            onPress={handleLogin}
            activeOpacity={isFormValid && !loading ? 0.8 : 1}
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={[styles.buttonText, (!isFormValid || loading) && styles.buttonTextDisabled]}>
                Se connecter
              </Text>
            )}
          </TouchableOpacity>

          {/* Message Display */}
          {message ? (
            <View style={[styles.messageContainer, messageType === "error" ? styles.errorContainer : styles.successContainer]}>
              <Text style={[styles.messageText, messageType === "error" ? styles.errorText : styles.successText]}>
                {message}
              </Text>
            </View>
          ) : null}

          {/* Bottom Links */}
          <View style={styles.bottomLinksContainer}>
            <Text style={styles.bottomText}>Vous n'avez pas de compte ? </Text>
            <TouchableOpacity onPress={() => router.push("/register")} disabled={loading}>
              <Text style={[styles.link, loading && styles.disabledText]}>Créer un compte</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
