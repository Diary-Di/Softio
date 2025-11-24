import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import { useState } from "react";
import { Alert, FlatList, LayoutAnimation, Linking, Platform, Pressable, Text, TouchableOpacity, UIManager, View } from "react-native";
import FloatingBottomBarCustomer from '../components/FloatingBottomBarCustomer';
import styles from "../styles/CustomerScreenStyles";
import { productScreenStyles as productStyles } from '../styles/productScreenStyles';

type Customer = {
  id: string;
  raisonSocial: string;
  nom: string;
  prenom: string;
  adresse: string;
  telephone: string;
  email: string;
  nif: string;
  stat: string;
};

const SAMPLE_CUSTOMERS: Customer[] = [
  {
    id: "1",
    raisonSocial: "SARL Les Fleurs",
    nom: "Dupont",
    prenom: "Marie",
    adresse: "12 Rue des Lilas, 75000 Paris",
    telephone: "+33 1 23 45 67 89",
    email: "marie.dupont@example.com",
    nif: "FR123456789",
    stat: "Actif",
  },
  {
    id: "2",
    raisonSocial: "EURL Boulangerie",
    nom: "Martin",
    prenom: "Paul",
    adresse: "3 Avenue du Pain, 69000 Lyon",
    telephone: "+33 4 56 78 90 12",
    email: "paul.martin@example.com",
    nif: "FR987654321",
    stat: "Actif",
  },
];

export default function CustomerScreen() {
  // Enable LayoutAnimation on Android
  if (Platform.OS === "android") {
    UIManager.setLayoutAnimationEnabledExperimental?.(true);
  }

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const navigation = useNavigation<any>();

  const renderField = (label: string, value: string) => (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}:</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );

  const toggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const renderItem = ({ item }: { item: Customer }) => {
    const isExpanded = expandedId === item.id;
    const initials = `${item.prenom?.[0] ?? ""}${item.nom?.[0] ?? ""}`.toUpperCase();

    return (
      <Pressable
        onPress={() => toggle(item.id)}
        style={styles.card}
        accessibilityLabel={`Client ${item.prenom} ${item.nom}`}
      >
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <Text style={styles.name}>{item.prenom} {item.nom}</Text>

          <Pressable
            onPress={() => toggle(item.id)}
            style={({ pressed }) => [
              styles.chevronButton,
              { opacity: pressed ? 0.85 : 1, transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] },
            ]}
            accessibilityLabel={isExpanded ? 'Réduire les détails' : 'Développer les détails'}
          >
            <Ionicons name="chevron-down" size={20} color="#4F46E5" />
          </Pressable>
        </View>

        {isExpanded && (
          <View style={styles.expanded}
          >
            {renderField("Raison social", item.raisonSocial)}
            {renderField("Adresse", item.adresse)}
            {renderField("Telephone", item.telephone)}
            {renderField("Email", item.email)}
            {renderField("NIF", item.nif)}
            {renderField("STAT", item.stat)}
            {/* Editeur removed */}

            {/* Action buttons */}
            <View style={styles.actionRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  { opacity: pressed ? 0.8 : 1 },
                ]}
                android_ripple={{ color: 'rgba(0,0,0,0.08)', borderless: true }}
                onPress={() => {
                  const url = `tel:${item.telephone}`;
                  Linking.canOpenURL(url).then((supported) => {
                    if (supported) Linking.openURL(url);
                    else Alert.alert("Appel impossible", "Votre appareil ne peut pas passer d'appels.");
                  });
                }}
                accessibilityLabel={`Call ${item.prenom} ${item.nom}`}
              >
                <Ionicons name="call" size={24} color="#2563EB" />
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.8 : 1 }]}
                android_ripple={{ color: 'rgba(0,0,0,0.08)', borderless: true }}
                onPress={() => {
                  const url = `mailto:${item.email}`;
                  Linking.canOpenURL(url).then((supported) => {
                    if (supported) Linking.openURL(url);
                    else Alert.alert("Email impossible", "Votre appareil ne peut pas envoyer d'emails.");
                  });
                }}
                accessibilityLabel={`Email ${item.prenom} ${item.nom}`}
              >
                <Ionicons name="mail" size={24} color="#059669" />
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.8 : 1 }]}
                android_ripple={{ color: 'rgba(0,0,0,0.08)', borderless: true }}
                onPress={() => Alert.alert("Edit", `Editer ${item.prenom} ${item.nom}`)}
                accessibilityLabel={`Edit ${item.prenom} ${item.nom}`}
              >
                <Ionicons name="create" size={24} color="#F59E0B" />
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.8 : 1 }]}
                android_ripple={{ color: 'rgba(0,0,0,0.08)', borderless: true }}
                onPress={() =>
                  Alert.alert(
                    "Supprimer",
                    `Voulez-vous supprimer ${item.prenom} ${item.nom} ?`,
                    [
                      { text: "Annuler", style: "cancel" },
                      { text: "Supprimer", style: "destructive", onPress: () => console.log("delete", item.id) },
                    ]
                  )
                }
                accessibilityLabel={`Delete ${item.prenom} ${item.nom}`}
              >
                <Ionicons name="trash" size={24} color="#DC2626" />
              </Pressable>
            </View>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Clients</Text>
      <FlatList
        data={SAMPLE_CUSTOMERS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
      {/* Reuse FAB from ProductScreen to open CreateCustomer */}
      <TouchableOpacity
        style={[productStyles.fab, { bottom: 92 }]}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('CreateCustomer')}
      >
        <Ionicons name="add" size={26} color="#fff" />
      </TouchableOpacity>
      {/* Customer-specific floating bottom bar */}
      <FloatingBottomBarCustomer active="client" />
    </View>
  );
}
