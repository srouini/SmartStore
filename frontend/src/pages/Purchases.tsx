import React, { useState, useEffect } from 'react';
import purchaseService from '../api/purchaseService';
import type { Purchase } from '../api/purchaseService';
import supplierService, { PaginatedResponse } from '../api/supplierService';
import phoneService from '../api/phoneService';
import type { Phone } from '../api/phoneService';
import accessoryService from '../api/accessoryService';
import type { Accessory } from '../api/accessoryService';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import PurchaseFormModal from '../components/purchases/PurchaseFormModal';
import PurchaseViewModal from '../components/purchases/PurchaseViewModal';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Purchases: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [phones, setPhones] = useState<Phone[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  
  // Ensure arrays are always arrays
  const ensuredPurchases = Array.isArray(purchases) ? purchases : [];
  const ensuredPhones = Array.isArray(phones) ? phones : [];
  const ensuredAccessories = Array.isArray(accessories) ? accessories : [];
  const ensuredSuppliers = Array.isArray(suppliers) ? suppliers : [];
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [viewingPurchase, setViewingPurchase] = useState<Purchase | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Payment status options
  const paymentStatusOptions = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'PARTIAL', label: 'Partial' },
    { value: 'PAID', label: 'Paid' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  // Payment method options
  const paymentMethodOptions = [
    { value: 'CASH', label: 'Cash' },
    { value: 'CREDIT_CARD', label: 'Credit Card' },
    { value: 'DEBIT_CARD', label: 'Debit Card' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
    { value: 'CHEQUE', label: 'Cheque' },
    { value: 'MOBILE_PAYMENT', label: 'Mobile Payment' },
    { value: 'OTHER', label: 'Other' }
  ];

  // Fetch data on component mount
  useEffect(() => {
    fetchPurchases();
    fetchPhones();
    fetchAccessories();
    fetchSuppliers();
  }, []);

  // Effect to refetch when page changes
  useEffect(() => {
    if (!isLoading) {
      fetchPurchases();
    }
  }, [currentPage, pageSize]);

  const fetchPurchases = async (params?: Record<string, any>) => {
    try {
      setIsLoading(true);
      
      // Add pagination parameters
      const paginationParams = {
        ...params,
        page: currentPage,
        page_size: pageSize
      };
      
      const data = await purchaseService.getAllPurchases(paginationParams);
      
      // Handle paginated response if available
      if (data && typeof data === 'object' && 'results' in data) {
        setPurchases(data.results);
        setTotalItems(data.count);
        setHasNextPage(!!data.next);
        setHasPrevPage(!!data.previous);
        setTotalPages(Math.ceil(data.count / pageSize));
      } else {
        // Fallback for non-paginated response
        setPurchases(Array.isArray(data) ? data : []);
        setTotalItems(Array.isArray(data) ? data.length : 0);
        setTotalPages(Math.ceil((Array.isArray(data) ? data.length : 0) / pageSize));
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Error fetching purchases:', err);
      setError('Failed to load purchases. Please try again.');
      setPurchases([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPhones = async () => {
    try {
      const data = await phoneService.getAllPhones();
      setPhones(data);
    } catch (err: any) {
      console.error('Error fetching phones:', err);
    }
  };

  const fetchAccessories = async () => {
    try {
      const data = await accessoryService.getAllAccessories();
      setAccessories(data);
    } catch (err: any) {
      console.error('Error fetching accessories:', err);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const data = await supplierService.getAllSuppliers();
      
      // Handle paginated response
      if (data && typeof data === 'object' && 'results' in data) {
        setSuppliers(data.results);
      } else {
        // Fallback for non-paginated response
        setSuppliers(Array.isArray(data) ? data : []);
      }
    } catch (err: any) {
      console.error('Error fetching suppliers:', err);
      setSuppliers([]);
    }
  };

  const handleCreatePurchase = () => {
    setEditingPurchase(null);
    setIsModalOpen(true);
  };

  const handleEditPurchase = (purchase: Purchase) => {
    setEditingPurchase(purchase);
    setIsModalOpen(true);
  };

  const handleViewPurchase = (purchase: Purchase) => {
    setViewingPurchase(purchase);
    setViewModalOpen(true);
  };

  const handleDeletePurchase = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this purchase?')) return;
    
    try {
      await purchaseService.deletePurchase(id);
      setPurchases(purchases.filter(purchase => purchase.id !== id));
    } catch (err: any) {
      console.error('Error deleting purchase:', err);
      setError('Failed to delete purchase. Please try again.');
    }
  };

  const onSubmit = async (data: any) => {
    try {
      // Calculate total amount
      const totalAmount = data.items.reduce(
        (sum: number, item: any) => sum + (item.quantity * item.unit_price),
        0
      );
      
      const purchaseData = {
        ...data,
        total_amount: totalAmount
      };
      
      if (editingPurchase) {
        await purchaseService.updatePurchase(editingPurchase.id, purchaseData);
      } else {
        await purchaseService.createPurchase(purchaseData);
      }
      
      setIsModalOpen(false);
      fetchPurchases();
    } catch (err: any) {
      console.error('Error saving purchase:', err);
      setError('Failed to save purchase. Please try again.');
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      // If search query is empty, fetch all purchases
      fetchPurchases();
      return;
    }

    setIsLoading(true);
    purchaseService.searchByReferenceNumber(searchQuery, currentPage, pageSize)
      .then(data => {
        if (data && typeof data === 'object' && 'results' in data) {
          setPurchases(data.results);
          setTotalItems(data.count);
          setHasNextPage(!!data.next);
          setHasPrevPage(!!data.previous);
          setTotalPages(Math.ceil(data.count / pageSize));
        } else {
          // Fallback for non-paginated response
          setPurchases(Array.isArray(data) ? data : []);
          setTotalItems(Array.isArray(data) ? data.length : 0);
          setTotalPages(Math.ceil((Array.isArray(data) ? data.length : 0) / pageSize));
        }
        setError(null);
      })
      .catch(err => {
        console.error('Error searching purchases:', err);
        setError('Failed to search purchases. Please try again.');
        setPurchases([]);
      })
      .finally(() => setIsLoading(false));
  };

  const handleDateFilter = () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }
    
    setIsLoading(true);
    purchaseService.getByDateRange(startDate, endDate, currentPage, pageSize)
      .then(data => {
        if (data && typeof data === 'object' && 'results' in data) {
          setPurchases(data.results);
          setTotalItems(data.count);
          setHasNextPage(!!data.next);
          setHasPrevPage(!!data.previous);
          setTotalPages(Math.ceil(data.count / pageSize));
        } else {
          // Fallback for non-paginated response
          setPurchases(Array.isArray(data) ? data : []);
          setTotalItems(Array.isArray(data) ? data.length : 0);
          setTotalPages(Math.ceil((Array.isArray(data) ? data.length : 0) / pageSize));
        }
        setError(null);
      })
      .catch(err => {
        console.error('Error filtering purchases by date:', err);
        setError('Date filter failed. Please try again.');
        setPurchases([]);
      })
      .finally(() => setIsLoading(false));
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setPaymentStatus(value);
    
    if (value) {
      setIsLoading(true);
      purchaseService.getByPaymentStatus(value, currentPage, pageSize)
        .then(data => {
          if (data && typeof data === 'object' && 'results' in data) {
            setPurchases(data.results);
            setTotalItems(data.count);
            setHasNextPage(!!data.next);
            setHasPrevPage(!!data.previous);
            setTotalPages(Math.ceil(data.count / pageSize));
          } else {
            // Fallback for non-paginated response
            setPurchases(Array.isArray(data) ? data : []);
            setTotalItems(Array.isArray(data) ? data.length : 0);
            setTotalPages(Math.ceil((Array.isArray(data) ? data.length : 0) / pageSize));
          }
          setError(null);
        })
        .catch(err => {
          console.error('Error filtering purchases by status:', err);
          setError('Status filter failed. Please try again.');
          setPurchases([]);
        })
        .finally(() => setIsLoading(false));
    } else {
      fetchPurchases();
    }
  };

  const columns = [
    { header: 'Reference #', accessor: 'reference_number' },
    { 
      header: 'Date', 
      accessor: 'date',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    { 
      header: 'Supplier', 
      accessor: 'supplier_details',
      render: (value: any) => value?.name || 'N/A'
    },
    { header: 'Status', accessor: 'payment_status_display' },
    { 
      header: 'Total HT', 
      accessor: 'ht',
      render: (value: number) => `$${value.toFixed(2)}`
    },
    { 
      header: 'TVA', 
      accessor: 'tva',
      render: (value: number) => `$${value.toFixed(2)}`
    },
    { 
      header: 'Total TTC', 
      accessor: 'ttc',
      render: (value: number) => `$${value.toFixed(2)}`
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (_: any, item: Purchase) => (
        <div className="flex space-x-2">
          <button onClick={() => handleViewPurchase(item)} className="btn btn-sm btn-info">View</button>
          <button onClick={() => handleEditPurchase(item)} className="btn btn-sm btn-warning">Edit</button>
          <button onClick={() => handleDeletePurchase(item.id)} className="btn btn-sm btn-error">Delete</button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Purchases</h1>
        <Button onClick={handleCreatePurchase}>Add Purchase</Button>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-4">
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">Filter by Payment Status</span>
          </label>
          <select 
            className="select select-bordered" 
            value={paymentStatus}
            onChange={handleStatusFilterChange}
          >
            <option value="">All Statuses</option>
            {paymentStatusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Filter by Date Range</span>
          </label>
          <div className="flex gap-2 m-r-20">
            <input 
              type="date" 
              className="input input-bordered w-full" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="self-center">to</span>
            <input 
              type="date" 
              className="input input-bordered w-full" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <Button 
              className="ml-2" 
              onClick={handleDateFilter}
            >
              Apply
            </Button>
          </div>
        </div>

        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">Search by Reference #</span>
          </label>
          <div className="flex">
            <input 
              type="text" 
              className="input input-bordered w-full" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter reference number"
            />
            <Button 
              className="ml-2" 
              onClick={handleSearch}
            >
              Search
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <Table 
          columns={columns} 
          data={ensuredPurchases} 
          isLoading={isLoading} 
          onRowClick={handleViewPurchase}
        />
        
        {/* Pagination Controls */}
        <div className="flex items-center justify-between border-t border-base-200 bg-base-100 px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={!hasPrevPage}
              className={`relative inline-flex items-center rounded-md border border-base-300 bg-base-100 px-4 py-2 text-sm font-medium ${!hasPrevPage ? 'text-base-300' : 'text-base-content hover:bg-base-200'}`}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={!hasNextPage}
              className={`relative ml-3 inline-flex items-center rounded-md border border-base-300 bg-base-100 px-4 py-2 text-sm font-medium ${!hasNextPage ? 'text-base-300' : 'text-base-content hover:bg-base-200'}`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{ensuredPurchases.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, totalItems)}
                </span> of{' '}
                <span className="font-medium">{totalItems}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={!hasPrevPage}
                  className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${!hasPrevPage ? 'text-base-300' : 'text-base-content hover:bg-base-200'}`}
                >
                  <span className="sr-only">Previous</span>
                  <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show pages around current page
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
                      onClick={() => setCurrentPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === pageNum ? 'z-10 bg-primary text-primary-content focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary' : 'text-base-content ring-1 ring-inset ring-base-300 hover:bg-base-200 focus:outline-offset-0'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!hasNextPage}
                  className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${!hasNextPage ? 'text-base-300' : 'text-base-content hover:bg-base-200'}`}
                >
                  <span className="sr-only">Next</span>
                  <FiChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </Card>

      {/* Purchase Form Modal */}
      <PurchaseFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={onSubmit}
        editingPurchase={editingPurchase}
        phones={ensuredPhones}
        accessories={ensuredAccessories}
        suppliers={ensuredSuppliers}
        paymentStatusOptions={paymentStatusOptions}
        paymentMethodOptions={paymentMethodOptions}
      />

      {/* View Purchase Modal */}
      <PurchaseViewModal 
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        purchase={viewingPurchase}
      />
    </div>
  );
};

export default Purchases;
