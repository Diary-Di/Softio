import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  icon: {
    color: '#000',
  },
  form: {
    flex: 1,
  },
  label: {
    marginBottom: 4,
    fontSize: 14,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 12,
    marginBottom: 16,
    height: 48,
    paddingHorizontal: 12,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 12,
    marginBottom: 16,
    paddingRight: 12,
    height: 48,
  },
  flexInput: {
    flex: 1,
    backgroundColor: '#fff',
    height: 48,
    paddingHorizontal: 12,
  },
  button: {
    marginTop: 8,
    backgroundColor: '#1976d2',
    borderRadius: 12,
  },
});