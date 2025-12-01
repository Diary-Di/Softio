import { Platform, StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  
  // Nouveau style pour ScrollView
  scrollContainer: { 
    flexGrow: 1, 
    paddingHorizontal: 16, 
    paddingBottom: Platform.OS === 'ios' ? 40 : 24 
  },
  
  // Ancien content gardé pour compatibilité
  content: { 
    padding: 16, 
    paddingBottom: Platform.OS === 'ios' ? 40 : 24 
  },
  
  title: { 
    fontSize: 20, 
    fontWeight: '700', 
    marginBottom: 16, 
    color: '#111827' 
  },
  
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12,
    paddingTop: Platform.OS === 'ios' ? 0 : 12 
  },
  
  backButton: { 
    width: 36, 
    height: 36, 
    borderRadius: 8, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 8, 
    backgroundColor: '#F3F4F6' 
  },
  
  headerCenter: { 
    flex: 1, 
    alignItems: 'center' 
  },
  
  headerRight: { 
    width: 36 
  },
  
  label: { 
    fontSize: 13, 
    color: '#374151', 
    marginBottom: 6, 
    marginTop: 8, 
    fontWeight: '600' 
  },
  
  // Nouveaux styles pour les inputs avec container
  inputContainer: {
    borderWidth: 1,
    borderColor: '#E6E7EB',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  
  inputFocused: {
    borderColor: '#6366F1',
    borderWidth: 1.5,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  input: {
    height: 44,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#fff',
  },
  
  multiline: { 
    height: 86, 
    paddingTop: 10, 
    textAlignVertical: 'top' 
  },
  
  button: {
    marginTop: 20,
    backgroundColor: '#6366F1',
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  
  buttonDisabled: {
    backgroundColor: '#A5B4FC',
    opacity: 0.6,
  },
  
  buttonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '700' 
  },
  
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: 4,
    borderRadius: 10,
    marginBottom: 12,
  },
  
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  
  segmentActive: {
    backgroundColor: '#6366F1',
  },
  
  segmentText: {
    color: '#374151',
    fontWeight: '600',
  },
  
  segmentTextActive: {
    color: '#fff',
  },

  // Inline variant used next to the Raison social label
  segmentRowInline: { 
    flexDirection: 'row' 
  },
  
  segmentButtonInline: { 
    paddingHorizontal: 8, 
    paddingVertical: 6, 
    borderRadius: 8, 
    marginLeft: 8 
  },
  
  segmentActiveInline: { 
    backgroundColor: '#6366F1' 
  },
  
  pickerButton: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6E7EB',
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginTop: 6,
  },
  
  pickerButtonText: { 
    color: '#111827', 
    fontWeight: '600' 
  },
  
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.3)', 
    justifyContent: 'center', 
    padding: 20 
  },
  
  pickerContainer: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  
  pickerOption: { 
    padding: 14, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F3F4F6' 
  },
  
  pickerOptionText: { 
    fontSize: 16, 
    color: '#111827' 
  },
  
  // Nouveaux styles pour les messages
  messageBox: {
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
  },
  
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  
  successBox: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  
  messageText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  
  errorText: {
    color: '#DC2626',
  },
  
  successText: {
    color: '#16A34A',
  },
  
  // Style pour le placeholder des TextInput
  placeholderText: {
    color: '#9CA3AF',
  }
});