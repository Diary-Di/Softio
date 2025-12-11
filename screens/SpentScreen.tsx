import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
// Removed StackScreenProps import and ProfileStackParamList typing to avoid incompatibilies
import styles from '@/styles/SpentScreenStyles';

// --- données fictives intégrées ---
const fakeExpenses: Expense[] = [
  { id: '1', raison: 'Courses alimentaires', montant: '120,50', date: '12/06/2025', heure: '10:30' },
  { id: '2', raison: 'Essence', montant: '65,00', date: '11/06/2025', heure: '18:45' },
  { id: '3', raison: 'Restaurant', montant: '38,90', date: '10/06/2025', heure: '20:15' },
];

type Expense = {
  id: string;
  raison: string;
  montant: string;
  date: string;
  heure: string;
};

export default function SpentScreen({ navigation }: any) { // <-- navigation:any
  const [expenses] = useState<Expense[]>(fakeExpenses);

  const renderItem = ({ item }: { item: Expense }) => (
    <View style={styles.card}>
      <Text style={styles.reason}>{item.raison}</Text>
      <Text style={styles.amount}>{item.montant} €</Text>
      <Text style={styles.datetime}>{item.date} – {item.heure}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={expenses.length ? styles.list : styles.emptyList}
        ListEmptyComponent={<Text style={styles.emptyText}>Aucune dépense</Text>}
      />
      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate('AddSpent')}   // garde le nom tel qu'exposé dans ProfileStackNavigator
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}