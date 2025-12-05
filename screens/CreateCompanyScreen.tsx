import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons, FontAwesome, Ionicons, Feather, Entypo } from '@expo/vector-icons';
import axios from 'axios'; // Import axios directement si besoin
import { CreateCompanyStyles } from '@/styles/CreateCompanyStyles';
import { companyService, CompanyData } from '@/services/companyService';
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api'; // Import de la config

const COMPANY_URL = `${API_BASE_URL}${API_ENDPOINTS.COMPANY || 'company'}`;

interface CompanyForm {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  nif: string;
  stat: string;
  rcs: string;
  logo: string | null;
}

interface FormErrors {
  companyName?: string;
  email?: string;
  phone?: string;
  nif?: string;
}

const CreateCompanyScreen = () => {
  const [formData, setFormData] = useState<CompanyForm>({
    companyName: '',
    address: '',
    phone: '',
    email: '',
    nif: '',
    stat: '',
    rcs: '',
    logo: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const handleInputChange = (field: keyof CompanyForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Le nom de l\'entreprise est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Le téléphone est requis';
    } else if (!/^[0-9+\-\s]+$/.test(formData.phone)) {
      newErrors.phone = 'Numéro de téléphone invalide';
    }

    if (!formData.nif.trim()) {
      newErrors.nif = 'Le NIF est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission requise', 'Nous avons besoin de votre permission pour accéder aux photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        // Utiliser directement l'URI retournée par ImagePicker
        setFormData(prev => ({ ...prev, logo: result.assets[0].uri }));
      }
    } catch (error) {
      console.error('Erreur sélection image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
    }
  };

  const removeLogo = () => {
    setFormData(prev => ({ ...prev, logo: null }));
  };

  // OPTION 1: Utiliser FormData pour envoyer tout en une requête (RECOMMANDÉ)
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Erreur', 'Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    setIsLoading(true);

    try {
      // Créer FormData pour l'envoi multipart
      const formDataToSend = new FormData();
      
      // Ajouter les champs texte
      formDataToSend.append('companyName', formData.companyName.trim());
      formDataToSend.append('address', formData.address.trim());
      formDataToSend.append('phone', formData.phone.trim());
      formDataToSend.append('email', formData.email.trim());
      formDataToSend.append('nif', formData.nif.trim());
      formDataToSend.append('stat', formData.stat.trim());
      formDataToSend.append('rcs', formData.rcs.trim());
      
      // Ajouter le logo si présent
      if (formData.logo) {
        const filename = formData.logo.split('/').pop() || 'logo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formDataToSend.append('logo', {
          uri: formData.logo,
          name: filename,
          type,
        } as any);
      }

      console.log('Envoi FormData à:', COMPANY_URL);
      
      // Option A: Utiliser axios directement
      const response = await axios.post(COMPANY_URL, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Option B: Ou utiliser le service si vous l'avez adapté pour FormData
      // const response = await companyService.createCompanyWithFormData(formDataToSend);
      
      Alert.alert(
        'Succès',
        'Entreprise créée avec succès!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Réinitialiser le formulaire
              setFormData({
                companyName: '',
                address: '',
                phone: '',
                email: '',
                nif: '',
                stat: '',
                rcs: '',
                logo: null,
              });
            }
          }
        ]
      );

    } catch (error: any) {
      console.error('Erreur création entreprise:', error);
      
      let errorMessage = 'Une erreur est survenue lors de la création de l\'entreprise';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.messages) {
        errorMessage = error.response.data.messages;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Erreur', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // OPTION 2: Utiliser le service companyService (si vous ne voulez pas de FormData)
  const handleSubmitWithService = async () => {
    if (!validateForm()) {
      Alert.alert('Erreur', 'Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    setIsLoading(true);

    try {
      // Préparer les données pour l'API
      const companyData: CompanyData = {
        companyName: formData.companyName.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        nif: formData.nif.trim(),
        stat: formData.stat.trim(),
        rcs: formData.rcs.trim(),
        logoUrl: formData.logo, // Envoyer l'URI comme chaîne
      };

      console.log('Envoi des données via service:', companyData);
      
      // Utiliser le service
      const response = await companyService.createCompany(companyData);
      
      Alert.alert(
        'Succès',
        'Entreprise créée avec succès!',
        [
          {
            text: 'OK',
            onPress: () => {
              setFormData({
                companyName: '',
                address: '',
                phone: '',
                email: '',
                nif: '',
                stat: '',
                rcs: '',
                logo: null,
              });
            }
          }
        ]
      );

    } catch (error: any) {
      console.error('Erreur création entreprise:', error);
      
      let errorMessage = 'Une erreur est survenue lors de la création de l\'entreprise';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Erreur', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (
    label: string,
    field: keyof CompanyForm,
    icon: React.ReactNode,
    placeholder: string,
    keyboardType: 'default' | 'email-address' | 'phone-pad' | 'numeric' = 'default',
    multiline: boolean = false
  ) => {
    const value = formData[field] || '';
    
    return (
      <View style={CreateCompanyStyles.inputContainer}>
        <Text style={CreateCompanyStyles.label}>{label}</Text>
        <View style={[
          CreateCompanyStyles.inputWrapper,
          focusedField === field && CreateCompanyStyles.inputWrapperFocused,
          errors[field as keyof FormErrors] && CreateCompanyStyles.inputWrapperError
        ]}>
          <View style={CreateCompanyStyles.inputIcon}>
            {icon}
          </View>
          <TextInput
            style={[
              CreateCompanyStyles.input,
              multiline && CreateCompanyStyles.inputMultiline
            ]}
            value={value}
            onChangeText={(text) => handleInputChange(field, text)}
            placeholder={placeholder}
            placeholderTextColor="#999"
            keyboardType={keyboardType}
            multiline={multiline}
            numberOfLines={multiline ? 4 : 1}
            onFocus={() => setFocusedField(field)}
            onBlur={() => setFocusedField(null)}
            editable={!isLoading && !uploadingLogo}
          />
        </View>
        {errors[field as keyof FormErrors] && (
          <Text style={CreateCompanyStyles.errorText}>{errors[field as keyof FormErrors]}</Text>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={CreateCompanyStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        contentContainerStyle={CreateCompanyStyles.scrollContainer}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        alwaysBounceVertical={false}
        overScrollMode="never"
      >
        <View style={CreateCompanyStyles.formContainer}>
          {/* Logo Upload */}
          <TouchableOpacity
            style={[
              CreateCompanyStyles.uploadContainer,
              focusedField === 'logo' && CreateCompanyStyles.uploadContainerActive,
              (isLoading || uploadingLogo) && { opacity: 0.7 }
            ]}
            onPress={pickImage}
            onPressIn={() => setFocusedField('logo')}
            onPressOut={() => setFocusedField(null)}
            activeOpacity={0.7}
            disabled={isLoading || uploadingLogo}
          >
            {formData.logo ? (
              <View style={{ alignItems: 'center' }}>
                <Image 
                  source={{ uri: formData.logo }} 
                  style={CreateCompanyStyles.logoPreview}
                />
                <TouchableOpacity 
                  style={CreateCompanyStyles.removeLogoButton}
                  onPress={removeLogo}
                  disabled={isLoading || uploadingLogo}
                >
                  <MaterialIcons name="close" size={16} color="#fff" />
                </TouchableOpacity>
                <Text style={CreateCompanyStyles.uploadText}>Modifier le logo</Text>
              </View>
            ) : (
              <>
                <View style={CreateCompanyStyles.uploadIcon}>
                  <MaterialIcons name="photo-camera" size={24} color="#666" />
                </View>
                <Text style={CreateCompanyStyles.uploadText}>Ajouter un logo</Text>
                <Text style={CreateCompanyStyles.uploadSubtext}>Cliquez pour sélectionner une image</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Company Name */}
          {renderInput(
            'Nom de l\'entreprise *',
            'companyName',
            <MaterialIcons name="business" size={22} color="#666" />,
            'Ex: Ma Société SARL'
          )}

          {/* Address */}
          {renderInput(
            'Adresse',
            'address',
            <MaterialIcons name="location-on" size={22} color="#666" />,
            'Adresse complète de l\'entreprise',
            'default',
            true
          )}

          {/* Phone */}
          {renderInput(
            'Téléphone *',
            'phone',
            <Feather name="phone" size={22} color="#666" />,
            'Ex: +261 34 12 345 67',
            'phone-pad'
          )}

          {/* Email */}
          {renderInput(
            'Email *',
            'email',
            <MaterialIcons name="email" size={22} color="#666" />,
            'contact@entreprise.mg',
            'email-address'
          )}

          {/* NIF */}
          {renderInput(
            'NIF *',
            'nif',
            <MaterialIcons name="badge" size={22} color="#666" />,
            'Numéro d\'Identification Fiscale',
            'numeric'
          )}

          {/* STAT */}
          {renderInput(
            'STAT',
            'stat',
            <FontAwesome name="file-text-o" size={22} color="#666" />,
            'Numéro Statistique',
            'numeric'
          )}

          {/* RCS */}
          {renderInput(
            'RCS',
            'rcs',
            <Ionicons name="document-text" size={22} color="#666" />,
            'Registre du Commerce et des Sociétés'
          )}

          {/* Submit Button */}
          <View style={CreateCompanyStyles.buttonContainer}>
            <TouchableOpacity
              style={[
                CreateCompanyStyles.submitButton,
                (isLoading || uploadingLogo) && CreateCompanyStyles.submitButtonDisabled
              ]}
              onPress={handleSubmit} // Choisissez handleSubmit ou handleSubmitWithService
              disabled={isLoading || uploadingLogo}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Entypo name="plus" size={22} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={CreateCompanyStyles.submitButtonText}>
                    Créer l'entreprise
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Espacement minimal après le bouton */}
          <View style={{ height: 1 }} />
        </View>
      </ScrollView>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={CreateCompanyStyles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4a6cf7" />
          <Text style={{ marginTop: 10, color: '#4a6cf7' }}>
            Création en cours...
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

export default CreateCompanyScreen;