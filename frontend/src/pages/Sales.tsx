import React, { useState, useEffect } from 'react';
import saleService from '../api/saleService';
import type { Sale, SaleItem, RecordSaleRequest } from '../api/saleService';
import phoneService from '../api/phoneService';
import type { Phone } from '../api/phoneService';
import accessoryService from '../api/accessoryService';
import type { Accessory } from '../api/accessoryService';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { useForm, useFieldArray } from 'react-hook-form';
// import { format } from 'date-fns';
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

  // Add a type assertion to handle the form properly
  type FormValues = Omit<RecordSaleRequest, 'items'> & {
    items: Array<{
      product_id: number | string;
      quantity: number;
    }>
  };

  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      sale_type: 'particular',
      customer_name: '',
      generate_invoice: false,
      items: [{ product_id: 0, quantity: 1 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });


  const watchItems = watch('items');
  const watchSaleType = watch('sale_type');

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
    reset({
      sale_type: 'particular',
      customer_name: '',
      generate_invoice: false,
      items: [{ product_id: 0, quantity: 1 }]
    });
    setIsModalOpen(true);
  };

  const handleViewSale = (sale: Sale) => {
    setViewingSale(sale);
    setViewModalOpen(true);
  };

  const onSubmit = async (data: any) => {
    try {
      // Format the data correctly
      const formattedData: RecordSaleRequest = {
        ...data,
        items: data.items.map((item: any) => ({
          product_id: typeof item.product_id === 'string' ? parseInt(item.product_id) : item.product_id,
          quantity: item.quantity
        }))
      };
      
      await saleService.recordSale(formattedData);
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

  const handleAddItem = () => {
    append({ product_id: '', quantity: 1 });
  };

  const handleRemoveItem = (index: number) => {
    remove(index);
  };

  const getAllProducts = () => {
    const phoneOptions = ensuredPhones.map(phone => ({
      id: phone.id,
      name: `${phone.name} (${phone.code})`,
      price: getPriceByType(phone, watchSaleType),
      type: 'phone'
    }));
    
    const accessoryOptions = ensuredAccessories.map(accessory => ({
      id: accessory.id,
      name: `${accessory.name} (${accessory.code})`,
      price: getPriceByType(accessory, watchSaleType),
      type: 'accessory'
    }));
    
    return [...phoneOptions, ...accessoryOptions];
  };

  const getPriceByType = (product: Phone | Accessory, saleType: string) => {
    if (saleType === 'bulk' && product.selling_bulk_price) {
      return product.selling_bulk_price;
    } else if (saleType === 'semi-bulk' && product.selling_semi_bulk_price) {
      return product.selling_semi_bulk_price;
    } else {
      return product.selling_unite_price;
    }
  };

  const handleProductChange = (index: number, productId: string) => {
    if (!productId) return;
    
    const id = parseInt(productId);
    const allProducts = getAllProducts();
    const selectedProduct = allProducts.find(p => p.id === id);
    
    if (selectedProduct) {
      setValue(`items.${index}.product_id`, id as any);
    }
  };

  const calculateTotalAmount = () => {
    if (!watchItems) return 0;
    
    return watchItems.reduce((sum, item) => {
      if (!item.product_id) return sum;
      
      const id = parseInt(item.product_id.toString());
      const allProducts = getAllProducts();
      const product = allProducts.find(p => p.id === id);
      
      if (product) {
        return sum + (item.quantity * product.price);
      }
      return sum;
    }, 0);
  };

  const getProductPrice = (productId: number) => {
    const allProducts = getAllProducts();
    const product = allProducts.find(p => p.id === productId);
    return product ? product.price : 0;
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

  const itemColumns = [
    { header: 'Product Type', accessor: 'product_type' },
    { header: 'Product', accessor: 'product_name' },
    { header: 'Code', accessor: 'product_code' },
    { 
      header: 'Quantity', 
      accessor: 'quantity_sold' 
    },
    { 
      header: 'Unit Price', 
      accessor: 'price_per_item',
      render: (value: number) => `$${value.toFixed(2)}`
    },
    { 
      header: 'Total', 
      accessor: 'total',
      render: (_: any, item: SaleItem) => `$${(item.quantity_sold * item.price_per_item).toFixed(2)}`
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

        <div className="form-control w-full max-w-xs">
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

        <div className="form-control w-full max-w-xs">
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

      {/* Record Sale Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Sale"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)}>Save</Button>
          </>
        }
        size="xl"
      >
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Sale Type*</span>
              </label>
              <select
                className={`select select-bordered ${errors.sale_type ? 'select-error' : ''}`}
                {...register('sale_type', { required: 'Sale type is required' })}
              >
                {saleTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Customer Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                {...register('customer_name')}
                placeholder="Leave blank for walk-in customer"
              />
            </div>

            <div className="form-control md:col-span-2">
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  className="checkbox"
                  {...register('generate_invoice')}
                />
                <span className="label-text">Generate Invoice</span>
              </label>
            </div>
          </div>

          <div className="divider">Sale Items</div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Items</h3>
              <Button size="sm" onClick={handleAddItem}>Add Item</Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end border p-2 rounded-md">
                <div className="form-control md:col-span-6">
                  <label className="label">
                    <span className="label-text">Product*</span>
                  </label>
                  <select
                    className={`select select-bordered ${errors.items?.[index]?.product_id ? 'select-error' : ''}`}
                    {...register(`items.${index}.product_id`, { required: 'Product is required' })}
                    onChange={(e) => handleProductChange(index, e.target.value)}
                  >
                    <option value="">Select a product</option>
                    {getAllProducts().map(product => (
                      <option key={`${product.type}-${product.id}`} value={product.id}>
                        {product.name} - ${product.price.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control md:col-span-2">
                  <label className="label">
                    <span className="label-text">Quantity*</span>
                  </label>
                  <input
                    type="number"
                    className={`input input-bordered ${errors.items?.[index]?.quantity ? 'input-error' : ''}`}
                    {...register(`items.${index}.quantity`, { 
                      required: 'Required',
                      min: { value: 1, message: 'Min 1' }
                    })}
                    min="1"
                  />
                </div>

                <div className="form-control md:col-span-3">
                  <label className="label">
                    <span className="label-text">Total</span>
                  </label>
                  <div className="input input-bordered bg-base-200 flex items-center">
                    ${watchItems[index]?.product_id ? 
                      (watchItems[index].quantity * getProductPrice(parseInt(watchItems[index].product_id.toString()))).toFixed(2) : 
                      '0.00'}
                  </div>
                </div>

                <div className="form-control md:col-span-1">
                  <Button 
                    variant="ghost" 
                    className="text-error" 
                    onClick={() => handleRemoveItem(index)}
                    disabled={fields.length <= 1}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex justify-end">
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title">Total Amount</div>
                  <div className="stat-value text-primary">${calculateTotalAmount().toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* View Sale Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Sale Details"
        footer={
          <Button onClick={() => setViewModalOpen(false)}>Close</Button>
        }
        size="lg"
      >
        {viewingSale && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold">Sale ID</h3>
                <p>{viewingSale.id}</p>
              </div>
              <div>
                <h3 className="font-bold">Date</h3>
                <p>{new Date(viewingSale.sale_date).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="font-bold">Sale Type</h3>
                <p>{viewingSale.sale_type_display}</p>
              </div>
              <div>
                <h3 className="font-bold">Customer</h3>
                <p>{viewingSale.customer_name || 'Walk-in Customer'}</p>
              </div>
              <div>
                <h3 className="font-bold">Invoice</h3>
                <p>
                  {viewingSale.has_invoice ? 
                    <span className="badge badge-success">Yes</span> : 
                    <span className="badge badge-ghost">No</span>}
                </p>
              </div>
              <div>
                <h3 className="font-bold">Sold By</h3>
                <p>{viewingSale.sold_by_username || 'System'}</p>
              </div>
            </div>

            <div className="divider">Items</div>

            <Table 
              columns={itemColumns} 
              data={viewingSale.items || []} 
              isLoading={false}
            />

            <div className="flex justify-end">
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title">Total Amount</div>
                  <div className="stat-value text-primary">${viewingSale.total_amount.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Sales;
