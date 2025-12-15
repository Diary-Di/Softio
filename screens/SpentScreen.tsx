import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  LayoutAnimation,
  Platform,
  RefreshControl,
  Text,
  TouchableOpacity,
  UIManager,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Spent, spentService } from '../services/SpentService';
import { spentScreenStyles as styles } from '../styles/SpentScreenStyles';

/* -------------------------------------------------------------------------- */
/*                             HELPER : MILLIERS                              */
/* -------------------------------------------------------------------------- */
const formatAmount = (n: number | string) =>
  Number(n)
    .toFixed(2)
    .replace('.', ',')
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

/* -------------------------------------------------------------------------- */
/*                                  COMPOSANT                                 */
/* -------------------------------------------------------------------------- */
export default function SpentScreen() {
  /* ----------------------------- ÉTAT LOCAL -------------------------------- */
  const [expenses, setExpenses] = useState<Spent[]>([]);
  const [displayedExpenses, setDisplayedExpenses] = useState<Spent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  /* Filtres */
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);
  const [fromText, setFromText] = useState('jj/mm/aaaa');
  const [toText, setToText] = useState('jj/mm/aaaa');
  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);

  /* Pagination */
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  /* Animations */
  const fabAnimation = useRef(new Animated.Value(1)).current;
  const isScrolling = useRef(false);
  const scrollTimeout = useRef<any>(null);
  const flatListRef = useRef<FlatList>(null);

  const navigation = useNavigation<any>();

  if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental?.(true);
  }

  /* --------------------------- FETCH & FILTRES ----------------------------- */
  const fetchExpenses = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    setRefreshing(isRefreshing);
    try {
      const all = await spentService.getSpents({ limit: 500 });
      const filtered = all.filter((d) => {
        const day = new Date(d.date_depense);
        return (!from || day >= from) && (!to || day <= to);
      });
      setExpenses(filtered);
    } catch (e: any) {
      Alert.alert('Erreur', e.message || 'Impossible de charger les dépenses');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [from, to]);

  useFocusEffect(
    useCallback(() => {
      fetchExpenses();
    }, [fetchExpenses])
  );

  /* Pagination */
  useEffect(() => {
    const total = Math.ceil(expenses.length / itemsPerPage);
    setTotalPages(total || 1);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    setDisplayedExpenses(expenses.slice(start, end));
  }, [expenses, currentPage, itemsPerPage]);

  /* --------------------------- HANDLERS ----------------------------------- */
  const onRefresh = useCallback(() => fetchExpenses(true), [fetchExpenses]);

  const handleScrollBegin = useCallback(() => {
    isScrolling.current = true;
    Animated.timing(fabAnimation, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
  }, [fabAnimation]);

  const handleScrollEnd = useCallback(() => {
    isScrolling.current = false;
    scrollTimeout.current = setTimeout(() => {
      if (!isScrolling.current) {
        Animated.timing(fabAnimation, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      }
    }, 500);
  }, [fabAnimation]);

  const onChangeFrom = (_: any, selected?: Date) => {
    setShowFrom(false);
    if (selected) {
      setFrom(selected);
      setFromText(selected.toLocaleDateString('fr-FR'));
    } else {
      setFrom(null);
      setFromText('jj/mm/aaaa');
    }
    setCurrentPage(1);
  };

  const onChangeTo = (_: any, selected?: Date) => {
    setShowTo(false);
    if (selected) {
      setTo(selected);
      setToText(selected.toLocaleDateString('fr-FR'));
    } else {
      setTo(null);
      setToText('jj/mm/aaaa');
    }
    setCurrentPage(1);
  };

  /* --------------------------- ACTIONS CARTE ------------------------------ */
  const toggle = useCallback((id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const handleEdit = useCallback((item: Spent) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('AddSpent', { spent: item });
  }, [navigation]);

  const handleDelete = useCallback((item: Spent) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      'Supprimer la dépense',
      `Êtes-vous sûr de vouloir supprimer « ${item.raison} » ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await spentService.deleteSpent(item.numero);
              setExpenses((prev) => prev.filter((e) => e.numero !== item.numero));
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (e: any) {
              Alert.alert('Erreur', e.message || 'Impossible de supprimer');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }, []);

  /* --------------------------- RENDUS ------------------------------------- */
  /* --------------------------- RENDU HEADER -------------------------------- */
  const renderHeader = useCallback(() => {
    const total = expenses.reduce((sum, item) => sum + Number(item.montant), 0);
    return (
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Dépenses</Text>

          {/* Bloc total */}
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>{formatAmount(total)} ar</Text>
          </View>
        </View>
      </View>
    );
  }, [expenses]);

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Ionicons name="cash-outline" size={64} color="#9CA3AF" />
        <Text style={styles.emptyText}>Aucune dépense pour le moment</Text>
        <Text style={styles.emptySubtext}>
          Ajoutez votre première dépense avec le bouton +
        </Text>
      </View>
    ),
    []
  );

  const renderItem = ({ item }: { item: Spent }) => {
    const isExpanded = expandedId === item.numero;
    const amount = Number(item.montant);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => toggle(item.numero)}
        activeOpacity={0.9}
      >
        {/* Rangée principale */}
        <View style={styles.row}>
          <View style={styles.iconBox}>
            <Ionicons name="cash" size={28} color="#4F46E5" />
          </View>

          <View style={styles.info}>
            <Text style={styles.reason} numberOfLines={2}>
              {item.raison}
            </Text>
            <Text style={styles.datetime}>
              {item.date_depense} – {item.heur_depense}
            </Text>
          </View>

          <View style={styles.priceTag}>
            <Text style={styles.price}>{formatAmount(amount)} ar</Text>
          </View>

          <Ionicons
            name="chevron-down"
            size={20}
            color="#4F46E5"
            style={{ marginLeft: 8, transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}
          />
        </View>

        {/* Section étendue */}
        {isExpanded && (
          <View style={styles.expanded}>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Montant</Text>
                <Text style={[styles.detailValue, styles.priceValue]}>
                  {formatAmount(amount)} ar
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>{item.date_depense}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Heure</Text>
                <Text style={styles.detailValue}>{item.heur_depense}</Text>
              </View>
            </View>

            {/* Boutons d'action */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleEdit(item)}
              >
                <Ionicons name="create" size={24} color="#F59E0B" />
                <Text style={styles.actionButtonText}>Modifier</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDelete(item)}
              >
                <Ionicons name="trash" size={24} color="#DC2626" />
                <Text style={styles.actionButtonText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  /* Pagination */
  const goToPage = useCallback(
    (p: number) => {
      if (p >= 1 && p <= totalPages && p !== currentPage) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setCurrentPage(p);
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }
    },
    [currentPage, totalPages]
  );

  const renderPagination = useCallback(() => {
    if (expenses.length <= itemsPerPage) return null;
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, expenses.length);
    return (
      <View style={styles.paginationContainer}>
        <View style={styles.paginationInfo}>
          <Text style={styles.paginationText}>
            {start}-{end} sur {expenses.length} dépenses
          </Text>
          <Text style={styles.paginationPageText}>
            Page {currentPage} sur {totalPages}
          </Text>
        </View>

        <View style={styles.paginationButtons}>
          <TouchableOpacity
            style={[styles.paginationButton, currentPage === 1 && styles.disabled]}
            onPress={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={currentPage === 1 ? '#9CA3AF' : '#4F46E5'}
            />
            <Text
              style={[
                styles.paginationButtonText,
                currentPage === 1 && styles.disabledText,
              ]}
            >
              Précédent
            </Text>
          </TouchableOpacity>

          {/* Indicateurs */}
          <View style={styles.pageIndicators}>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let p: number;
              if (totalPages <= 5) p = i + 1;
              else if (currentPage <= 3) p = i + 1;
              else if (currentPage >= totalPages - 2) p = totalPages - 4 + i;
              else p = currentPage - 2 + i;
              return (
                <TouchableOpacity
                  key={`page-${p}`}
                  style={[
                    styles.pageIndicator,
                    currentPage === p && styles.pageIndicatorActive,
                  ]}
                  onPress={() => goToPage(p)}
                >
                  <Text
                    style={[
                      styles.pageIndicatorText,
                      currentPage === p && styles.pageIndicatorTextActive,
                    ]}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              );
            })}
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <Text style={styles.dots}>…</Text>
                <TouchableOpacity
                  style={styles.pageIndicator}
                  onPress={() => goToPage(totalPages)}
                >
                  <Text style={styles.pageIndicatorText}>{totalPages}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.paginationButton,
              currentPage === totalPages && styles.disabled,
            ]}
            onPress={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <Text
              style={[
                styles.paginationButtonText,
                currentPage === totalPages && styles.disabledText,
              ]}
            >
              Suivant
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={currentPage === totalPages ? '#9CA3AF' : '#4F46E5'}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [currentPage, totalPages, expenses.length, itemsPerPage, goToPage]);

  /* --------------------------- ÉCRAN DE CHARGEMENT ------------------------- */
  if (loading && !refreshing && expenses.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Chargement des dépenses…</Text>
        </View>
      </SafeAreaView>
    );
  }

  /* --------------------------- RENDU PRINCIPAL ----------------------------- */
  return (
    <SafeAreaView style={styles.safeArea}>
      {renderHeader()}

      {/* --------------- CHAMPS DATE AVEC ICÔNE --------------- */}
      <View style={styles.dateFieldsRow}>
        <View style={styles.dateField}>
          <Text style={styles.dateLabel}>Du</Text>
          <TouchableOpacity
            style={styles.dateInputTouch}
            onPress={() => setShowFrom(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.dateInputText, !from && styles.placeholderText]}>
              {fromText}
            </Text>
            <Ionicons name="calendar" size={20} color="#4F46E5" />
          </TouchableOpacity>
        </View>

        <View style={styles.dateField}>
          <Text style={styles.dateLabel}>Au</Text>
          <TouchableOpacity
            style={styles.dateInputTouch}
            onPress={() => setShowTo(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.dateInputText, !to && styles.placeholderText]}>
              {toText}
            </Text>
            <Ionicons name="calendar" size={20} color="#4F46E5" />
          </TouchableOpacity>
        </View>
      </View>

      {showFrom && (
        <DateTimePicker 
          value={from || new Date()} 
          mode="date" 
          onChange={onChangeFrom} 
        />
      )}
      {showTo && (
        <DateTimePicker 
          value={to || new Date()} 
          mode="date" 
          onChange={onChangeTo} 
        />
      )}

      {/* Liste */}
      <FlatList
        ref={flatListRef}
        data={displayedExpenses}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.numero)}
        contentContainerStyle={
          displayedExpenses.length ? styles.listContainer : styles.listContainerCenter
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4F46E5"
            colors={['#4F46E5']}
          />
        }
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderPagination}
        onScrollBeginDrag={handleScrollBegin}
        onScrollEndDrag={handleScrollEnd}
        onMomentumScrollEnd={handleScrollEnd}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews
        keyboardShouldPersistTaps="handled"
      />

      {/* FAB animé */}
      <Animated.View
        style={[
          styles.fabContainer,
          {
            transform: [
              {
                translateY: fabAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                }),
              },
            ],
            opacity: fabAnimation,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AddSpent')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={26} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}