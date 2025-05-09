import { useState, useEffect } from 'react';
import { getCaisses, depositFunds, withdrawFunds, getCaisseOperations, createCaisse } from '../services/caisseService';
import { Caisse as CaisseType, CaisseOperation, PaginatedResponse } from '../types/Caisse';

const Caisse = () => {
  const [caisses, setCaisses] = useState<CaisseType[]>([]);
  const [selectedCaisse, setSelectedCaisse] = useState<CaisseType | null>(null);
  const [operations, setOperations] = useState<CaisseOperation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [operationsLoading, setOperationsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOperations, setTotalOperations] = useState(0);
  
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

  useEffect(() => {
    if (selectedCaisse) {
      fetchOperations(1);
    }
  }, [selectedCaisse]);

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

  const fetchOperations = async (page: number) => {
    if (!selectedCaisse) return;

    setOperationsLoading(true);
    try {
      const response = await getCaisseOperations(page, { caisse: selectedCaisse.id });
      setOperations(response.results);
      setTotalOperations(response.count);
      setCurrentPage(page);
      setTotalPages(Math.ceil(response.count / 10)); // Assuming 10 items per page
    } catch (error) {
      console.error('Error fetching operations:', error);
      showNotification('Failed to fetch operations', 'error');
    } finally {
      setOperationsLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!selectedCaisse) return;
    
    // Validate deposit amount
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      setDepositError('Please enter a valid amount greater than 0');
      return;
    }
    
    try {
      await depositFunds(selectedCaisse.id, { 
        amount, 
        description: depositDescription || 'Manual deposit' 
      });
      
      // Reset form and close modal
      setDepositAmount('');
      setDepositDescription('');
      setDepositError('');
      setIsDepositModalOpen(false);
      
      // Refresh data
      await fetchCaisses();
      await fetchOperations(1);
      
      showNotification(`Successfully added $${amount.toFixed(2)} to ${selectedCaisse.name}`, 'success');
    } catch (error) {
      console.error('Error adding funds:', error);
      setDepositError('Failed to add funds. Please try again.');
    }
  };

  const handleWithdrawal = async () => {
    if (!selectedCaisse) return;
    
    // Validate withdrawal amount
    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0) {
      setWithdrawalError('Please enter a valid amount greater than 0');
      return;
    }
    
    if (amount > Number(selectedCaisse.current_balance)) {
      setWithdrawalError('Amount cannot exceed current balance');
      return;
    }
    
    try {
      await withdrawFunds(selectedCaisse.id, { 
        amount, 
        description: withdrawalDescription || 'Manual withdrawal' 
      });
      
      // Reset form and close modal
      setWithdrawalAmount('');
      setWithdrawalDescription('');
      setWithdrawalError('');
      setIsWithdrawalModalOpen(false);
      
      // Refresh data
      await fetchCaisses();
      await fetchOperations(1);
      
      showNotification(`Successfully withdrew $${amount.toFixed(2)} from ${selectedCaisse.name}`, 'success');
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
      
      // Reset form and close modal
      setNewCaisseName('');
      setCreateError('');
      setIsCreateModalOpen(false);
      
      // Refresh data
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
        <div>
          {/* Cash Register Cards */}
          <div className="flex flex-wrap gap-4 mb-6">
            {caisses.map((caisse) => (
              <div 
                key={caisse.id}
                className={`card bg-base-100 shadow-md cursor-pointer w-60 ${
                  selectedCaisse?.id === caisse.id ? 'border-2 border-primary' : ''
                }`}
                onClick={() => setSelectedCaisse(caisse)}
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

          {selectedCaisse && (
            <div>
              {/* Action Buttons */}
              <div className="flex gap-4 mb-6">
                <button className="btn btn-success" onClick={() => setIsDepositModalOpen(true)}>
                  Add Funds
                </button>
                <button 
                  className="btn btn-error" 
                  onClick={() => setIsWithdrawalModalOpen(true)}
                  disabled={Number(selectedCaisse.current_balance) <= 0}
                >
                  Withdraw Funds
                </button>
              </div>

              {/* Tabs */}
              <div className="tabs tabs-boxed mb-4">
                <button className="tab tab-active">Recent Operations</button>
                <button className="tab">Reports</button>
              </div>

              {/* Operations Table */}
              {operationsLoading ? (
                <div className="flex justify-center py-10">
                  <span className="loading loading-spinner loading-md"></span>
                </div>
              ) : operations.length === 0 ? (
                <div className="bg-base-200 p-10 text-center rounded-lg">
                  <p>No operations found for this cash register</p>
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
                        {operations.map((operation) => (
                          <tr key={operation.id}>
                            <td>{formatDate(operation.timestamp)}</td>
                            <td>
                              <span className={`badge ${getOperationTypeClass(operation.operation_type)}`}>
                                {operation.operation_type_display}
                              </span>
                            </td>
                            <td className={Number(operation.amount) >= 0 ? 'text-success font-bold' : 'text-error font-bold'}>
                              {Number(operation.amount) >= 0 ? '+' : ''}{Number(operation.amount).toFixed(2)}
                            </td>
                            <td>{Number(operation.balance_after).toFixed(2)}</td>
                            <td>{operation.description || '-'}</td>
                            <td>{operation.performed_by_username || 'System'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-sm text-gray-600">
                        Showing {operations.length} of {totalOperations} operations
                      </span>
                      <div className="join">
                        {/* Previous page button */}
                        <button 
                          className="join-item btn btn-sm"
                          onClick={() => fetchOperations(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          «
                        </button>
                        
                        {/* Page number buttons */}
                        {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                          let pageNum;
                          
                          if (totalPages <= 5) {
                            // If total pages <= 5, show all pages
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            // If near the start
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            // If near the end
                            pageNum = totalPages - 4 + i;
                          } else {
                            // In the middle
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
                        
                        {/* Next page button */}
                        <button 
                          className="join-item btn btn-sm"
                          onClick={() => fetchOperations(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          »
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Deposit Modal */}
      {isDepositModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">
              Add Funds to {selectedCaisse?.name}
            </h3>
            <div className="py-4">
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
