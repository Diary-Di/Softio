import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const CreateCompanyStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  inputWrapperFocused: {
    borderColor: '#4a6cf7',
    backgroundColor: '#fff',
  },
  inputWrapperError: {
    borderColor: '#ff4757',
  },
  inputIcon: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
  },
  errorText: {
    color: '#ff4757',
    fontSize: 13,
    marginTop: 5,
    marginLeft: 4,
  },
  uploadContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
    paddingVertical: 30,
    marginBottom: 20,
  },
  uploadContainerActive: {
    borderColor: '#4a6cf7',
    backgroundColor: '#f0f4ff',
  },
  uploadIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e9ecef',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  uploadText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  uploadSubtext: {
    fontSize: 13,
    color: '#999',
  },
  logoPreview: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginBottom: 10,
  },
  removeLogoButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff4757',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 10, // Réduit pour limiter l'espace après le bouton
  },
  submitButton: {
    backgroundColor: '#4a6cf7',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4a6cf7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  submitButtonDisabled: {
    backgroundColor: '#a0a0a0',
    shadowColor: 'transparent',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  // Nouveau style pour le conteneur de formulaire avec hauteur limitée
  formContent: {
    paddingBottom: 10, // Espacement minimal après le bouton
  },
});