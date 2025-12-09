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
import { styles } from "@/styles/registerStyles";
import { useRouter } from "expo-router";

const SecurityScreen = () => {
  const router = useRouter();

  /* ----------  États locaux (simples, juste pour l’affichage)  ---------- */
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /* ----------  Refs pour le focus  ---------- */
  const fullNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  /* ----------  Handlers vides (on ne fait rien)  ---------- */
  const handleRegister = () => {
    // Ici : rien n’est envoyé, rien n’est validé
    console.log("Bouton pressé – aucune action réseau.");
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
        {/*  LOGO  */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/icons/softio-Dark.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/*  FORM  */}
        <View style={styles.formContainer}>
          <Text style={styles.instructionText}>Créer votre compte</Text>

          {/*  FULL NAME  */}
          <TouchableWithoutFeedback onPress={() => fullNameRef.current?.focus()}>
            <View style={styles.inputContainer}>
              <Image source={require("../../assets/icons/person.png")} style={styles.icon} />
              <TextInput
                ref={fullNameRef}
                placeholder="Nom complet"
                placeholderTextColor="#888"
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
              />
            </View>
          </TouchableWithoutFeedback>

          {/*  EMAIL  */}
          <TouchableWithoutFeedback onPress={() => emailRef.current?.focus()}>
            <View style={styles.inputContainer}>
              <Image source={require("../../assets/icons/mail.png")} style={styles.icon} />
              <TextInput
                ref={emailRef}
                placeholder="Email"
                placeholderTextColor="#888"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </View>
          </TouchableWithoutFeedback>

          {/*  PASSWORD  */}
          <TouchableWithoutFeedback onPress={() => passwordRef.current?.focus()}>
            <View style={styles.inputContainer}>
              <Image source={require("../../assets/icons/lock.png")} style={styles.icon} />
              <TextInput
                ref={passwordRef}
                placeholder="Mot de passe"
                placeholderTextColor="#888"
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeButton}>
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

          {/*  CONFIRM PASSWORD  */}
          <TouchableWithoutFeedback onPress={() => confirmPasswordRef.current?.focus()}>
            <View style={styles.inputContainer}>
              <Image source={require("../../assets/icons/lock.png")} style={styles.icon} />
              <TextInput
                ref={confirmPasswordRef}
                placeholder="Confirmer le mot de passe"
                placeholderTextColor="#888"
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword((v) => !v)} style={styles.eyeButton}>
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

          {/*  BUTTON  */}
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Créer un compte</Text>
          </TouchableOpacity>

          {/*  LOGIN LINK  */}
          <View style={styles.bottomLinksContainer}>
            <Text style={styles.bottomText}>Vous avez déjà un compte ?</Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={styles.link}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SecurityScreen;