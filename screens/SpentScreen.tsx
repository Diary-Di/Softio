// screens/SpentScreen.tsx
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { spentService, Spent } from '../services/SpentService';
import styles from '@/styles/SpentScreenStyles';

export default function SpentScreen() {
  /* -------------------------------------------------------------------------- */
  /*                                    STATE                                   */
  /* -------------------------------------------------------------------------- */
  const [expenses, setExpenses] = useState<Spent[]>([]);
  const [loading, setLoading] = useState(true);

  /* filtres */
  const [from, setFrom] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [to, setTo] = useState(new Date());
  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);
  const navigation = useNavigation<any>();

  /* -------------------------------------------------------------------------- */
  /*                              FETCH + FILTRE                                */
  /* -------------------------------------------------------------------------- */
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const all = await spentService.getSpents({ limit: 500 }); // on ramène tout
      /* filtre front simple entre 2 dates */
      const filtered = all.filter((d) => {
        const day = new Date(d.date_depense);
        return day >= from && day <= to;
      });
      setExpenses(filtered);
    } catch (e: any) {
      Alert.alert('Erreur', e.message || 'Impossible de charger les dépenses');
    } finally {
      setLoading(false);
    }
  };

  /* recharge à chaque focus + quand on change une borne */
  useFocusEffect(
    useCallback(() => {
      fetchExpenses();
    }, [from, to])
  );

  /* -------------------------------------------------------------------------- */
  /*                                 HANDLERS                                   */
  /* -------------------------------------------------------------------------- */
  const onChangeFrom = (_: any, selected?: Date) => {
    setShowFrom(false);
    if (selected) setFrom(selected);
  };
  const onChangeTo = (_: any, selected?: Date) => {
    setShowTo(false);
    if (selected) setTo(selected);
  };

  /* -------------------------------------------------------------------------- */
  /*                               RENDER ITEM                                  */
  /* -------------------------------------------------------------------------- */
  const renderItem = ({ item }: { item: Spent }) => (
    <View style={styles.card}>
      <Text style={styles.reason}>{item.raison}</Text>
      <Text style={styles.amount}>{Number(item.montant).toFixed(2)} €</Text>
      <Text style={styles.datetime}>
        {item.date_depense} – {item.heur_depense}
      </Text>
    </View>
  );

  /* -------------------------------------------------------------------------- */
  /*                                   MAIN                                     */
  /* -------------------------------------------------------------------------- */
  return (
    <View style={styles.container}>
      {/* --------------- FILTRE DATE --------------- */}
      <View style={styles.filterBar}>
        <Pressable onPress={() => setShowFrom(true)} style={styles.filterBtn}>
          <Text>Du : {from.toLocaleDateString()}</Text>
        </Pressable>
        <Pressable onPress={() => setShowTo(true)} style={styles.filterBtn}>
          <Text>Au : {to.toLocaleDateString()}</Text>
        </Pressable>
      </View>

      {showFrom && (
        <DateTimePicker value={from} mode="date" onChange={onChangeFrom} />
      )}
      {showTo && (
        <DateTimePicker value={to} mode="date" onChange={onChangeTo} />
      )}

      {/* --------------- LISTE --------------- */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => String(item.numero)}
          renderItem={renderItem}
          contentContainerStyle={
            expenses.length ? styles.list : styles.emptyList
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aucune dépense</Text>
          }
          refreshing={loading}
          onRefresh={fetchExpenses}
        />
      )}

      {/* --------------- FAB --------------- */}
      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate('AddSpent')}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}