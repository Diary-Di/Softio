import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function AuthLoadingScreen({ navigation }: any) {
  useEffect(() => {
    const check = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        // direct replace so user cannot go back to loading screen
        if (token) navigation.replace('Dashboard');
        else navigation.replace('Login');
      } catch (e) {
        navigation.replace('Login');
      }
    };
    check();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
