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
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { createProductStyles } from '../styles/CreateProductStyles';

// Types
type ProductForm = {
  reference: string;
  designation: string;
  marque: string;
  prix: string;
  categorie: string;
  description: string;
  enStock: boolean;
};

type FormErrors = {
  [key in keyof ProductForm]?: string;
};

// Mock data for categories and brands
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

const BRANDS = [
  'Apple',
  'Samsung',
  'Dell',
  'Sony',
  'LG',
  'HP',
  'Lenovo',
  'Microsoft',
  'Autre',
];

export default function CreateProductScreen({ navigation }: any) {
  const [formData, setFormData] = useState<ProductForm>({
    reference: '',
    designation: '',
    marque: '',
    prix: '',
    categorie: '',
    description: '',
    enStock: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // Handle input changes
  const handleInputChange = useCallback((field: keyof ProductForm, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  // Mark field as touched
  const handleBlur = useCallback((field: keyof ProductForm) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  }, [formData]);

  // Validate individual field
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
      
      case 'marque':
        if (!value.trim()) error = 'La marque est obligatoire';
        break;
      
      case 'prix':
        if (!value.trim()) error = 'Le prix est obligatoire';
        else if (isNaN(parseFloat(value)) || parseFloat(value) <= 0) error = 'Le prix doit être un nombre positif';
        break;
      
      case 'categorie':
        if (!value.trim()) error = 'La catégorie est obligatoire';
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  }, []);

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(formData).forEach(key => {
      const field = key as keyof ProductForm;
      if (field !== 'description' && field !== 'enStock') {
        const fieldIsValid = validateField(field, formData[field]);
        if (!fieldIsValid) isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formData, validateField]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Mark all fields as touched
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Replace with actual API call:
      // const response = await api.post('/products', {
      //   ...formData,
      //   prix: parseFloat(formData.prix)
      // });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert(
        'Succès',
        'Produit créé avec succès',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erreur', 'Impossible de créer le produit');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, navigation]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  }, [navigation]);

  const isFormValid = 
    formData.reference.trim() && 
    formData.designation.trim() && 
    formData.marque.trim() && 
    formData.prix.trim() && 
    formData.categorie.trim() && 
    !Object.values(errors).some(error => error);

  return (
    <SafeAreaView style={createProductStyles.safeArea}>
      {/* Header */}
      <View style={createProductStyles.header}>
        <TouchableOpacity
          style={createProductStyles.cancelButton}
          onPress={handleCancel}
          disabled={isSubmitting}
        >
          <Text style={createProductStyles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>
        
        <Text style={createProductStyles.headerTitle}>Nouveau Produit</Text>
        
        <View style={{ width: 60 }} /> {/* Spacer for balance */}
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
          <Text style={createProductStyles.label}>
            Référence <Text style={createProductStyles.required}>*</Text>
          </Text>
          <TextInput
            style={[
              createProductStyles.textInput,
              touched.reference && errors.reference && createProductStyles.errorInput
            ]}
            value={formData.reference}
            onChangeText={(value) => handleInputChange('reference', value)}
            onBlur={() => handleBlur('reference')}
            placeholder="ex: REF001"
            placeholderTextColor="#999"
            editable={!isSubmitting}
            maxLength={50}
          />
          {touched.reference && errors.reference && (
            <Text style={createProductStyles.errorText}>{errors.reference}</Text>
          )}
        </View>

        {/* Désignation */}
        <View style={createProductStyles.inputGroup}>
          <Text style={createProductStyles.label}>
            Désignation <Text style={createProductStyles.required}>*</Text>
          </Text>
          <TextInput
            style={[
              createProductStyles.textInput,
              touched.designation && errors.designation && createProductStyles.errorInput
            ]}
            value={formData.designation}
            onChangeText={(value) => handleInputChange('designation', value)}
            onBlur={() => handleBlur('designation')}
            placeholder="Nom du produit"
            placeholderTextColor="#999"
            editable={!isSubmitting}
            maxLength={100}
          />
          {touched.designation && errors.designation && (
            <Text style={createProductStyles.errorText}>{errors.designation}</Text>
          )}
        </View>

        {/* Marque */}
        <View style={createProductStyles.inputGroup}>
          <Text style={createProductStyles.label}>
            Marque <Text style={createProductStyles.required}>*</Text>
          </Text>
          <View style={createProductStyles.picker}>
            <Picker
              selectedValue={formData.marque}
              onValueChange={(value) => handleInputChange('marque', value)}
              enabled={!isSubmitting}
              style={Platform.OS === 'ios' ? createProductStyles.pickerIOS : createProductStyles.pickerAndroid}
            >
              <Picker.Item label="Sélectionnez une marque" value="" />
              {BRANDS.map((brand) => (
                <Picker.Item key={brand} label={brand} value={brand} />
              ))}
            </Picker>
          </View>
          {touched.marque && errors.marque && (
            <Text style={createProductStyles.errorText}>{errors.marque}</Text>
          )}
        </View>

        {/* Prix */}
        <View style={createProductStyles.inputGroup}>
          <Text style={createProductStyles.label}>
            Prix (€) <Text style={createProductStyles.required}>*</Text>
          </Text>
          <View style={createProductStyles.priceContainer}>
            <Text style={createProductStyles.currencySymbol}>€</Text>
            <TextInput
              style={[
                createProductStyles.textInput,
                createProductStyles.priceInput,
                touched.prix && errors.prix && createProductStyles.errorInput
              ]}
              value={formData.prix}
              onChangeText={(value) => handleInputChange('prix', value.replace(',', '.'))}
              onBlur={() => handleBlur('prix')}
              placeholder="0.00"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
              editable={!isSubmitting}
            />
          </View>
          {touched.prix && errors.prix && (
            <Text style={createProductStyles.errorText}>{errors.prix}</Text>
          )}
        </View>

        {/* Catégorie */}
        <View style={createProductStyles.inputGroup}>
          <Text style={createProductStyles.label}>
            Catégorie <Text style={createProductStyles.required}>*</Text>
          </Text>
          <View style={createProductStyles.picker}>
            <Picker
              selectedValue={formData.categorie}
              onValueChange={(value) => handleInputChange('categorie', value)}
              enabled={!isSubmitting}
              style={Platform.OS === 'ios' ? createProductStyles.pickerIOS : createProductStyles.pickerAndroid}
            >
              <Picker.Item label="Sélectionnez une catégorie" value="" />
              {CATEGORIES.map((category) => (
                <Picker.Item key={category} label={category} value={category} />
              ))}
            </Picker>
          </View>
          {touched.categorie && errors.categorie && (
            <Text style={createProductStyles.errorText}>{errors.categorie}</Text>
          )}
        </View>

        {/* Description */}
        <View style={createProductStyles.inputGroup}>
          <Text style={createProductStyles.label}>Description</Text>
          <TextInput
            style={[
              createProductStyles.textInput,
              createProductStyles.textArea
            ]}
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            placeholder="Description du produit (optionnel)"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            editable={!isSubmitting}
            maxLength={500}
          />
        </View>

        {/* En Stock */}
        <View style={createProductStyles.inputGroup}>
          <View style={createProductStyles.switchContainer}>
            <Text style={createProductStyles.switchLabel}>En stock</Text>
            <Switch
              value={formData.enStock}
              onValueChange={(value) => handleInputChange('enStock', value)}
              disabled={isSubmitting}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={formData.enStock ? '#007AFF' : '#f4f3f4'}
            />
          </View>
        </View>
      </ScrollView>

      {/* Footer with Submit Button */}
      <View style={createProductStyles.footer}>
        <TouchableOpacity
          style={[
            createProductStyles.submitButton,
            (!isFormValid || isSubmitting) && createProductStyles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={[
              createProductStyles.submitButtonText,
              (!isFormValid || isSubmitting) && createProductStyles.submitButtonTextDisabled
            ]}>
              Créer le Produit
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Loading Overlay */}
      {isSubmitting && (
        <View style={createProductStyles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={{ color: 'white', marginTop: 12, fontSize: 16 }}>
            Création en cours...
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}