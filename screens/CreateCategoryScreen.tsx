import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createCategoryStyles as styles } from '../styles/CreateCategoryStyles';

export default function CreateCategoryScreen() {
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');

	const handleCreate = () => {
		if (!name.trim()) {
			Alert.alert('Erreur', "Le nom de la catégorie est requis");
			return;
		}
		// Placeholder: replace with API call or state update
		Alert.alert('Catégorie créée', `${name}\n${description}`);
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<Ionicons name="albums-outline" size={22} color="#333" />
				<Text style={styles.title}>Créer une catégorie</Text>
			</View>

			<View style={styles.form}>
				<Text style={styles.label}>Nom</Text>
				<TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nom de la catégorie" />

				<Text style={styles.label}>Description</Text>
				<TextInput
					style={[styles.input, styles.textarea]}
					value={description}
					onChangeText={setDescription}
					placeholder="Description (optionnelle)"
					multiline
				/>

				<TouchableOpacity style={styles.button} onPress={handleCreate} activeOpacity={0.8}>
					<Text style={styles.buttonText}>Enregistrer</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}



