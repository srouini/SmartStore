import React from 'react';
import { CaisseOperation } from '../../../types/Caisse';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { getOperationTypeClass, formatDate } from '../../../utils/caisseUtils';

type OperationsTableProps = {
  operations: CaisseOperation[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showAllOperations: boolean;
  selectedCaisseName?: string;
};

export const OperationsTable: React.FC<OperationsTableProps> = ({
  operations,
  loading,
  currentPage,
  totalPages,
  onPageChange,
  showAllOperations,
  selectedCaisseName,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <span className="loading loading-spinner loading-md"></span>
      </div>
    );
  }

  if (operations.length === 0) {
    return (
      <div className="bg-base-200 p-10 text-center rounded-lg">
        <p>
          {showAllOperations
            ? "No operations found in any cash register"
            : `No operations found for ${selectedCaisseName}`}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Balance After</th>
              <th>Description</th>
              <th>Performed By</th>
            </tr>
          </thead>
          <tbody>
            {operations.map((op) => (
              <tr key={op.id}>
                <td>{formatDate(op.timestamp)}</td>
                <td><span className={`badge ${getOperationTypeClass(op.operation_type)}`}>
                  {op.operation_type.replace('_', ' ')}
                </span></td>
                <td>{Number(op.amount).toFixed(2)}</td>
                <td>{Number(op.balance_after).toFixed(2)}</td>
                <td>{op.description}</td>
                <td>{op.performed_by_username || 'System'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="join flex justify-center mt-4">
        <button 
          className="join-item btn btn-sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <FiChevronLeft />
        </button>
        {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
          let pageNum;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (currentPage <= 3) {
            pageNum = i + 1;
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = currentPage - 2 + i;
          }
          
          return (
            <button 
              key={pageNum}
              className={`join-item btn btn-sm ${currentPage === pageNum ? 'btn-active' : ''}`}
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </button>
          );
        })}
        <button 
          className="join-item btn btn-sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
};
