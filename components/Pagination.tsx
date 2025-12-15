import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

type PaginationProps = {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  variant?: 'default' | 'compact' | 'minimal';
  showInfo?: boolean;
  hapticFeedback?: boolean;
};

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  variant = 'default',
  showInfo = true,
  hapticFeedback = true,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  
  // Ne rien afficher si une seule page
  if (totalPages <= 1) return null;

  const triggerHaptic = useCallback(() => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [hapticFeedback]);

  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      triggerHaptic();
      onPageChange(page);
    }
  }, [currentPage, totalPages, onPageChange, triggerHaptic]);

  const handlePrev = useCallback(() => {
    handlePageChange(currentPage - 1);
  }, [currentPage, handlePageChange]);

  const handleNext = useCallback(() => {
    handlePageChange(currentPage + 1);
  }, [currentPage, handlePageChange]);

  // Calcul des pages à afficher
  const visiblePages = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = variant === 'compact' ? 3 : 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      let endPage = Math.min(totalPages, startPage + maxVisible - 1);
      
      if (endPage - startPage < maxVisible - 1) {
        startPage = endPage - maxVisible + 1;
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }, [currentPage, totalPages, variant]);

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const styles = getStyles(variant);

  return (
    <View style={styles.container}>
      {showInfo && variant !== 'minimal' && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            {startItem}-{endItem} sur {totalItems}
          </Text>
          {variant === 'default' && (
            <Text style={styles.pageText}>
              Page {currentPage} sur {totalPages}
            </Text>
          )}
        </View>
      )}

      <View style={styles.buttonsContainer}>
        {/* Bouton Précédent */}
        <TouchableOpacity
          style={[
            styles.button,
            currentPage === 1 && styles.buttonDisabled
          ]}
          onPress={handlePrev}
          disabled={currentPage === 1}
        >
          <Ionicons
            name="chevron-back"
            size={variant === 'compact' ? 20 : 24}
            color={currentPage === 1 ? "#9CA3AF" : "#4F46E5"}
          />
        </TouchableOpacity>

        {/* Indicateurs de page */}
        <View style={styles.pageIndicators}>
          {/* Première page + points de suspension */}
          {visiblePages[0] > 1 && (
            <>
              <TouchableOpacity
                style={styles.pageIndicator}
                onPress={() => handlePageChange(1)}
              >
                <Text style={styles.pageIndicatorText}>1</Text>
              </TouchableOpacity>
              {visiblePages[0] > 2 && (
                <Text style={styles.dots}>...</Text>
              )}
            </>
          )}

          {/* Pages visibles */}
          {visiblePages.map((pageNum) => (
            <TouchableOpacity
              key={`page-${pageNum}`}
              style={[
                styles.pageIndicator,
                currentPage === pageNum && styles.pageIndicatorActive
              ]}
              onPress={() => handlePageChange(pageNum)}
            >
              <Text
                style={[
                  styles.pageIndicatorText,
                  currentPage === pageNum && styles.pageIndicatorTextActive
                ]}
              >
                {pageNum}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Points de suspension + dernière page */}
          {visiblePages[visiblePages.length - 1] < totalPages && (
            <>
              {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                <Text style={styles.dots}>...</Text>
              )}
              <TouchableOpacity
                style={styles.pageIndicator}
                onPress={() => handlePageChange(totalPages)}
              >
                <Text style={styles.pageIndicatorText}>{totalPages}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Bouton Suivant */}
        <TouchableOpacity
          style={[
            styles.button,
            currentPage === totalPages && styles.buttonDisabled
          ]}
          onPress={handleNext}
          disabled={currentPage === totalPages}
        >
          <Ionicons
            name="chevron-forward"
            size={variant === 'compact' ? 20 : 24}
            color={currentPage === totalPages ? "#9CA3AF" : "#4F46E5"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Styles dynamiques selon la variante
const getStyles = (variant: 'default' | 'compact' | 'minimal') => {
  const isCompact = variant === 'compact';
  const isMinimal = variant === 'minimal';
  
  return StyleSheet.create({
    container: {
      backgroundColor: '#fff',
      paddingVertical: isCompact ? 12 : 16,
      paddingHorizontal: isCompact ? 12 : 16,
      borderTopWidth: 1,
      borderTopColor: '#f1f5f9',
      marginTop: 8,
      borderRadius: 12,
      marginHorizontal: 16,
      marginBottom: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    
    infoContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: isCompact ? 8 : 12,
    },
    
    infoText: {
      fontSize: isCompact ? 12 : 14,
      color: '#4B5563',
      fontWeight: '500',
    },
    
    pageText: {
      fontSize: isCompact ? 12 : 14,
      color: '#6B7280',
    },
    
    buttonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: isCompact ? 6 : 8,
      paddingHorizontal: isCompact ? 12 : 16,
      borderRadius: 8,
      backgroundColor: '#f8fafc',
      borderWidth: 1,
      borderColor: '#e2e8f0',
    },
    
    buttonDisabled: {
      opacity: 0.5,
    },
    
    pageIndicators: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    
    pageIndicator: {
      width: isCompact ? 32 : 36,
      height: isCompact ? 32 : 36,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
      marginHorizontal: isMinimal ? 1 : 2,
      backgroundColor: '#f8fafc',
    },
    
    pageIndicatorActive: {
      backgroundColor: '#4F46E5',
    },
    
    pageIndicatorText: {
      fontSize: isCompact ? 12 : 14,
      fontWeight: '600',
      color: '#4B5563',
    },
    
    pageIndicatorTextActive: {
      color: '#fff',
    },
    
    dots: {
      fontSize: isCompact ? 12 : 14,
      color: '#9CA3AF',
      marginHorizontal: isMinimal ? 2 : 4,
    },
  });
};

// Hook personnalisé pour gérer la pagination
export const usePagination = (initialItemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(initialItemsPerPage);

  const paginateData = useCallback(<T,>(data: T[]): T[] => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [currentPage, itemsPerPage]);

  const resetPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return {
    currentPage,
    itemsPerPage,
    paginateData,
    resetPage,
    goToPage,
  };
};

export default Pagination;