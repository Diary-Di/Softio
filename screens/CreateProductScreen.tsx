import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { 
  styles 
} from '../styles/CreateProductStyles';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
//import type { ApiError } from '../services/productService';

// Interface pour les catégories
interface Categorie {
  categorie: string;
  description: string;
}

// Interface pour les données du produit
interface ProductFormData {
  ref_produit: string;
  designation: string;
  categorie: string;
  prix_actuel: string;
  qte_disponible: number;
  illustration: string | null;
  imageBase64?: string;
  // Non inclus dans le formulaire mais gérés par le backend :
  // prix_precedent: number | null
  // date_mise_a_jour_prix: string | null
}

const ProductFormScreen: React.FC = () => {

  const navigation = useNavigation<any>();
  // États du formulaire
  const [formData, setFormData] = useState<ProductFormData>({
    ref_produit: '',
    designation: '',
    categorie: '',
    prix_actuel: '',
    qte_disponible: 1,
    illustration: null,
    imageBase64: undefined,
  });
  
  // États pour les catégories
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [refreshingCategories, setRefreshingCategories] = useState(false);
  
  // États UI
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingReference, setIsCheckingReference] = useState(false);
  const [referenceError, setReferenceError] = useState<string | null>(null);

  // Références
  const inputRef = useRef<TextInput>(null);

  // Destructuration
  const { ref_produit, designation, categorie, prix_actuel, qte_disponible, illustration, imageBase64 } = formData;

  // Charger les catégories au démarrage
  useEffect(() => {
    loadCategories();
  }, []);

  // Charger les catégories depuis l'API
  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const categoriesData = await categoryService.getCategories();
      
      if (Array.isArray(categoriesData)) {
        setCategories(categoriesData);
      } else {
        console.warn('Format de données de catégories inattendu:', categoriesData);
        setCategories([]);
      }
    } catch (error: any) {
      console.error('❌ Erreur chargement catégories:', error);
      Alert.alert(
        'Erreur',
        error.message || 'Impossible de charger les catégories',
        [
          { text: 'Réessayer', onPress: () => loadCategories() },
          { text: 'Continuer', style: 'cancel' }
        ]
      );
      setCategories([]);
    } finally {
      setLoadingCategories(false);
      setRefreshingCategories(false);
    }
  };

  // Rafraîchir les catégories
  const handleRefreshCategories = () => {
    setRefreshingCategories(true);
    loadCategories();
  };

  // Vérifier si la référence existe (avec debounce)
  useEffect(() => {
    const checkReference = async () => {
      if (ref_produit.trim().length >= 2) {
        setIsCheckingReference(true);
        setReferenceError(null);
        
        try {
          const exists = await productService.checkReferenceExists(ref_produit);
          if (exists) {
            setReferenceError('Cette référence existe déjà');
          }
        } catch (error) {
          console.error('Erreur vérification référence:', error);
        } finally {
          setIsCheckingReference(false);
        }
      }
    };

    const timer = setTimeout(() => {
      checkReference();
    }, 500);

    return () => clearTimeout(timer);
  }, [ref_produit]);

  // Mise à jour des champs
  const updateField = useCallback((field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Sélectionner une image depuis la galerie
  const selectImageFromGallery = async () => {
    try {
      setIsLoading(true);
      
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Nous avons besoin d\'accéder à votre galerie');
        setIsLoading(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        // Limiter la taille de l'image
        if (asset.base64 && asset.base64.length > 5000000) {
          Alert.alert('Image trop grande', 'Veuillez choisir une image de moins de 5MB');
          return;
        }
        
        updateField('illustration', asset.uri);
        updateField('imageBase64', asset.base64);
      }
    } catch (error) {
      console.error('❌ Erreur sélection image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion de l'import d'image
  const handleImageImport = () => {
    selectImageFromGallery();
  };

  // Supprimer l'image - Version compatible web et mobile
const handleImageDelete = () => {
  // Pour le web
  if (typeof window !== 'undefined' && window.confirm) {
    const confirmDelete = window.confirm('Êtes-vous sûr de vouloir supprimer cette image ?');
    if (confirmDelete) {
      updateField('illustration', null);
      updateField('imageBase64', undefined);
    }
  } 
  // Pour React Native
  else {
    Alert.alert(
      'Supprimer l\'image',
      'Êtes-vous sûr de vouloir supprimer cette image ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => {
            updateField('illustration', null);
            updateField('imageBase64', undefined);
          }
        },
      ]
    );
  }
};

  // Formatage du prix
  const formatPrix = useCallback((text: string) => {
    let cleaned = text.replace(/[^\d.,]/g, '');
    cleaned = cleaned.replace(',', '.');
    
    const parts = cleaned.split('.');
    let partieEntiere = parts[0];
    let partieDecimale = parts.length > 1 ? parts[1].substring(0, 2) : '';
    
    if (partieEntiere) {
      partieEntiere = partieEntiere.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }
    
    const formatted = partieDecimale 
      ? `${partieEntiere}.${partieDecimale}`
      : partieEntiere;
    
    updateField('prix_actuel', formatted);
  }, [updateField]);

  // Gestion de la quantité
  const incrementQuantite = useCallback(() => {
    updateField('qte_disponible', qte_disponible + 1);
  }, [qte_disponible, updateField]);

  const decrementQuantite = useCallback(() => {
    if (qte_disponible > 1) {
      updateField('qte_disponible', qte_disponible - 1);
    }
  }, [qte_disponible, updateField]);

  const handleQuantiteChange = useCallback((text: string) => {
    const num = parseInt(text);
    if (!isNaN(num) && num > 0) {
      updateField('qte_disponible', num);
    } else if (text === '') {
      updateField('qte_disponible', 0);
    }
  }, [updateField]);

  // Sélection de catégorie
  const handleSelectCategorie = useCallback((nomCategorie: string) => {
    updateField('categorie', nomCategorie);
    setModalVisible(false);
  }, [updateField]);

  // Validation du formulaire
  const validateForm = useCallback((): boolean => {
    setReferenceError(null);

    if (!ref_produit.trim()) {
      Alert.alert('Erreur', 'La référence du produit est obligatoire');
      return false;
    }

    if (ref_produit.trim().length < 2) {
      Alert.alert('Erreur', 'La référence doit avoir au moins 2 caractères');
      return false;
    }

    if (referenceError) {
      Alert.alert('Erreur', referenceError);
      return false;
    }

    if (!designation.trim()) {
      Alert.alert('Erreur', 'La désignation est obligatoire');
      return false;
    }

    if (!categorie) {
      Alert.alert('Erreur', 'Veuillez sélectionner une catégorie');
      return false;
    }

    if (!prix_actuel) {
      Alert.alert('Erreur', 'Le prix actuel est obligatoire');
      return false;
    }

    const prixNumerique = parseFloat(prix_actuel.replace(/\s/g, '').replace(',', '.'));
    if (isNaN(prixNumerique) || prixNumerique <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un prix valide (supérieur à 0)');
      return false;
    }

    if (qte_disponible < 0) {
      Alert.alert('Erreur', 'La quantité doit être positive');
      return false;
    }

    return true;
  }, [ref_produit, designation, categorie, prix_actuel, qte_disponible, referenceError]);

  // Enregistrement du produit
  const handleSave = useCallback(async () => {
  if (!validateForm()) return;

  const categorieExists = categories.some(cat => cat.categorie === categorie);
  if (!categorieExists) {
    Alert.alert('Erreur', 'La catégorie sélectionnée n\'existe plus.');
    setModalVisible(true);
    return;
  }

  try {
    setIsLoading(true);
    
    const prixClean = prix_actuel.replace(/\s/g, '').replace(',', '.');
    const prixNumerique = parseFloat(prixClean);
    
    if (isNaN(prixNumerique) || prixNumerique <= 0) {
      Alert.alert('Erreur', 'Le prix doit être supérieur à 0');
      setIsLoading(false);
      return;
    }

    const productData = {
      ref_produit: ref_produit.trim(),
      designation: designation.trim(),
      categorie: categorie.trim(),
      prix_actuel: prixNumerique,
      qte_disponible: Number(qte_disponible),
      image: imageBase64 || null,
    };

    const response = await productService.createProduct(productData);

    // VIDER IMMÉDIATEMENT LE FORMULAIRE
    setFormData({
      ref_produit: '',
      designation: '',
      categorie: '',
      prix_actuel: '',
      qte_disponible: 1,
      illustration: null,
      imageBase64: undefined,
    });
    setReferenceError(null);
    setModalVisible(false);

    // Afficher le message de succès
    Alert.alert('Succès ✅', response.message);

  } catch (error: any) {
    console.error('❌ Erreur:', error);
    
    let errorMessage = 'Échec de l\'enregistrement';
    if (error.code === 409) errorMessage = 'Cette référence existe déjà';
    else if (error.code === 400) errorMessage = 'Données invalides';
    else if (error.code === 404) errorMessage = 'Catégorie introuvable';
    else if (error.code === 413) errorMessage = 'Image trop volumineuse';
    else if (error.message) errorMessage = error.message;

    Alert.alert('Erreur ❌', errorMessage);
  } finally {
    setIsLoading(false);
  }
}, [ref_produit, designation, categorie, prix_actuel, qte_disponible, imageBase64, validateForm, categories]);

  // Rendu d'un élément de catégorie
  const renderCategorieItem = useCallback(({ item }: { item: Categorie }) => (
    <TouchableOpacity
      style={styles.categorieItem}
      onPress={() => handleSelectCategorie(item.categorie)}
    >
      <View style={styles.categorieInfo}>
        <Text style={styles.categorieText}>{item.categorie}</Text>
        {item.description && (
          <Text style={styles.categorieDescription} numberOfLines={1}>
            {item.description}
          </Text>
        )}
      </View>
      {categorie === item.categorie && (
        <Icon name="check" size={20} color="#4A90E2" />
      )}
    </TouchableOpacity>
  ), [categorie, handleSelectCategorie]);

  // Rendu du contenu du modal
  const renderModalContent = () => {
    if (loadingCategories && !refreshingCategories) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Chargement des catégories...</Text>
        </View>
      );
    }

    if (categories.length === 0 && !loadingCategories) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="category" size={60} color="#CCCCCC" />
          <Text style={styles.emptyText}>Aucune catégorie disponible</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRefreshCategories}
          >
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={categories}
        renderItem={renderCategorieItem}
        keyExtractor={(item) => item.categorie}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        windowSize={5}
        refreshControl={
          <RefreshControl
            refreshing={refreshingCategories}
            onRefresh={handleRefreshCategories}
            colors={['#4A90E2']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune catégorie trouvée</Text>
          </View>
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} accessibilityLabel="Retour">
            <Ionicons name="arrow-back" size={24} color="#111" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>Ajouter un client</Text>
          </View>
          <View style={{ width: 32 }} />
        </View>
        
        {/* Référence du produit */}
        <View style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>Référence du produit *</Text>
            {isCheckingReference && (
              <ActivityIndicator size="small" color="#4A90E2" style={styles.loadingIndicator} />
            )}
          </View>
          <TextInput
            style={[
              styles.input, 
              referenceError && styles.inputError
            ]}
            value={ref_produit}
            onChangeText={(text) => {
              updateField('ref_produit', text);
              setReferenceError(null);
            }}
            placeholder="Ex: PROD001"
            placeholderTextColor="#999"
            returnKeyType="next"
            editable={!isLoading}
            autoCapitalize="none"
            maxLength={50}
          />
          {referenceError && (
            <Text style={styles.errorText}>{referenceError}</Text>
          )}
        </View>

        {/* Désignation */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Désignation *</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={designation}
            onChangeText={(text) => updateField('designation', text)}
            placeholder="Description du produit"
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            blurOnSubmit={true}
            editable={!isLoading}
          />
        </View>

        {/* Catégorie */}
        <View style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>Catégorie *</Text>
            {loadingCategories && (
              <ActivityIndicator size="small" color="#4A90E2" style={styles.loadingIndicator} />
            )}
          </View>
          <TouchableOpacity
            style={[styles.dropdown, (isLoading || loadingCategories) && { opacity: 0.5 }]}
            onPress={() => !isLoading && setModalVisible(true)}
            disabled={isLoading || loadingCategories}
          >
            <View style={styles.dropdownContent}>
              {categorie ? (
                <View>
                  <Text style={styles.dropdownTextSelected}>{categorie}</Text>
                  {categories.find(cat => cat.categorie === categorie)?.description && (
                    <Text style={styles.dropdownDescription} numberOfLines={1}>
                      {categories.find(cat => cat.categorie === categorie)?.description}
                    </Text>
                  )}
                </View>
              ) : (
                <Text style={styles.dropdownTextPlaceholder}>
                  {loadingCategories ? 'Chargement...' : 'Sélectionnez une catégorie'}
                </Text>
              )}
            </View>
            <Icon name="arrow-drop-down" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Prix actuel */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Prix actuel (€) *</Text>
          <View style={styles.prixContainer}>
            <TextInput
              style={[styles.input, styles.prixInput, isLoading && { opacity: 0.5 }]}
              value={prix_actuel}
              onChangeText={formatPrix}
              placeholder="0,00"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
              returnKeyType="next"
              editable={!isLoading}
            />
            <Text style={styles.currency}>€</Text>
          </View>
          <Text style={styles.hint}>Utilisez le point ou la virgule pour les décimales</Text>
        </View>

        {/* Quantité disponible */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Quantité disponible</Text>
          
          <View style={styles.quantiteContainer}>
            {/* Bouton Moins */}
            <TouchableOpacity
              style={[
                styles.quantiteButton,
                qte_disponible <= 0 && styles.quantiteButtonDisabled,
                isLoading && { opacity: 0.5 }
              ]}
              onPress={decrementQuantite}
              disabled={qte_disponible <= 0 || isLoading}
              activeOpacity={0.7}
            >
              <Icon 
                name="remove" 
                size={24} 
                color={qte_disponible <= 0 ? "#999" : "#FFF"} 
              />
            </TouchableOpacity>

            {/* Input de quantité */}
            <TextInput
              ref={inputRef}
              style={[styles.quantiteInput, isLoading && { opacity: 0.5 }]}
              value={qte_disponible.toString()}
              onChangeText={handleQuantiteChange}
              keyboardType="numeric"
              textAlign="center"
              returnKeyType="done"
              maxLength={6}
              onBlur={() => {
                if (qte_disponible < 0) updateField('qte_disponible', 0);
              }}
              editable={!isLoading}
            />

            {/* Bouton Plus */}
            <TouchableOpacity
              style={[styles.quantiteButton, isLoading && { opacity: 0.5 }]}
              onPress={incrementQuantite}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Icon name="add" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Illustration */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Illustration</Text>
          <View style={styles.imageContainer}>
            {illustration ? (
              <>
                <Image source={{ uri: illustration }} style={styles.imagePreview} />
                <View style={styles.imageActions}>
                  <TouchableOpacity
                    style={[styles.imageButton, styles.changeButton, isLoading && { opacity: 0.5 }]}
                    onPress={handleImageImport}
                    disabled={isLoading}
                  >
                    <Icon name="edit" size={20} color="#FFF" />
                    <Text style={styles.imageButtonText}>Changer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.imageButton, styles.deleteButton, isLoading && { opacity: 0.5 }]}
                    onPress={handleImageDelete}
                    disabled={isLoading}
                  >
                    <Icon name="delete" size={20} color="#FFF" />
                    <Text style={styles.imageButtonText}>Supprimer</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.uploadArea, isLoading && { opacity: 0.5 }]}
                onPress={handleImageImport}
                disabled={isLoading}
              >
                <Icon name="add-photo-alternate" size={50} color="#4A90E2" />
                <Text style={styles.uploadText}>
                  {isLoading ? 'Chargement...' : 'Importer une image'}
                </Text>
                <Text style={styles.uploadSubtext}>Appuyez pour sélectionner</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.imageHint}>
              {imageBase64 ? `Taille: ${Math.round(imageBase64.length / 1024)} KB` : 'Optionnel'}
            </Text>
          </View>
        </View>

        {/* Espace pour le bouton enregistrer */}
        <View style={styles.spacer} />
      </ScrollView>

      {/* Bouton Enregistrer */}
      <View style={styles.saveButtonContainer}>
        <TouchableOpacity 
          style={[
            styles.saveButton, 
            (isLoading || isCheckingReference || !!referenceError || loadingCategories) && { opacity: 0.7 }
          ]} 
          onPress={handleSave}
          activeOpacity={0.8}
          disabled={isLoading || isCheckingReference || !!referenceError || loadingCategories}
        >
          {isLoading ? (
            <>
              <ActivityIndicator size="small" color="#FFF" />
              <Text style={styles.saveButtonText}>Enregistrement...</Text>
            </>
          ) : (
            <>
              <Icon name="save" size={24} color="#FFF" />
              <Text style={styles.saveButtonText}>
                {loadingCategories ? 'Chargement...' : 'Enregistrer'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal pour la sélection des catégories */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionnez une catégorie</Text>
              <View style={styles.modalHeaderActions}>
                <TouchableOpacity 
                  style={styles.refreshButton}
                  onPress={handleRefreshCategories}
                  disabled={refreshingCategories}
                >
                  <Icon 
                    name="refresh" 
                    size={22} 
                    color={refreshingCategories ? "#999" : "#4A90E2"} 
                  />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setModalVisible(false)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
            </View>
            {renderModalContent()}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProductFormScreen;