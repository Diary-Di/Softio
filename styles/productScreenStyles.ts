/******************************************************************
 *  productScreenStyles.ts  –  matches the Expo-Go ProductScreen
 ******************************************************************/
import { StyleSheet, Platform, Dimensions } from 'react-native';
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const productScreenStyles = StyleSheet.create({
  /* ----------- global / helpers ----------- */
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },

  /* ----------- header ----------- */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: { elevation: 2 },
    }),
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },

  /* ----------- FAB ----------- */
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 92, // placed above the floating bottom bar
    width: 56,
    height: 56,
    borderRadius: 12, // rounded square
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        // iOS uses zIndex for stacking
        zIndex: 20,
      },
      android: { elevation: 12 },
    }),
  },

  /* ----------- list ----------- */
  listContent: { padding: 16, paddingBottom: Platform.OS === 'ios' ? 34 : 20 },
  listContentCenter: { flex: 1, justifyContent: 'center' },

  /* ----------- card (image row) ----------- */
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 12,
    padding: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: { elevation: 3 },
    }),
  },
  cardImage: {
    width: 88,
    height: 88,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
  },
  cardInfo: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  cardName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    lineHeight: 20,
  },
  metaRow: { flexDirection: 'row', marginTop: 4 },
  metaLabel: {
    fontSize: 13,
    color: '#8e8e93',
    fontWeight: '500',
    width: 50,
  },
  metaValue: { fontSize: 13, color: '#424242', flex: 1 },
  cardPrice: {
    fontSize: 17,
    fontWeight: '700',
    color: '#34c759',
    marginTop: 6,
    textAlign: 'right',
  },

  /* ----------- empty ----------- */
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: screenHeight * 0.2,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  emptySubText: {
    fontSize: 15,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },

  // Add these styles to your existing productScreenStyles.ts

cardHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: 8,
},
menuButton: {
  padding: 4,
  borderRadius: 6,
  marginLeft: 8,
},
});