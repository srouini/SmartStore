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

  const fetchSales = async (params?: Record<string, any>) => {
    try {
      setIsLoading(true);
      const data = await saleService.getAllSales(params);
      setSales(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching sales:', err);
      setError('Failed to load sales. Please try again.');
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
    
    saleService.getSalesByDateRange(startDate, endDate)
      .then(data => {
        setSales(data);
        setError(null);
      })
      .catch(err => {
        console.error('Error filtering sales by date:', err);
        setError('Date filter failed. Please try again.');
      });
  };

  const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSaleType(value);
    
    if (value) {
      saleService.getSalesByType(value as any)
        .then(data => {
          setSales(data);
          setError(null);
        })
        .catch(err => {
          console.error('Error filtering sales by type:', err);
          setError('Type filter failed. Please try again.');
        });
    } else {
      fetchSales();
    }
  };

  const handleCustomerSearch = () => {
    if (!searchQuery) {
      fetchSales();
      return;
    }
    
    saleService.getSalesByCustomer(searchQuery)
      .then(data => {
        setSales(data);
        setError(null);
      })
      .catch(err => {
        console.error('Error searching sales by customer:', err);
        setError('Search failed. Please try again.');
      });
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
