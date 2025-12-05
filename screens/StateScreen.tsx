import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { CompanyStackParamList } from '../navigation/CompanyStackNavigator';
import { LineChart, PieChart } from 'react-native-chart-kit';

type Props = StackScreenProps<CompanyStackParamList, 'State'>;

const screenWidth = Dimensions.get('window').width;

export default function StateScreen({ navigation }: Props) {
  const [timeRange, setTimeRange] = useState<'month' | 'year'>('month');

  // Données fictives pour le graphique
  const revenueData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
    datasets: [
      {
        data: [300000, 450000, 280000, 500000, 420000, 550000],
        color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const expenseData = [
    {
      name: 'Achats',
      amount: 150000,
      color: '#F87171',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
    {
      name: 'Salaires',
      amount: 200000,
      color: '#60A5FA',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
    {
      name: 'Loyer',
      amount: 100000,
      color: '#34D399',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
    {
      name: 'Autres',
      amount: 50000,
      color: '#FBBF24',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
  ];

  const stats = [
    {
      title: 'Revenu Total',
      value: '1,250,000 FCFA',
      change: '+12.5%',
      isPositive: true,
      icon: 'trending-up-outline',
      color: '#10B981',
    },
    {
      title: 'Dépenses Total',
      value: '500,000 FCFA',
      change: '-3.2%',
      isPositive: false,
      icon: 'trending-down-outline',
      color: '#EF4444',
    },
    {
      title: 'Bénéfice Net',
      value: '750,000 FCFA',
      change: '+18.7%',
      isPositive: true,
      icon: 'cash-outline',
      color: '#6366F1',
    },
    {
      title: 'Marge',
      value: '60%',
      change: '+4.2%',
      isPositive: true,
      icon: 'bar-chart-outline',
      color: '#8B5CF6',
    },
  ];

  const recentExpenses = [
    { id: '1', title: 'Achat matériel', amount: '75,000 FCFA', date: '15 Déc', type: 'achat' },
    { id: '2', title: 'Salaire employé', amount: '120,000 FCFA', date: '10 Déc', type: 'salaire' },
    { id: '3', title: 'Loyer bureau', amount: '100,000 FCFA', date: '5 Déc', type: 'loyer' },
    { id: '4', title: 'Carburant', amount: '25,000 FCFA', date: '3 Déc', type: 'transport' },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'achat': return 'cart-outline';
      case 'salaire': return 'cash-outline';
      case 'loyer': return 'business-outline';
      case 'transport': return 'car-outline';
      default: return 'receipt-outline';
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
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

      {/* Cartes de statistiques */}
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

      {/* Graphiques */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Évolution des revenus</Text>
        <View style={styles.chartCard}>
          <LineChart
            data={revenueData}
            width={screenWidth - 48}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#6366F1',
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Répartition des dépenses</Text>
        <View style={styles.chartCard}>
          <PieChart
            data={expenseData}
            width={screenWidth - 48}
            height={200}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
      </View>

      {/* Dépenses récentes */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Dépenses récentes</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Spent')}>
            <Text style={styles.seeAllText}>Voir tout</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.expensesList}>
          {recentExpenses.map((expense) => (
            <TouchableOpacity key={expense.id} style={styles.expenseItem}>
              <View style={styles.expenseIconContainer}>
                <Ionicons name={getTypeIcon(expense.type) as any} size={20} color="#6366F1" />
              </View>
              <View style={styles.expenseInfo}>
                <Text style={styles.expenseTitle}>{expense.title}</Text>
                <Text style={styles.expenseDate}>{expense.date}</Text>
              </View>
              <Text style={styles.expenseAmount}>{expense.amount}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Boutons d'action */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Spent')}
        >
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Nouvelle dépense</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.secondaryActionButton]}
          onPress={() => {/* Exporter les données */}}
        >
          <Ionicons name="download-outline" size={20} color="#6366F1" />
          <Text style={styles.secondaryActionButtonText}>Exporter rapport</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 20,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
  },
  timeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  timeButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  timeButtonTextActive: {
    color: '#6366F1',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
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
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 13,
    color: '#64748b',
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  seeAllText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  chart: {
    borderRadius: 16,
  },
  expensesList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  expenseIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 4,
  },
  expenseDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  actionButtons: {
    padding: 24,
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: '#6366F1',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  secondaryActionButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  secondaryActionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
    marginLeft: 8,
  },
});