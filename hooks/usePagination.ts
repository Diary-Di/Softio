// hooks/usePagination.ts
import { useState, useCallback, useEffect } from 'react';

export function usePagination<T>(data: T[], itemsPerPage: number = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [displayedItems, setDisplayedItems] = useState<T[]>([]);

  useEffect(() => {
    const total = Math.ceil(data.length / itemsPerPage);
    setTotalPages(total || 1);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    setDisplayedItems(data.slice(start, end));
  }, [data, currentPage, itemsPerPage]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const goToNextPage = useCallback(() => {
    setCurrentPage(prev => (prev < totalPages ? prev + 1 : prev));
  }, [totalPages]);

  const goToPrevPage = useCallback(() => {
    setCurrentPage(prev => (prev > 1 ? prev - 1 : prev));
  }, []);

  const resetPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    totalPages,
    displayedItems,
    goToPage,
    goToNextPage,
    goToPrevPage,
    resetPage,
  };
}