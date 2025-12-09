import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useState, useEffect, useCallback } from "react";
import { 
  Alert, 
  FlatList, 
  LayoutAnimation, 
  Linking, 
  Platform, 
  Pressable, 
  Text, 
  TouchableOpacity, 
  UIManager, 
  View, 
  RefreshControl, 
  ActivityIndicator,
  TextInput 
} from "react-native";
import FloatingBottomBarCustomer from '../components/FloatingBottomBarCustomer';
import styles from "../styles/CustomerScreenStyles";
import { productScreenStyles as productStyles } from '../styles/productScreenStyles';
import { customerService, Customer } from '../services/customerService'; // Importer le type Customer

const ITEMS_PER_PAGE = 10;

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
  const [currentPage, setCurrentPage] = useState(1);
  const [searchFocused, setSearchFocused] = useState(false);
  const navigation = useNavigation<any>();

  // Filtrer les clients
  useEffect(() => {
    let filtered = [...customers];
    
    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(customer =>
        (customer.nom?.toLowerCase().includes(query)) ||
        (customer.prenoms?.toLowerCase().includes(query)) || // Changé de prenom à prenoms
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
    setCurrentPage(1);
  }, [customers, searchQuery, customerType]);

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

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

  // Pagination
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Bouton première page
    if (startPage > 1) {
      pages.push(
        <TouchableOpacity
          key="first"
          style={styles.pageButton}
          onPress={() => goToPage(1)}
        >
          <Text style={styles.pageButtonText}>1</Text>
        </TouchableOpacity>
      );
      if (startPage > 2) {
        pages.push(<Text key="dots1" style={styles.pageDots}>...</Text>);
      }
    }
    
    // Pages numérotées
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <TouchableOpacity
          key={i}
          style={[styles.pageButton, currentPage === i && styles.activePageButton]}
          onPress={() => goToPage(i)}
        >
          <Text style={[styles.pageButtonText, currentPage === i && styles.activePageButtonText]}>
            {i}
          </Text>
        </TouchableOpacity>
      );
    }
    
    // Bouton dernière page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<Text key="dots2" style={styles.pageDots}>...</Text>);
      }
      pages.push(
        <TouchableOpacity
          key="last"
          style={styles.pageButton}
          onPress={() => goToPage(totalPages)}
        >
          <Text style={styles.pageButtonText}>{totalPages}</Text>
        </TouchableOpacity>
      );
    }
    
    return pages;
  };

  // Effacer la recherche
  const clearSearch = () => {
    setSearchQuery("");
  };

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
          onPress={() => {
            const url = `tel:${item.telephone}`;
            Linking.canOpenURL(url).then((supported) => {
              if (supported) Linking.openURL(url);
              else Alert.alert("Appel impossible", "Votre appareil ne peut pas passer d'appels.");
            });
          }}
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
    // Utiliser router.push au lieu de navigation.navigate
    navigation.navigate('EditCustomer', {
      id: item.identifiant.toString(), // Convertir en string
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
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Chargement des clients...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
      {paginatedCustomers.length === 0 ? (
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
          <FlatList
            data={paginatedCustomers}
            keyExtractor={(item) => item.identifiant.toString()} // Utiliser identifiant comme clé
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
          />
          
          {/* Pagination */}
          {totalPages > 1 && (
            <View style={styles.paginationContainer}>
              <View style={styles.paginationInfo}>
                <Text style={styles.paginationText}>
                  Page {currentPage} sur {totalPages}
                </Text>
                <Text style={styles.paginationCount}>
                  {startIndex + 1}-{Math.min(endIndex, filteredCustomers.length)} sur {filteredCustomers.length}
                </Text>
              </View>
              
              <View style={styles.paginationControls}>
                <TouchableOpacity
                  style={[styles.navButton, currentPage === 1 && styles.navButtonDisabled]}
                  onPress={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <Ionicons name="chevron-back" size={20} color={currentPage === 1 ? "#9CA3AF" : "#4F46E5"} />
                </TouchableOpacity>
                
                <View style={styles.pageNumbersContainer}>
                  {renderPageNumbers()}
                </View>
                
                <TouchableOpacity
                  style={[styles.navButton, currentPage === totalPages && styles.navButtonDisabled]}
                  onPress={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <Ionicons name="chevron-forward" size={20} color={currentPage === totalPages ? "#9CA3AF" : "#4F46E5"} />
                </TouchableOpacity>
              </View>
            </View>
          )}
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
    </View>
  );
}