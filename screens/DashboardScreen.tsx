import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DashboardScreen({ navigation }: any) {
  const logout = async () => {
    await AsyncStorage.removeItem('authToken');
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>Bienvenue — tu es connecté.</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CategoryScreen' as any)}>
        <Text style={styles.btnText}>Aller aux catégories</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: '#DC2626' }]} onPress={logout}>
        <Text style={styles.btnText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, alignItems:'center', justifyContent:'center', padding:20 },
  title: { fontSize:24, fontWeight:'700', marginBottom:8 },
  subtitle: { fontSize:14, color:'#6b7280', marginBottom:20 },
  button: { backgroundColor:'#007AFF', padding:12, borderRadius:8, marginTop:10, width:'100%', alignItems:'center' },
  btnText: { color:'#fff', fontWeight:'600' },
});
