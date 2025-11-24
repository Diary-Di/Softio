import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
    Alert,
    FlatList,
    LayoutAnimation,
    Platform,
    Pressable,
    SafeAreaView,
    Text,
    TouchableOpacity,
    UIManager,
    View
} from 'react-native';
import FloatingBottomBarCustomer from '../components/FloatingBottomBarCustomer';
import stylesHeader from '../styles/CreateCustomerStyles';
import styles from '../styles/CustomerScreenStyles';

type FollowCustomer = {
  id: string;
  raisonSocial: string;
  nom: string;
  prenom: string;
  adresse: string;
  telephone: string;
  email: string;
  facture: string;
  totalImpayee: string;
};

const SAMPLE_FOLLOW_CUSTOMERS: FollowCustomer[] = [
  {
    id: 'f1',
    raisonSocial: 'SARL Les Fleurs',
    nom: 'Dupont',
    prenom: 'Marie',
    adresse: '12 Rue des Lilas, 75000 Paris',
    telephone: '+33 1 23 45 67 89',
    email: 'marie.dupont@example.com',
    facture: 'FAC-2025-001',
    totalImpayee: '€120.50',
  },
  {
    id: 'f2',
    raisonSocial: 'EURL Boulangerie',
    nom: 'Martin',
    prenom: 'Paul',
    adresse: '3 Avenue du Pain, 69000 Lyon',
    telephone: '+33 4 56 78 90 12',
    email: 'paul.martin@example.com',
    facture: 'FAC-2025-002',
    totalImpayee: '€85.00',
  },
];

export default function CustomerFollowUpScreen() {
  // Enable LayoutAnimation on Android
  if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental?.(true);
  }

  const navigation = useNavigation<any>();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const renderField = (label: string, value: string) => (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}:</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );

  const renderItem = ({ item }: { item: FollowCustomer }) => {
    const isExpanded = expandedId === item.id;
    const initials = `${item.prenom?.[0] ?? ''}${item.nom?.[0] ?? ''}`.toUpperCase();

    return (
      <Pressable onPress={() => toggle(item.id)} style={styles.card} accessibilityLabel={`Client ${item.prenom} ${item.nom}`}>
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
          >
            <Ionicons name="chevron-down" size={20} color="#4F46E5" />
          </Pressable>
        </View>

        {isExpanded && (
          <View style={styles.expanded}>
            {renderField('Raison social', item.raisonSocial)}
            {renderField('Adresse', item.adresse)}
            {renderField('Telephone', item.telephone)}
            {renderField('Email', item.email)}
            {renderField('Facture', item.facture)}
            {renderField('Total Impayee', item.totalImpayee)}

            <View style={styles.actionRow}>
              <Pressable
                style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.9 : 1, flexDirection: 'row', justifyContent: 'center' }]}
                android_ripple={{ color: 'rgba(0,0,0,0.06)', borderless: true }}
                onPress={() => {
                  const details = `Raison social: ${item.raisonSocial}\nNom: ${item.prenom} ${item.nom}\nAdresse: ${item.adresse}\nTéléphone: ${item.telephone}\nEmail: ${item.email}\nFacture: ${item.facture}\nTotal impayée: ${item.totalImpayee}`;
                  Alert.alert('Détails du client', details, [{ text: 'OK' }]);
                }}
                accessibilityLabel={`Voir détails ${item.prenom} ${item.nom}`}
              >
                <Ionicons name="eye" size={20} color="#6366F1" />
                <Text style={{ color: '#6366F1', fontWeight: '700', marginLeft: 8 }}>Voir détails</Text>
              </Pressable>
            </View>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
      <View style={{ padding: 16 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={stylesHeader.backButton}>
          <Ionicons name="arrow-back" size={18} color="#374151" />
        </TouchableOpacity>
        <Text style={[stylesHeader.title, { marginTop: 8 }]}>Suivi des clients</Text>
      </View>

      <FlatList
        data={SAMPLE_FOLLOW_CUSTOMERS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <FloatingBottomBarCustomer active="suivi" />
    </SafeAreaView>
  );
}

