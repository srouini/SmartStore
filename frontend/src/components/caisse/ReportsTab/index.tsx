import React from 'react';
import { CaisseOperation } from '../../../types/Caisse';
import { useReports } from '../../../hooks/useReports';
import { getOperationTypeClass } from '../../../utils/caisseUtils';

type ReportsTabProps = {
  operations: CaisseOperation[];
};

export const ReportsTab: React.FC<ReportsTabProps> = ({ operations }) => {
  const reportData = useReports(operations);

  return (
    <div className="bg-base-100 rounded-lg p-6 shadow">
      <h2 className="text-xl font-bold mb-4">Reports</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Total Deposits</div>
            <div className="stat-value text-success">${reportData.totalDeposits.toFixed(2)}</div>
          </div>
        </div>
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Total Withdrawals</div>
            <div className="stat-value text-error">${reportData.totalWithdrawals.toFixed(2)}</div>
          </div>
        </div>
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Today's Operations</div>
            <div className="stat-value">{reportData.todayOperations}</div>
          </div>
        </div>
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">This Week's Operations</div>
            <div className="stat-value">{reportData.weeklyOperations}</div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Operations by Type</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(reportData.operationsByType).map(([type, count]) => (
            <div key={type} className="badge badge-lg gap-2">
              <span className={`badge ${getOperationTypeClass(type)}`}></span>
              {type.replace('_', ' ')}: {count}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
