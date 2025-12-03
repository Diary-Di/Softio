import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

// Créer des styles séparés pour le Web pour éviter les problèmes de type
const webSpecificStyles = Platform.OS === 'web' ? {
  searchInput: {
    outlineWidth: 0,
    outlineStyle: 'none' as any,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  quantityInput: {
    outlineWidth: 0,
    outlineStyle: 'none' as any,
    borderWidth: 0,
  },
  inputFocus: {
    outline: 'none',
    border: 'none',
    boxShadow: 'none',
  }
} : {};

export const cartSalesStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  cancelButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  headerBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  headerBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyCartButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Sections
  section: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },

  // Recherche
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  searchInputContainerFocused: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#000',
    padding: 0,
    ...(Platform.OS === 'web' ? webSpecificStyles.searchInput : {}),
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    width: 48,
    height: 48,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  searchButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },

  // Erreurs
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEEEE',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  errorText: {
    color: '#FF3B30',
    marginLeft: 8,
    fontSize: 14,
  },

  // Produit
  productCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
    }),
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  productRef: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  productDetails: {
    marginTop: 8,
  },
  productDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productDetailItem: {
    flex: 1,
  },
  productDetailLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 4,
  },
  productDetailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },

  // Contrôle quantité
  quantitySection: {
    marginTop: 8,
  },
  quantityLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 4,
  },
  quantityButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
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
  quantityInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginHorizontal: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    ...(Platform.OS === 'web' ? webSpecificStyles.quantityInput : {}),
  },

  // Bouton Ajouter au panier
  addToCartButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  addToCartButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Panier
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cartCountBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  cartCountText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyCart: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    backgroundColor: '#FFF',
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  emptyCartText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
  },
  emptyCartSubtext: {
    fontSize: 14,
    color: '#C7C7CC',
    marginTop: 8,
  },

  // Article panier
  cartItemCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cartItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cartItemRef: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 4,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  cartItemRemove: {
    padding: 4,
  },
  cartItemDetails: {
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    paddingTop: 12,
  },
  cartItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cartItemLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  cartItemValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
  },
  cartItemTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  cartQuantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 2,
  },
  cartQtyButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 6,
  },
  cartQtyValue: {
    width: 40,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },

  // Total
  totalCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    color: '#8E8E93',
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
  },
  totalSeparator: {
    height: 1,
    backgroundColor: '#F2F2F7',
    marginVertical: 12,
  },
  totalMainLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  totalMainValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerTotal: {
    flex: 1,
  },
  footerTotalLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 2,
  },
  footerTotalAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#007AFF',
  },
  continueButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});

// Fonction utilitaire pour appliquer les styles Web si nécessaire
export const getWebStyles = () => {
  if (Platform.OS !== 'web') return {};
  
  return {
    searchInput: {
      outlineWidth: 0,
      outlineStyle: 'none' as any,
      borderWidth: 0,
      ':focus': {
        outline: 'none',
        border: 'none',
        boxShadow: 'none',
      } as any,
    },
    quantityInput: {
      outlineWidth: 0,
      outlineStyle: 'none' as any,
      borderWidth: 0,
      ':focus': {
        outline: 'none',
        border: 'none',
        boxShadow: 'none',
      } as any,
    },
  };
};