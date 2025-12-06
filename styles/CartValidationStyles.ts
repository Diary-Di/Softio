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

  // Section remise
  discountContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  discountControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  discountTypeButtons: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 2,
  },
  discountTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  discountTypeButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  discountTypeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  discountTypeButtonTextActive: {
    color: '#007AFF',
  },
  discountInput: {
    width: 80,
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    textAlign: 'right',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
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

  // Section paiement
  paymentSection: {
    marginBottom: 16,
  },
  paymentLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectPaymentMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderStyle: 'dashed',
  },
  selectPaymentMethodText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
    marginLeft: 8,
  },
  selectedPaymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#34C759',
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

  // Montant payé
  amountPaidSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  amountPaidLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 12,
  },
  amountPaidContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  amountPaidSymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: '#007AFF',
    marginRight: 8,
  },
  amountPaidInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    textAlign: 'right',
    padding: 0,
  },

  // Monnaie à rendre / Reste dû
  changeSection: {
    backgroundColor: '#F8F9FF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8F4FF',
  },
  changeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  changeLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
  },
  changeValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  changeBreakdown: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  changeBreakdownText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },

  // Section Condition
  conditionSection: {
    marginTop: 16,
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  conditionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  conditionInput: {
    fontSize: 16,
    color: '#000',
    minHeight: 60,
    padding: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    textAlignVertical: 'top',
  },
  conditionHelpText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 8,
    fontStyle: 'italic',
  },

  // Section Notes (Nouveau pour Proforma)
  notesSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 16,
  },
  notesLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notesInput: {
    fontSize: 16,
    color: '#000',
    minHeight: 80,
    padding: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    textAlignVertical: 'top',
  },
  notesHelpText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 8,
    fontStyle: 'italic',
  },

  // Carte d'information (Nouveau pour Proforma)
  infoCard: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFECB3',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#6D4C41',
    marginLeft: 12,
    lineHeight: 20,
  },

  // Avertissement stocks insuffisants (Nouveau pour Proforma)
  warningCard: {
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginLeft: 12,
  },
  warningContent: {
    marginLeft: 36, // Pour aligner avec l'icône
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 12,
    lineHeight: 20,
  },
  warningNote: {
    fontSize: 12,
    color: '#856404',
    fontStyle: 'italic',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#FFEAA7',
  },

  // Liste des articles avec stocks insuffisants
  warningItemsList: {
    maxHeight: 150,
    marginBottom: 12,
  },
  warningItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FFEAA7',
  },
  warningItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 4,
  },
  warningItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  warningItemStock: {
    fontSize: 12,
    color: '#856404',
  },
  warningItemRequested: {
    fontSize: 12,
    color: '#856404',
  },
  warningItemDiff: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '600',
  },

  // Badge d'avertissement stock insuffisant dans les articles
  stockWarningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  stockWarningText: {
    fontSize: 11,
    color: '#856404',
    fontWeight: '600',
    marginLeft: 4,
  },

  // Ligne d'information de stock (Nouveau pour Proforma)
  stockInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  stockInfoText: {
    fontSize: 12,
    color: '#8E8E93',
  },

  // Modal paiement
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    maxHeight: SCREEN_HEIGHT * 0.85,
    minHeight: SCREEN_HEIGHT * 0.5,
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

  // Méthodes de paiement dans modal
  paymentMethodsList: {
    padding: 16,
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 8,
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

  // Styles pour les modals client
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

  // Formulaire création client
  createForm: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
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

  // Message de succès (Toast)
  successToast: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: '#34C759',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  successToastContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  successToastIcon: {
    marginRight: 12,
  },
  successToastText: {
    flex: 1,
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  successToastClose: {
    padding: 4,
  },
});

// Styles spécifiques pour Proforma
export const proformaValidationStyles = StyleSheet.create({
  ...validationStyles,
  
  // Surcharger les couleurs pour le proforma
  headerBadge: {
    ...validationStyles.headerBadge,
    backgroundColor: '#6B7280',
  },
  
  itemsCountBadge: {
    ...validationStyles.itemsCountBadge,
    backgroundColor: '#6B7280',
  },
  
  totalValueMain: {
    ...validationStyles.totalValueMain,
    color: '#6B7280',
  },
  
  footerTotalAmount: {
    ...validationStyles.footerTotalAmount,
    color: '#6B7280',
  },
  
  validateButton: {
    ...validationStyles.validateButton,
    backgroundColor: '#6B7280',
  },
  
  validateButtonDisabled: {
    ...validationStyles.validateButtonDisabled,
    backgroundColor: '#C7C7CC',
  },
  
  successToast: {
    ...validationStyles.successToast,
    backgroundColor: '#6B7280',
  },
  
  // Styles spécifiques pour les badges d'avertissement
  quantityBadgeLowStock: {
    backgroundColor: '#FFEAA7',
  },
  
  quantityBadgeCriticalStock: {
    backgroundColor: '#FECACA',
  },
  
  quantityBadgeTextLowStock: {
    color: '#856404',
  },
  
  quantityBadgeTextCriticalStock: {
    color: '#DC2626',
  },
  
  // Styles pour les indicateurs de stock
  stockIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  
  stockIndicatorGood: {
    backgroundColor: '#D1FAE5',
  },
  
  stockIndicatorWarning: {
    backgroundColor: '#FEF3C7',
  },
  
  stockIndicatorCritical: {
    backgroundColor: '#FEE2E2',
  },
  
  stockIndicatorText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  
  stockIndicatorTextGood: {
    color: '#059669',
  },
  
  stockIndicatorTextWarning: {
    color: '#D97706',
  },
  
  stockIndicatorTextCritical: {
    color: '#DC2626',
  },
});