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
import { productScreenStyles as styles } from '../styles/productScreenStyles'; // ré-utilisé

type PriceItem = {
  id: string;
  ref: string;
  designation: string;
  lastUpdate: string; // ISO
  unitPrice: number;
};

const MOCK_PRICES: PriceItem[] = [
  { id: '1', ref: 'REF001', designation: 'Laptop Dell XPS 13', lastUpdate: '2025-11-20', unitPrice: 1299.99 },
  { id: '2', ref: 'REF002', designation: 'iPhone 14 Pro 256 GB', lastUpdate: '2025-11-22', unitPrice: 1159.99 },
  { id: '3', ref: 'REF003', designation: 'Galaxy S23 Ultra', lastUpdate: '2025-11-18', unitPrice: 899.99 },
  { id: '4', ref: 'REF004', designation: 'MacBook Air M2 13"', lastUpdate: '2025-11-24', unitPrice: 1499.99 },
  { id: '5', ref: 'REF005', designation: 'PlayStation 5 Digital', lastUpdate: '2025-11-15', unitPrice: 499.99 },
];

type Props = { onScroll?: any };

export default function PriceScreen({ onScroll }: Props) {
  const [prices, setPrices] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPrices = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      setPrices(MOCK_PRICES);
      if (isRefreshing) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erreur', 'Impossible de charger les prix');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPrices(true);
  }, [fetchPrices]);

  useEffect(() => { fetchPrices(); }, [fetchPrices]);

  const handleRowPress = (p: PriceItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(p.designation, `Ref: ${p.ref}\nPrix: ${p.unitPrice.toFixed(2)} €\nMis à jour: ${p.lastUpdate}`);
  };

  const handleMenu = (p: PriceItem, e: any) => {
    e.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Options prix',
      `${p.designation}`,
      [
        { text: 'Modifier', onPress: () => Alert.alert('Modifier', p.ref) },
        { text: 'Supprimer', style: 'destructive', onPress: () => setPrices((prev) => prev.filter((x) => x.id !== p.id)) },
        { text: 'Détails', onPress: () => handleRowPress(p) },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  const renderItem = ({ item }: { item: PriceItem }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleRowPress(item)} activeOpacity={0.9}>
      <Image source={{ uri: `https://picsum.photos/seed/${item.ref}/400/400` }} style={styles.cardImage} />
      <View style={styles.cardInfo}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardName} numberOfLines={2}>{item.designation}</Text>
          <TouchableOpacity style={styles.menuButton} onPress={(e) => handleMenu(item, e)}>
            <Ionicons name="ellipsis-vertical" size={18} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Ref:</Text>
          <Text style={styles.metaValue}>{item.ref}</Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>MàJ:</Text>
          <Text style={styles.metaValue}>{item.lastUpdate}</Text>
        </View>

        <Text style={styles.cardPrice}>{item.unitPrice.toFixed(2)} €</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="pricetag-outline" size={72} color="#ccc" />
      <Text style={styles.emptyText}>Aucun prix référencé</Text>
      <Text style={styles.emptySubText}>Ajoutez votre premier tarif avec le bouton « + »</Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Chargement des prix...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={prices}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={prices.length ? styles.listContent : styles.listContentCenter}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll} // ➜ relayé vers withFadeBar
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={renderEmpty}
      />

      <TouchableOpacity style={styles.fab} onPress={() => Alert.alert('Ajouter prix')}>
        <Ionicons name="add" size={26} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}