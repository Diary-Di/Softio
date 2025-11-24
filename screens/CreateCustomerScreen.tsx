import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import styles from '../styles/CreateCustomerStyles';

export default function CreateCustomerScreen() {
  const navigation = useNavigation<any>();

  const [raisonSocial, setRaisonSocial] = useState('');
  const [customerType, setCustomerType] = useState<'particulier' | 'entreprise'>('particulier');
  const [sigle, setSigle] = useState('');
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [adresse, setAdresse] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [nif, setNif] = useState('');
  const [stat, setStat] = useState('');

  const validate = () => {
    if (customerType === 'particulier') {
      if (!nom.trim() || !prenom.trim()) {
        Alert.alert('Champs requis', 'Veuillez renseigner le nom et le prénom.');
        return false;
      }
    } else {
      if (!sigle.trim()) {
        Alert.alert('Champs requis', 'Veuillez renseigner le SIGLE de l\'entreprise.');
        return false;
      }
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Email invalide', 'Veuillez entrer une adresse email valide.');
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const newCustomer: any = {
      id: Date.now().toString(),
      type: customerType,
      raisonSocial,
      adresse,
      telephone,
      email,
      nif,
      stat,
    };

    if (customerType === 'particulier') {
      newCustomer.nom = nom;
      newCustomer.prenom = prenom;
    } else {
      newCustomer.sigle = sigle;
    }

    // TODO: send to API (services/api.ts) — currently just logging
    console.log('Create customer', newCustomer);
    Alert.alert('Client créé', `${prenom} ${nom} a été ajouté.`, [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Créer un client</Text>

          <View style={{ marginBottom: 8 }}>
            <Text style={styles.label}>Raison social</Text>

            {/* Replace free-text raisonSocial with a prefilled selector (Entreprise / Particulier) */}
            <TouchableOpacity style={styles.pickerButton} onPress={() => setShowTypePicker(true)}>
              <Text style={styles.pickerButtonText}>{customerType === 'particulier' ? 'Particulier' : 'Entreprise'}</Text>
            </TouchableOpacity>

            <Modal transparent visible={showTypePicker} animationType="fade" onRequestClose={() => setShowTypePicker(false)}>
              <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowTypePicker(false)}>
                <View style={styles.pickerContainer}>
                  <TouchableOpacity style={styles.pickerOption} onPress={() => { setCustomerType('particulier'); setShowTypePicker(false); setRaisonSocial('Particulier'); }}>
                    <Text style={styles.pickerOptionText}>Particulier</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.pickerOption} onPress={() => { setCustomerType('entreprise'); setShowTypePicker(false); setRaisonSocial('Entreprise'); }}>
                    <Text style={styles.pickerOptionText}>Entreprise</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Modal>
          </View>

          {customerType === 'particulier' ? (
            <>
              <Text style={styles.label}>Nom *</Text>
              <TextInput style={styles.input} value={nom} onChangeText={setNom} placeholder="Nom" />

              <Text style={styles.label}>Prénom *</Text>
              <TextInput style={styles.input} value={prenom} onChangeText={setPrenom} placeholder="Prénom" />
            </>
          ) : (
            <>
              <Text style={styles.label}>SIGLE *</Text>
              <TextInput style={styles.input} value={sigle} onChangeText={setSigle} placeholder="SIGLE de l'entreprise" />
            </>
          )}

          <Text style={styles.label}>Adresse</Text>
          <TextInput style={[styles.input, styles.multiline]} value={adresse} onChangeText={setAdresse} placeholder="Adresse" multiline />

          <Text style={styles.label}>Téléphone</Text>
          <TextInput style={styles.input} value={telephone} onChangeText={setTelephone} placeholder="Téléphone" keyboardType="phone-pad" />

          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none" />

          <Text style={styles.label}>NIF</Text>
          <TextInput style={styles.input} value={nif} onChangeText={setNif} placeholder="NIF" />

          <Text style={styles.label}>STAT</Text>
          <TextInput style={styles.input} value={stat} onChangeText={setStat} placeholder="STAT" />

          {/* Editeur field removed */}

          <TouchableOpacity style={styles.button} onPress={handleSubmit} activeOpacity={0.9}>
            <Text style={styles.buttonText}>Créer le client</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
