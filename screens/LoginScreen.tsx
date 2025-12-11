import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      // Remplace par ton API d'authentification.
      // Ici : simulation -> stocke un token factice si email/password non vides
      if (!email.trim() || !password) {
        Alert.alert('Erreur', 'Email et mot de passe requis');
        setLoading(false);
        return;
      }
      // Exemple : après réussite
      await AsyncStorage.setItem('authToken', 'token-example');
      navigation.replace('Dashboard');
    } catch (e) {
      Alert.alert('Erreur', 'Connexion échouée');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" keyboardType="email-address" />
      <TextInput placeholder="Mot de passe" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={submit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Se connecter</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:20, justifyContent:'center' },
  title: { fontSize:22, fontWeight:'600', marginBottom:12, textAlign:'center' },
  input: { borderWidth:1, borderColor:'#E5E5EA', borderRadius:8, padding:12, marginBottom:12 },
  button: { backgroundColor:'#007AFF', padding:12, borderRadius:8, alignItems:'center' },
  btnText: { color:'#FFF', fontWeight:'600' },
});
