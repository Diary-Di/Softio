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
import { CreateCompanyStyles } from '@/styles/CreateCompanyStyles';

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
        setFormData(prev => ({ ...prev, logo: result.assets[0].uri }));
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
    }
  };

  const removeLogo = () => {
    setFormData(prev => ({ ...prev, logo: null }));
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      Alert.alert('Erreur', 'Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
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
    }, 1500);
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
        // Désactive le défilement excessif
        alwaysBounceVertical={false}
        overScrollMode="never"
      >
        <View style={CreateCompanyStyles.formContainer}>
          {/* Logo Upload */}
          <TouchableOpacity
            style={[
              CreateCompanyStyles.uploadContainer,
              focusedField === 'logo' && CreateCompanyStyles.uploadContainerActive
            ]}
            onPress={pickImage}
            onPressIn={() => setFocusedField('logo')}
            onPressOut={() => setFocusedField(null)}
            activeOpacity={0.7}
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

          {/* Submit Button - c'est le dernier élément */}
          <View style={CreateCompanyStyles.buttonContainer}>
            <TouchableOpacity
              style={[
                CreateCompanyStyles.submitButton,
                isLoading && CreateCompanyStyles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
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

          {/* Espacement minimal après le bouton pour éviter le défilement excessif */}
          <View style={{ height: 1 }} />
        </View>
      </ScrollView>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={CreateCompanyStyles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4a6cf7" />
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

export default CreateCompanyScreen;