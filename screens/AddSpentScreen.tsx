import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Button, TextInput, Snackbar } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from '../styles/AddSpentStyles';
import { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { spentService, CreateSpentData, Spent } from '../services/SpentService';

/* -------------------------------------------------------------------------- */
/*                               UTILS / FORMAT                               */
/* -------------------------------------------------------------------------- */
const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

const formatDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const formatTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

const parseDateTime = (dateStr?: string, timeStr?: string): Date => {
  if (!dateStr || !timeStr) return new Date();          // ← sécurité
  const [y, m, d] = dateStr.split('-').map(Number);
  const [h, min, s] = timeStr.split(':').map(Number);
  return new Date(y, m - 1, d, h, min, s || 0);
};

/* -------------------------------------------------------------------------- */
/*                              SCREEN COMPONENT                              */
/* -------------------------------------------------------------------------- */
export default function AddSpentScreen({ route, navigation }: any) {
  const spent = route.params?.spent as Spent | undefined;
  const isEdit = !!spent;

  /* ----------------------------- FORM STATE -------------------------------- */
  const [raison, setRaison] = useState(spent?.raison ?? '');
  const [montant, setMontant] = useState(
    spent ? String(spent.montant).replace('.', ',') : ''
  );
  const [date, setDate] = useState(
  spent?.date_depense && spent?.heur_depense
    ? parseDateTime(spent.date_depense, spent.heur_depense)
    : new Date()
);
const [heure, setHeure] = useState(date);
  const [showDate, setShowDate] = useState(false);
  const [showHeure, setShowHeure] = useState(false);

  /* ----------------------------- UI STATE ---------------------------------- */
  const [submitting, setSubmitting] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  /* -------------------------- RESET FORM FUNCTION -------------------------- */
  const resetForm = () => {
    setRaison('');
    setMontant('');
    const now = new Date();
    setDate(now);
    setHeure(now);
  };

  /* ----------------------------- HANDLERS ---------------------------------- */
  const onChangeDate = (_: DateTimePickerEvent, selected?: Date) => {
    setShowDate(false);
    if (selected) setDate(selected);
  };

  const onChangeHeure = (_: DateTimePickerEvent, selected?: Date) => {
    setShowHeure(false);
    if (selected) setHeure(selected);
  };

  const handleSubmit = async () => {
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

    setSubmitting(true);
    try {
      if (isEdit)
        await spentService.updateSpent(spent!.numero, payload);
      else
        await spentService.createSpent(payload);

      // Show success message
      setSnackbarMessage(isEdit ? 'Dépense mise à jour avec succès!' : 'Dépense créée avec succès!');
      setSnackbarVisible(true);

      // Clear form only for new expense creation
      if (!isEdit) {
        resetForm();
      }

    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Échec de la sauvegarde.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ------------------------------- RENDER ---------------------------------- */
  return (
    <View style={styles.container}>
      {/* SNACKBAR FOR CONFIRMATION MESSAGE */}
      <Snackbar
  visible={snackbarVisible}
  onDismiss={() => setSnackbarVisible(false)}
  duration={3000}
  style={styles.snackbar}
  wrapperStyle={styles.snackbarWrapper}
  action={{
    label: 'FERMER',
    onPress: () => setSnackbarVisible(false),
  }}
>
  {snackbarMessage}
</Snackbar>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={navigation.goBack}>
          <Icon name="arrow-back" size={24} style={styles.icon} />
        </TouchableOpacity>
        <Text style={styles.title}>{isEdit ? 'Modifier' : 'Nouvelle'} dépense</Text>
        <TouchableOpacity onPress={navigation.goBack}>
          <Icon name="close" size={24} style={styles.icon} />
        </TouchableOpacity>
      </View>

      {/* FORM */}
      <View style={styles.form}>
        <Text style={styles.label}>Raison</Text>
        <TextInput
          value={raison}
          onChangeText={setRaison}
          style={styles.input}
          underlineColor="transparent"
          activeUnderlineColor="transparent"
        />

        <Text style={styles.label}>Montant</Text>
        <TextInput
          value={montant}
          onChangeText={setMontant}
          keyboardType="numeric"
          style={styles.input}
          underlineColor="transparent"
          activeUnderlineColor="transparent"
        />

        <Text style={styles.label}>Date</Text>
        <View style={styles.inputWithIcon}>
          <TextInput
            value={formatDate(date)}
            editable={false}
            style={styles.flexInput}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
          />
          <TouchableOpacity onPress={() => setShowDate(true)}>
            <Icon name="event" size={22} color="#666" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Heure</Text>
        <View style={styles.inputWithIcon}>
          <TextInput
            value={formatTime(heure)}
            editable={false}
            style={styles.flexInput}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
          />
          <TouchableOpacity onPress={() => setShowHeure(true)}>
            <Icon name="schedule" size={22} color="#666" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>

        {showDate && (
          <DateTimePicker value={date} mode="date" display="default" onChange={onChangeDate} />
        )}
        {showHeure && (
          <DateTimePicker value={heure} mode="time" display="default" onChange={onChangeHeure} />
        )}

        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={submitting}
          style={styles.button}
          labelStyle={{ color: '#fff' }}
        >
          {submitting ? <ActivityIndicator color="#fff" /> : isEdit ? 'Enregistrer' : 'Valider'}
        </Button>
      </View>
    </View>
  );
}