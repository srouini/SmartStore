/**
 * Utility functions for caisse operations
 */

export const getOperationTypeClass = (type: string): string => {
  switch (type) {
    case 'DEPOSIT':
      return 'badge-success';
    case 'WITHDRAWAL':
      return 'badge-error';
    case 'SALE':
      return 'badge-info';
    case 'PURCHASE_PAYMENT':
      return 'badge-warning';
    case 'ADJUSTMENT':
      return 'badge-secondary';
    default:
      return 'badge-ghost';
  }
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString();
};
