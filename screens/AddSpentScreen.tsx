import React, { useState } from 'react';
import { View, Button, Text, TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from '../styles/AddSpentStyles';
import { DateTimePickerEvent } from '@react-native-community/datetimepicker';

export default function AddSpentScreen({ navigation }: any) {
  const [raison, setRaison] = useState('');
  const [montant, setMontant] = useState('');
  const [date, setDate] = useState(new Date());
  const [heure, setHeure] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [showHeure, setShowHeure] = useState(false);

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
  setShowDate(false);
  if (selectedDate) setDate(selectedDate);
};

  const onChangeHeure = (event: DateTimePickerEvent, selectedTime?: Date) => {
  setShowHeure(false);
  if (selectedTime) setHeure(selectedTime);
};

  const handleValider = () => {
    console.log({
      raison,
      montant,
      date: date.toLocaleDateString(),
      heure: heure.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} style={styles.icon} />
        </TouchableOpacity>
        <Text style={styles.title}>Dépense</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={24} style={styles.icon} />
        </TouchableOpacity>
      </View>

      {/* Formulaire */}
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
          <Button title="Choisir la date" onPress={() => setShowDate(true)} />
          <Button title="Choisir l'heure" onPress={() => setShowHeure(true)} />
        </View>

        {showDate && (
          <DateTimePicker value={date} mode="date" display="default" onChange={onChangeDate} />
        )}
        {showHeure && (
          <DateTimePicker value={heure} mode="time" display="default" onChange={onChangeHeure} />
        )}

        <Button title="Valider" onPress={handleValider} />
      </View>
    </View>
  );
}