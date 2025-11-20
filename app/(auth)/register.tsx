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
} from "react-native";
import { styles } from "../../styles/registerStyles";
import { useRouter } from "expo-router"; // Use Expo Router

const RegisterScreen = () => {
  const router = useRouter(); // Use Expo Router
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullNameFocused, setFullNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  const fullNameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  // Check if all fields are filled and passwords match
  const isFormValid = fullName.trim().length > 0 && 
                     email.trim().length > 0 && 
                     password.trim().length > 0 && 
                     confirmPassword.trim().length > 0 &&
                     password === confirmPassword;

  const handleRegister = () => {
    if (!isFormValid) {
      if (password !== confirmPassword) {
        setMessageType("error");
        setMessage("Les mots de passe ne correspondent pas.");
      } else {
        setMessageType("error");
        setMessage("Veuillez remplir tous les champs.");
      }
      return;
    }

    // Simulate registration success
    setMessageType("success");
    setMessage("Compte créé avec succès !");
    setTimeout(() => {
      router.push("/login"); // Navigate back to login using Expo Router
    }, 1500);
  };

  const handleGoogleRegister = () => {
    setMessageType("success");
    setMessage("Inscription Google sélectionnée");
  };

  const handleLogin = () => {
    router.push("/login"); // Navigate to login using Expo Router
  };


  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

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
            Créer votre compte
          </Text>

          {/* Full Name Input Container */}
          <TouchableWithoutFeedback onPress={focusFullNameInput}>
            <View style={[
              styles.inputContainer,
              fullNameFocused && styles.inputContainerFocused
            ]}>
              <Image 
                source={require('../../assets/icons/person.png')}  // You might need to add this icon
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
              />
            </View>
          </TouchableWithoutFeedback>

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
                autoComplete="password-new"
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                selectionColor="#007bff"
                cursorColor="#007bff"
              />
              {/* Show/Hide Password Button */}
              <TouchableOpacity 
                onPress={toggleShowPassword}
                style={styles.eyeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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

          {/* Confirm Password Input Container */}
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
              />
              {/* Show/Hide Confirm Password Button */}
              <TouchableOpacity 
                onPress={toggleShowConfirmPassword}
                style={styles.eyeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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

          {/* Register Button */}
          <TouchableOpacity 
            style={[
              styles.button,
              !isFormValid && styles.buttonDisabled
            ]} 
            onPress={handleRegister}
            activeOpacity={isFormValid ? 0.8 : 1}
            disabled={!isFormValid}
          >
            <Text style={[
              styles.buttonText,
              !isFormValid && styles.buttonTextDisabled
            ]}>
              Créer un compte
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign-In Button */}
          <TouchableOpacity 
            style={styles.googleButton}
            onPress={handleGoogleRegister}
            activeOpacity={0.8}
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

          {/* Message Display */}
          {message ? (
            <Text
              style={[
                styles.message,
                messageType === "error" ? styles.error : styles.success,
              ]}
            >
              {message}
            </Text>
          ) : null}

          {/* Bottom Links */}
          <View style={styles.bottomLinksContainer}>
            <Text style={styles.bottomText}>
              Vous avez déjà un compte ?{" "}
            </Text>
            <TouchableOpacity onPress={handleLogin}>
              <Text style={styles.link}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;