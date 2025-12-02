import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  spacer: {
    height: 100,
  },

  // Titre
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },

  // Conteneurs d'input
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },

  // Inputs généraux
  input: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },

  // Dropdown catégorie
  dropdown: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownTextSelected: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  dropdownTextPlaceholder: {
    fontSize: 16,
    color: '#999',
    flex: 1,
  },

  // Prix
  prixContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prixInput: {
    flex: 1,
    marginRight: 10,
  },
  currency: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },

  // Quantité
  quantiteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantiteButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  quantiteButtonDisabled: {
    backgroundColor: '#E0E0E0',
    borderColor: '#E0E0E0',
  },
  quantiteInput: {
    width: 100,
    height: 50,
    backgroundColor: '#FFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    marginHorizontal: 10,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },

  // Image
  imageContainer: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  imageActions: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#FFF',
  },
  imageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  changeButton: {
    backgroundColor: '#4A90E2',
  },
  deleteButton: {
    backgroundColor: '#E74C3C',
  },
  imageButtonText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
  uploadArea: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#FAFAFA',
  },
  uploadText: {
    fontSize: 18,
    color: '#4A90E2',
    fontWeight: '600',
    marginTop: 15,
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },

  // Bouton Enregistrer
  saveButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F5F5F5',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#DDD',
  },
  saveButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },

  // Modal catégories
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  categorieItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categorieText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },

  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  loadingIndicator: {
    marginLeft: 8,
  },
  
  inputError: {
    borderColor: '#FF3B30',
    backgroundColor: '#FFF5F5',
  },
  
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  
  imageHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },

  
  // Styles pour les catégories
  dropdownContent: {
    flex: 1,
  },
  
  dropdownDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  
  
  categorieInfo: {
    flex: 1,
    marginRight: 8,
  },
  
  categorieDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
  },
  
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#4A90E2',
    borderRadius: 6,
  },
  
  retryButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  
  modalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  refreshButton: {
    marginRight: 16,
    padding: 4,
  }
});

// Types
export interface Categorie {
  id: string;
  nom: string;
}

export interface ProductFormData {
  reference: string;
  designation: string;
  categorie: string;
  prix: string;
  quantite: number;
  image: string | null;
  imageBase64?: string;
}

// Constantes
export const CATEGORIES: Categorie[] = [
  { id: '1', nom: 'Électronique' },
  { id: '2', nom: 'Vêtements' },
  { id: '3', nom: 'Alimentation' },
  { id: '4', nom: 'Meubles' },
  { id: '5', nom: 'Livres' },
  { id: '6', nom: 'Sports' },
  { id: '7', nom: 'Beauté' },
  { id: '8', nom: 'Jouets' },
  { id: '9', nom: 'Automobile' },
  { id: '10', nom: 'Jardin' },
];