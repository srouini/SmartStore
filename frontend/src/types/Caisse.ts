import { User } from './User';

export type OperationType = 'DEPOSIT' | 'WITHDRAWAL' | 'SALE' | 'PURCHASE_PAYMENT' | 'ADJUSTMENT';

export interface Caisse {
  id: number;
  name: string;
  current_balance: number;
  last_updated: string;
  created_at: string;
}

export interface CaisseOperation {
  id: number;
  caisse: number;
  caisse_name: string;
  operation_type: OperationType;
  operation_type_display: string;
  amount: number;
  balance_after: number;
  description: string | null;
  reference_id: string | null;
  performed_by: number | null;
  performed_by_username: string | null;
  timestamp: string;
}

export interface CaisseDetail extends Caisse {
  operations: CaisseOperation[];
}

export interface CaisseDeposit {
  amount: number;
  description?: string;
}

export interface CaisseWithdrawal {
  amount: number;
  description?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
