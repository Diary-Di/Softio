import { Ionicons } from '@expo/vector-icons';
import Icon from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { categoryService } from '../services/categoryService';
import { productService } from '../services/productService';
import {
  styles
} from '../styles/CreateProductStyles';

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
  image_url: string | null;
  imageFile?: any; // Fichier image temporaire
}

const CreateProductScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  
  // États du formulaire
  const [formData, setFormData] = useState<ProductFormData>({
    ref_produit: '',
    designation: '',
    categorie: '',
    prix_actuel: '',
    qte_disponible: 1,
    image_url: null,
    imageFile: undefined,
  });
  
  // États pour les catégories
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [refreshingCategories, setRefreshingCategories] = useState(false);
  
  // États UI
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // États pour le message de succès
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(-100)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Références
  const inputRef = useRef<TextInput>(null);
  const hideTimerRef = useRef<number | null>(null);

  // Destructuration
  const { ref_produit, designation, categorie, prix_actuel, qte_disponible, image_url, imageFile } = formData;

  // Nettoyage des timers
  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

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

  // Mise à jour des champs
  const updateField = useCallback((field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Sélectionner une image depuis la galerie
  const selectImageFromGallery = async () => {
    try {
      setUploadingImage(true);
      
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Nous avons besoin d\'accéder à votre galerie');
        setUploadingImage(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        // Stocker le fichier image temporairement
        updateField('image_url', asset.uri);
        updateField('imageFile', {
          uri: asset.uri,
          type: asset.mimeType || 'image/jpeg',
          name: asset.fileName || `product_${Date.now()}.jpg`,
        });
      }
    } catch (error) {
      console.error('❌ Erreur sélection image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
    } finally {
      setUploadingImage(false);
    }
  };

  // Gestion de l'import d'image
  const handleImageImport = () => {
    selectImageFromGallery();
  };

  // Supprimer l'image
  const handleImageDelete = () => {
    Alert.alert(
      'Supprimer l\'image',
      'Êtes-vous sûr de vouloir supprimer cette image ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => {
            updateField('image_url', null);
            updateField('imageFile', undefined);
          }
        },
      ]
    );
  };

  // Uploader l'image vers le serveur
  const uploadImageToServer = async (): Promise<string | null> => {
    if (!imageFile) return null;

    try {
      const formData = new FormData();
      formData.append('image', imageFile as any);
      
      return imageFile.uri;
    } catch (error) {
      console.error('Erreur upload image:', error);
      return null;
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
    if (!ref_produit.trim()) {
      Alert.alert('Erreur', 'La référence du produit est obligatoire');
      return false;
    }

    if (ref_produit.trim().length < 2) {
      Alert.alert('Erreur', 'La référence doit avoir au moins 2 caractères');
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
  }, [ref_produit, designation, categorie, prix_actuel, qte_disponible]);

  // Afficher le message de succès avec animation
  const showSuccessBanner = useCallback((message: string) => {
    // Réinitialiser les animations
    fadeAnim.setValue(0);
    translateYAnim.setValue(-100);
    scaleAnim.setValue(0.9);
    
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    
    // Animation d'entrée
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(translateYAnim, {
        toValue: 0,
        tension: 70,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 70,
        friction: 10,
        useNativeDriver: true,
      })
    ]).start();

    // Cacher automatiquement après 2 secondes
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      hideSuccessBanner();
    }, 2000) as unknown as number;
  }, [fadeAnim, translateYAnim, scaleAnim]);

  // Masquer le message de succès avec animation
  const hideSuccessBanner = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      setShowSuccessMessage(false);
    });
  }, [fadeAnim, translateYAnim]);

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

      // Préparer les données du produit
      const productData: any = {
        ref_produit: ref_produit.trim(),
        designation: designation.trim(),
        categorie: categorie.trim(),
        prix_actuel: prixNumerique,
        qte_disponible: Number(qte_disponible),
      };

      // Ajouter l'URL de l'image si disponible
      if (imageFile) {
        productData.image_url = imageFile.uri;
      } else if (image_url) {
        productData.image_url = image_url;
      }

      const response = await productService.createProduct(productData);

      // VIDER LE FORMULAIRE
      setFormData({
        ref_produit: '',
        designation: '',
        categorie: '',
        prix_actuel: '',
        qte_disponible: 1,
        image_url: null,
        imageFile: undefined,
      });
      setModalVisible(false);

      // Afficher le message de succès avec animation
      showSuccessBanner(`Produit "${designation}" créé avec succès`);

      // Retourner à la liste des produits après 2 secondes
      setTimeout(() => {
        navigation.navigate('ProductList', { 
          refresh: true,
          newProduct: response.product || productData
        });
      }, 2000);

    } catch (error: any) {
      console.error('❌ Erreur:', error);
      
      let errorMessage = 'Échec de l\'enregistrement';
      if (error.code === 409) errorMessage = 'Cette référence existe déjà';
      else if (error.code === 400) errorMessage = 'Données invalides';
      else if (error.code === 404) errorMessage = 'Catégorie introuvable';
      else if (error.code === 413) errorMessage = 'Image trop volumineuse';
      else if (error.message) errorMessage = error.message;

      Alert.alert('Erreur ❌', errorMessage);
      setIsLoading(false);
    }
  }, [ref_produit, designation, categorie, prix_actuel, qte_disponible, image_url, imageFile, validateForm, categories, navigation, showSuccessBanner]);

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
    <KeyboardAvoidingView
      style={{ flex: 1, position: 'relative' }} // allow absolute overlay
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Bannière de succès (overlay absolute, n'affecte pas le flux) */}
      {showSuccessMessage && (
        <Animated.View
          style={[
            localStyles.successBanner,
            {
              opacity: fadeAnim,
              transform: [{ translateY: translateYAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <View style={localStyles.bannerContent}>
            <Text style={localStyles.bannerText}>{successMessage}</Text>
            <TouchableOpacity
              onPress={hideSuccessBanner}
              style={localStyles.bannerCloseButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="close" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      <View style={styles.container}>
        <KeyboardAwareScrollView
          enableOnAndroid
          extraScrollHeight={Platform.OS === 'ios' ? 20 : 120}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 10 }}
        >
      
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={styles.backButton} 
              accessibilityLabel="Retour"
              disabled={isLoading}
            >
              <Ionicons name="arrow-back" size={24} color="#111" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.title}>Ajouter un produit</Text>
            </View>
            <View style={{ width: 32 }} />
          </View>
          
          {/* Référence du produit */}
          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Référence du produit *</Text>
            </View>
            <TextInput
              style={styles.input}
              value={ref_produit}
              onChangeText={(text) => updateField('ref_produit', text)}
              placeholder="Ex: PROD001"
              placeholderTextColor="#999"
              returnKeyType="next"
              editable={!isLoading}
              autoCapitalize="none"
              maxLength={50}
            />
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

          {/* Image du produit */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Image du produit</Text>
            <View style={styles.imageContainer}>
              {image_url ? (
                <>
                  <Image source={{ uri: image_url }} style={styles.imagePreview} />
                  <View style={styles.imageActions}>
                    <TouchableOpacity
                      style={[styles.imageButton, styles.changeButton, (isLoading || uploadingImage) && { opacity: 0.5 }]}
                      onPress={handleImageImport}
                      disabled={isLoading || uploadingImage}
                    >
                      {uploadingImage ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <>
                          <Icon name="edit" size={20} color="#FFF" />
                          <Text style={styles.imageButtonText}>Changer</Text>
                        </>
                      )}
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
                  style={[styles.uploadArea, (isLoading || uploadingImage) && { opacity: 0.5 }]}
                  onPress={handleImageImport}
                  disabled={isLoading || uploadingImage}
                >
                  {uploadingImage ? (
                    <ActivityIndicator size="large" color="#4A90E2" />
                  ) : (
                    <>
                      <Icon name="add-photo-alternate" size={50} color="#4A90E2" />
                      <Text style={styles.uploadText}>
                        {isLoading ? 'Chargement...' : 'Importer une image'}
                      </Text>
                      <Text style={styles.uploadSubtext}>Appuyez pour sélectionner</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
              <Text style={styles.imageHint}>
                {imageFile ? `Fichier: ${imageFile.name}` : 'Optionnel - Formats: JPG, PNG, GIF'}
              </Text>
            </View>
          </View>

          {/* Espace pour le bouton enregistrer */}
          <View style={styles.spacer} />
        </KeyboardAwareScrollView>
 
        {/* Bouton Enregistrer */}
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity 
            style={[
              styles.saveButton, 
              (isLoading || loadingCategories || uploadingImage) && { opacity: 0.7 }
            ]} 
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={isLoading || loadingCategories || uploadingImage}
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
    </KeyboardAvoidingView>
  );
};

// Styles locaux pour les animations
const localStyles = StyleSheet.create({
  successBanner: {
    position: 'absolute',
    top: 20,
    left: 16,
    right: 16,
    backgroundColor: '#4CAF50',
    zIndex: 1000,
    elevation: 8,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
    lineHeight: 20,
  },
  bannerCloseButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollViewWithBanner: {
    marginTop: 100, // Hauteur de la bannière + marge
  },
});

export default CreateProductScreen;