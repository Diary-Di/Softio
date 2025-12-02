import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import { useState, useEffect, useCallback } from "react";
import { Alert, FlatList, LayoutAnimation, Linking, Platform, Pressable, Text, TouchableOpacity, UIManager, View, RefreshControl, ActivityIndicator } from "react-native";
import FloatingBottomBarCustomer from '../components/FloatingBottomBarCustomer';
import styles from "../styles/CustomerScreenStyles";
import { productScreenStyles as productStyles } from '../styles/productScreenStyles';
import { customerService } from '../services/customerService';

type Customer = {
  id?: string;
  email: string; // Clé primaire
  type: 'particulier' | 'entreprise';
  sigle?: string;
  nom?: string;
  prenoms?: string;
  adresse?: string;
  telephone?: string;
  nif?: string;
  stat?: string;
  raison_social?: string;
  created_at?: string;
  updated_at?: string;
};

export default function CustomerScreen() {
  // Enable LayoutAnimation on Android
  if (Platform.OS === "android") {
    UIManager.setLayoutAnimationEnabledExperimental?.(true);
  }

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<any>();

  // Fonction pour charger les clients
  const loadCustomers = useCallback(async () => {
    try {
      setError(null);
      const data = await customerService.getCustomers();
      setCustomers(data || []);
    } catch (error: any) {
      console.error('❌ Erreur chargement clients:', error);
      setError(error.message || 'Impossible de charger les clients');
      Alert.alert('Erreur', error.message || 'Impossible de charger les clients');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Chargement initial
  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCustomers();
  }, [loadCustomers]);

  // Formatage du nom complet
  const getFullName = (customer: Customer): string => {
    if (customer.type === 'particulier') {
      return `${customer.prenoms || ''} ${customer.nom || ''}`.trim();
    } else {
      return customer.sigle || customer.raison_social || 'Entreprise';
    }
  };

  // Initiales pour l'avatar
  const getInitials = (customer: Customer): string => {
    if (customer.type === 'particulier') {
      return `${customer.prenoms?.[0] || ''}${customer.nom?.[0] || ''}`.toUpperCase();
    } else {
      return customer.sigle?.[0] || customer.raison_social?.[0] || 'E';
    }
  };

  // Formatage de la raison sociale
  const getRaisonSocial = (customer: Customer): string => {
    if (customer.type === 'particulier') {
      return `${customer.prenoms || ''} ${customer.nom || ''}`.trim();
    } else {
      return customer.sigle || customer.raison_social || 'Entreprise';
    }
  };

  const renderField = (label: string, value: string | undefined) => (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}:</Text>
      <Text style={styles.fieldValue}>{value || 'Non renseigné'}</Text>
    </View>
  );

  const toggle = (email: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === email ? null : email));
  };

  // Fonction pour supprimer un client
  const handleDeleteCustomer = async (email: string, name: string) => {
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
              await customerService.deleteCustomer(email);
              Alert.alert('Succès', 'Client supprimé avec succès');
              // Recharger la liste
              loadCustomers();
            } catch (error: any) {
              Alert.alert('Erreur', error.message || 'Erreur lors de la suppression');
            }
          }
        },
      ]
    );
  };

  // Fonction pour éditer un client
  const handleEditCustomer = (customer: Customer) => {
    navigation.navigate('EditCustomer', { customer });
  };

  const renderItem = ({ item }: { item: Customer }) => {
    const isExpanded = expandedId === item.email;
    const fullName = getFullName(item);
    const initials = getInitials(item);

    return (
      <Pressable
        onPress={() => toggle(item.email)}
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
            <Text style={styles.email}>{item.email}</Text>
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>
                {item.type === 'particulier' ? 'Particulier' : 'Entreprise'}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => toggle(item.email)}
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

            {/* Action buttons */}
            <View style={styles.actionRow}>
              {item.telephone && (
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
                  accessibilityLabel={`Appeler ${fullName}`}
                >
                  <Ionicons name="call" size={24} color="#2563EB" />
                </Pressable>
              )}

              {item.email && (
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
                  accessibilityLabel={`Email ${fullName}`}
                >
                  <Ionicons name="mail" size={24} color="#059669" />
                </Pressable>
              )}

              <Pressable
                style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.8 : 1 }]}
                android_ripple={{ color: 'rgba(0,0,0,0.08)', borderless: true }}
                onPress={() => handleEditCustomer(item)}
                accessibilityLabel={`Editer ${fullName}`}
              >
                <Ionicons name="create" size={24} color="#F59E0B" />
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.8 : 1 }]}
                android_ripple={{ color: 'rgba(0,0,0,0.08)', borderless: true }}
                onPress={() => handleDeleteCustomer(item.email, fullName)}
                accessibilityLabel={`Supprimer ${fullName}`}
              >
                <Ionicons name="trash" size={24} color="#DC2626" />
              </Pressable>
            </View>
          </View>
        )}
      </Pressable>
    );
  };

  // Écran de chargement
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Chargement des clients...</Text>
      </View>
    );
  }

  // Écran d'erreur
  if (error && customers.length === 0) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <Ionicons name="alert-circle-outline" size={64} color="#DC2626" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadCustomers}
        >
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Clients</Text>
      
      {customers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyText}>Aucun client pour le moment</Text>
          <Text style={styles.emptySubtext}>Ajoutez votre premier client en cliquant sur le bouton +</Text>
        </View>
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(item) => item.email}
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
          ListHeaderComponent={
            <Text style={styles.countText}>
              {customers.length} client{customers.length > 1 ? 's' : ''}
            </Text>
          }
        />
      )}
      
      {/* FAB pour créer un nouveau client */}
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