import React, { useState, useEffect, useCallback } from 'react';
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
import { companyService } from '@/services/companyService';
import { useAuth } from '@/hooks/useAuth';
import { useFocusEffect } from '@react-navigation/native'; // ← import

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
  const { user } = useAuth();
  const [formData, setFormData] = useState<CompanyForm>({
    companyName: '',
    address: '',
    phone: '',
    email: user?.email || '',
    nif: '',
    stat: '',
    rcs: '',
    logo: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [loadingCompanyData, setLoadingCompanyData] = useState(true);
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [existingId, setExistingId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchCompanyByUserEmail = async () => {
    if (!user?.email) {
      setLoadingCompanyData(false);
      return;
    }

    try {
      setLoadingCompanyData(true);
      const companies = await companyService.getCompanies();
      const userCompany = companies.find(
        (c: any) => c.email?.toLowerCase() === user.email.toLowerCase()
      );

      if (userCompany) {
        setFormData({
          companyName: userCompany.nom || '',
          address: userCompany.adresse || '',
          phone: userCompany.telephone || '',
          email: userCompany.email || '',
          nif: userCompany.nif || '',
          stat: userCompany.stat || '',
          rcs: userCompany.rcs || '',
          logo: userCompany.logo
            ? `http://localhost/SOFTIO/backend/public/uploads/logos/${userCompany.logo}`
            : null,
        });
        setExistingId(userCompany.id);
        setIsEditingExisting(true);
      }
    } catch (error) {
      console.log('Erreur lors de la recherche de l’entreprise:', error);
    } finally {
      setLoadingCompanyData(false);
    }
  };

  useEffect(() => {
    fetchCompanyByUserEmail();
  }, [user?.email, refreshKey]);

  useFocusEffect(
    useCallback(() => {
      fetchCompanyByUserEmail();
    }, [])
  );

  const handleInputChange = (field: keyof CompanyForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.companyName.trim()) newErrors.companyName = 'Le nom de l\'entreprise est requis';
    if (!formData.email.trim()) newErrors.email = 'L\'email est requis';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email invalide';
    if (!formData.phone.trim()) newErrors.phone = 'Le téléphone est requis';
    else if (!/^[0-9+\-\s]+$/.test(formData.phone)) newErrors.phone = 'Numéro invalide';
    if (!formData.nif.trim()) newErrors.nif = 'Le NIF est requis';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission requise', 'Accès aux photos refusé');
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
  };

  const removeLogo = () => setFormData(prev => ({ ...prev, logo: null }));

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Erreur', 'Veuillez corriger les erreurs du formulaire');
      return;
    }
    if (formData.email.toLowerCase() !== user?.email?.toLowerCase()) {
      Alert.alert('Email incompatible', 'L\'email doit correspondre à votre compte');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        companyName: formData.companyName.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        nif: formData.nif.trim(),
        stat: formData.stat.trim(),
        rcs: formData.rcs.trim(),
      };

      if (isEditingExisting && existingId) {
        await companyService.updateCompany(existingId, payload, formData.logo);
      } else {
        await companyService.createCompany(payload, formData.logo);
      }

      Alert.alert(
        'Succès',
        isEditingExisting ? 'Entreprise mise à jour avec succès!' : 'Entreprise créée avec succès!',
        [
          {
            text: 'OK',
            onPress: () => {
              setRefreshKey(prev => prev + 1);
              if (!isEditingExisting) {
                setFormData({
                  companyName: '',
                  address: '',
                  phone: '',
                  email: user?.email || '',
                  nif: '',
                  stat: '',
                  rcs: '',
                  logo: null,
                });
                setIsEditingExisting(false);
                setExistingId(null);
              }
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Une erreur est survenue');
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
    multiline: boolean = false,
    editable: boolean = true
  ) => {
    const value = formData[field] || '';
    return (
      <View style={CreateCompanyStyles.inputContainer}>
        <Text style={CreateCompanyStyles.label}>{label}</Text>
        <View style={[
          CreateCompanyStyles.inputWrapper,
          focusedField === field && CreateCompanyStyles.inputWrapperFocused,
          errors[field as keyof FormErrors] && CreateCompanyStyles.inputWrapperError,
          !editable && CreateCompanyStyles.inputDisabled
        ]}>
          <View style={CreateCompanyStyles.inputIcon}>{icon}</View>
          <TextInput
            style={[
              CreateCompanyStyles.input,
              multiline && CreateCompanyStyles.inputMultiline,
              !editable && CreateCompanyStyles.inputTextDisabled
            ]}
            value={value}
            onChangeText={text => handleInputChange(field, text)}
            placeholder={placeholder}
            placeholderTextColor="#999"
            keyboardType={keyboardType}
            multiline={multiline}
            numberOfLines={multiline ? 4 : 1}
            onFocus={() => setFocusedField(field)}
            onBlur={() => setFocusedField(null)}
            editable={!isLoading && !uploadingLogo && editable}
          />
        </View>
        {errors[field as keyof FormErrors] && (
          <Text style={CreateCompanyStyles.errorText}>{errors[field as keyof FormErrors]}</Text>
        )}
      </View>
    );
  };

  if (loadingCompanyData) {
    return (
      <View style={CreateCompanyStyles.container}>
        <View style={CreateCompanyStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a6cf7" />
          <Text style={{ marginTop: 10, color: '#4a6cf7' }}>Recherche de votre entreprise...</Text>
        </View>
      </View>
    );
  }

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
          <View style={CreateCompanyStyles.header}>
            <Text style={CreateCompanyStyles.title}>
              {isEditingExisting ? 'Modifier mon entreprise' : 'Créer mon entreprise'}
            </Text>
            <Text style={CreateCompanyStyles.subtitle}>
              {user?.email ? `Connecté en tant que: ${user.email}` : 'Non connecté'}
            </Text>
            {isEditingExisting && (
              <View style={CreateCompanyStyles.infoBox}>
                <MaterialIcons name="info" size={16} color="#4a6cf7" />
                <Text style={CreateCompanyStyles.infoText}>
                  L'entreprise liée à votre email a été trouvée. Vous pouvez la modifier.
                </Text>
              </View>
            )}
          </View>

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

          {/* Champs */}
          {renderInput('Nom de l\'entreprise *', 'companyName', <MaterialIcons name="business" size={22} color="#666" />, 'Ex: Ma Société SARL')}
          {renderInput('Adresse', 'address', <MaterialIcons name="location-on" size={22} color="#666" />, 'Adresse complète de l\'entreprise', 'default', true)}
          {renderInput('Téléphone *', 'phone', <Feather name="phone" size={22} color="#666" />, 'Ex: +261 34 12 345 67', 'phone-pad')}
          {renderInput('Email *', 'email', <MaterialIcons name="email" size={22} color="#666" />, user?.email || 'Votre email', 'email-address', false, false)}
          {renderInput('NIF *', 'nif', <MaterialIcons name="badge" size={22} color="#666" />, 'Numéro d\'Identification Fiscale', 'numeric')}
          {renderInput('STAT', 'stat', <FontAwesome name="file-text-o" size={22} color="#666" />, 'Numéro Statistique', 'numeric')}
          {renderInput('RCS', 'rcs', <Ionicons name="document-text" size={22} color="#666" />, 'Registre du Commerce et des Sociétés')}

          {/* Bouton */}
          <View style={CreateCompanyStyles.buttonContainer}>
            <TouchableOpacity
              style={[CreateCompanyStyles.submitButton, (isLoading || uploadingLogo) && CreateCompanyStyles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading || uploadingLogo}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {isEditingExisting ? (
                    <>
                      <MaterialIcons name="save" size={22} color="#fff" style={{ marginRight: 8 }} />
                      <Text style={CreateCompanyStyles.submitButtonText}>Mettre à jour l'entreprise</Text>
                    </>
                  ) : (
                    <>
                      <Entypo name="plus" size={22} color="#fff" style={{ marginRight: 8 }} />
                      <Text style={CreateCompanyStyles.submitButtonText}>Créer l'entreprise</Text>
                    </>
                  )}
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Note */}
          <View style={CreateCompanyStyles.noteContainer}>
            <MaterialIcons name="warning" size={16} color="#666" />
            <Text style={CreateCompanyStyles.noteText}>
              L'email de l'entreprise doit correspondre à votre email de connexion.
              {isEditingExisting && ' Les modifications seront appliquées immédiatement.'}
            </Text>
          </View>

          <View style={{ height: 1 }} />
        </View>
      </ScrollView>

      {isLoading && (
        <View style={CreateCompanyStyles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4a6cf7" />
          <Text style={{ marginTop: 10, color: '#4a6cf7' }}>
            {isEditingExisting ? 'Mise à jour en cours...' : 'Création en cours...'}
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

export default CreateCompanyScreen;