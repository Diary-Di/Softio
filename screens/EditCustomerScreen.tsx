/******************************************************************
 *  ModifyProductScreen.tsx  –  Modification d'un produit existant
 ******************************************************************/
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
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';

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
  original_ref?: string; // Référence originale pour mise à jour
}

// Type pour les paramètres de navigation
type ModifyProductRouteProp = RouteProp<
  { params: { product: any } },
  'params'
>;

const EditProductScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<ModifyProductRouteProp>();
  const { product } = route.params;
  
  // États du formulaire avec pré-remplissage
  const [formData, setFormData] = useState<ProductFormData>({
    ref_produit: product.ref_produit || '',
    designation: product.designation || '',
    categorie: product.categorie || '',
    prix_actuel: product.prix_actuel?.toString() || '',
    qte_disponible: product.qte_disponible || 1,
    image_url: product.image_url || null,
    imageFile: undefined,
    original_ref: product.ref_produit, // Sauvegarde de la référence originale
  });
  
  // États pour les catégories
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [refreshingCategories, setRefreshingCategories] = useState(false);
  
  // États UI
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Références
  const inputRef = useRef<TextInput>(null);

  // Destructuration
  const { ref_produit, designation, categorie, prix_actuel, qte_disponible, image_url, imageFile, original_ref } = formData;

  // Charger les catégories et vérifier les données au démarrage
  useEffect(() => {
    loadCategories();
    verifyProductData();
  }, []);

  // Vérifier et valider les données du produit reçu
  const verifyProductData = async () => {
    try {
      if (!product || !product.ref_produit) {
        Alert.alert('Erreur', 'Données du produit invalides', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
        return;
      }

      // Optionnel: Vérifier si le produit existe toujours
      setIsFetching(true);
      const existingProduct = await productService.getProduct(product.ref_produit);
      
      if (!existingProduct) {
        Alert.alert(
          'Produit non trouvé',
          'Ce produit a peut-être été supprimé.',
          [
            { 
              text: 'Retour', 
              onPress: () => navigation.goBack() 
            }
          ]
        );
      }
    } catch (error) {
      console.warn('⚠️ Impossible de vérifier le produit:', error);
      // On continue quand même, l'utilisateur pourra essayer de sauvegarder
    } finally {
      setIsFetching(false);
    }
  };

  // Charger les catégories depuis l'API
  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const categoriesData = await categoryService.getCategories();
      
      if (Array.isArray(categoriesData)) {
        setCategories(categoriesData);
        
        // Si la catégorie du produit n'existe plus, afficher un avertissement
        if (product.categorie && !categoriesData.some(cat => cat.categorie === product.categorie)) {
          Alert.alert(
            'Catégorie introuvable',
            `La catégorie "${product.categorie}" n'existe plus. Veuillez en sélectionner une nouvelle.`
          );
        }
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

  // Réinitialiser l'image à l'originale
  const handleImageReset = () => {
    Alert.alert(
      'Rétablir l\'image originale',
      'Voulez-vous rétablir l\'image d\'origine ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Rétablir', 
          onPress: () => {
            updateField('image_url', product.image_url || null);
            updateField('imageFile', undefined);
          }
        },
      ]
    );
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
    if (qte_disponible > 0) {
      updateField('qte_disponible', qte_disponible - 1);
    }
  }, [qte_disponible, updateField]);

  const handleQuantiteChange = useCallback((text: string) => {
    const num = parseInt(text);
    if (!isNaN(num) && num >= 0) {
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

  // Vérifier si des modifications ont été faites
  const hasChanges = useCallback((): boolean => {
    const originalProduct = product;
    
    return (
      ref_produit !== originalProduct.ref_produit ||
      designation !== originalProduct.designation ||
      categorie !== originalProduct.categorie ||
      parseFloat(prix_actuel.replace(/\s/g, '').replace(',', '.')) !== originalProduct.prix_actuel ||
      qte_disponible !== originalProduct.qte_disponible ||
      imageFile !== undefined || // Nouvelle image sélectionnée
      image_url !== originalProduct.image_url
    );
  }, [ref_produit, designation, categorie, prix_actuel, qte_disponible, image_url, imageFile, product]);

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
      Alert.alert('Erreur', 'La quantité doit être positive ou nulle');
      return false;
    }

    return true;
  }, [ref_produit, designation, categorie, prix_actuel, qte_disponible]);

  // Annuler les modifications
  const handleCancel = useCallback(() => {
    if (hasChanges()) {
      Alert.alert(
        'Annuler les modifications',
        'Vous avez des modifications non enregistrées. Êtes-vous sûr de vouloir quitter ?',
        [
          { text: 'Continuer la modification', style: 'cancel' },
          { 
            text: 'Quitter', 
            style: 'destructive',
            onPress: () => navigation.goBack()
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  }, [hasChanges, navigation]);

  // Réinitialiser le formulaire
  const handleReset = useCallback(() => {
    Alert.alert(
      'Réinitialiser',
      'Voulez-vous réinitialiser toutes les modifications ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Réinitialiser', 
          style: 'destructive',
          onPress: () => {
            setFormData({
              ref_produit: product.ref_produit || '',
              designation: product.designation || '',
              categorie: product.categorie || '',
              prix_actuel: product.prix_actuel?.toString() || '',
              qte_disponible: product.qte_disponible || 1,
              image_url: product.image_url || null,
              imageFile: undefined,
              original_ref: product.ref_produit,
            });
          }
        },
      ]
    );
  }, [product]);

  // Mise à jour du produit
  const handleUpdate = useCallback(async () => {
    if (!validateForm()) return;

    // Vérifier si des modifications ont été faites
    if (!hasChanges()) {
      Alert.alert('Aucune modification', 'Aucune modification détectée.');
      return;
    }

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

      // Gestion de l'image
      if (imageFile) {
        // Ici, vous devrez uploader l'image et obtenir l'URL
        // Pour l'instant, utilisez une URL temporaire
        productData.image_url = imageFile.uri; // Remplacez par l'URL réelle après upload
      } else if (image_url) {
        productData.image_url = image_url;
      } else {
        // Si aucune image n'est spécifiée, conservez l'originale
        productData.image_url = product.image_url;
      }

      // Vérifier si la référence a changé
      const refHasChanged = original_ref !== ref_produit.trim();
      
      let response;
      if (refHasChanged) {
        // Si la référence a changé, on doit créer un nouveau produit et supprimer l'ancien
        Alert.alert(
          'Changement de référence',
          'La référence du produit a changé. Cela créera un nouveau produit avec la nouvelle référence.',
          [
            { text: 'Annuler', style: 'cancel' },
            { 
              text: 'Continuer', 
              onPress: async () => {
                try {
                  // Créer le nouveau produit
                  response = await productService.createProduct(productData);
                  
                  // Supprimer l'ancien produit
                  await productService.deleteProduct(original_ref!);
                  
                  Alert.alert(
                    'Succès ✅', 
                    'Produit mis à jour avec nouvelle référence',
                    [
                      { 
                        text: 'OK', 
                        onPress: () => navigation.replace('ProductList') 
                      }
                    ]
                  );
                } catch (error) {
                  throw error;
                }
              }
            }
          ]
        );
        setIsLoading(false);
        return;
      } else {
        // Mise à jour normale
        response = await productService.updateProduct(original_ref!, productData);
      }

      Alert.alert(
        'Succès ✅', 
        response.message || 'Produit mis à jour avec succès',
        [
          { 
            text: 'OK', 
            onPress: () => navigation.goBack() 
          }
        ]
      );

    } catch (error: any) {
      console.error('❌ Erreur mise à jour:', error);
      
      let errorMessage = 'Échec de la mise à jour';
      if (error.code === 409) errorMessage = 'Cette référence existe déjà';
      else if (error.code === 400) errorMessage = 'Données invalides';
      else if (error.code === 404) errorMessage = 'Produit ou catégorie introuvable';
      else if (error.code === 413) errorMessage = 'Image trop volumineuse';
      else if (error.message) errorMessage = error.message;

      Alert.alert('Erreur ❌', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [ref_produit, designation, categorie, prix_actuel, qte_disponible, image_url, imageFile, original_ref, validateForm, hasChanges, categories, product, navigation]);

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

  if (isFetching) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={{ marginTop: 16, color: '#666' }}>Chargement des données...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.backButton} accessibilityLabel="Retour">
            <Ionicons name="arrow-back" size={24} color="#111" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>Modifier le produit</Text>
            <Text style={styles.subtitle}>Ref: {original_ref}</Text>
          </View>
          <TouchableOpacity 
            onPress={handleReset} 
            style={styles.resetButton}
            disabled={!hasChanges() || isLoading}
          >
            <Icon 
              name="refresh" 
              size={22} 
              color={hasChanges() && !isLoading ? "#4A90E2" : "#CCCCCC"} 
            />
          </TouchableOpacity>
        </View>
        
        {/* Indicateur de modifications */}
        {hasChanges() && (
          <View style={styles.changesIndicator}>
            <Icon name="edit" size={16} color="#4A90E2" />
            <Text style={styles.changesText}>Modifications non enregistrées</Text>
          </View>
        )}

        {/* Référence du produit */}
        <View style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>Référence du produit *</Text>
            {original_ref !== ref_produit && (
              <Text style={styles.warningText}>Référence modifiée</Text>
            )}
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
          <Text style={styles.hint}>Référence originale: {original_ref}</Text>
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
            {product.categorie !== categorie && (
              <Text style={styles.warningText}>Catégorie modifiée</Text>
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
          {product.categorie && (
            <Text style={styles.hint}>Catégorie originale: {product.categorie}</Text>
          )}
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
          {product.prix_actuel && (
            <Text style={styles.hint}>
              Prix original: {product.prix_actuel.toFixed(2).replace('.', ',')} €
            </Text>
          )}
        </View>

        {/* Quantité disponible */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Quantité disponible</Text>
          {product.qte_disponible !== qte_disponible && (
            <Text style={styles.warningText}>Quantité modifiée</Text>
          )}
          
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
          {product.qte_disponible !== undefined && (
            <Text style={styles.hint}>Quantité originale: {product.qte_disponible}</Text>
          )}
        </View>

        {/* Image du produit */}
        <View style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>Image du produit</Text>
            {(imageFile || image_url !== product.image_url) && (
              <Text style={styles.warningText}>Image modifiée</Text>
            )}
          </View>
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
                  {product.image_url && product.image_url !== image_url && (
                    <TouchableOpacity
                      style={[styles.imageButton, styles.resetButtonStyle, isLoading && { opacity: 0.5 }]}
                      onPress={handleImageReset}
                      disabled={isLoading}
                    >
                      <Icon name="restore" size={20} color="#FFF" />
                      <Text style={styles.imageButtonText}>Originale</Text>
                    </TouchableOpacity>
                  )}
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
                      {isLoading ? 'Chargement...' : product.image_url ? 'Changer l\'image' : 'Importer une image'}
                    </Text>
                    <Text style={styles.uploadSubtext}>Appuyez pour sélectionner</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
            <Text style={styles.imageHint}>
              {imageFile ? `Fichier: ${imageFile.name}` : 
               product.image_url ? 'Image originale disponible' : 'Optionnel - Formats: JPG, PNG, GIF'}
            </Text>
          </View>
        </View>

        {/* Espace pour les boutons */}
        <View style={styles.spacer} />
      </ScrollView>

      {/* Boutons d'action */}
      <View style={styles.saveButtonContainer}>
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[
              styles.cancelButton,
              (isLoading || loadingCategories || uploadingImage) && { opacity: 0.7 }
            ]} 
            onPress={handleCancel}
            activeOpacity={0.8}
            disabled={isLoading || loadingCategories || uploadingImage}
          >
            <Icon name="close" size={20} color="#666" />
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.saveButton, 
              (!hasChanges() || isLoading || loadingCategories || uploadingImage) && { opacity: 0.7 }
            ]} 
            onPress={handleUpdate}
            activeOpacity={0.8}
            disabled={!hasChanges() || isLoading || loadingCategories || uploadingImage}
          >
            {isLoading ? (
              <>
                <ActivityIndicator size="small" color="#FFF" />
                <Text style={styles.saveButtonText}>Mise à jour...</Text>
              </>
            ) : (
              <>
                <Icon name="save" size={24} color="#FFF" />
                <Text style={styles.saveButtonText}>
                  {loadingCategories ? 'Chargement...' : 'Mettre à jour'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
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

export default EditProductScreen;