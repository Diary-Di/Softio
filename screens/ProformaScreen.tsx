import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import { styles } from '../styles/ProformaStyles';

export default function ProformaScreen() {
  const [form, setForm] = useState({
    reference: '',
    designation: '',
    prix: '',
    quantite: '',
    montant: '',
  });

  const update = (key: keyof typeof form, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const addToCart = () => {
    console.log('Produit ajouté :', form);
    /*  your logic here  */
  };

  return (
    <View style={styles.container}>
      {/* Reference */}
      <Text style={styles.label}>Référence</Text>
      <TextInput
        style={styles.input}
        value={form.reference}
        onChangeText={txt => update('reference', txt)}
      />

      {/* Designation */}
      <Text style={styles.label}>Désignation</Text>
      <TextInput
        style={styles.input}
        value={form.designation}
        onChangeText={txt => update('designation', txt)}
      />

      {/* Prix */}
      <Text style={styles.label}>Prix</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={form.prix}
        onChangeText={txt => update('prix', txt)}
      />

      {/* Quantité */}
      <Text style={styles.label}>Quantité</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={form.quantite}
        onChangeText={txt => update('quantite', txt)}
      />

      {/* Montant */}
      <Text style={styles.label}>Montant</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={form.montant}
        onChangeText={txt => update('montant', txt)}
      />

      {/* Bouton */}
      <TouchableOpacity style={styles.button} onPress={addToCart}>
        <Text style={styles.buttonText}>Ajouter au panier</Text>
      </TouchableOpacity>
    </View>
  );
}