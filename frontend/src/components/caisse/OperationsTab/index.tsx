import React from 'react';
import { OperationsFilter } from './OperationsFilter';
import { OperationsTable } from './OperationsTable';

type OperationsTabProps = {
  operations: any[];
  operationsLoading: boolean;
  currentPage: number;
  totalPages: number;
  filterOperationType: string;
  setFilterOperationType: (value: string) => void;
  filterAmountGreaterThan: string;
  setFilterAmountGreaterThan: (value: string) => void;
  filterAmountLessThan: string;
  setFilterAmountLessThan: (value: string) => void;
  filterPerformedBy: string;
  setFilterPerformedBy: (value: string) => void;
  filterDate: string;
  setFilterDate: (value: string) => void;
  fetchOperations: (page: number, applyFilters?: boolean) => void;
  applyFilters: () => void;
  resetFilters: () => void;
  showAllOperations: boolean;
  selectedCaisseName?: string;
};

export const OperationsTab: React.FC<OperationsTabProps> = ({
  operations,
  operationsLoading,
  currentPage,
  totalPages,
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
  resetFilters,
  showAllOperations,
  selectedCaisseName
}) => {
  return (
    <>
      <OperationsFilter
        filterOperationType={filterOperationType}
        setFilterOperationType={setFilterOperationType}
        filterAmountGreaterThan={filterAmountGreaterThan}
        setFilterAmountGreaterThan={setFilterAmountGreaterThan}
        filterAmountLessThan={filterAmountLessThan}
        setFilterAmountLessThan={setFilterAmountLessThan}
        filterPerformedBy={filterPerformedBy}
        setFilterPerformedBy={setFilterPerformedBy}
        filterDate={filterDate}
        setFilterDate={setFilterDate}
        applyFilters={applyFilters}
        resetFilters={resetFilters}
      />
      
      <OperationsTable
        operations={operations}
        loading={operationsLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => fetchOperations(page)}
        showAllOperations={showAllOperations}
        selectedCaisseName={selectedCaisseName}
      />
    </>
  );
};
