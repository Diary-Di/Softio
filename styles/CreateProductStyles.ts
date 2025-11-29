import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export const createProductStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  cancelButton: {
    padding: 8,
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  required: {
    color: '#ff3b30',
  },
  textInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1a1a1a',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  picker: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  pickerAndroid: {
    width: '100%',
    height: 50,
  },
  pickerIOS: {
    width: '100%',
    height: 200,
  },
  errorInput: {
    borderColor: '#ff3b30',
    backgroundColor: '#fffafa',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    marginTop: 6,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
    fontSize: 16,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  priceInput: {
    paddingLeft: 30,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  switchLabel: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    ...Platform.select({
      ios: {
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  submitButtonDisabled: {
    backgroundColor: '#cccccc',
    ...Platform.select({
      ios: {
        shadowColor: '#cccccc',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  submitButtonTextDisabled: {
    color: '#999999',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },

  imageButton: {
  backgroundColor: '#007AFF',
  paddingVertical: 14,
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',
  ...Platform.select({
    ios: {
      shadowColor: '#007AFF',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
  }),
},
imageButtonText: {
  color: 'white',
  fontSize: 16,
  fontWeight: '600',
  fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
},

imageContainer: {
  height: 180,
  borderRadius: 12,
  borderWidth: 2,
  borderColor: '#d1d5db',
  borderStyle: 'dashed',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#fafafa',
},

imagePlaceholderText: {
  fontSize: 16,
  color: '#6b7280',
  fontWeight: '600',
},

imagePreviewWrapper: {
  width: '100%',
  height: 220,
  borderRadius: 12,
  overflow: 'hidden',
  position: 'relative',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#f0f0f0',
},

imagePreview: {
  width: '100%',
  height: '100%',
  borderRadius: 12,
},

removeIconContainer: {
  position: 'absolute',
  top: 10,
  right: 10,
  backgroundColor: 'white',
  borderRadius: 50,
  width: 28,
  height: 28,
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#ff3b30',
  zIndex: 10,
},

removeIconText: {
  color: '#ff3b30',
  fontSize: 16,
  fontWeight: '700',
},

quantityContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: 'white',
  borderWidth: 1,
  borderColor: '#d1d5db',
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 10,
},

qtyButton: {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: '#f1f5f9',
  justifyContent: 'center',
  alignItems: 'center',

  ...Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
    },
    android: {
      elevation: 3,
    },
  }),
},

qtyButtonText: {
  fontSize: 22,
  fontWeight: '700',
  color: '#1a1a1a',
},

qtyValue: {
  fontSize: 18,
  fontWeight: '600',
  color: '#1a1a1a',
  textAlign: 'center',
  minWidth: 40,
},

qtyInput: {
  minWidth: 50,
  textAlign: "center",
  fontSize: 18,
  paddingHorizontal: 6,
}


});