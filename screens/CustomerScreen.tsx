// screens/CustomerScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    LayoutAnimation,
    Linking,
    Platform,
    Pressable,
    RefreshControl,
    Text,
    TextInput,
    TouchableOpacity,
    UIManager,
    View
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import FloatingBottomBarCustomer from '../components/FloatingBottomBarCustomer';
import { Customer, customerService } from '../services/customerService';
import styles from "../styles/CustomerScreenStyles";
import { productScreenStyles as productStyles } from '../styles/productScreenStyles';
import Pagination, { usePagination } from '../components/Pagination';

export default function CustomerScreen() {
  if (Platform.OS === "android") {
    UIManager.setLayoutAnimationEnabledExperimental?.(true);
  }

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [customerType, setCustomerType] = useState<'all' | 'particulier' | 'entreprise'>('all');
  const [searchFocused, setSearchFocused] = useState(false);
  const navigation = useNavigation<any>();

  // Utilisation du hook de pagination réutilisable
  const { currentPage, itemsPerPage, paginateData, goToPage, resetPage } = usePagination(10);
  const flatListRef = useRef<FlatList>(null);

  // Filtrer les clients
  useEffect(() => {
    let filtered = [...customers];
    
    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(customer =>
        (customer.nom?.toLowerCase().includes(query)) ||
        (customer.prenoms?.toLowerCase().includes(query)) ||
        (customer.sigle?.toLowerCase().includes(query)) ||
        (customer.email?.toLowerCase().includes(query)) ||
        (customer.telephone?.includes(query)) ||
        (customer.adresse?.toLowerCase().includes(query))
      );
    }
    
    // Filtre par type
    if (customerType !== 'all') {
      filtered = filtered.filter(customer => customer.type === customerType);
    }
    
    setFilteredCustomers(filtered);
    resetPage(); // Réinitialiser la pagination quand les filtres changent
  }, [customers, searchQuery, customerType, resetPage]);

  // Charger les clients
  const loadCustomers = useCallback(async () => {
    try {
      setError(null);
      // Ajouter des paramètres pour le filtrage côté serveur si nécessaire
      const params: any = {};
      if (customerType !== 'all') {
        params.type = customerType;
      }
      if (searchQuery.trim()) {
        params.q = searchQuery.trim();
      }
      
      const data = await customerService.getCustomers(params);
      setCustomers(data || []);
    } catch (error: any) {
      console.error('❌ Erreur chargement clients:', error);
      setError(error.message || 'Impossible de charger les clients');
      
      // Afficher une alerte pour les erreurs graves
      if (error.code === 500) {
        Alert.alert('Erreur serveur', 'Impossible de contacter le serveur. Veuillez réessayer plus tard.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [customerType, searchQuery]);

  // Recharger quand l'écran obtient le focus
  useFocusEffect(
    useCallback(() => {
      loadCustomers();
    }, [loadCustomers])
  );

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCustomers();
  }, [loadCustomers]);

  // Fonctions utilitaires
  const getFullName = (customer: Customer): string => {
    if (customer.type === 'particulier') {
      return `${customer.prenoms || ''} ${customer.nom || ''}`.trim();
    } else {
      return customer.sigle || 'Entreprise';
    }
  };

  const getInitials = (customer: Customer): string => {
    if (customer.type === 'particulier') {
      return `${customer.prenoms?.[0] || ''}${customer.nom?.[0] || ''}`.toUpperCase();
    } else {
      return customer.sigle?.[0] || 'E';
    }
  };

  // Nouvelle fonction : nettoyer le numéro et ouvrir le dialer
  const cleanPhone = (phone: string) => {
    return phone.replace(/[^0-9+]/g, '');
  };

  const initiateCall = async (phone?: string) => {
    if (!phone) {
      Alert.alert('Numéro invalide', 'Aucun numéro de téléphone disponible.');
      return;
    }

    const cleaned = phone.replace(/[^0-9+]/g, '');
    if (!cleaned) {
      Alert.alert('Numéro invalide', 'Le numéro ne contient aucun chiffre.');
      return;
    }

    const url = `tel:${cleaned}`;
    try {
      await Linking.openURL(url);
    } catch (err: any) {
      console.error('Erreur appel :', err);
      Alert.alert(
        'Appel impossible',
        'Aucune application téléphonique disponible ou numéro incorrect.'
      );
    }
  };

  const renderField = (label: string, value: string | undefined) => (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}:</Text>
      <Text style={styles.fieldValue}>{value || 'Non renseigné'}</Text>
    </View>
  );

  const toggle = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Effacer la recherche
  const clearSearch = () => {
    setSearchQuery("");
  };

  // Nouveau rendu de la pagination
  const renderPagination = useCallback(() => {
    if (filteredCustomers.length <= itemsPerPage) return null;

    return (
      <View style={{ marginBottom: 150 }}> {/* Espace pour le FAB */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredCustomers.length}
          itemsPerPage={itemsPerPage}
          onPageChange={goToPage}
          variant="default"
          showInfo={true}
          hapticFeedback={true}
        />
      </View>
    );
  }, [currentPage, filteredCustomers.length, itemsPerPage, goToPage]);

  // Render item
  const renderItem = ({ item }: { item: Customer }) => {
    const isExpanded = expandedId === item.identifiant;
    const fullName = getFullName(item);
    const initials = getInitials(item);

    return (
      <Pressable
        onPress={() => toggle(item.identifiant)}
        style={styles.card}
        accessibilityLabel={`Client ${fullName}`}
      >
        <View style={styles.headerRow}>
          <View style={[
            styles.avatar,
            item.type === 'entreprise' ? styles.avatarEnterprise : styles.avatarParticulier
          ]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <View style={styles.nameContainer}>
            <Text style={styles.name}>{fullName}</Text>
            <Text style={styles.email}>{item.email || 'Aucun email'}</Text>
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>
                {item.type === 'particulier' ? 'Particulier' : 'Entreprise'}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => toggle(item.identifiant)}
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
            {renderField("Type", item.type === 'particulier' ? 'Particulier' : 'Entreprise')}
            
            {item.type === 'entreprise' && renderField("SIGLE", item.sigle)}
            {item.type === 'particulier' && renderField("Nom", item.nom)}
            {item.type === 'particulier' && renderField("Prénom", item.prenoms)}
            
            {renderField("Adresse", item.adresse)}
            {renderField("Téléphone", item.telephone)}
            {renderField("Email", item.email)}
            
            {item.type === 'entreprise' && renderField("NIF", item.nif)}
            {item.type === 'entreprise' && renderField("STAT", item.stat)}

            <View style={styles.actionRow}>
              {item.telephone && (
                <Pressable
                  style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.8 : 1 }]}
                  onPress={() => initiateCall(item.telephone)}
                >
                  <Ionicons name="call" size={24} color="#2563EB" />
                </Pressable>
              )}

              {item.email && (
                <Pressable
                  style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.8 : 1 }]}
                  onPress={() => {
                    const url = `mailto:${item.email}`;
                    Linking.canOpenURL(url).then((supported) => {
                      if (supported) Linking.openURL(url);
                      else Alert.alert("Email impossible", "Votre appareil ne peut pas envoyer d'emails.");
                    });
                  }}
                >
                  <Ionicons name="mail" size={24} color="#059669" />
                </Pressable>
              )}

              <Pressable
                style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.8 : 1 }]}
                onPress={() => {
                  navigation.navigate('EditCustomer', {
                    id: item.identifiant.toString(),
                    type: item.type,
                    nom: item.nom || '',
                    prenoms: item.prenoms || '',
                    sigle: item.sigle || '',
                    adresse: item.adresse || '',
                    telephone: item.telephone || '',
                    email: item.email || '',
                    nif: item.nif || '',
                    stat: item.stat || ''
                  });
                }}
              >
                <Ionicons name="pencil" size={24} color="#F59E0B" />
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.8 : 1 }]}
                onPress={() => handleDeleteCustomer(item.identifiant, fullName)}
              >
                <Ionicons name="trash" size={24} color="#DC2626" />
              </Pressable>
            </View>
          </View>
        )}
      </Pressable>
    );
  };

  // Actions
  const handleDeleteCustomer = async (id: number, name: string) => {
    Alert.alert(
      "Supprimer",
      `Voulez-vous supprimer ${name} ?`,
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive", 
          onPress: async () => {
            try {
              await customerService.deleteCustomer(id);
              Alert.alert('Succès', 'Client supprimé avec succès');
              loadCustomers();
            } catch (error: any) {
              console.error('❌ Erreur suppression:', error);
              Alert.alert(
                'Erreur', 
                error.message || 'Erreur lors de la suppression',
                [{ text: 'OK' }]
              );
            }
          }
        },
      ]
    );
  };

  // Écran de chargement
  if (loading && customers.length === 0) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Chargement des clients...</Text>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        {/* En-tête avec titre */}
        <View style={styles.header}>
          <Text style={styles.title}>Clients</Text>
          <Text style={styles.subtitle}>
            {filteredCustomers.length} client{filteredCustomers.length > 1 ? 's' : ''}
            {customerType !== 'all' && ` (${customerType}s)`}
          </Text>
        </View>

        {/* Barre de recherche */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchInputContainer, searchFocused && styles.searchInputFocused]}>
            <Ionicons 
              name="search" 
              size={20} 
              color={searchFocused ? "#4F46E5" : "#9CA3AF"} 
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un client..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearSearch}
                accessibilityLabel="Effacer la recherche"
              >
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filtres */}
        <View style={styles.filterContainer}>
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterButton, customerType === 'all' && styles.filterButtonActive]}
              onPress={() => setCustomerType('all')}
            >
              <Text style={[styles.filterButtonText, customerType === 'all' && styles.filterButtonTextActive]}>
                Tous
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filterButton, customerType === 'particulier' && styles.filterButtonActive]}
              onPress={() => setCustomerType('particulier')}
            >
              <Text style={[styles.filterButtonText, customerType === 'particulier' && styles.filterButtonTextActive]}>
                Particuliers
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filterButton, customerType === 'entreprise' && styles.filterButtonActive]}
              onPress={() => setCustomerType('entreprise')}
            >
              <Text style={[styles.filterButtonText, customerType === 'entreprise' && styles.filterButtonTextActive]}>
                Entreprises
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Liste des clients */}
        {!Array.isArray(paginateData(filteredCustomers)) || paginateData(filteredCustomers).length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons 
              name={searchQuery ? "search-outline" : "people-outline"} 
              size={64} 
              color="#9CA3AF" 
            />
            <Text style={styles.emptyText}>
              {searchQuery || customerType !== 'all' 
                ? "Aucun client ne correspond aux critères" 
                : "Aucun client pour le moment"}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery 
                ? "Essayez avec d'autres mots-clés" 
                : customerType !== 'all'
                  ? "Essayez de modifier vos filtres"
                  : "Ajoutez votre premier client en cliquant sur le bouton +"}
            </Text>
            {(searchQuery || customerType !== 'all') && (
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={() => {
                  setSearchQuery("");
                  setCustomerType('all');
                }}
              >
                <Text style={styles.clearFiltersButtonText}>Effacer les filtres</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            // Remplacer la partie FlatList et pagination par ceci :

<FlatList
  ref={flatListRef}
  data={paginateData(filteredCustomers)}
  keyExtractor={(item) => item.identifiant.toString()}
  renderItem={renderItem}
  contentContainerStyle={styles.listContainer}
  showsVerticalScrollIndicator={false}
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={['#4F46E5']}
      tintColor="#4F46E5"
    />
  }
  keyboardShouldPersistTaps='handled'
  keyboardDismissMode='on-drag'
  ListFooterComponent={() => {
    if (filteredCustomers.length <= itemsPerPage) return null;
    
    return (
      <View style={{ paddingVertical: 20 }}>
        <Pagination
          currentPage={currentPage}
          totalItems={filteredCustomers.length}
          itemsPerPage={itemsPerPage}
          onPageChange={goToPage}
          variant="default"
          showInfo={true}
          hapticFeedback={true}
        />
      </View>
    );
  }}
/>

{/* Supprimer complètement le renderPagination() et sa déclaration */}
            
            {/* Pagination réutilisable */}
            
          </>
        )}
        
        {/* FAB */}
        <TouchableOpacity
          style={[productStyles.fab, { bottom: 92 }]}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('CreateCustomer')}
        >
          <Ionicons name="add" size={26} color="#fff" />
        </TouchableOpacity>
        
        <FloatingBottomBarCustomer active="client" />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}