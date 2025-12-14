import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { createCategoryStyles as styles } from '../styles/CreateCategoryStyles';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useRoute, useNavigation } from '@react-navigation/native';
import { categoryService } from '../services/categoryService';
import { Ionicons } from '@expo/vector-icons';

type MessageType = 'error' | 'success' | '';

interface CategoryDto {
  categorie: string;
  description: string;
}

export default function CreateOrEditCategoryScreen() {
  const router = useRouter();
  const route = useRoute();
  const navigation = useNavigation();
  const { categoryId, categorie: catName, description: catDesc } = (route.params || {}) as {
  categoryId?: string;
  categorie?: string;
  description?: string;
};

  /* ---------- Mode ---------- */
  const isEdit = !!categoryId;

  /* ---------- Champs ---------- */
  const [categorie, setCategorie] = useState(catName || '');
  const [description, setDescription] = useState(catDesc || '');

  /* ---------- UI ---------- */
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<MessageType>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(isEdit); // bloque pendant le fetch

  /* ---------- Focus ---------- */
  const [categorieFocused, setCategorieFocused] = useState(false);
  const [descriptionFocused, setDescriptionFocused] = useState(false);

  /* ---------- Refs ---------- */
  const categorieRef = useRef<TextInput>(null);
  const descriptionRef = useRef<TextInput>(null);

  /* ---------- Validation ---------- */
  const isFormValid = categorie.trim().length > 0 && description.trim().length > 0;

  /* ---------- Chargement en édition ---------- */
  useEffect(() => {
    if (!isEdit) return;
    // Si on arrive via un params complet, on a déjà les données
    if (catName && catDesc) {
      setIsReadOnly(false);
      return;
    }
    // Sinon on fetch
    (async () => {
      try {
        setIsLoading(true);
        const data = await categoryService.getCategory(categoryId!);
        setCategorie(data.categorie);
        setDescription(data.description);
      } catch (e: any) {
        Alert.alert('Erreur', e.message || 'Impossible de charger la catégorie');
        router.back();
      } finally {
        setIsLoading(false);
        setIsReadOnly(false);
      }
    })();
  }, [categoryId]);

  /* ---------- Submit ---------- */
  const handleSubmit = async () => {
    if (!categorie.trim()) return showError('Le nom de la catégorie est obligatoire.');
    if (!description.trim()) return showError('La description est obligatoire.');

    const payload: CategoryDto = {
      categorie: categorie.trim(),
      description: description.trim(),
    };

    setIsLoading(true);
    setMessage('');

    try {
      const response = isEdit
        ? await categoryService.updateCategory(categoryId!, payload)
        : await categoryService.createCategory(payload);

      setMessageType('success');
      setMessage(response.message || (isEdit ? 'Catégorie modifiée !' : 'Catégorie créée !'));

      setTimeout(() => navigation.goBack(), 1500);
    } catch (error: any) {
      console.log('❌ Erreur', error);
      showError(error.message || `Erreur lors de ${isEdit ? 'la modification' : "l'ajout"}`);
      if (error.code === 500) {
        Alert.alert('Erreur serveur', 'Impossible de contacter le serveur.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------- Helpers ---------- */
  const showError = (msg: string) => {
    setMessageType('error');
    setMessage(msg);
  };

  /* ---------- Render ---------- */
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={router.back} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.title}>{isEdit ? 'Modifier la catégorie' : 'Créer une catégorie'}</Text>
          </View>

          <View style={{ width: 32 }} />
        </View>

        {/* CATEGORIE */}
        <TouchableWithoutFeedback onPress={() => categorieRef.current?.focus()}>
          <View style={[styles.inputContainer, categorieFocused && styles.inputFocused]}>
            <TextInput
              ref={categorieRef}
              placeholder="Nom de la catégorie"
              placeholderTextColor="#777"
              value={categorie}
              style={styles.input}
              onChangeText={setCategorie}
              onFocus={() => setCategorieFocused(true)}
              onBlur={() => setCategorieFocused(false)}
              editable={!isLoading && !isReadOnly}
              returnKeyType="next"
              onSubmitEditing={() => descriptionRef.current?.focus()}
            />
          </View>
        </TouchableWithoutFeedback>

        {/* DESCRIPTION */}
        <TouchableWithoutFeedback onPress={() => descriptionRef.current?.focus()}>
          <View style={[styles.inputContainer, descriptionFocused && styles.inputFocused]}>
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
              editable={!isLoading && !isReadOnly}
            />
          </View>
        </TouchableWithoutFeedback>

        {/* BOUTON */}
        <TouchableOpacity
          style={[styles.button, (!isFormValid || isLoading) && styles.buttonDisabled]}
          disabled={!isFormValid || isLoading || isReadOnly}
          onPress={handleSubmit}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{isEdit ? 'Enregistrer' : 'Créer'}</Text>
          )}
        </TouchableOpacity>

        {/* MESSAGE */}
        {message ? (
          <View style={[styles.messageBox, messageType === 'error' ? styles.errorBox : styles.successBox]}>
            <Text style={[styles.messageText, messageType === 'error' ? styles.errorText : styles.successText]}>
              {message}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}