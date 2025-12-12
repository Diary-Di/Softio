import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  list: { paddingBottom: 100 },
  emptyList: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  reason: { fontSize: 16, fontWeight: '600' },
  amount: { fontSize: 14, color: '#555', marginTop: 2 },
  datetime: { fontSize: 12, color: '#888', marginTop: 4 },
  emptyText: { color: '#888', fontSize: 16 },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  fabText: { color: '#fff', fontSize: 24, lineHeight: 24 },

  filterBar: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  paddingHorizontal: 16,
  paddingVertical: 8,
},
filterBtn: {
  backgroundColor: '#eee',
  padding: 10,
  borderRadius: 6,
},
});