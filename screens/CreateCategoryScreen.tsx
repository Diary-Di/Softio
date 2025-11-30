import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  TouchableWithoutFeedback,
} from "react-native";
import { createCategoryStyles as styles } from '../styles/CreateCategoryStyles';
import { useRouter } from "expo-router";
import { categoryService } from "../services/categoryService";
import { Ionicons } from "@expo/vector-icons";

const CreateCategoryScreen = () => {
  const router = useRouter();

  // Champs
  const [categorie, setCategorie] = useState("");
  const [description, setDescription] = useState("");

  // UI
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] =
    useState<"error" | "success" | "">("");
  const [isLoading, setIsLoading] = useState(false);

  // Focus states
  const [categorieFocused, setCategorieFocused] = useState(false);
  const [descriptionFocused, setDescriptionFocused] = useState(false);

  // Refs
  const categorieRef = useRef<TextInput>(null);
  const descriptionRef = useRef<TextInput>(null);

  // Validation
  const isFormValid =
    categorie.trim().length > 0 && description.trim().length > 0;

  /** Fonction de création */
  const handleCreate = async () => {
    if (!categorie.trim())
      return showError("Le nom de la catégorie est obligatoire.");
    if (!description.trim())
      return showError("La description est obligatoire.");

    const payload = {
      categorie: categorie.trim(),
      description: description.trim(),
    };

    setIsLoading(true);
    setMessage("");

    try {
      const response = await categoryService.createCategory(payload);

      setMessageType("success");
      setMessage(response.message || "Catégorie créée avec succès !");

      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error: any) {
      console.log("❌ Erreur création catégorie :", error);
      showError(error.message || "Erreur lors de l’ajout de la catégorie");

      if (error.code === 500) {
        Alert.alert(
          "Erreur serveur",
          "Impossible de contacter le serveur."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  /** Affiche l’erreur */
  const showError = (msg: string) => {
    setMessageType("error");
    setMessage(msg);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}
		<View style={styles.header}>
  		<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
    		<Ionicons name="arrow-back" size={24} color="#111" />
  		</TouchableOpacity>

  		<View style={styles.headerCenter}>
    		<Text style={styles.title}>Créer une catégorie</Text>
  		</View>

  		<View style={{ width: 32 }} />
		</View>


        {/* CATEGORIE */}
        <TouchableWithoutFeedback
          onPress={() => categorieRef.current?.focus()}
        >
          <View
            style={[
              styles.inputContainer,
              categorieFocused && styles.inputFocused,
            ]}
          >
            <TextInput
              ref={categorieRef}
              placeholder="Nom de la catégorie"
              placeholderTextColor="#777"
              value={categorie}
              style={styles.input}
              onChangeText={setCategorie}
              onFocus={() => setCategorieFocused(true)}
              onBlur={() => setCategorieFocused(false)}
              editable={!isLoading}
              returnKeyType="next"
              onSubmitEditing={() => descriptionRef.current?.focus()}
            />
          </View>
        </TouchableWithoutFeedback>

        {/* DESCRIPTION */}
        <TouchableWithoutFeedback
          onPress={() => descriptionRef.current?.focus()}
        >
          <View
            style={[
              styles.inputContainer,
              descriptionFocused && styles.inputFocused,
            ]}
          >
            <TextInput
              ref={descriptionRef}
              placeholder="Description"
              placeholderTextColor="#777"
              value={description}
              style={[styles.input, { height: 100 }]}
              onChangeText={setDescription}
              multiline
              onFocus={() => setDescriptionFocused(true)}
              onBlur={() => setDescriptionFocused(false)}
              editable={!isLoading}
            />
          </View>
        </TouchableWithoutFeedback>

        {/* BOUTON */}
        <TouchableOpacity
          style={[
            styles.button,
            (!isFormValid || isLoading) && styles.buttonDisabled,
          ]}
          disabled={!isFormValid || isLoading}
          onPress={handleCreate}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Créer</Text>
          )}
        </TouchableOpacity>

        {/* MESSAGE */}
        {message ? (
          <View
            style={[
              styles.messageBox,
              messageType === "error"
                ? styles.errorBox
                : styles.successBox,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                messageType === "error"
                  ? styles.errorText
                  : styles.successText,
              ]}
            >
              {message}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreateCategoryScreen;
