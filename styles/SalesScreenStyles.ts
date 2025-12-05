import { StyleSheet } from "react-native";

export default StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F3F4F6",
		paddingTop: 16,
		overflow: 'visible',
	},
	title: {
		fontSize: 22,
		fontWeight: "700",
		color: "#111827",
		paddingHorizontal: 16,
		marginBottom: 8,
	},
	listContainer: {
		paddingHorizontal: 16,
		paddingBottom: 24,
	},
	card: {
		backgroundColor: "#FFFFFF",
		borderRadius: 12,
		padding: 12,
		marginBottom: 12,
		shadowColor: "#000",
		shadowOpacity: 0.05,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 6,
		elevation: 2,
	},
	fieldRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		marginBottom: 6,
	},
	fieldLabel: {
		width: 110,
		fontWeight: "600",
		color: "#374151",
		marginRight: 8,
	},
	fieldValue: {
		flex: 1,
		color: "#111827",
	},
	headerRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 6,
	},
	avatar: {
		width: 42,
		height: 42,
		borderRadius: 21,
		backgroundColor: "#E0E7FF",
		alignItems: "center",
		justifyContent: "center",
		marginRight: 12,
	},
	avatarText: {
		color: "#3730A3",
		fontWeight: "700",
		fontSize: 14,
	},
	name: {
		flex: 1,
		fontSize: 16,
		fontWeight: "700",
		color: "#111827",
	},
	chevronButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#EEF2FF',
		shadowColor: '#000',
		shadowOpacity: 0.04,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 4,
		elevation: 2,
	},
	expanded: {
		marginTop: 8,
		borderTopWidth: 1,
		borderTopColor: "#F3F4F6",
		paddingTop: 8,
	},
	actionRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 10,
		paddingTop: 8,
		borderTopWidth: 1,
		borderTopColor: '#F9FAFB',
	},
	actionButton: {
		flex: 1,
		height: 44,
		borderRadius: 10,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#F6F4FF',
		paddingHorizontal: 12,
		marginHorizontal: 6,
		shadowColor: '#000',
		shadowOpacity: 0.04,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 4,
		elevation: 1,
	},

	headerInfo: {
  flex: 1,
  marginLeft: 12,
},

invoiceRef: {
  fontSize: 16,
  fontWeight: '600',
  color: '#1F2937',
  marginBottom: 2,
},

email: {
  fontSize: 14,
  color: '#6B7280',
},

loadingContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
},

emptyContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
},

emptyText: {
  fontSize: 18,
  color: '#6B7280',
  marginTop: 16,
  textAlign: 'center',
},

emptySubText: {
  fontSize: 14,
  color: '#9CA3AF',
  marginTop: 8,
  textAlign: 'center',
},

// Styles pour la barre de recherche et les filtres
searchContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 16,
  gap: 12,
},

searchBar: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#F9FAFB',
  borderWidth: 1,
  borderColor: '#E5E7EB',
  borderRadius: 12,
  paddingHorizontal: 12,
  height: 44,
},

searchIcon: {
  marginRight: 8,
},

searchInput: {
  flex: 1,
  fontSize: 16,
  color: '#1F2937',
  height: '100%',
},

filterButton: {
  width: 44,
  height: 44,
  borderRadius: 12,
  backgroundColor: '#F3F4F6',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
},

filterBadge: {
  position: 'absolute',
  top: -4,
  right: -4,
  backgroundColor: '#EF4444',
  width: 16,
  height: 16,
  borderRadius: 8,
  justifyContent: 'center',
  alignItems: 'center',
},

filterBadgeText: {
  color: '#FFFFFF',
  fontSize: 10,
  fontWeight: 'bold',
},

resultCounter: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
},

resultText: {
  fontSize: 14,
  color: '#6B7280',
  fontWeight: '500',
},

clearFilterButton: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
  paddingVertical: 4,
  paddingHorizontal: 8,
  backgroundColor: '#EEF2FF',
  borderRadius: 6,
},

clearFilterText: {
  fontSize: 12,
  color: '#4F46E5',
  fontWeight: '500',
},

amountBadge: {
  fontSize: 14,
  fontWeight: '600',
  color: '#059669',
  marginTop: 2,
},

// Styles pour la modale des filtres
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'flex-end',
},

modalContent: {
  backgroundColor: '#FFFFFF',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  maxHeight: '80%',
},

modalHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 20,
  paddingVertical: 16,
  borderBottomWidth: 1,
  borderBottomColor: '#F3F4F6',
},

modalTitle: {
  fontSize: 18,
  fontWeight: '600',
  color: '#1F2937',
},

filterContainer: {
  padding: 20,
},

filterSection: {
  marginBottom: 24,
},

filterSectionTitle: {
  fontSize: 16,
  fontWeight: '600',
  color: '#374151',
  marginBottom: 12,
},

filterLabel: {
  fontSize: 14,
  color: '#6B7280',
  marginBottom: 6,
},

dateFilterRow: {
  flexDirection: 'row',
  gap: 12,
},

dateFilterItem: {
  flex: 1,
},

dateButton: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  backgroundColor: '#F9FAFB',
  borderWidth: 1,
  borderColor: '#E5E7EB',
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 10,
},

dateButtonText: {
  flex: 1,
  fontSize: 14,
  color: '#1F2937',
},

amountFilterRow: {
  flexDirection: 'row',
  gap: 12,
},

amountFilterItem: {
  flex: 1,
},

amountInput: {
  backgroundColor: '#F9FAFB',
  borderWidth: 1,
  borderColor: '#E5E7EB',
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontSize: 14,
  color: '#1F2937',
},

paymentFilterRow: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
},

paymentButton: {
  paddingHorizontal: 16,
  paddingVertical: 8,
  backgroundColor: '#F3F4F6',
  borderRadius: 20,
  borderWidth: 1,
  borderColor: '#E5E7EB',
},

paymentButtonActive: {
  backgroundColor: '#4F46E5',
  borderColor: '#4F46E5',
},

paymentButtonText: {
  fontSize: 14,
  color: '#6B7280',
},

paymentButtonTextActive: {
  color: '#FFFFFF',
},

modalFooter: {
  flexDirection: 'row',
  paddingHorizontal: 20,
  paddingVertical: 16,
  borderTopWidth: 1,
  borderTopColor: '#F3F4F6',
  gap: 12,
},

clearButton: {
  flex: 1,
  paddingVertical: 12,
  alignItems: 'center',
  backgroundColor: '#F3F4F6',
  borderRadius: 8,
},

clearButtonText: {
  fontSize: 16,
  fontWeight: '500',
  color: '#6B7280',
},

applyButton: {
  flex: 1,
  paddingVertical: 12,
  alignItems: 'center',
  backgroundColor: '#4F46E5',
  borderRadius: 8,
},

applyButtonText: {
  fontSize: 16,
  fontWeight: '500',
  color: '#FFFFFF',
},

suggestClearButton: {
  marginTop: 12,
  paddingVertical: 8,
  paddingHorizontal: 16,
  backgroundColor: '#EEF2FF',
  borderRadius: 20,
},

suggestClearText: {
  fontSize: 14,
  color: '#4F46E5',
  fontWeight: '500',
},
});
