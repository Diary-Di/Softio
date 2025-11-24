import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import FloatingBottomBarCustomer from '../components/FloatingBottomBarCustomer';
import styles from '../styles/CreateCustomerStyles';

export default function CustomerFollowUpScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ padding: 16 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={18} color="#374151" />
        </TouchableOpacity>
        <Text style={[styles.title, { marginTop: 8 }]}>Suivi des clients</Text>
        <Text style={{ marginTop: 12, color: '#374151' }}>Page de suivi (placeholder).</Text>
      </View>
      <FloatingBottomBarCustomer active="suivi" />
    </SafeAreaView>
  );
}

