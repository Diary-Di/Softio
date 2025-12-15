import { Dimensions, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  
  container: { flex: 1, backgroundColor: '#f8fafc' },

  /* Header */
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
  headerSubtitle: { fontSize: 16, color: '#64748b', marginBottom: 20 },
  timeRangeContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
  },
  timeButton: { flex: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center' },
  timeButtonActive: { backgroundColor: '#fff', elevation: 2 },
  timeButtonText: { fontSize: 14, fontWeight: '500', color: '#64748b' },
  timeButtonTextActive: { color: '#6366F1', fontWeight: '600' },

  /* Statistiques */
  statsContainer: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 12 },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },

    dateFilterRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  dateInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dateInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1e293b',
  },
    /* ----- Range modern ----- */
  rangeRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  dateBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  dateTextBox: {
    marginLeft: 10,
  },
  dateLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    paddingVertical: 20,
  },

  placeholderText: {
  color: '#9CA3AF',
  fontStyle: 'italic',
},

modalOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Dimensions.get('window').height * 0.85, // M
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  modalHandleContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 20,
  },
  
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
  },
  
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  
  modalScroll: {
    flex: 1,
  },
  
  modalListRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  
  modalListLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  
  modalSubLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  
  modalListValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  
  modalEmptyText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 14,
    marginTop: 40,
  },
  
  modalCloseButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  
  modalCloseText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },

  subLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },

  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statIconContainer: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  changeText: { fontSize: 12, fontWeight: '600' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
  statTitle: { fontSize: 13, color: '#64748b' },

  /* Sections / Listes */
  section: { paddingHorizontal: 24, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  seeAllText: { fontSize: 14, color: '#6366F1', fontWeight: '500' },

  listCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  listRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  bullet: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#6366F1', marginRight: 12 },
  listLabel: { flex: 1, fontSize: 15, color: '#1e293b' },
  listValue: { fontSize: 15, fontWeight: '600', color: '#1e293b' },

  /* Dépenses récentes */
  expensesList: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' },
  expenseItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  expenseIconContainer: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  expenseInfo: { flex: 1 },
  expenseTitle: { fontSize: 16, fontWeight: '500', color: '#1e293b', marginBottom: 4 },
  expenseDate: { fontSize: 12, color: '#94a3b8' },
  expenseAmount: { fontSize: 16, fontWeight: '600', color: '#1e293b' },

  /* Boutons d'action */
  actionButtons: { padding: 24, gap: 12, marginBottom: 24 },
  actionButton: { backgroundColor: '#6366F1', borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  actionButtonText: { fontSize: 16, fontWeight: '600', color: '#fff', marginLeft: 8 },
  secondaryActionButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0' },
  secondaryActionButtonText: { fontSize: 16, fontWeight: '600', color: '#6366F1', marginLeft: 8 },
});