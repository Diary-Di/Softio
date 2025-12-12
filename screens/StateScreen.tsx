// StateScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { styles } from '../styles/StateScreenStyles';
import { salesService, Sale } from '../services/salesService';
import { spentService, Spent } from '../services/SpentService';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';

export default function StateScreen({ navigation }: any) {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [openStart, setOpenStart] = useState(false);
  const [openEnd, setOpenEnd] = useState(false);

  const [sales, setSales] = useState<Sale[]>([]);
  const [spents, setSpents] = useState<Spent[]>([]);

  const [totalIn, setTotalIn] = useState(0);
  const [totalOut, setTotalOut] = useState(0);
  const [profit, setProfit] = useState(0);
  const [margin, setMargin] = useState(0);
  const nav = useNavigation();

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const fetchData = async () => {
    try {
      const [salesRes, spentsRes] = await Promise.all([
        salesService.getSales({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        }),
        spentService.getSpents(),
      ]);

      const filteredSpents = spentsRes.filter(
        (s) => new Date(s.date_depense) >= startDate && new Date(s.date_depense) <= endDate
      );

      const inAmount = salesRes.reduce((sum, s) => sum + (s.montant_paye || 0), 0);
      const outAmount = filteredSpents.reduce((sum, s) => sum + s.montant, 0);

      setSales(salesRes);
      setSpents(filteredSpents);
      setTotalIn(inAmount);
      setTotalOut(outAmount);
      setProfit(inAmount - outAmount);
      setMargin(inAmount > 0 ? ((inAmount - outAmount) / inAmount) * 100 : 0);
    } catch (error) {
      console.error("Erreur chargement données:", error);
    }
  };

  const format = (d: Date) => d.toLocaleDateString('fr-FR');

  const stats = [
    {
      title: 'Entrées',
      value: `${totalIn.toLocaleString()} FCFA`,
      change: '+100%',
      isPositive: true,
      icon: 'trending-up-outline',
      color: '#10B981',
    },
    {
      title: 'Sorties',
      value: `${totalOut.toLocaleString()} FCFA`,
      change: '-100%',
      isPositive: false,
      icon: 'trending-down-outline',
      color: '#EF4444',
    },
    {
      title: 'Bénéfice',
      value: `${profit.toLocaleString()} FCFA`,
      change: '+100%',
      isPositive: profit >= 0,
      icon: 'cash-outline',
      color: '#6366F1',
    },
    {
      title: 'Marge',
      value: `${margin.toFixed(1)} %`,
      change: '+100%',
      isPositive: margin >= 0,
      icon: 'bar-chart-outline',
      color: '#8B5CF6',
    },
  ];

  // 10 derniers
  const last10Sales = sales.slice(-10).reverse();
  const last10Spents = spents.slice(-10).reverse();

  return (
    <ScrollView style={styles.container}>
      {/* Header avec filtres date */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tableau de bord</Text>
        <Text style={styles.headerSubtitle}>Filtrer par période</Text>

        <View style={styles.rangeRow}>
          <TouchableOpacity style={styles.dateBox} onPress={() => setOpenStart(true)}>
            <Ionicons name="calendar-clear-outline" size={18} color="#6366F1" />
            <View style={styles.dateTextBox}>
              <Text style={styles.dateLabel}>Du</Text>
              <Text style={styles.dateValue}>{format(startDate)}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dateBox} onPress={() => setOpenEnd(true)}>
            <Ionicons name="calendar-clear-outline" size={18} color="#6366F1" />
            <View style={styles.dateTextBox}>
              <Text style={styles.dateLabel}>Au</Text>
              <Text style={styles.dateValue}>{format(endDate)}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {openStart && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="calendar"
            maximumDate={endDate}
            onChange={(_, d) => {
              setOpenStart(false);
              if (d) setStartDate(d);
            }}
          />
        )}
        {openEnd && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="calendar"
            minimumDate={startDate}
            onChange={(_, d) => {
              setOpenEnd(false);
              if (d) setEndDate(d);
            }}
          />
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        {stats.map((stat, i) => (
          <View key={i} style={styles.statCard}>
            <View style={styles.statHeader}>
              <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}20` }]}>
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

      {/* 10 dernières entrées */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Entrées récentes</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SalesScreen')}>
            <Text style={styles.seeAllText}>Voir plus</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.listCard}>
          {last10Sales.length === 0 && <Text style={styles.emptyText}>Aucune vente récente</Text>}
          {last10Sales.map((s) => (
            <View key={s.ref_facture} style={styles.listRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.listLabel}>{s.ref_facture}</Text>
                <Text style={styles.subLabel}>{s.email}</Text>
              </View>
              <Text style={styles.listValue}>{s.montant_paye.toLocaleString()} FCFA</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 10 dernières sorties */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sorties récentes</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SpentScreen')}>
            <Text style={styles.seeAllText}>Voir plus</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.listCard}>
          {last10Spents.length === 0 && <Text style={styles.emptyText}>Aucune dépense récente</Text>}
          {last10Spents.map((s) => (
            <View key={s.numero} style={styles.listRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.listLabel}>{s.raison}</Text>
                <Text style={styles.subLabel}>{s.date_depense}</Text>
              </View>
              <Text style={styles.listValue}>{s.montant.toLocaleString()} FCFA</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}