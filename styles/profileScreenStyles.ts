import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  
  // Header styles
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e8eaed',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4285F4',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 22,
    fontWeight: '500',
    color: '#202124',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#5f6368',
    marginBottom: 16,
  },
  manageAccountButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#dadce0',
  },
  manageAccountText: {
    color: '#1a73e8',
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Section styles
  section: {
    marginTop: 8,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#5f6368',
    paddingHorizontal: 16,
    paddingVertical: 8,
    letterSpacing: 0.5,
  },
  
  // Menu item styles
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f3f4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    color: '#202124',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#5f6368',
  },
  
  // Logout button styles
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#fce8e6',
  },
  logoutText: {
    color: '#d93025',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  
  // Footer styles
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#5f6368',
    marginBottom: 8,
  },
  footerVersion: {
    fontSize: 12,
    color: '#5f6368',
  },

  initialsAvatar: {
  width: 80,
  height: 80,
  borderRadius: 40,
  backgroundColor: '#4285F4', // couleur de fond
  alignItems: 'center',
  justifyContent: 'center',
},
initialsText: {
  color: '#fff',
  fontSize: 32,
  fontWeight: 'bold',
},
});