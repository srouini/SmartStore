import React, { useState, useEffect } from 'react';
import saleService from '../api/saleService';
import type { Sale } from '../api/saleService';
import phoneService from '../api/phoneService';
import type { Phone } from '../api/phoneService';
import accessoryService from '../api/accessoryService';
import type { Accessory } from '../api/accessoryService';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import SaleFormModal from '../components/sales/SaleFormModal';
import SaleViewModal from '../components/sales/SaleViewModal';
import { useAuth } from '../contexts/AuthContext';

const Sales: React.FC = () => {
  const { /* user */ } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [phones, setPhones] = useState<Phone[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  
  // Ensure arrays are always arrays
  const ensuredSales = Array.isArray(sales) ? sales : [];
  const ensuredPhones = Array.isArray(phones) ? phones : [];
  const ensuredAccessories = Array.isArray(accessories) ? accessories : [];
  
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
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [saleType, setSaleType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Sale type options
  const saleTypeOptions = [
    { value: 'particular', label: 'Particular (Retail)' },
    { value: 'semi-bulk', label: 'Semi-Bulk' },
    { value: 'bulk', label: 'Bulk (Wholesale)' }
  ];

  // Fetch sales, phones, and accessories on component mount
  useEffect(() => {
    fetchSales();
    fetchPhones();
    fetchAccessories();
  }, []);

  // Effect to refetch when page changes
  useEffect(() => {
    if (!isLoading) {
      fetchSales();
    }
  }, [currentPage, pageSize]);

  const fetchSales = async (params?: Record<string, any>) => {
    try {
      setIsLoading(true);
      
      // Add pagination parameters
      const paginationParams = {
        ...params,
        page: currentPage,
        page_size: pageSize
      };
      
      const data = await saleService.getAllSales(paginationParams);
      
      // Handle paginated response if available
      if (data && typeof data === 'object' && 'results' in data) {
        setSales(data.results);
        setTotalItems(data.count);
        setHasNextPage(!!data.next);
        setHasPrevPage(!!data.previous);
        setTotalPages(Math.ceil(data.count / pageSize));
      } else {
        // Fallback for non-paginated response
        setSales(Array.isArray(data) ? data : []);
        setTotalItems(Array.isArray(data) ? data.length : 0);
        setTotalPages(Math.ceil((Array.isArray(data) ? data.length : 0) / pageSize));
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Error fetching sales:', err);
      setError('Failed to load sales. Please try again.');
      setSales([]);
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

  const handleCreateSale = () => {
    setIsModalOpen(true);
  };

  const handleViewSale = (sale: Sale) => {
    setViewingSale(sale);
    setViewModalOpen(true);
  };

  const onSubmit = async (data: any) => {
    try {
      // Format the data correctly
      await saleService.recordSale(data);
      setIsModalOpen(false);
      fetchSales();
    } catch (err: any) {
      console.error('Error recording sale:', err);
      setError('Failed to record sale. Please try again.');
    }
  };

  const handleDateFilter = () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }
    
    setIsLoading(true);
    saleService.getSalesByDateRange(startDate, endDate, currentPage, pageSize)
      .then(data => {
        if (data && typeof data === 'object' && 'results' in data) {
          setSales(data.results);
          setTotalItems(data.count);
          setHasNextPage(!!data.next);
          setHasPrevPage(!!data.previous);
          setTotalPages(Math.ceil(data.count / pageSize));
        } else {
          // Fallback for non-paginated response
          setSales(Array.isArray(data) ? data : []);
          setTotalItems(Array.isArray(data) ? data.length : 0);
          setTotalPages(Math.ceil((Array.isArray(data) ? data.length : 0) / pageSize));
        }
        setError(null);
      })
      .catch(err => {
        console.error('Error filtering sales by date:', err);
        setError('Date filter failed. Please try again.');
        setSales([]);
      })
      .finally(() => setIsLoading(false));
  };

  const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSaleType(value);
    
    if (value) {
      setIsLoading(true);
      saleService.getSalesByType(value as any, currentPage, pageSize)
        .then(data => {
          if (data && typeof data === 'object' && 'results' in data) {
            setSales(data.results);
            setTotalItems(data.count);
            setHasNextPage(!!data.next);
            setHasPrevPage(!!data.previous);
            setTotalPages(Math.ceil(data.count / pageSize));
          } else {
            // Fallback for non-paginated response
            setSales(Array.isArray(data) ? data : []);
            setTotalItems(Array.isArray(data) ? data.length : 0);
            setTotalPages(Math.ceil((Array.isArray(data) ? data.length : 0) / pageSize));
          }
          setError(null);
        })
        .catch(err => {
          console.error('Error filtering sales by type:', err);
          setError('Type filter failed. Please try again.');
          setSales([]);
        })
        .finally(() => setIsLoading(false));
    } else {
      fetchSales();
    }
  };

  const handleCustomerSearch = () => {
    if (!searchQuery.trim()) {
      fetchSales();
      return;
    }

    setIsLoading(true);
    saleService.getSalesByCustomer(searchQuery, currentPage, pageSize)
      .then(data => {
        if (data && typeof data === 'object' && 'results' in data) {
          setSales(data.results);
          setTotalItems(data.count);
          setHasNextPage(!!data.next);
          setHasPrevPage(!!data.previous);
          setTotalPages(Math.ceil(data.count / pageSize));
        } else {
          // Fallback for non-paginated response
          setSales(Array.isArray(data) ? data : []);
          setTotalItems(Array.isArray(data) ? data.length : 0);
          setTotalPages(Math.ceil((Array.isArray(data) ? data.length : 0) / pageSize));
        }
        setError(null);
      })
      .catch(err => {
        console.error('Error searching sales by customer:', err);
        setError('Search failed. Please try again.');
        setSales([]);
      })
      .finally(() => setIsLoading(false));
  };

  const columns = [
    { 
      header: 'ID', 
      accessor: 'id' 
    },
    { 
      header: 'Date', 
      accessor: 'sale_date',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    { 
      header: 'Type', 
      accessor: 'sale_type_display' 
    },
    { 
      header: 'Customer', 
      accessor: 'customer_name',
      render: (value: string | null) => value || 'Walk-in Customer'
    },
    { 
      header: 'Total Amount', 
      accessor: 'total_amount',
      render: (value: number) => `$${value.toFixed(2)}`
    },
    { 
      header: 'Invoice', 
      accessor: 'has_invoice',
      render: (value: boolean) => value ? 
        <span className="badge badge-success">Yes</span> : 
        <span className="badge badge-ghost">No</span>
    },
    { 
      header: 'Sold By', 
      accessor: 'sold_by_username',
      render: (value: string | null) => value || 'System'
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (_: any, item: Sale) => (
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              handleViewSale(item);
            }}
          >
            View
          </Button>
        </div>
      )
    }
  ];



  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sales</h1>
        <Button onClick={handleCreateSale}>Record Sale</Button>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-4">
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">Filter by Sale Type</span>
          </label>
          <select 
            className="select select-bordered" 
            value={saleType}
            onChange={handleTypeFilterChange}
          >
            <option value="">All Types</option>
            {saleTypeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Filter by Date Range</span>
          </label>
          <div className="flex gap-2">
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
        <div className="form-control">
          <label className="label">
            <span className="label-text">Search by Customer</span>
          </label>
          <div className="flex">
            <input 
              type="text" 
              className="input input-bordered w-full" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter customer name"
            />
            <Button 
              className="ml-2" 
              onClick={handleCustomerSearch}
            >
              Search
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <Table 
          columns={columns} 
          data={ensuredSales} 
          isLoading={isLoading} 
          onRowClick={handleViewSale}
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
                Showing <span className="font-medium">{ensuredSales.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to{' '}
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
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
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
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </Card>

      {/* Sale Form Modal */}
      <SaleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={onSubmit}
        phones={ensuredPhones}
        accessories={ensuredAccessories}
        saleTypeOptions={saleTypeOptions}
      />

      {/* View Sale Modal */}
      <SaleViewModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        sale={viewingSale}
      />
    </div>
  );
};

export default Sales;
