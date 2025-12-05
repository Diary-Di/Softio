import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { CompanyStackParamList } from '../navigation/CompanyStackNavigator';

type Props = StackScreenProps<CompanyStackParamList, 'Spent'>;

type ExpenseType = 'achat' | 'salaire' | 'loyer' | 'transport' | 'autre';

export default function SpentScreen({ navigation }: Props) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseType, setExpenseType] = useState<ExpenseType>('achat');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const expenseTypes: { type: ExpenseType; label: string; icon: string }[] = [
    { type: 'achat', label: 'Achat', icon: 'cart-outline' },
    { type: 'salaire', label: 'Salaire', icon: 'cash-outline' },
    { type: 'loyer', label: 'Loyer', icon: 'business-outline' },
    { type: 'transport', label: 'Transport', icon: 'car-outline' },
    { type: 'autre', label: 'Autre', icon: 'ellipsis-horizontal-outline' },
  ];

  const handleSubmit = () => {
    if (!title.trim() || !amount.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir le titre et le montant');
      return;
    }

    const expenseData = {
      title,
      amount: parseFloat(amount),
      type: expenseType,
      description,
      date,
    };

    console.log('Nouvelle dépense:', expenseData);
    
    Alert.alert(
      'Succès',
      'Dépense enregistrée avec succès',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nouvelle Dépense</Text>
        <Text style={styles.subtitle}>Enregistrez vos dépenses d'entreprise</Text>
      </View>

      <View style={styles.form}>
        {/* Type de dépense */}
        <Text style={styles.label}>Type de dépense</Text>
        <View style={styles.typeContainer}>
          {expenseTypes.map((item) => (
            <TouchableOpacity
              key={item.type}
              style={[
                styles.typeButton,
                expenseType === item.type && styles.typeButtonActive,
              ]}
              onPress={() => setExpenseType(item.type)}
            >
              <Ionicons
                name={item.icon as any}
                size={24}
                color={expenseType === item.type ? '#6366F1' : '#64748B'}
              />
              <Text
                style={[
                  styles.typeLabel,
                  expenseType === item.type && styles.typeLabelActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Titre */}
        <Text style={styles.label}>Titre *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Achat matériel informatique"
          value={title}
          onChangeText={setTitle}
        />

        {/* Montant */}
        <Text style={styles.label}>Montant (FCFA) *</Text>
        <View style={styles.amountContainer}>
          <Ionicons name="cash-outline" size={24} color="#64748B" style={styles.amountIcon} />
          <TextInput
            style={[styles.input, styles.amountInput]}
            placeholder="0"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
          <Text style={styles.currency}>FCFA</Text>
        </View>

        {/* Date */}
        <Text style={styles.label}>Date</Text>
        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={24} color="#64748B" style={styles.dateIcon} />
          <TextInput
            style={[styles.input, styles.dateInput]}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
          />
        </View>

        {/* Description */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Notes supplémentaires..."
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        {/* Boutons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Ionicons name="checkmark-outline" size={20} color="#fff" />
            <Text style={styles.submitButtonText}>Enregistrer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  form: {
    padding: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
    marginTop: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  typeButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  typeButtonActive: {
    backgroundColor: '#f1f5f9',
    borderColor: '#6366F1',
  },
  typeLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748B',
  },
  typeLabelActive: {
    color: '#6366F1',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  amountIcon: {
    marginRight: 12,
  },
  amountInput: {
    flex: 1,
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 16,
  },
  currency: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
    marginLeft: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  dateIcon: {
    marginRight: 12,
  },
  dateInput: {
    flex: 1,
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#6366F1',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
});