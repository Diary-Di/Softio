import { StyleSheet } from 'react-native';

export const createCategoryStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 8 },
  title: { fontSize: 18, fontWeight: '600', color: '#111' },
  form: { padding: 16 },
  label: { fontSize: 14, color: '#444', marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#e0e0e0', padding: 10, borderRadius: 8, marginTop: 6 },
  textarea: { height: 100, textAlignVertical: 'top' },
  button: { marginTop: 18, backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
});

export default createCategoryStyles;
