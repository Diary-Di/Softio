import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { createProductStyles } from '../styles/CreateProductStyles';
import { Image } from 'react-native';

// Types
type ProductForm = {
  reference: string;
  designation: string;
  categorie: string;
  prix_actuel: string;
  qte_disponible: number | "";
  illustration: string | null;
};

type FormErrors = {
  [key in keyof ProductForm]?: string;
};

// Mock data for categories
const CATEGORIES = [
  'Informatique',
  'Téléphonie',
  'Gaming',
  'Électroménager',
  'Mode',
  'Cosmétiques',
  'Sport',
  'Autre',
];

// Fonction de formatage des prix avec séparateur de milliers
const formatPrice = (value: string) => {
  if (!value) return '';
  const number = parseFloat(value.replace(',', '.'));
  if (isNaN(number)) return value;
  return number.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function CreateProductScreen({ navigation }: any) {
  const [formData, setFormData] = useState<ProductForm>({
    reference: '',
    designation: '',
    categorie: '',
    prix_actuel: '',
    qte_disponible: 0,
    illustration: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = useCallback(
    (field: keyof ProductForm, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    },
    [errors]
  );

  const handleBlur = useCallback(
    (field: keyof ProductForm) => {
      setTouched(prev => ({ ...prev, [field]: true }));
      validateField(field, formData[field]);
    },
    [formData]
  );

  const validateField = useCallback((field: keyof ProductForm, value: any) => {
    let error = '';

    switch (field) {
      case 'reference':
        if (!value.trim()) error = 'La référence est obligatoire';
        else if (value.trim().length < 2) error = 'La référence doit contenir au moins 2 caractères';
        break;
      case 'designation':
        if (!value.trim()) error = 'La désignation est obligatoire';
        else if (value.trim().length < 3) error = 'La désignation doit contenir au moins 3 caractères';
        break;
      case 'categorie':
        if (!value.trim()) error = 'La catégorie est obligatoire';
        break;
      case 'prix_actuel':
        if (!value.trim()) error = 'Le prix unitaire est obligatoire';
        else if (isNaN(parseFloat(value)) || parseFloat(value) <= 0)
          error = 'Le prix doit être un nombre positif';
        break;
      case 'qte_disponible':
        if (value && (!Number.isInteger(Number(value)) || Number(value) < 0))
          error = 'La quantité doit être un entier ≥ 0';
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  }, []);

  const validateForm = useCallback(() => {
    let isValid = true;
    (Object.keys(formData) as (keyof ProductForm)[]).forEach(field => {
      const fieldIsValid = validateField(field, formData[field]);
      if (!fieldIsValid) isValid = false;
    });
    return isValid;
  }, [formData, validateField]);

  const pickImage = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission refusée', 'Nous avons besoin de l’accès à vos photos pour sélectionner une image.');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        setFormData(prev => ({ ...prev, illustration: result.assets[0].uri }));
      }
    } catch (error) {
      console.log('Erreur lors de la sélection de l’image :', error);
      Alert.alert('Erreur', 'Impossible de sélectionner l’image.');
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, illustration: null }));
  };

  const handleSubmit = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as { [key: string]: boolean });
    setTouched(allTouched);

    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erreur', 'Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const payload = {
        ref_produit: formData.reference,
        designation: formData.designation,
        categorie: formData.categorie,
        prix_actuel: parseFloat(formData.prix_actuel),
        qte_disponible: parseInt(String(formData.qte_disponible)) || 0,
        illustration: formData.illustration,
        date_mise_a_jour_prix: new Date().toISOString().split('T')[0],
      };

      console.log('Payload envoyé:', payload);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Succès', 'Produit créé avec succès', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erreur', 'Impossible de créer le produit');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, navigation]);

  const handleCancel = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  }, [navigation]);

  const isFormValid =
    formData.reference.trim() &&
    formData.designation.trim() &&
    formData.categorie.trim() &&
    formData.prix_actuel.trim() &&
    !Object.values(errors).some(error => error);

  return (
    <SafeAreaView style={createProductStyles.safeArea}>
      {/* Header */}
      <View style={createProductStyles.header}>
        <TouchableOpacity onPress={handleCancel} disabled={isSubmitting}>
          <Text style={createProductStyles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>
        <Text style={createProductStyles.headerTitle}>Nouveau Produit</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Form */}
      <ScrollView
        style={createProductStyles.formContainer}
        contentContainerStyle={createProductStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Référence */}
        <View style={createProductStyles.inputGroup}>
          <Text style={createProductStyles.label}>Référence *</Text>
          <TextInput
            style={[createProductStyles.textInput, touched.reference && errors.reference && createProductStyles.errorInput]}
            value={formData.reference}
            onChangeText={value => handleInputChange('reference', value)}
            onBlur={() => handleBlur('reference')}
            placeholder="ex: REF001"
            placeholderTextColor="#999"
            editable={!isSubmitting}
            maxLength={50}
          />
          {touched.reference && errors.reference && <Text style={createProductStyles.errorText}>{errors.reference}</Text>}
        </View>

        {/* Désignation */}
        <View style={createProductStyles.inputGroup}>
          <Text style={createProductStyles.label}>Désignation *</Text>
          <TextInput
            style={[createProductStyles.textInput, touched.designation && errors.designation && createProductStyles.errorInput]}
            value={formData.designation}
            onChangeText={value => handleInputChange('designation', value)}
            onBlur={() => handleBlur('designation')}
            placeholder="Nom du produit"
            placeholderTextColor="#999"
            editable={!isSubmitting}
            maxLength={255}
          />
          {touched.designation && errors.designation && <Text style={createProductStyles.errorText}>{errors.designation}</Text>}
        </View>

        {/* Catégorie */}
        <View style={createProductStyles.inputGroup}>
          <Text style={createProductStyles.label}>Catégorie *</Text>
          <View style={createProductStyles.picker}>
            <Picker
              selectedValue={formData.categorie}
              onValueChange={value => handleInputChange('categorie', value)}
              enabled={!isSubmitting}
              style={Platform.OS === 'ios' ? createProductStyles.pickerIOS : createProductStyles.pickerAndroid}
            >
              <Picker.Item label="Sélectionnez une catégorie" value="" />
              {CATEGORIES.map(cat => <Picker.Item key={cat} label={cat} value={cat} />)}
            </Picker>
          </View>
          {touched.categorie && errors.categorie && <Text style={createProductStyles.errorText}>{errors.categorie}</Text>}
        </View>

        {/* Prix unitaire */}
        <View style={createProductStyles.inputGroup}>
          <Text style={createProductStyles.label}>Prix unitaire (€) *</Text>
          <TextInput
            style={[
              createProductStyles.textInput,
              touched.prix_actuel && errors.prix_actuel && createProductStyles.errorInput
            ]}
            value={formatPrice(formData.prix_actuel)} // affichage formaté
            onChangeText={value => {
              // Supprimer espaces et remplacer ',' par '.'
              const cleanedValue = value.replace(/\s/g, '').replace(',', '.');
              handleInputChange('prix_actuel', cleanedValue);
            }}
            onBlur={() => handleBlur('prix_actuel')}
            placeholder="0,00"
            placeholderTextColor="#999"
            keyboardType="decimal-pad"
            editable={!isSubmitting}
          />
          {touched.prix_actuel && errors.prix_actuel && (
            <Text style={createProductStyles.errorText}>{errors.prix_actuel}</Text>
          )}
        </View>

        {/* Quantité disponible */}
<View style={createProductStyles.inputGroup}>
  <Text style={createProductStyles.label}>
    Quantité disponible <Text style={createProductStyles.required}>*</Text>
  </Text>

  <View style={createProductStyles.quantityContainer}>

    {/* Bouton "-" */}
    <TouchableOpacity
      onPress={() =>
        setFormData((prev) => ({
          ...prev,
          qte_disponible: Math.max(
            0,
            (Number(prev.qte_disponible) || 0) - 1
          ),
        }))
      }
      style={createProductStyles.qtyButton}
    >
      <Text style={createProductStyles.qtyButtonText}>–</Text>
    </TouchableOpacity>

    {/* Champ de saisie */}
    <TextInput
      style={createProductStyles.qtyInput}
      keyboardType="numeric"
      value={
        formData.qte_disponible === ""
          ? ""
          : String(formData.qte_disponible)
      }
      onChangeText={(text) =>
        setFormData((prev) => ({
          ...prev,
          qte_disponible: text === "" ? "" : Number(text),
        }))
      }
    />

    {/* Bouton "+" */}
    <TouchableOpacity
      onPress={() =>
        setFormData((prev) => ({
          ...prev,
          qte_disponible: (Number(prev.qte_disponible) || 0) + 1,
        }))
      }
      style={createProductStyles.qtyButton}
    >
      <Text style={createProductStyles.qtyButtonText}>+</Text>
    </TouchableOpacity>

  </View>
</View>


        {/* Illustration */}
<View style={createProductStyles.inputGroup}>

  {/* CONTENEUR DU BOUTON D'AJOUT */}
  {!formData.illustration && (
    <TouchableOpacity 
      onPress={pickImage} 
      style={createProductStyles.imageContainer}
    >
      <Text style={createProductStyles.imagePlaceholderText}>
        + Ajouter une image
      </Text>
    </TouchableOpacity>
  )}

  {/* APERCU DE L'IMAGE */}
  {formData.illustration && (
    <View style={createProductStyles.imagePreviewWrapper}>

      {/* Croix pour supprimer */}
      <TouchableOpacity 
        onPress={removeImage} 
        style={createProductStyles.removeIconContainer}
      >
        <Text style={createProductStyles.removeIconText}>✕</Text>
      </TouchableOpacity>

      <Image
        source={{ uri: formData.illustration }}
        style={createProductStyles.imagePreview}
        resizeMode="cover"
      />
    </View>
  )}

  {/* BOUTON POUR CHANGER D'IMAGE */}
  {formData.illustration && (
    <TouchableOpacity 
      onPress={pickImage}
      style={[createProductStyles.imageButton, { marginTop: 10 }]}
    >
      <Text style={createProductStyles.imageButtonText}>
        Changer l’image
      </Text>
    </TouchableOpacity>
  )}
</View>

      </ScrollView>

      {/* Footer */}
      <View style={createProductStyles.footer}>
        <TouchableOpacity
          style={[createProductStyles.submitButton, (!isFormValid || isSubmitting) && createProductStyles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={createProductStyles.submitButtonText}>Créer le Produit</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
