import { StyleSheet, Dimensions } from 'react-native';
const { width } = Dimensions.get('window');

export const spentScreenStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },

  /* Header */
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  title: { fontSize: 24, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },

  /* Search */
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    height: 44,
  },
  searchInputFocused: { borderColor: '#4F46E5', backgroundColor: '#fff' },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: '#111827', paddingVertical: 8 },
  clearButton: { padding: 4 },

  /* Filter bar */
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  filterBtnText: { fontSize: 14, color: '#4B5563' },

  /* List */
  listContainer: { padding: 16, paddingBottom: 100 },
  listContainerCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },

  /* Card */
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: { flex: 1, marginLeft: 12 },
  reason: { fontSize: 16, fontWeight: '600', color: '#111827' },
  datetime: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  priceTag: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  price: { fontSize: 16, fontWeight: '700', color: '#4F46E5' },

  /* Empty */
  emptyContainer: { alignItems: 'center', padding: 40 },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 280,
  },
  clearFiltersButton: {
    marginTop: 16,
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearFiltersButtonText: { color: '#4F46E5', fontSize: 14, fontWeight: '500' },

  /* Loading */
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#6B7280' },

  /* FAB */
  fabContainer: { position: 'absolute', bottom: 20, right: 20 },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  /* Pagination */
  paginationContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    marginTop: 8,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  paginationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paginationText: { fontSize: 14, color: '#4B5563', fontWeight: '500' },
  paginationPageText: { fontSize: 14, color: '#6B7280' },
  paginationButtons: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  paginationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  disabled: { opacity: 0.5 },
  paginationButtonText: { fontSize: 14, fontWeight: '600', color: '#4F46E5', marginHorizontal: 4 },
  disabledText: { color: '#9CA3AF' },
  pageIndicators: { flexDirection: 'row', alignItems: 'center' },
  pageIndicator: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 2,
    backgroundColor: '#f8fafc',
  },

    /* Expanded section */
  expanded: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: { width: '48%', marginBottom: 12 },
  detailLabel: { fontSize: 12, color: '#6B7280', marginBottom: 2 },
  detailValue: { fontSize: 14, fontWeight: '500', color: '#111827' },
  priceValue: { color: '#4F46E5', fontWeight: '600' },

  /* Action buttons */
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  actionButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },

  dateFieldsRow: {
  flexDirection: 'row',
  paddingHorizontal: 16,
  paddingVertical: 12,
  backgroundColor: '#fff',
  borderBottomWidth: 1,
  borderBottomColor: '#f1f5f9',
  gap: 12,
},
dateField: { flex: 1 },
dateLabel: {
  fontSize: 14,
  color: '#6B7280',
  marginBottom: 6,
},
dateInputTouch: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: '#f8fafc',
  borderWidth: 1,
  borderColor: '#e2e8f0',
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 10,
},
dateInputText: {
  fontSize: 15,
  color: '#111827',
},

headerContainer: {
  backgroundColor: '#FFFFFF',
  paddingHorizontal: 20,
  paddingTop: 16,
  paddingBottom: 20,
  borderBottomWidth: 1,
  borderColor: '#E5E7EB',
},

headerRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},

totalBox: {
  alignItems: 'flex-end',
  borderWidth: 1.5,
  borderColor: '#4F46E5',
  borderRadius: 12,
  paddingVertical: 8,
  paddingHorizontal: 14,
  backgroundColor: '#F5F7FF',
},

totalLabel: {
  fontSize: 12,
  color: '#4F46E5',
  marginBottom: 2,
  fontWeight: '600',
},

totalAmount: {
  fontSize: 18,
  fontWeight: '700',
  color: '#4F46E5',
},
  actionButtonText: { fontSize: 12, marginTop: 4, fontWeight: '500' },
  pageIndicatorActive: { backgroundColor: '#4F46E5' },
  pageIndicatorText: { fontSize: 14, fontWeight: '600', color: '#4B5563' },
  pageIndicatorTextActive: { color: '#fff' },
  dots: { fontSize: 14, color: '#9CA3AF', marginHorizontal: 4 },
});