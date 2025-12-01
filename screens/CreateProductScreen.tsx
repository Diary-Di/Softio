import React, { useState, useCallback, useRef } from 'react';
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
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { 
  styles, 
  CATEGORIES, 
  ProductFormData, 
  Categorie 
} from '../styles/CreateProductStyles';

const ProductFormScreen: React.FC = () => {
  // États
  const [formData, setFormData] = useState<ProductFormData>({
    reference: '',
    designation: '',
    categorie: '',
    prix: '',
    quantite: 1,
    image: null,
    imageBase64: undefined,
  });
  
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Références
  const inputRef = useRef<TextInput>(null);

  // Destructuration
  const { reference, designation, categorie, prix, quantite, image, imageBase64 } = formData;

  // Mise à jour des champs
  const updateField = useCallback((field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Sélectionner une image depuis la galerie (VERSION SIMPLIFIÉE)
  const selectImageFromGallery = async () => {
    try {
      setIsLoading(true);
      
      // Demander la permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Nous avons besoin d\'accéder à votre galerie');
        setIsLoading(false);
        return;
      }

      // Lancer le sélecteur d'image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true, // IMPORTANT: demande le base64 directement
      });

      // Traiter le résultat
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        // Stocker l'URI pour l'affichage
        updateField('image', asset.uri);
        
        // Stocker le base64 fourni par Expo
        if (asset.base64) {
          updateField('imageBase64', asset.base64);
          console.log('✅ Image sélectionnée');
          console.log('URI:', asset.uri.substring(0, 50) + '...');
          console.log('Base64 taille:', asset.base64.length, 'caractères');
        } else {
          // Si base64 n'est pas fourni, on utilise juste l'URI
          updateField('imageBase64', undefined);
          console.log('⚠️ Base64 non disponible, URI seulement:', asset.uri);
        }
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
            updateField('image', null);
            updateField('imageBase64', undefined);
          }
        },
      ]
    );
  };

  // Formatage du prix avec séparateur de milliers
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
    
    updateField('prix', formatted);
  }, [updateField]);

  // Gestion de la quantité
  const incrementQuantite = useCallback(() => {
    updateField('quantite', quantite + 1);
  }, [quantite, updateField]);

  const decrementQuantite = useCallback(() => {
    if (quantite > 1) {
      updateField('quantite', quantite - 1);
    }
  }, [quantite, updateField]);

  const handleQuantiteChange = useCallback((text: string) => {
    const num = parseInt(text);
    if (!isNaN(num) && num > 0) {
      updateField('quantite', num);
    } else if (text === '') {
      updateField('quantite', 0);
    }
  }, [updateField]);

  // Sélection de catégorie
  const handleSelectCategorie = useCallback((nom: string) => {
    updateField('categorie', nom);
    setModalVisible(false);
  }, [updateField]);

  // Validation du formulaire
  const validateForm = useCallback((): boolean => {
    if (!reference.trim()) {
      Alert.alert('Erreur', 'La référence du produit est obligatoire');
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

    if (!prix) {
      Alert.alert('Erreur', 'Le prix unitaire est obligatoire');
      return false;
    }

    return true;
  }, [reference, designation, categorie, prix]);

  // Enregistrement
  const handleSave = useCallback(async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      
      // Convertir le prix formaté en nombre
      const prixNumerique = parseFloat(prix.replace(/\s/g, '').replace(',', '.'));
      
      // Préparer les données pour l'API
      const productData = {
        reference,
        designation,
        categorie,
        prix: prixNumerique,
        quantite,
        imageBlob: imageBase64 || null, // Prêt pour LONGBLOB
      };

      console.log('📤 Données prêtes pour l\'API:', {
        reference,
        designation,
        categorie,
        prix: prixNumerique,
        quantite,
        imageBlob: imageBase64 ? `[BLOB: ${imageBase64.length} caractères]` : 'null'
      });

      // SIMULATION: Attendre 1 seconde pour simuler l'envoi
      await new Promise(resolve => setTimeout(resolve, 1000));

      Alert.alert(
        'Succès ✅', 
        'Produit prêt pour l\'enregistrement!\n\n' +
        `Référence: ${reference}\n` +
        `Désignation: ${designation}\n` +
        `Catégorie: ${categorie}\n` +
        `Prix: ${prixNumerique} €\n` +
        `Quantité: ${quantite}\n` +
        `Image: ${imageBase64 ? 'Oui' : 'Non'}`
      );

    } catch (error) {
      console.error('❌ Erreur enregistrement:', error);
      Alert.alert('Erreur', 'Échec de l\'enregistrement');
    } finally {
      setIsLoading(false);
    }
  }, [reference, designation, categorie, prix, quantite, imageBase64, validateForm]);

  // Rendu d'un élément de catégorie
  const renderCategorieItem = useCallback(({ item }: { item: Categorie }) => (
    <TouchableOpacity
      style={styles.categorieItem}
      onPress={() => handleSelectCategorie(item.nom)}
    >
      <Text style={styles.categorieText}>{item.nom}</Text>
      {categorie === item.nom && (
        <Icon name="check" size={20} color="#4A90E2" />
      )}
    </TouchableOpacity>
  ), [categorie, handleSelectCategorie]);

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Titre */}
        <Text style={styles.title}>Nouveau Produit</Text>
        
        {/* Référence du produit */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Référence du produit *</Text>
          <TextInput
            style={styles.input}
            value={reference}
            onChangeText={(text) => updateField('reference', text)}
            placeholder="Entrez la référence"
            placeholderTextColor="#999"
            returnKeyType="next"
            editable={!isLoading}
          />
        </View>

        {/* Désignation */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Désignation *</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={designation}
            onChangeText={(text) => updateField('designation', text)}
            placeholder="Entrez la désignation"
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
          <Text style={styles.label}>Catégorie *</Text>
          <TouchableOpacity
            style={[styles.dropdown, isLoading && { opacity: 0.5 }]}
            onPress={() => !isLoading && setModalVisible(true)}
            disabled={isLoading}
          >
            <Text style={categorie ? styles.dropdownTextSelected : styles.dropdownTextPlaceholder}>
              {categorie || 'Sélectionnez une catégorie'}
            </Text>
            <Icon name="arrow-drop-down" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Prix unitaire */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Prix unitaire (€) *</Text>
          <View style={styles.prixContainer}>
            <TextInput
              style={[styles.input, styles.prixInput, isLoading && { opacity: 0.5 }]}
              value={prix}
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

        {/* Section Quantité */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Quantité</Text>
          
          <View style={styles.quantiteContainer}>
            {/* Bouton Moins */}
            <TouchableOpacity
              style={[
                styles.quantiteButton,
                quantite <= 1 && styles.quantiteButtonDisabled,
                isLoading && { opacity: 0.5 }
              ]}
              onPress={decrementQuantite}
              disabled={quantite <= 1 || isLoading}
              activeOpacity={0.7}
            >
              <Icon 
                name="remove" 
                size={24} 
                color={quantite <= 1 ? "#999" : "#FFF"} 
              />
            </TouchableOpacity>

            {/* Input de quantité */}
            <TextInput
              ref={inputRef}
              style={[styles.quantiteInput, isLoading && { opacity: 0.5 }]}
              value={quantite.toString()}
              onChangeText={handleQuantiteChange}
              keyboardType="numeric"
              textAlign="center"
              returnKeyType="done"
              maxLength={6}
              onBlur={() => {
                if (quantite < 1) updateField('quantite', 1);
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
            {image ? (
              <>
                <Image source={{ uri: image }} style={styles.imagePreview} />
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
          </View>
        </View>

        {/* Espace pour le bouton enregistrer */}
        <View style={styles.spacer} />
      </ScrollView>

      {/* Bouton Enregistrer */}
      <View style={styles.saveButtonContainer}>
        <TouchableOpacity 
          style={[styles.saveButton, isLoading && { opacity: 0.7 }]} 
          onPress={handleSave}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Icon name="hourglass-empty" size={24} color="#FFF" />
              <Text style={styles.saveButtonText}>Enregistrement...</Text>
            </>
          ) : (
            <>
              <Icon name="save" size={24} color="#FFF" />
              <Text style={styles.saveButtonText}>Enregistrer</Text>
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
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={CATEGORIES}
              renderItem={renderCategorieItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              initialNumToRender={10}
              windowSize={5}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProductFormScreen;