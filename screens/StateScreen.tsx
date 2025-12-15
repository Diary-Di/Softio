// StateScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState, useRef } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';
import { Sale, salesService } from '../services/salesService';
import { Spent, spentService } from '../services/SpentService';
import { styles } from '../styles/StateScreenStyles';

const { height } = Dimensions.get('window');

export default function StateScreen({ navigation }: any) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [openStart, setOpenStart] = useState(false);
  const [openEnd, setOpenEnd] = useState(false);

  const [sales, setSales] = useState<Sale[]>([]);
  const [spents, setSpents] = useState<Spent[]>([]);

  const [totalIn, setTotalIn] = useState(0);
  const [totalOut, setTotalOut] = useState(0);
  const [profit, setProfit] = useState(0);
  const [margin, setMargin] = useState(0);

  const [showSalesModal, setShowSalesModal] = useState(false);
  const [showSpentsModal, setShowSpentsModal] = useState(false);

  const slideAnim = useRef(new Animated.Value(height)).current;
  const panY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          hideModal();
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const nav = useNavigation();

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const fetchData = async () => {
    try {
      const [salesRes, spentsRes] = await Promise.all([
        salesService.getSales({
          startDate: startDate?.toISOString().split('T')[0],
          endDate: endDate?.toISOString().split('T')[0],
        }),
        spentService.getSpents(),
      ]);

      const filteredSpents = spentsRes.filter(
        (s) => {
          const expenseDate = new Date(s.date_depense);
          return (!startDate || expenseDate >= startDate) && (!endDate || expenseDate <= endDate);
        }
      );

      const inAmount = salesRes.reduce((sum, s) => sum + (s.montant_paye || 0), 0);
      
      const outAmount = filteredSpents.reduce((sum, s) => {
        const montant = Number(s.montant) || 0;
        return sum + montant;
      }, 0);

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

  const format = (d: Date | null) => d ? d.toLocaleDateString('fr-FR') : 'jj/mm/aaaa';

  const showModal = (type: 'sales' | 'spents') => {
    if (type === 'sales') {
      setShowSalesModal(true);
      setShowSpentsModal(false);
    } else {
      setShowSpentsModal(true);
      setShowSalesModal(false);
    }
    
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const hideModal = () => {
    Animated.spring(slideAnim, {
      toValue: height,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start(() => {
      setShowSalesModal(false);
      setShowSpentsModal(false);
      panY.setValue(0);
    });
  };

  const stats = [
    {
      title: 'Entrées',
      value: `${totalIn.toLocaleString()} ar`,
      change: '+100%',
      isPositive: true,
      icon: 'trending-up-outline',
      color: '#10B981',
    },
    {
      title: 'Sorties',
      value: `${totalOut.toLocaleString()} ar`,
      change: '-100%',
      isPositive: false,
      icon: 'trending-down-outline',
      color: '#EF4444',
    },
    {
      title: 'Bénéfice',
      value: `${profit.toLocaleString()} ar`,
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

  const last10Sales = sales.slice(-10).reverse();
  const last10Spents = spents.slice(-10).reverse();

  return (
    <View style={{ flex: 1 }}>
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
                <Text style={[styles.dateValue, !startDate && styles.placeholderText]}>
                  {format(startDate)}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.dateBox} onPress={() => setOpenEnd(true)}>
              <Ionicons name="calendar-clear-outline" size={18} color="#6366F1" />
              <View style={styles.dateTextBox}>
                <Text style={styles.dateLabel}>Au</Text>
                <Text style={[styles.dateValue, !endDate && styles.placeholderText]}>
                  {format(endDate)}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {openStart && (
            <DateTimePicker
              value={startDate || new Date()}
              mode="date"
              display="calendar"
              maximumDate={endDate || undefined}
              onChange={(_, d) => {
                setOpenStart(false);
                setStartDate(d || null);
              }}
            />
          )}
          {openEnd && (
            <DateTimePicker
              value={endDate || new Date()}
              mode="date"
              display="calendar"
              minimumDate={startDate || undefined}
              onChange={(_, d) => {
                setOpenEnd(false);
                setEndDate(d || null);
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
            <TouchableOpacity onPress={() => showModal('sales')}>
              <Text style={styles.seeAllText}>Voir toutes</Text>
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
                <Text style={styles.listValue}>{s.montant_paye.toLocaleString()} ar</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 10 dernières sorties */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sorties récentes</Text>
            <TouchableOpacity onPress={() => showModal('spents')}>
              <Text style={styles.seeAllText}>Voir toutes</Text>
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
                <Text style={styles.listValue}>{s.montant.toLocaleString()} ar</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Modal animé - Affiche TOUTES les données sans filtre */}
      {(showSalesModal || showSpentsModal) && (
        <Animated.View 
          style={[styles.modalOverlay, {
            transform: [{ translateY: slideAnim }, { translateY: panY }]
          }]} 
          pointerEvents={showSalesModal || showSpentsModal ? 'auto' : 'none'}
        >
          <View style={styles.modalHandleContainer} {...panResponder.panHandlers}>
            <View style={styles.modalHandle} />
          </View>
          
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {showSalesModal ? 'Toutes les entrées' : 'Toutes les sorties'}
            </Text>
            
            <ScrollView 
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              {showSalesModal && sales.map((sale) => (
                <View key={sale.ref_facture} style={styles.modalListRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalListLabel}>{sale.ref_facture}</Text>
                    <Text style={styles.modalSubLabel}>{sale.email}</Text>
                    {sale.created_at && (
                      <Text style={styles.modalSubLabel}>
                        {new Date(sale.created_at).toLocaleDateString('fr-FR')}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.modalListValue}>{sale.montant_paye.toLocaleString()} ar</Text>
                </View>
              ))}
              
              {showSpentsModal && spents.map((spent) => (
                <View key={spent.numero} style={styles.modalListRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalListLabel}>{spent.raison}</Text>
                    <Text style={styles.modalSubLabel}>{spent.date_depense}</Text>
                  </View>
                  <Text style={styles.modalListValue}>{spent.montant.toLocaleString()} ar</Text>
                </View>
              ))}
              
              {(showSalesModal && sales.length === 0) && (
                <Text style={styles.modalEmptyText}>Aucune entrée</Text>
              )}
              
              {(showSpentsModal && spents.length === 0) && (
                <Text style={styles.modalEmptyText}>Aucune sortie</Text>
              )}
            </ScrollView>
            
            <TouchableOpacity style={styles.modalCloseButton} onPress={hideModal}>
              <Text style={styles.modalCloseText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
}