// app/index.tsx
import { useKeepAwake } from 'expo-keep-awake';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';

export default function Index() {
  useKeepAwake();
  
  const { token, loading } = useAuth();

  // Afficher un écran de chargement pendant la vérification
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Rediriger vers login si pas de token, sinon vers dashboard
  if (!token) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/dashboard" />;
}
