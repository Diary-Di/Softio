// screens/AddSpentScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from '../styles/AddSpentStyles';
import { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { spentService, CreateSpentData } from '../services/SpentService';

/* -------------------------------------------------------------------------- */
/*                               UTILS / FORMAT                               */
/* -------------------------------------------------------------------------- */
const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

const formatDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const formatTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

/* -------------------------------------------------------------------------- */
/*                              SCREEN COMPONENT                              */
/* -------------------------------------------------------------------------- */
export default function AddSpentScreen({ navigation }: any) {
  /* ----------------------------- FORM STATE -------------------------------- */
  const [raison, setRaison] = useState('');
  const [montant, setMontant] = useState('');
  const [date, setDate] = useState(new Date());
  const [heure, setHeure] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [showHeure, setShowHeure] = useState(false);

  /* ----------------------------- UI STATE ---------------------------------- */
  const [loading, setLoading] = useState(false);

  /* ----------------------------- HANDLERS ---------------------------------- */
  const onChangeDate = (_: DateTimePickerEvent, selected?: Date) => {
    setShowDate(false);
    if (selected) setDate(selected);
  };

  const onChangeHeure = (_: DateTimePickerEvent, selected?: Date) => {
    setShowHeure(false);
    if (selected) setHeure(selected);
  };

  const handleValider = async () => {
    if (!raison.trim() || !montant.trim()) {
      Alert.alert('Champs requis', 'Veuillez remplir la raison et le montant.');
      return;
    }

    const payload: CreateSpentData = {
      raison: raison.trim(),
      montant: parseFloat(montant.replace(',', '.')),
      date_depense: formatDate(date),
      heur_depense: formatTime(heure),
    };

    setLoading(true);
    try {
      await spentService.createSpent(payload);
      Alert.alert('Succès', 'Dépense enregistrée.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Échec de la sauvegarde.');
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------- RENDER ---------------------------------- */
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={navigation.goBack}>
          <Icon name="arrow-back" size={24} style={styles.icon} />
        </TouchableOpacity>
        <Text style={styles.title}>Dépense</Text>
        <TouchableOpacity onPress={navigation.goBack}>
          <Icon name="close" size={24} style={styles.icon} />
        </TouchableOpacity>
      </View>

      {/* FORM */}
      <View style={styles.form}>
        <TextInput label="Raison" value={raison} onChangeText={setRaison} style={styles.input} />
        <TextInput
          label="Montant"
          value={montant}
          onChangeText={setMontant}
          keyboardType="numeric"
          style={styles.input}
        />

        <View style={styles.row}>
          <Button onPress={() => setShowDate(true)}>Choisir la date</Button>
          <Button onPress={() => setShowHeure(true)}>Choisir l'heure</Button>
        </View>

        {showDate && (
          <DateTimePicker value={date} mode="date" display="default" onChange={onChangeDate} />
        )}
        {showHeure && (
          <DateTimePicker value={heure} mode="time" display="default" onChange={onChangeHeure} />
        )}

        <Button mode="contained" onPress={handleValider} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : 'Valider'}
        </Button>
      </View>
    </View>
  );
}