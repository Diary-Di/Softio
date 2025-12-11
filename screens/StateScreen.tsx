import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const screenWidth = Dimensions.get('window').width;

export default function StateScreen({ navigation }: any) {
  const [timeRange, setTimeRange] = useState<'month' | 'year'>('month');

  /* ------------------------------------------------------------------ */
  /*  DONNÉES                                                           */
  /* ------------------------------------------------------------------ */
  const revenueByMonth = [
    { label: 'Jan', value: 300000 },
    { label: 'Fév', value: 450000 },
    { label: 'Mar', value: 280000 },
    { label: 'Avr', value: 500000 },
    { label: 'Mai', value: 420000 },
    { label: 'Juin', value: 550000 },
  ];

  const expenseItems = [
    { name: 'Achats', amount: 150000, color: '#F87171' },
    { name: 'Salaires', amount: 200000, color: '#60A5FA' },
    { name: 'Loyer', amount: 100000, color: '#34D399' },
    { name: 'Autres', amount: 50000, color: '#FBBF24' },
  ];

  const stats = [
    {
      title: 'Revenu Total',
      value: '1 250 000 FCFA',
      change: '+12,5 %',
      isPositive: true,
      icon: 'trending-up-outline',
      color: '#10B981',
    },
    {
      title: 'Dépenses Total',
      value: '500 000 FCFA',
      change: '-3,2 %',
      isPositive: false,
      icon: 'trending-down-outline',
      color: '#EF4444',
    },
    {
      title: 'Bénéfice Net',
      value: '750 000 FCFA',
      change: '+18,7 %',
      isPositive: true,
      icon: 'cash-outline',
      color: '#6366F1',
    },
    {
      title: 'Marge',
      value: '60 %',
      change: '+4,2 %',
      isPositive: true,
      icon: 'bar-chart-outline',
      color: '#8B5CF6',
    },
  ];

  const recentExpenses = [
    { id: '1', title: 'Achat matériel', amount: '75 000 FCFA', date: '15 Déc', type: 'achat' },
    { id: '2', title: 'Salaire employé', amount: '120 000 FCFA', date: '10 Déc', type: 'salaire' },
    { id: '3', title: 'Loyer bureau', amount: '100 000 FCFA', date: '5 Déc', type: 'loyer' },
    { id: '4', title: 'Carburant', amount: '25 000 FCFA', date: '3 Déc', type: 'transport' },
  ];

  /* ------------------------------------------------------------------ */
  /*  UTILS                                                             */
  /* ------------------------------------------------------------------ */
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'achat': return 'cart-outline';
      case 'salaire': return 'cash-outline';
      case 'loyer': return 'business-outline';
      case 'transport': return 'car-outline';
      default: return 'receipt-outline';
    }
  };

  /* ------------------------------------------------------------------ */
  /*  RENDER                                                            */
  /* ------------------------------------------------------------------ */
  return (
    <ScrollView style={styles.container}>
      {/* Header ------------------------------------------------------- */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Tableau de bord</Text>
          <Text style={styles.headerSubtitle}>Vue d'ensemble de votre entreprise</Text>
        </View>

        <View style={styles.timeRangeContainer}>
          <TouchableOpacity
            style={[styles.timeButton, timeRange === 'month' && styles.timeButtonActive]}
            onPress={() => setTimeRange('month')}
          >
            <Text style={[styles.timeButtonText, timeRange === 'month' && styles.timeButtonTextActive]}>
              Mois
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.timeButton, timeRange === 'year' && styles.timeButtonActive]}
            onPress={() => setTimeRange('year')}
          >
            <Text style={[styles.timeButtonText, timeRange === 'year' && styles.timeButtonTextActive]}>
              Année
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Statistiques ------------------------------------------------- */}
      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={styles.statHeader}>
              <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}15` }]}>
                <Ionicons name={stat.icon as any} size={20} color={stat.color} />
              </View>
              <Text style={[styles.changeText, { color: stat.isPositive ? '#10B981' : '#EF4444' }]}>
                {stat.change}
              </Text>
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statTitle}>{stat.title}</Text>
          </View>
        ))}
      </View>

      /* REPLACEMENT DES GRAPHES PAR DES LISTES ------------------------ */

      {/* Revenus mensuels (liste) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Revenus mensuels</Text>
        <View style={styles.listCard}>
          {revenueByMonth.map((item) => (
            <View key={item.label} style={styles.listRow}>
              <Text style={styles.listLabel}>{item.label}</Text>
              <Text style={styles.listValue}>{item.value.toLocaleString()} FCFA</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Dépenses par catégorie (liste) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dépenses par catégorie</Text>
        <View style={styles.listCard}>
          {expenseItems.map((item) => (
            <View key={item.name} style={styles.listRow}>
              <View style={styles.bullet} />
              <Text style={styles.listLabel}>{item.name}</Text>
              <Text style={styles.listValue}>{item.amount.toLocaleString()} FCFA</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Dépenses récentes ------------------------------------------- */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Dépenses récentes</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Depenses')}>
            <Text style={styles.seeAllText}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.expensesList}>
          {recentExpenses.map((exp) => (
            <TouchableOpacity key={exp.id} style={styles.expenseItem}>
              <View style={styles.expenseIconContainer}>
                <Ionicons name={getTypeIcon(exp.type) as any} size={20} color="#6366F1" />
              </View>

              <View style={styles.expenseInfo}>
                <Text style={styles.expenseTitle}>{exp.title}</Text>
                <Text style={styles.expenseDate}>{exp.date}</Text>
              </View>

              <Text style={styles.expenseAmount}>{exp.amount}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Boutons d'action -------------------------------------------- */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Depenses')}>
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Nouvelle dépense</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.secondaryActionButton]} onPress={() => {}}>
          <Ionicons name="download-outline" size={20} color="#6366F1" />
          <Text style={styles.secondaryActionButtonText}>Exporter rapport</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/* ======================================================================
   STYLES
   ====================================================================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },

  /* Header */
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
  headerSubtitle: { fontSize: 16, color: '#64748b', marginBottom: 20 },
  timeRangeContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
  },
  timeButton: { flex: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center' },
  timeButtonActive: { backgroundColor: '#fff', elevation: 2 },
  timeButtonText: { fontSize: 14, fontWeight: '500', color: '#64748b' },
  timeButtonTextActive: { color: '#6366F1', fontWeight: '600' },

  /* Statistiques */
  statsContainer: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 12 },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statIconContainer: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  changeText: { fontSize: 12, fontWeight: '600' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
  statTitle: { fontSize: 13, color: '#64748b' },

  /* Sections / Listes */
  section: { paddingHorizontal: 24, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  seeAllText: { fontSize: 14, color: '#6366F1', fontWeight: '500' },

  listCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  listRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  bullet: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#6366F1', marginRight: 12 },
  listLabel: { flex: 1, fontSize: 15, color: '#1e293b' },
  listValue: { fontSize: 15, fontWeight: '600', color: '#1e293b' },

  /* Dépenses récentes */
  expensesList: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' },
  expenseItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  expenseIconContainer: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  expenseInfo: { flex: 1 },
  expenseTitle: { fontSize: 16, fontWeight: '500', color: '#1e293b', marginBottom: 4 },
  expenseDate: { fontSize: 12, color: '#94a3b8' },
  expenseAmount: { fontSize: 16, fontWeight: '600', color: '#1e293b' },

  /* Boutons d'action */
  actionButtons: { padding: 24, gap: 12, marginBottom: 24 },
  actionButton: { backgroundColor: '#6366F1', borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  actionButtonText: { fontSize: 16, fontWeight: '600', color: '#fff', marginLeft: 8 },
  secondaryActionButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0' },
  secondaryActionButtonText: { fontSize: 16, fontWeight: '600', color: '#6366F1', marginLeft: 8 },
});