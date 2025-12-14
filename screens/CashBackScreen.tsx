import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const CashBackScreen = () => {
  const navigation = useNavigation();

  const [invoiceRef, setInvoiceRef] = React.useState('');
  const [purchaseDate, setPurchaseDate] = React.useState('');
  const [totalAmount, setTotalAmount] = React.useState('');
  const [paidAmount, setPaidAmount] = React.useState('');
  const [remainingAmount, setRemainingAmount] = React.useState('');

  const handleValidate = () => {
    if (!invoiceRef || !purchaseDate || !totalAmount || !paidAmount || !remainingAmount) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    Alert.alert('Succès', 'Recouvrement validé.');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Recouvrement</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Formulaire */}
      <View style={styles.form}>
        <Text style={styles.label}>Référence du facture</Text>
        <TextInput
          style={styles.input}
          value={invoiceRef}
          onChangeText={setInvoiceRef}
          placeholder="EX: FAC-001"
        />

        <Text style={styles.label}>Date de l'achat</Text>
        <TextInput
          style={styles.input}
          value={purchaseDate}
          onChangeText={setPurchaseDate}
          placeholder="JJ/MM/AAAA"
        />

        <Text style={styles.label}>Montant Total à payer</Text>
        <TextInput
          style={styles.input}
          value={totalAmount}
          onChangeText={setTotalAmount}
          keyboardType="numeric"
          placeholder="0.00"
        />

        <Text style={styles.label}>Montant déjà payé</Text>
        <TextInput
          style={styles.input}
          value={paidAmount}
          onChangeText={setPaidAmount}
          keyboardType="numeric"
          placeholder="0.00"
        />

        <Text style={styles.label}>Montant restant à payer</Text>
        <TextInput
          style={styles.input}
          value={remainingAmount}
          onChangeText={setRemainingAmount}
          keyboardType="numeric"
          placeholder="0.00"
        />

        <TouchableOpacity style={styles.button} onPress={handleValidate}>
          <Text style={styles.buttonText}>Valider</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CashBackScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  form: {
    flex: 1,
  },
  label: {
    marginTop: 15,
    marginBottom: 5,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
  },
  button: {
    marginTop: 30,
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});