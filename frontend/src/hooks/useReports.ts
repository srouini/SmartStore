import { useState, useEffect } from 'react';
import { CaisseOperation } from '../types/Caisse';

interface ReportData {
  totalDeposits: number;
  totalWithdrawals: number;
  todayOperations: number;
  weeklyOperations: number;
  operationsByType: Record<string, number>;
}

export const useReports = (operations: CaisseOperation[]) => {
  const [reportData, setReportData] = useState<ReportData>({
    totalDeposits: 0,
    totalWithdrawals: 0,
    todayOperations: 0,
    weeklyOperations: 0,
    operationsByType: {}
  });

  useEffect(() => {
    if (operations.length > 0) {
      calculateReportData();
    }
  }, [operations]);

  const calculateReportData = () => {
    const deposits = operations.filter(op => op.operation_type === 'DEPOSIT');
    const totalDeposits = deposits.reduce((sum, op) => sum + Number(op.amount), 0);
    
    const withdrawals = operations.filter(op => op.operation_type === 'WITHDRAWAL');
    const totalWithdrawals = Math.abs(withdrawals.reduce((sum, op) => sum + Number(op.amount), 0));
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOperations = operations.filter(op => new Date(op.timestamp) >= today).length;
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);
    const weeklyOperations = operations.filter(op => new Date(op.timestamp) >= oneWeekAgo).length;
    
    const operationsByType: Record<string, number> = {};
    operations.forEach(op => {
      if (!operationsByType[op.operation_type]) {
        operationsByType[op.operation_type] = 0;
      }
      operationsByType[op.operation_type]++;
    });
    
    setReportData({
      totalDeposits,
      totalWithdrawals,
      todayOperations,
      weeklyOperations,
      operationsByType
    });
  };

  return reportData;
};
