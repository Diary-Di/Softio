
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, FlatList, LayoutAnimation, Platform, Pressable, Text, UIManager, View } from "react-native";
import styles from "../styles/SalesScreenStyles";

type Sale = {
  id: string;
  user: string;
  product: string;
  quantity: number;
  total: number;
  date: string;
};

const SAMPLE_SALES: Sale[] = [
  {
    id: "1",
    user: "Marie Dupont",
    product: "Bouquet de Roses",
    quantity: 3,
    total: 45.0,
    date: "2025-11-20",
  },
  {
    id: "2",
    user: "Paul Martin",
    product: "Pain Complet",
    quantity: 10,
    total: 20.0,
    date: "2025-11-21",
  },
];

export default function SaleScreen() {
  // Enable LayoutAnimation on Android
  if (Platform.OS === "android") {
    UIManager.setLayoutAnimationEnabledExperimental?.(true);
  }

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const renderField = (label: string, value: string | number) => (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}:</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );

  const toggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const renderItem = ({ item }: { item: Sale }) => {
    const isExpanded = expandedId === item.id;
    const initials = item.user
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

    return (
      <Pressable
        onPress={() => toggle(item.id)}
        style={styles.card}
        accessibilityLabel={`Vente par ${item.user}`}
      >
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <Text style={styles.name}>{item.user}</Text>

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
          <View style={styles.expanded}>
            {renderField("Produit", item.product)}
            {renderField("Quantité", item.quantity)}
            {renderField("Total (€)", item.total.toFixed(2))}
            {renderField("Date", item.date)}

            <View style={styles.actionRow}>
              <Pressable
                style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.8 : 1 }]}
                android_ripple={{ color: 'rgba(0,0,0,0.08)', borderless: true }}
                onPress={() => Alert.alert("Détails", `Voir détails de la vente #${item.id}`)}
                accessibilityLabel={`Voir détails vente ${item.id}`}
              >
                <Ionicons name="information-circle" size={24} color="#2563EB" />
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.8 : 1 }]}
                android_ripple={{ color: 'rgba(0,0,0,0.08)', borderless: true }}
                onPress={() => Alert.alert("Supprimer", `Voulez-vous supprimer la vente #${item.id} ?`, [
                  { text: "Annuler", style: "cancel" },
                  { text: "Supprimer", style: "destructive", onPress: () => console.log("delete", item.id) },
                ])}
                accessibilityLabel={`Supprimer vente ${item.id}`}
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
      <Text style={styles.title}>Ventes</Text>
      <FlatList
        data={SAMPLE_SALES}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
