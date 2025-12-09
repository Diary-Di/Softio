import { Platform, StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  
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

  hintText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
    marginLeft: 12,
  },
  
  placeholderText: {
    color: '#9CA3AF',
  }, 

  subtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  
  resetButton: {
    padding: 8,
    borderRadius: 8,
  },
  
  changesIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 10,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  
  changesText: {
    marginLeft: 8,
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '500',
  },
  
  warningText: {
    fontSize: 11,
    color: '#FF9800',
    marginLeft: 8,
    fontWeight: '500',
  },
  
  resetButtonStyle: {
    backgroundColor: '#FF9800',
  },
  
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flex: 1,
    marginRight: 12,
  },
  
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  successBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  
  successBannerText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginLeft: 12,
  },

  // BANNER SIMPLE ET MODERNE
  banner: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 16,
    right: 16,
    zIndex: 1000,
    elevation: 1000,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    //elevation: 6,
  },
  
  errorBanner: {
    backgroundColor: '#DC2626', // Rouge vif
  },
  
  successBanner: {
    backgroundColor: '#10B981', // Vert vif
  },
  
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  bannerTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  
  bannerText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
    lineHeight: 20,
  },
  
  bannerCloseButton: {
    padding: 4,
  },
  
  // Ajustement du scroll container
  scrollContainer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24
  },
    
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginTop: 8,
    },
    
    resetButtonText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '600',
    },
    
    updateButton: {
        flex: 2,
        backgroundColor: '#007AFF',
    },

    closeBannerButton: {
    padding: 4,
    }
});