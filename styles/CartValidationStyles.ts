// styles/CartValidationStyles.ts
import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const validationStyles = StyleSheet.create({
  // Conteneurs principaux
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F7',
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  backButton: {
    padding: 8,
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
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  headerBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },

  // Sections
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Boutons client
  clientButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  clientButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#C7C7CC',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
  },
  clientButtonPrimary: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  clientButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
  clientButtonTextPrimary: {
    color: '#FFF',
  },

  // Carte client sélectionné
  selectedClientCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#34C759',
  },
  selectedClientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedClientInfo: {
    flex: 1,
  },
  selectedClientName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  selectedClientDetails: {
    marginTop: 4,
  },
  clientDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  selectedClientEmail: {
    fontSize: 13,
    color: '#8E8E93',
  },
  selectedClientPhone: {
    fontSize: 13,
    color: '#8E8E93',
  },
  changeClientButton: {
    padding: 8,
  },

  // Carte aucun client
  noClientCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderStyle: 'dashed',
  },
  noClientIconContainer: {
    marginBottom: 16,
  },
  noClientText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3A3A3C',
    marginBottom: 4,
  },
  noClientSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },

  // Badge nombre d'articles
  itemsCountBadge: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  itemsCountText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E8E93',
  },

  // Récapitulatif
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  summaryItem: {
    padding: 16,
  },
  summaryItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  summaryItemMain: {
    flex: 1,
  },
  summaryItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  summaryItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    flex: 1,
    marginRight: 12,
  },
  summaryItemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  summaryItemRef: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 8,
  },
  summaryItemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityBadge: {
    backgroundColor: '#F2F2F7',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  quantityBadgeText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E8E93',
  },
  summaryItemDetailText: {
    fontSize: 13,
    color: '#8E8E93',
  },

  // Total
  totalCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: 16,
    color: '#8E8E93',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  totalLabelMain: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  totalValueMain: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  totalDivider: {
    height: 1,
    backgroundColor: '#F2F2F7',
    marginVertical: 12,
  },

  // Notes
  notesCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
  },
  notesInput: {
    fontSize: 16,
    color: '#000',
    minHeight: 80,
    padding: 0,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  footerTotal: {
    flex: 1,
  },
  footerTotalLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  footerTotalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  validateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
    minWidth: 180,
  },
  validateButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  validateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },

  // ========== MODAL CLIENT (COLLÉ EN BAS) ==========
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end', // Collé en bas
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    maxHeight: SCREEN_HEIGHT * 0.85, // 85% max de l'écran
    minHeight: SCREEN_HEIGHT * 0.5, // 50% min de l'écran
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFF',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D1D6',
    borderRadius: 2,
    marginBottom: 12,
    alignSelf: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    right: 20,
    top: 12,
    padding: 4,
  },

  // Recherche dans le modal
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#F8F8F8',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  clearSearchButton: {
    padding: 4,
    marginLeft: 8,
  },

  // Liste des clients
  customerList: {
    flex: 1,
  },
  customerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  customerItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  customerItemInfo: {
    flex: 1,
  },
  customerItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  customerItemDetails: {
    marginTop: 4,
  },
  customerDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  customerDetailIcon: {
    marginRight: 4,
  },
  customerItemEmail: {
    fontSize: 13,
    color: '#8E8E93',
  },
  customerItemPhone: {
    fontSize: 13,
    color: '#8E8E93',
  },
  customerItemAddress: {
    fontSize: 11,
    color: '#8E8E93',
    flex: 1,
  },

  // État de chargement
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#8E8E93',
  },

  // Aucun résultat
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3A3A3C',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  createFromSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  createFromSearchText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#007AFF',
  },

  // Formulaire création client
  createForm: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20, // Plus d'espace en bas sur iOS
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
    marginBottom: 8,
  },
  formInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  },
  formInputIcon: {
    marginRight: 10,
  },
  formInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    padding: 0,
  },
  formHelpText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    fontStyle: 'italic',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    gap: 12,
  },
  formCancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingVertical: 14,
  },
  formCancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
  },
  formSubmitButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
  },
  formSubmitButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  formSubmitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },

  // Détails client dans la carte sélectionnée
  clientPhoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },

  // Ajoutez ces styles à validationStyles dans CartValidationStyles.ts

paymentMethodsContainer: {
  gap: 12,
  marginBottom: 16,
},

paymentMethodItem: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  padding: 16,
  borderWidth: 1,
  borderColor: '#E5E5EA',
},

paymentMethodItemSelected: {
  borderWidth: 1.5,
  borderColor: '#007AFF',
  backgroundColor: '#F8F9FF',
},

paymentMethodIconContainer: {
  width: 48,
  height: 48,
  borderRadius: 12,
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 12,
},

paymentMethodInfo: {
  flex: 1,
},

paymentMethodName: {
  fontSize: 16,
  fontWeight: '600',
  color: '#000',
  marginBottom: 2,
},

paymentMethodDescription: {
  fontSize: 13,
  color: '#8E8E93',
},

paymentMethodCheckmark: {
  width: 24,
  height: 24,
  borderRadius: 12,
  justifyContent: 'center',
  alignItems: 'center',
  marginLeft: 8,
},

selectedPaymentCard: {
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  padding: 16,
  borderWidth: 1,
  borderColor: '#34C759',
},

selectedPaymentHeader: {
  flexDirection: 'row',
  alignItems: 'center',
},

selectedPaymentIcon: {
  width: 40,
  height: 40,
  borderRadius: 10,
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 12,
},

selectedPaymentInfo: {
  flex: 1,
},

selectedPaymentName: {
  fontSize: 16,
  fontWeight: '600',
  color: '#000',
  marginBottom: 2,
},

selectedPaymentDescription: {
  fontSize: 13,
  color: '#8E8E93',
},

changePaymentButton: {
  padding: 4,
},
});