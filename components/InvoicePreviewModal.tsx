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
  { id: 'A4', label: 'Facture A4' },
  { id: 'A5', label: 'Facture A5' },
  { id: 'BL-A4', label: 'Bon liv. A4' },
  { id: 'BL-A5', label: 'Bon liv. A5' },
  { id: 'T80', label: 'Ticket 80 mm' },
  { id: 'T58', label: 'Ticket 58 mm' },
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={26} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Aperçu facture</Text>
          <View style={{ width: 26 }} />
        </View>

        {/* Sélecteur format */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.formatBar}>
          {formats.map(f => (
            <TouchableOpacity
              key={f.id}
              onPress={() => onChangeFormat?.(f.id)}
              style={[styles.formatChip, selectedFormat === f.id && styles.chipActive]}>
              <Text style={[styles.chipText, selectedFormat === f.id && styles.chipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* WebView aperçu */}
        <View style={styles.webviewWrap}>
          <WebView originWhitelist={['*']} style={styles.webview} source={{ html }} />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.button, styles.print]} onPress={onPrint}>
            <Ionicons name="print-outline" size={20} color="#FFF" />
            <Text style={styles.buttonText}>Imprimer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.share]} onPress={onShare}>
            <Ionicons name="share-outline" size={20} color="#FFF" />
            <Text style={styles.buttonText}>Partager</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.done]}
            onPress={() => {
              onClose();
              onDone?.();
            }}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
            <Text style={styles.buttonText}>Terminer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

/* ---------------- Styles ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  done: {
    backgroundColor: '#34C759',
  },
  title: { fontSize: 18, fontWeight: '600' },
  formatBar: { paddingVertical: 10, paddingHorizontal: 12 },
  formatChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 6,
    backgroundColor: '#eee',
  },
  chipActive: { backgroundColor: '#007AFF' },
  chipText: { color: '#000' },
  chipTextActive: { color: '#fff' },
  webviewWrap: {
    flex: 1,
    margin: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  webview: { flex: 1 },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  print: { backgroundColor: '#34C759' },
  share: { backgroundColor: '#5856D6' },
  buttonText: { color: '#fff', fontWeight: '600' },
});