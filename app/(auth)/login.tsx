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
import { styles } from "./../styles/loginStyles";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
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

  const handleLogin = () => {
    if (!isFormValid) {
      setMessageType("error");
      setMessage("Veuillez saisir l'email et le mot de passe.");
      return;
    }

    if (email === "admin@gmail.com" && password === "123456") {
      setMessageType("success");
      setMessage("Connexion réussie !");
      setTimeout(() => {
        navigation.navigate("Home");
      }, 1000);
    } else {
      setMessageType("error");
      setMessage("Identifiants invalides. Veuillez réessayer.");
    }
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

          {/* Login Button */}
          <TouchableOpacity 
            style={[
              styles.button,
              !isFormValid && styles.buttonDisabled
            ]} 
            onPress={handleLogin}
            activeOpacity={isFormValid ? 0.8 : 1}
            disabled={!isFormValid}
          >
            <Text style={[
              styles.buttonText,
              !isFormValid && styles.buttonTextDisabled
            ]}>
              Se connecter
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
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;