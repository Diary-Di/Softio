import { Ionicons } from '@expo/vector-icons';
import { Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import WebView from 'react-native-webview';

type PaperFormat = 'A4' | 'A5' | 'BL-A4' | 'BL-A5' | 'T80' | 'T58';

interface Props {
  visible: boolean;
  onClose: () => void;
  html: string;
  formats?: { id: PaperFormat; label: string }[];
  selectedFormat?: PaperFormat;
  onChangeFormat?: (f: PaperFormat) => void;
  onPrint: () => void;
  onShare: () => void;
  onDone?: () => void;
}

const DEFAULT_FORMATS: { id: PaperFormat; label: string }[] = [
  { id: 'A4', label: 'A4' },
  { id: 'A5', label: 'A5' },
  { id: 'BL-A4', label: 'Bon livraison' },
  { id: 'BL-A5', label: 'Bon liv. A5' },
  { id: 'T80', label: 'Ticket 80mm' },
  { id: 'T58', label: 'Ticket 58mm' },
];

export default function InvoicePreviewModal({
  visible,
  onClose,
  html,
  formats = DEFAULT_FORMATS,
  selectedFormat = 'A4',
  onChangeFormat,
  onPrint,
  onShare,
  onDone,
}: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
      statusBarTranslucent={true}
    >
      <SafeAreaView style={styles.container}>
        {/* Header moderne */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={onClose} 
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color="#1C1C1E" />
          </TouchableOpacity>
          <Text style={styles.title}>Aperçu</Text>
          <TouchableOpacity 
            onPress={() => {
              onClose();
              onDone?.();
            }}
            style={styles.doneButton}
            activeOpacity={0.7}
          >
            <Text style={styles.doneText}>Terminer</Text>
          </TouchableOpacity>
        </View>

        {/* Sélecteur format - design pilule */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.formatBar}
          contentContainerStyle={styles.formatBarContent}
        >
          {formats.map(f => (
            <TouchableOpacity
              key={f.id}
              onPress={() => onChangeFormat?.(f.id)}
              style={[
                styles.formatChip, 
                selectedFormat === f.id && styles.chipActive
              ]}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.chipText, 
                selectedFormat === f.id && styles.chipTextActive
              ]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* WebView aperçu avec bordure moderne */}
        <View style={styles.webviewContainer}>
          <WebView 
            originWhitelist={['*']} 
            style={styles.webview} 
            source={{ html }} 
          />
        </View>

        {/* Actions - design bottom sheet */}
        <View style={styles.actionsContainer}>
          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.printButton]} 
              onPress={onPrint}
              activeOpacity={0.8}
            >
              <Ionicons name="print-outline" size={22} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Imprimer</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.shareButton]} 
              onPress={onShare}
              activeOpacity={0.8}
            >
              <Ionicons name="share-outline" size={22} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Partager</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

/* ---------------- Styles Modernes ---------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  doneButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  doneText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  formatBar: {
    maxHeight: 60,
    backgroundColor: '#FFFFFF',
  },
  formatBarContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  formatChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  webviewContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
  },
  actionsContainer: {
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  printButton: {
    backgroundColor: '#34C759',
  },
  shareButton: {
    backgroundColor: '#5856D6',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});