import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { productScreenStyles as styles } from '../styles/productScreenStyles';

type Category = {
  id: string;
  name: string;
  description: string;
};

const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'Informatique', description: 'PC, laptops, accessoires' },
  { id: '2', name: 'Téléphonie', description: 'Smartphones, coques, chargeurs' },
  { id: '3', name: 'Gaming', description: 'Consoles, jeux, manettes' },
  { id: '4', name: 'Audio', description: 'Casques, enceintes, micros' },
  { id: '5', name: 'Bureautique', description: 'Imprimantes, papeterie, fournitures' },
];

type Props = { onScroll?: any };

export default function CategoryScreen({ onScroll }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCategories = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 900));
      setCategories(MOCK_CATEGORIES);
      if (isRefreshing) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erreur', 'Impossible de charger les catégories');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCategories(true);
  }, [fetchCategories]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleRowPress = (c: Category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(c.name, c.description);
  };

  const handleMenu = (c: Category, e: any) => {
    e.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Options catégorie',
      `${c.name}`,
      [
        { text: 'Modifier', onPress: () => Alert.alert('Modifier', c.name) },
        { text: 'Supprimer', style: 'destructive', onPress: () => setCategories((prev) => prev.filter((x) => x.id !== c.id)) },
        { text: 'Détails', onPress: () => handleRowPress(c) },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  const renderItem = ({ item }: { item: Category }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleRowPress(item)} activeOpacity={0.9}>
      <Image source={{ uri: `https://picsum.photos/seed/${item.id}/400/400` }} style={styles.cardImage} />
      <View style={styles.cardInfo}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          <TouchableOpacity style={styles.menuButton} onPress={(e) => handleMenu(item, e)}>
            <Ionicons name="ellipsis-vertical" size={18} color="#666" />
          </TouchableOpacity>
        </View>

        <Text style={styles.metaValue}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="albums-outline" size={72} color="#ccc" />
      <Text style={styles.emptyText}>Aucune catégorie</Text>
      <Text style={styles.emptySubText}>Créez votre première catégorie avec le bouton « + »</Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Chargement des catégories...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={categories.length ? styles.listContent : styles.listContentCenter}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll} // ➜ relayé vers withFadeBar
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={renderEmpty}
      />

      <TouchableOpacity style={styles.fab} onPress={() => Alert.alert('Ajouter catégorie')}>
        <Ionicons name="add" size={26} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}