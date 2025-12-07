import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useState, useEffect, useCallback } from 'react';
import {
    Alert,
    FlatList,
    LayoutAnimation,
    Platform,
    Pressable,
    SafeAreaView,
    Text,
    UIManager,
    View,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import FloatingBottomBarCustomer from '../components/FloatingBottomBarCustomer';
import stylesHeader from '../styles/CreateCustomerStyles';
import styles from '../styles/CustomerScreenStyles';
import { salesService, Sale } from '../services/salesService';
import { customerService } from '../services/customerService';

// Interface pour les données combinées
type FollowCustomer = {
  id: string;
  email: string;
  raisonSocial?: string;
  nom?: string;
  prenom?: string;
  adresse?: string;
  telephone?: string;
  type: 'particulier' | 'entreprise';
  // Données de vente
  facture?: string;
  totalImpayee: number;
  totalAchats: number;
  derniereAchat?: string;
  nombreAchats: number;
  // Informations spécifiques
  sigle?: string;
  nif?: string;
  stat?: string;
};

export default function CustomerFollowUpScreen() {
  // Enable LayoutAnimation on Android
  if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental?.(true);
  }

  const navigation = useNavigation<any>();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [customers, setCustomers] = useState<FollowCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Fonction utilitaire pour convertir en nombre
  const toNumber = (value: any): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Enlever les symboles de devise et les espaces
      const cleaned = value.replace(/[^\d.,-]/g, '').replace(',', '.');
      const num = parseFloat(cleaned);
      return isNaN(num) ? 0 : num;
    }
    return 0;
  };

  // Fonction pour charger les données
  const loadCustomersData = useCallback(async () => {
    try {
      setError(null);
      
      // 1. Récupérer tous les clients
      const customersData = await customerService.getCustomers();
      
      if (!customersData || customersData.length === 0) {
        setCustomers([]);
        setLoading(false);
        return;
      }

      // 2. Récupérer toutes les ventes
      let allSales: Sale[] = [];
      try {
        allSales = await salesService.getSales();
      } catch (salesError) {
        console.warn('Erreur lors de la récupération des ventes:', salesError);
        // Continuer sans les données de vente
      }

      // 3. Grouper les ventes par client (email)
      const salesByCustomer: Record<string, Sale[]> = {};
      allSales.forEach((sale: Sale) => {
        if (sale.email) {
          if (!salesByCustomer[sale.email]) {
            salesByCustomer[sale.email] = [];
          }
          salesByCustomer[sale.email].push(sale);
        }
      });

      // 4. Combiner les données clients avec les statistiques de vente
      const combinedData = customersData.map((customer: any) => {
        const customerEmail = customer.email;
        const customerSales = salesByCustomer[customerEmail] || [];
        
        // Convertir et calculer les statistiques de vente
        const totalImpayee = customerSales
          .filter((sale: Sale) => sale.condition_paiement === 'impayé')
          .reduce((sum: number, sale: Sale) => sum + toNumber(sale.montant_paye), 0);
        
        const totalAchats = customerSales
          .reduce((sum: number, sale: Sale) => sum + toNumber(sale.montant_paye), 0);
        
        // Trouver la dernière facture
        const derniereFacture = customerSales.length > 0 
          ? customerSales.reduce((latest: Sale, sale: Sale) => {
              const latestDate = latest.date_achat ? new Date(latest.date_achat).getTime() : 0;
              const saleDate = sale.date_achat ? new Date(sale.date_achat).getTime() : 0;
              return saleDate > latestDate ? sale : latest;
            })
          : null;

        // Déterminer le nom à afficher
        let displayName = '';
        let displayFirstName = '';
        
        if (customer.type === 'entreprise') {
          displayName = customer.sigle || customer.nom || '';
          displayFirstName = customer.nom || '';
        } else {
          displayName = customer.nom || '';
          displayFirstName = customer.prenoms || 'Client';
        }

        // Créer l'objet combiné
        const followCustomer: FollowCustomer = {
          id: `customer_${customerEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
          email: customerEmail,
          type: customer.type,
          raisonSocial: customer.type === 'entreprise' ? (customer.sigle || customer.nom) : undefined,
          nom: displayName,
          prenom: displayFirstName,
          adresse: customer.adresse || 'Adresse non spécifiée',
          telephone: customer.telephone || 'Non renseigné',
          sigle: customer.sigle,
          nif: customer.nif,
          stat: customer.stat,
          facture: derniereFacture?.ref_facture || 'Aucune facture',
          totalImpayee: toNumber(totalImpayee),
          totalAchats: toNumber(totalAchats),
          derniereAchat: derniereFacture?.date_achat,
          nombreAchats: customerSales.length
        };

        return followCustomer;
      });

      // Trier par total impayé décroissant
      const sortedData = combinedData.sort((a: { totalImpayee: number; }, b: { totalImpayee: number; }) => b.totalImpayee - a.totalImpayee);
      
      setCustomers(sortedData);
    } catch (err: any) {
      console.error('Erreur lors du chargement des clients:', err);
      setError(err.message || 'Erreur lors du chargement des données');
      Alert.alert('Erreur', 'Impossible de charger la liste des clients');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Chargement initial
  useEffect(() => {
    loadCustomersData();
  }, [loadCustomersData]);

  // Fonction de rafraîchissement
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCustomersData();
  }, [loadCustomersData]);

  const renderField = (label: string, value: string) => (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}:</Text>
      <Text style={styles.fieldValue}>{value || 'Non renseigné'}</Text>
    </View>
  );

  // Formatter la date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Jamais';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Formatter le montant (version sécurisée)
  const formatCurrency = (amount: any) => {
    const num = toNumber(amount);
    return `€${num.toFixed(2)}`;
  };

  const renderItem = ({ item }: { item: FollowCustomer }) => {
    const isExpanded = expandedId === item.id;
    const initials = `${item.prenom?.[0] ?? ''}${item.nom?.[0] ?? ''}`.toUpperCase();

    return (
      <Pressable 
        onPress={() => toggle(item.id)} 
        style={styles.card} 
        accessibilityLabel={`Client ${item.prenom} ${item.nom}`}
      >
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials || '?'}</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.name}>
              {item.type === 'entreprise' ? item.raisonSocial : `${item.prenom} ${item.nom}`}
            </Text>
            <Text style={styles.email}>{item.email}</Text>
            {item.totalImpayee > 0 && (
              <Text style={styles.impayeeAlert}>
                Impayé: {formatCurrency(item.totalImpayee)}
              </Text>
            )}
          </View>

          <Pressable
            onPress={() => toggle(item.id)}
            style={({ pressed }) => [
              styles.chevronButton,
              { opacity: pressed ? 0.85 : 1, transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] },
            ]}
          >
            <Ionicons name="chevron-down" size={20} color="#4F46E5" />
          </Pressable>
        </View>

        {isExpanded && (
          <View style={styles.expanded}>
            {item.type === 'entreprise' ? (
              <>
                {renderField('Raison sociale', item.raisonSocial || '')}
                {renderField('Sigle', item.sigle || '')}
                {renderField('NIF', item.nif || '')}
                {renderField('STAT', item.stat || '')}
              </>
            ) : (
              <>
                {renderField('Nom', item.nom || '')}
                {renderField('Prénom', item.prenom || '')}
              </>
            )}
            
            {renderField('Adresse', item.adresse || '')}
            {renderField('Téléphone', item.telephone || '')}
            {renderField('Email', item.email)}
            {renderField('Type', item.type === 'entreprise' ? 'Entreprise' : 'Particulier')}
            
            {/* Statistiques d'achat */}
            <View style={styles.statsSection}>
              <Text style={styles.sectionTitle}>Statistiques d'achat</Text>
              {renderField('Dernière facture', item.facture || 'Aucune')}
              {renderField('Dernier achat', formatDate(item.derniereAchat))}
              {renderField('Nombre d\'achats', item.nombreAchats?.toString() || '0')}
              {renderField('Total achats', formatCurrency(item.totalAchats || 0))}
              {renderField('Total impayé', formatCurrency(item.totalImpayee))}
            </View>

            
          </View>
        )}
      </Pressable>
    );
  };

  // Écran de chargement
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={{ marginTop: 16, color: '#6B7280' }}>Chargement des clients...</Text>
      </SafeAreaView>
    );
  }

  // Écran d'erreur
  if (error && customers.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Ionicons name="alert-circle" size={64} color="#EF4444" />
        <Text style={{ marginTop: 16, fontSize: 18, color: '#1F2937', textAlign: 'center' }}>
          Une erreur est survenue
        </Text>
        <Text style={{ marginTop: 8, color: '#6B7280', textAlign: 'center' }}>
          {error}
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            { 
              marginTop: 20, 
              backgroundColor: '#4F46E5',
              opacity: pressed ? 0.9 : 1 
            }
          ]}
          onPress={loadCustomersData}
        >
          <Text style={{ color: 'white', fontWeight: '700' }}>Réessayer</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  // Écran vide
  if (customers.length === 0 && !loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
        <View style={{ padding: 16 }}>
          <Text style={[stylesHeader.title, { marginTop: 8, textAlign: 'center' }]}>Suivi des clients</Text>
        </View>

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Ionicons name="people-outline" size={64} color="#9CA3AF" />
          <Text style={{ marginTop: 16, fontSize: 18, color: '#1F2937', textAlign: 'center' }}>
            Aucun client trouvé
          </Text>
          <Text style={{ marginTop: 8, color: '#6B7280', textAlign: 'center' }}>
            Les clients apparaîtront ici après leur création
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              { 
                marginTop: 20, 
                backgroundColor: '#4F46E5',
                opacity: pressed ? 0.9 : 1 
              }
            ]}
            onPress={() => navigation.navigate('CustomerCreation')}
          >
            <Text style={{ color: 'white', fontWeight: '700' }}>Créer un client</Text>
          </Pressable>
        </View>

        <FloatingBottomBarCustomer active="suivi" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
      <View style={{ padding: 16 }}>
        <Text style={[stylesHeader.title, { marginTop: 8, textAlign: 'center' }]}>Suivi des clients</Text>
        <Text style={{ textAlign: 'center', color: '#6B7280', marginTop: 4 }}>
          {customers.length} client{customers.length > 1 ? 's' : ''} trouvé{customers.length > 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={customers}
        keyExtractor={(item) => item.id}
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
        ListFooterComponent={
          customers.length > 0 ? (
            <View style={{ padding: 16, alignItems: 'center' }}>
              <Text style={{ color: '#9CA3AF', fontSize: 12 }}>
                {customers.filter(c => c.totalImpayee > 0).length} client{customers.filter(c => c.totalImpayee > 0).length > 1 ? 's' : ''} avec impayé{customers.filter(c => c.totalImpayee > 0).length > 1 ? 's' : ''}
              </Text>
            </View>
          ) : null
        }
      />

      <FloatingBottomBarCustomer active="suivi" />
    </SafeAreaView>
  );
}