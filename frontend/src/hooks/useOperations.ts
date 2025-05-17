import { useState, useEffect } from 'react';
import { getCaisseOperations } from '../services/caisseService';
import { CaisseOperation } from '../types/Caisse';

export const useOperations = (selectedCaisseId: number | null, showAllOperations: boolean) => {
  const [operations, setOperations] = useState<CaisseOperation[]>([]);
  const [operationsLoading, setOperationsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOperations, setTotalOperations] = useState(0);
  
  // Filter states
  const [filterOperationType, setFilterOperationType] = useState<string>('');
  const [filterAmountGreaterThan, setFilterAmountGreaterThan] = useState<string>('');
  const [filterAmountLessThan, setFilterAmountLessThan] = useState<string>('');
  const [filterPerformedBy, setFilterPerformedBy] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>('');

  const fetchOperations = async (page: number, applyFilters = false) => {
    setOperationsLoading(true);
    try {
      const filters: Record<string, any> = { page };
      
      if (!showAllOperations && selectedCaisseId) {
        filters.caisse = selectedCaisseId;
      }
      
      if (applyFilters) {
        if (filterOperationType) filters.operation_type = filterOperationType;
        if (filterPerformedBy) filters.search = filterPerformedBy;
        
        if (filterDate) {
          filters.start_date = filterDate;
          const nextDay = new Date(filterDate);
          nextDay.setDate(nextDay.getDate() + 1);
          filters.end_date = nextDay.toISOString().split('T')[0];
        }
      }
      
      const response = await getCaisseOperations(page, filters);
      
      if (response && response.results) {
        setOperations(response.results);
        setTotalOperations(response.count);
        setCurrentPage(page);
        setTotalPages(Math.ceil(response.count / response.page_size));
      }
    } catch (error) {
      console.error('Error fetching operations:', error);
    } finally {
      setOperationsLoading(false);
    }
  };

  const applyFilters = () => fetchOperations(1, true);
  
  const resetFilters = () => {
    setFilterOperationType('');
    setFilterAmountGreaterThan('');
    setFilterAmountLessThan('');
    setFilterPerformedBy('');
    setFilterDate('');
    fetchOperations(1, false);
  };

  useEffect(() => {
    if (selectedCaisseId !== undefined) {
      fetchOperations(1, false);
    }
  }, [selectedCaisseId, showAllOperations]);

  return {
    operations,
    operationsLoading,
    currentPage,
    totalPages,
    totalOperations,
    filterOperationType,
    setFilterOperationType,
    filterAmountGreaterThan,
    setFilterAmountGreaterThan,
    filterAmountLessThan,
    setFilterAmountLessThan,
    filterPerformedBy,
    setFilterPerformedBy,
    filterDate,
    setFilterDate,
    fetchOperations,
    applyFilters,
    resetFilters
  };
};
