import { useState, useEffect } from 'react';
import { getCaisses, depositFunds, withdrawFunds, getCaisseOperations, createCaisse } from '../services/caisseService';
import { Caisse as CaisseType, CaisseOperation } from '../types/Caisse';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Caisse = () => {
  const [caisses, setCaisses] = useState<CaisseType[]>([]);
  const [selectedCaisse, setSelectedCaisse] = useState<CaisseType | null>(null);
  const [showAllOperations, setShowAllOperations] = useState<boolean>(false);
  const [operations, setOperations] = useState<CaisseOperation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [operationsLoading, setOperationsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOperations, setTotalOperations] = useState(0);
  
  // Tab management
  const [activeTab, setActiveTab] = useState<'operations' | 'reports'>('operations');
  
  // Filter states
  const [filterOperationType, setFilterOperationType] = useState<string>('');
  const [filterAmountGreaterThan, setFilterAmountGreaterThan] = useState<string>('');
  const [filterAmountLessThan, setFilterAmountLessThan] = useState<string>('');
  const [filterPerformedBy, setFilterPerformedBy] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>('');

  // Reports data
  const [reportData, setReportData] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    todayOperations: 0,
    weeklyOperations: 0,
    operationsByType: {} as Record<string, number>
  });
  
  // Modal states
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Form states
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [depositDescription, setDepositDescription] = useState<string>('');
  const [withdrawalAmount, setWithdrawalAmount] = useState<string>('');
  const [withdrawalDescription, setWithdrawalDescription] = useState<string>('');
  const [newCaisseName, setNewCaisseName] = useState<string>('');
  
  // Error states
  const [depositError, setDepositError] = useState<string>('');
  const [withdrawalError, setWithdrawalError] = useState<string>('');
  const [createError, setCreateError] = useState<string>('');
  
  // Toast/notification state
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    show: false,
    message: '',
    type: 'info'
  });

  useEffect(() => {
    fetchCaisses();
  }, []);

  const fetchOperations = async (page: number, applyFilters = false) => {
    setOperationsLoading(true);
    try {
      const filters: Record<string, any> = { page };
      
      if (!showAllOperations && selectedCaisse) {
        filters.caisse = selectedCaisse.id;
      }
      
      if (applyFilters) {
        if (filterOperationType) {
          filters.operation_type = filterOperationType;
        }
        
        if (filterPerformedBy) {
          filters.search = filterPerformedBy;
        }
        
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
        setTotalPages(Math.ceil(response.count / 10));
      } else {
        setOperations([]);
        setTotalOperations(0);
        setCurrentPage(1);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching operations:', error);
      showNotification('Failed to fetch operations', 'error');
      setOperations([]);
      setTotalOperations(0);
    } finally {
      setOperationsLoading(false);
    }
  };
  
  const applyFilters = () => {
    fetchOperations(1, true);
  };
  
  const resetFilters = () => {
    setFilterOperationType('');
    setFilterAmountGreaterThan('');
    setFilterAmountLessThan('');
    setFilterPerformedBy('');
    setFilterDate('');
    fetchOperations(1, false);
  };

  useEffect(() => {
    fetchOperations(1, false);
  }, [selectedCaisse, showAllOperations]);

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

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({
      show: true,
      message,
      type
    });

    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const fetchCaisses = async () => {
    setIsLoading(true);
    try {
      const data = await getCaisses();
      setCaisses(data);
      if (data.length > 0 && !selectedCaisse) {
        setSelectedCaisse(data[0]);
      }
    } catch (error) {
      console.error('Error fetching cash registers:', error);
      showNotification('Failed to fetch cash registers', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!selectedCaisse) return;
    
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      setDepositError('Please enter a valid amount greater than 0');
      return;
    }

    try {
      await depositFunds(selectedCaisse.id, {
  amount,
  description: depositDescription
});
      
      setDepositAmount('');
      setDepositDescription('');
      setDepositError('');
      setIsDepositModalOpen(false);
      
      await fetchCaisses();
      await fetchOperations(1);
      
      showNotification(`Successfully deposited $${amount.toFixed(2)}`, 'success');
    } catch (error) {
      console.error('Error adding funds:', error);
      setDepositError('Failed to add funds. Please try again.');
    }
  };

  const handleWithdrawal = async () => {
    if (!selectedCaisse) return;
    
    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0) {
      setWithdrawalError('Please enter a valid amount greater than 0');
      return;
    }

    if (amount > Number(selectedCaisse.current_balance)) {
      setWithdrawalError('Withdrawal amount exceeds current balance');
      return;
    }

    try {
      await withdrawFunds(selectedCaisse.id, {
  amount,
  description: withdrawalDescription
});
      
      setWithdrawalAmount('');
      setWithdrawalDescription('');
      setWithdrawalError('');
      setIsWithdrawalModalOpen(false);
      
      await fetchCaisses();
      await fetchOperations(1);
      
      showNotification(`Successfully withdrew $${amount.toFixed(2)}`, 'success');
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      setWithdrawalError('Failed to withdraw funds. Please try again.');
    }
  };

  const handleCreateCaisse = async () => {
    if (!newCaisseName.trim()) {
      setCreateError('Please enter a name for the cash register');
      return;
    }

    try {
      await createCaisse({ name: newCaisseName });
      
      setNewCaisseName('');
      setCreateError('');
      setIsCreateModalOpen(false);
      
      await fetchCaisses();
      
      showNotification(`Successfully created cash register "${newCaisseName}"`, 'success');
    } catch (error) {
      console.error('Error creating cash register:', error);
      setCreateError('Failed to create cash register. Please try again.');
    }
  };

  const getOperationTypeClass = (type: string) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading && caisses.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Notification */}
      {notification.show && (
        <div className={`alert ${
          notification.type === 'success' ? 'alert-success' : 
          notification.type === 'error' ? 'alert-error' : 'alert-info'
        } mb-4`}>
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cash Register Management</h1>
        <button 
          className="btn btn-primary" 
          onClick={() => setIsCreateModalOpen(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New Cash Register
        </button>
      </div>

      {caisses.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-base-200 rounded-lg">
          <p className="mb-4">No cash registers found</p>
          <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
            Create Cash Register
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-4 mb-6">
            {caisses.map((caisse) => (
              <div 
                key={caisse.id}
                className={`card bg-base-100 shadow-md cursor-pointer w-60 ${selectedCaisse?.id === caisse.id ? 'border-2 border-primary' : ''}`}
                onClick={() => {
                  setSelectedCaisse(caisse);
                  setShowAllOperations(false);
                }}
              >
                <div className="card-body">
                  <h2 className="card-title">{caisse.name}</h2>
                  <p className={`text-2xl font-bold ${Number(caisse.current_balance) > 0 ? 'text-success' : 'text-error'}`}>
                    ${Number(caisse.current_balance).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Last updated: {new Date(caisse.last_updated).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs and Filter Controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <div className="tabs tabs-boxed">
              <button 
                className={`tab ${activeTab === 'operations' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('operations')}
              >
                Recent Operations
              </button>
              <button 
                className={`tab ${activeTab === 'reports' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('reports')}
              >
                Reports
              </button>
            </div>
            
            <div className="flex items-center">
              <div className="form-control">
                <label className="cursor-pointer label">
                  <span className="label-text mr-2">Show all operations</span>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary" 
                    checked={showAllOperations}
                    onChange={(e) => {
                      setShowAllOperations(e.target.checked);
                      setSelectedCaisse(e.target.checked ? null : selectedCaisse);
                      fetchOperations(1);
                    }} 
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'operations' ? (
            <>
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  className="btn btn-success"
                  disabled={!selectedCaisse}
                  onClick={() => setIsDepositModalOpen(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Deposit
                </button>
                <button
                  className="btn btn-error"
                  disabled={!selectedCaisse || Number(selectedCaisse.current_balance) <= 0}
                  onClick={() => setIsWithdrawalModalOpen(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  Withdraw
                </button>
              </div>

              {/* Operation Filters */}
              <form
                className="flex flex-wrap gap-4 mb-4 items-end p-4 rounded-lg"
                onSubmit={e => {
                  e.preventDefault();
                  applyFilters();
                }}
              >
                <div>
                  <label className="label label-text">Type</label>
                  <select
                    className="select select-bordered"
                    value={filterOperationType}
                    onChange={e => setFilterOperationType(e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="DEPOSIT">Deposit</option>
                    <option value="WITHDRAWAL">Withdrawal</option>
                    <option value="SALE">Sale</option>
                    <option value="PURCHASE_PAYMENT">Purchase Payment</option>
                    <option value="ADJUSTMENT">Balance Adjustment</option>
                  </select>
                </div>
                <div>
                  <label className="label label-text">Performed By</label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={filterPerformedBy}
                    onChange={e => setFilterPerformedBy(e.target.value)}
                    placeholder="Username"
                  />
                </div>
                <div>
                  <label className="label label-text">Date</label>
                  <input
                    type="date"
                    className="input input-bordered"
                    value={filterDate}
                    onChange={e => setFilterDate(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn btn-primary">Filter</button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={resetFilters}
                  >
                    Reset
                  </button>
                </div>
              </form>

              {/* Operations Table */}
              {operationsLoading ? (
                <div className="flex justify-center py-10">
                  <span className="loading loading-spinner loading-md"></span>
                </div>
              ) : operations.length === 0 ? (
                <div className="bg-base-200 p-10 text-center rounded-lg">
                  <p>
                    {showAllOperations
                      ? "No operations found in any cash register"
                      : `No operations found for ${selectedCaisse?.name}`}
                  </p>
                </div>
              ) : (
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
                            <td><span className={`badge ${getOperationTypeClass(op.operation_type)}`}>{op.operation_type.replace('_', ' ')}</span></td>
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
                      onClick={() => fetchOperations(currentPage - 1)}
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
                          onClick={() => fetchOperations(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button 
                      className="join-item btn btn-sm"
                      onClick={() => fetchOperations(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <FiChevronRight />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
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
          )}
        </>
      )}

      {/* Deposit Modal */}
      {isDepositModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">
              Deposit Funds into {selectedCaisse?.name}
            </h3>
            <div className="py-4">
              <p className="mb-4">
                Current Balance: <strong>${selectedCaisse ? Number(selectedCaisse.current_balance).toFixed(2) : '0.00'}</strong>
              </p>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Amount</span>
                </label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  className={`input input-bordered ${depositError ? 'input-error' : ''}`}
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                />
                {depositError && <span className="text-error text-sm mt-1">{depositError}</span>}
              </div>
              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">Description (optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter description"
                  className="input input-bordered"
                  value={depositDescription}
                  onChange={(e) => setDepositDescription(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-action">
              <button className="btn" onClick={() => {
                setIsDepositModalOpen(false);
                setDepositAmount('');
                setDepositDescription('');
                setDepositError('');
              }}>
                Cancel
              </button>
              <button className="btn btn-success" onClick={handleDeposit}>
                Add Funds
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {isWithdrawalModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">
              Withdraw Funds from {selectedCaisse?.name}
            </h3>
            <div className="py-4">
              <p className="mb-4">
                Current Balance: <strong>${selectedCaisse ? Number(selectedCaisse.current_balance).toFixed(2) : '0.00'}</strong>
              </p>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Amount</span>
                </label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  className={`input input-bordered ${withdrawalError ? 'input-error' : ''}`}
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  min="0.01"
                  max={selectedCaisse ? Number(selectedCaisse.current_balance).toString() : '0'}
                  step="0.01"
                />
                {withdrawalError && <span className="text-error text-sm mt-1">{withdrawalError}</span>}
              </div>
              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">Description (optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter description"
                  className="input input-bordered"
                  value={withdrawalDescription}
                  onChange={(e) => setWithdrawalDescription(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-action">
              <button className="btn" onClick={() => {
                setIsWithdrawalModalOpen(false);
                setWithdrawalAmount('');
                setWithdrawalDescription('');
                setWithdrawalError('');
              }}>
                Cancel
              </button>
              <button className="btn btn-error" onClick={handleWithdrawal}>
                Withdraw Funds
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Cash Register Modal */}
      {isCreateModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Create New Cash Register</h3>
            <div className="py-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter cash register name"
                  className={`input input-bordered ${createError ? 'input-error' : ''}`}
                  value={newCaisseName}
                  onChange={(e) => setNewCaisseName(e.target.value)}
                />
                {createError && <span className="text-error text-sm mt-1">{createError}</span>}
              </div>
            </div>
            <div className="modal-action">
              <button className="btn" onClick={() => {
                setIsCreateModalOpen(false);
                setNewCaisseName('');
                setCreateError('');
              }}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleCreateCaisse}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Caisse;