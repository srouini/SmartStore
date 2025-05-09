import React, { useState, useEffect } from 'react';
import purchaseService from '../api/purchaseService';
import type { Purchase, Supplier } from '../api/purchaseService';
import supplierService from '../api/supplierService';
import phoneService from '../api/phoneService';
import type { Phone } from '../api/phoneService';
import accessoryService from '../api/accessoryService';
import type { Accessory } from '../api/accessoryService';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { useForm, useFieldArray } from 'react-hook-form';
import { format } from 'date-fns';

const Purchases: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [phones, setPhones] = useState<Phone[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  
  // Ensure arrays are always arrays
  const ensuredPurchases = Array.isArray(purchases) ? purchases : [];
  const ensuredPhones = Array.isArray(phones) ? phones : [];
  const ensuredAccessories = Array.isArray(accessories) ? accessories : [];
  const ensuredSuppliers = Array.isArray(suppliers) ? suppliers : [];
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

  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm<any>({
    defaultValues: {
      supplier_name: '',
      supplier_contact: '',
      reference_number: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      payment_status: 'PENDING',
      payment_method: 'CASH',
      notes: '',
      items: [{ product_type: 'PHONE', product_id: '', quantity: 1, unit_price: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const watchItems = watch('items');
  const watchProductTypes = watchItems?.map((item: any) => item.product_type);

  // Fetch data on component mount
  useEffect(() => {
    fetchPurchases();
    fetchPhones();
    fetchAccessories();
    fetchSuppliers();
  }, []);

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
    { value: 'CHECK', label: 'Check' },
    { value: 'MOBILE_PAYMENT', label: 'Mobile Payment' },
    { value: 'OTHER', label: 'Other' }
  ];

  const fetchPurchases = async (params?: Record<string, any>) => {
    try {
      setIsLoading(true);
      const data = await purchaseService.getAllPurchases(params);
      setPurchases(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching purchases:', err);
      setError('Failed to load purchases. Please try again.');
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
      setSuppliers(data);
    } catch (err: any) {
      console.error('Error fetching suppliers:', err);
    }
  };

  const handleCreatePurchase = () => {
    setEditingPurchase(null);
    reset({
      supplier_id: '',
      reference_number: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      payment_status: 'PENDING',
      payment_method: 'CASH',
      notes: '',
      soumis_tva: true,
      discount: 0,
      items: [{ product_type: 'PHONE', product_id: '', quantity: 1, unit_price: 0, discount: 0 }]
    });
    setIsModalOpen(true);
  };

  const handleEditPurchase = (purchase: Purchase) => {
    setEditingPurchase(purchase);
    
    // Format items for the form
    const formattedItems = purchase.items.map(item => ({
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount: item.discount || 0
    }));
    
    reset({
      supplier_id: purchase.supplier || '',
      reference_number: purchase.reference_number,
      date: purchase.date,
      payment_status: purchase.payment_status,
      payment_method: purchase.payment_method,
      notes: purchase.notes || '',
      soumis_tva: purchase.soumis_tva !== undefined ? purchase.soumis_tva : true,
      discount: purchase.discount || 0,
      items: formattedItems
    });
    
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
    if (!searchQuery) {
      fetchPurchases();
      return;
    }
    
    purchaseService.searchByReferenceNumber(searchQuery)
      .then(data => {
        setPurchases(data);
        setError(null);
      })
      .catch(err => {
        console.error('Error searching purchases:', err);
        setError('Search failed. Please try again.');
      });
  };

  const handleDateFilter = () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }
    
    purchaseService.getByDateRange(startDate, endDate)
      .then(data => {
        setPurchases(data);
        setError(null);
      })
      .catch(err => {
        console.error('Error filtering purchases by date:', err);
        setError('Date filter failed. Please try again.');
      });
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setPaymentStatus(value);
    
    if (value) {
      purchaseService.getByPaymentStatus(value)
        .then(data => {
          setPurchases(data);
          setError(null);
        })
        .catch(err => {
          console.error('Error filtering purchases by status:', err);
          setError('Status filter failed. Please try again.');
        });
    } else {
      fetchPurchases();
    }
  };

  const handleAddItem = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    append({ product_type: 'PHONE', product_id: '', quantity: 1, unit_price: 0, discount: 0 });
  };

  const handleRemoveItem = (index: number) => {
    remove(index);
  };

  const getProductOptions = (productType: string) => {
    if (productType === 'PHONE') {
      return ensuredPhones.map(phone => (
        <option key={phone.id} value={phone.id}>
          {phone.name} ({phone.code}) - ${phone.cost_price}
        </option>
      ));
    } else if (productType === 'ACCESSORY') {
      return ensuredAccessories.map(accessory => (
        <option key={accessory.id} value={accessory.id}>
          {accessory.name} ({accessory.code}) - ${accessory.cost_price}
        </option>
      ));
    }
    return null;
  };

  const handleProductChange = (index: number, productId: string, productType: string) => {
    if (!productId) return;
    
    const id = parseInt(productId);
    let product;
    
    if (productType === 'PHONE') {
      product = phones.find(p => p.id === id);
      if (product) {
        setValue(`items.${index}.unit_price`, product.cost_price);
      }
    } else if (productType === 'ACCESSORY') {
      product = accessories.find(a => a.id === id);
      if (product) {
        setValue(`items.${index}.unit_price`, product.cost_price);
      }
    }
  };

  const calculateTotalAmount = () => {
    if (!watchItems) return 0;
    
    return watchItems.reduce(
      (sum: number, item: any) => sum + (item.quantity * item.unit_price),
      0
    );
  };

  const columns = [
    { 
      header: 'Reference #', 
      accessor: 'reference_number' 
    },
    { 
      header: 'Date', 
      accessor: 'date',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    { header: 'Supplier', accessor: 'supplier_name' },
    { 
      header: 'Total Amount', 
      accessor: 'total_amount',
      render: (value: number) => `$${value.toFixed(2)}`
    },
    { 
      header: 'Payment Status', 
      accessor: 'payment_status_display',
      render: (value: string, item: Purchase) => (
        <span className={`badge ${
          item.payment_status === 'PAID' ? 'badge-success' : 
          item.payment_status === 'PARTIAL' ? 'badge-warning' : 
          item.payment_status === 'CANCELLED' ? 'badge-error' : 
          'badge-ghost'
        }`}>
          {value}
        </span>
      )
    },
    { header: 'Payment Method', accessor: 'payment_method_display' },
    {
      header: 'Actions',
      accessor: 'id',
      render: (_: any, item: Purchase) => (
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              handleViewPurchase(item);
            }}
          >
            View
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              handleEditPurchase(item);
            }}
          >
            Edit
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-error" 
            onClick={(e) => {
              e.stopPropagation();
              handleDeletePurchase(item.id);
            }}
          >
            Delete
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
      accessor: 'quantity' 
    },
    { 
      header: 'Unit Price', 
      accessor: 'unit_price',
      render: (value: number) => `$${value.toFixed(2)}`
    },
    { 
      header: 'Total', 
      accessor: 'total_price',
      render: (value: number) => `$${value.toFixed(2)}`
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
      </Card>

      {/* Add/Edit Purchase Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPurchase ? 'Edit Purchase' : 'Add Purchase'}
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
                <span className="label-text">Supplier*</span>
              </label>
              <select
                className={`select select-bordered ${errors.supplier_id ? 'select-error' : ''}`}
                {...register('supplier_id', { required: 'Supplier is required' })}
              >
                <option value="">Select a supplier</option>
                {ensuredSuppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                ))}
              </select>
              {errors.supplier_id && (
                <label className="label">
                  <span className="label-text-alt text-error">{String(errors.supplier_id.message)}</span>
                </label>
              )}
              <div className="mt-2 text-right">
                <a href="/suppliers" target="_blank" className="text-sm text-primary hover:underline">
                  Manage Suppliers
                </a>
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Reference Number*</span>
              </label>
              <input
                type="text"
                className={`input input-bordered ${errors.reference_number ? 'input-error' : ''}`}
                {...register('reference_number', { required: 'Reference number is required' })}
              />
              {errors.reference_number && (
                <label className="label">
                  <span className="label-text-alt text-error">{String(errors.reference_number.message)}</span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Date*</span>
              </label>
              <input
                type="date"
                className={`input input-bordered ${errors.date ? 'input-error' : ''}`}
                {...register('date', { required: 'Date is required' })}
              />
              {errors.date && (
                <label className="label">
                  <span className="label-text-alt text-error">{String(errors.date.message)}</span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Payment Status*</span>
              </label>
              <select
                className={`select select-bordered ${errors.payment_status ? 'select-error' : ''}`}
                {...register('payment_status', { required: 'Payment status is required' })}
              >
                {paymentStatusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Payment Method*</span>
              </label>
              <select
                className={`select select-bordered ${errors.payment_method ? 'select-error' : ''}`}
                {...register('payment_method', { required: 'Payment method is required' })}
              >
                {paymentMethodOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {errors.payment_method && (
                <label className="label">
                  <span className="label-text-alt text-error">{String(errors.payment_method.message)}</span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Soumis TVA</span>
              </label>
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  className="checkbox"
                  {...register('soumis_tva')}
                />
                <span className="ml-2">Apply TVA to this purchase</span>
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Discount</span>
              </label>
              <input
                type="number"
                step="0.01"
                className={`input input-bordered ${errors.discount ? 'input-error' : ''}`}
                {...register('discount', { 
                  valueAsNumber: true,
                  validate: value => (value >= 0) || 'Must be non-negative'
                })}
              />
              <label className="label">
                <span className="label-text-alt">Enter percentage (1-100) or absolute amount (greater than 100)</span>
              </label>
            </div>

            <div className="form-control md:col-span-2">
              <label className="label">
                <span className="label-text">Notes</span>
              </label>
              <textarea
                className="textarea textarea-bordered"
                rows={2}
                {...register('notes')}
              ></textarea>
            </div>
          </div>

          <div className="divider">Purchase Items</div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Items</h3>
              <Button type="button" size="sm" onClick={handleAddItem}>Add Item</Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end border p-2 rounded-md">
                <div className="form-control md:col-span-2">
                  <label className="label">
                    <span className="label-text">Type*</span>
                  </label>
                  <select
                    className={`select select-bordered ${errors.items && errors.items[index]?.product_type ? 'select-error' : ''}`}
                    {...register(`items.${index}.product_type`, { required: 'Required' })}
                  >
                    <option value="PHONE">Phone</option>
                    <option value="ACCESSORY">Accessory</option>
                  </select>
                </div>

                <div className="form-control md:col-span-3">
                  <label className="label">
                    <span className="label-text">Product*</span>
                  </label>
                  <select
                    className={`select select-bordered ${errors.items && errors.items[index]?.product_id ? 'select-error' : ''}`}
                    {...register(`items.${index}.product_id`, { required: 'Required' })}
                    onChange={(e) => handleProductChange(index, e.target.value, watchProductTypes[index])}
                  >
                    <option value="">Select a product</option>
                    {getProductOptions(watchProductTypes?.[index] || '')}
                  </select>
                </div>

                <div className="form-control md:col-span-2">
                  <label className="label">
                    <span className="label-text">Quantity*</span>
                  </label>
                  <input
                    type="number"
                    className={`input input-bordered ${errors.items && errors.items[index]?.quantity ? 'input-error' : ''}`}
                    {...register(`items.${index}.quantity`, { 
                      required: 'Required',
                      min: { value: 1, message: 'Min 1' }
                    })}
                    min="1"
                  />
                </div>

                <div className="form-control md:col-span-2">
                  <label className="label">
                    <span className="label-text">Unit Price*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className={`input input-bordered ${errors.items && errors.items[index]?.unit_price ? 'input-error' : ''}`}
                    {...register(`items.${index}.unit_price`, { 
                      required: 'Required',
                      min: { value: 0, message: 'Min 0' }
                    })}
                    min="0"
                  />
                </div>

                <div className="form-control md:col-span-2">
                  <label className="label">
                    <span className="label-text">Total</span>
                  </label>
                  <div className="input input-bordered bg-base-200 flex items-center">
                    ${(watchItems[index]?.quantity * watchItems[index]?.unit_price || 0).toFixed(2)}
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

      {/* View Purchase Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Purchase Details"
        footer={
          <Button onClick={() => setViewModalOpen(false)}>Close</Button>
        }
        size="lg"
      >
        {viewingPurchase && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold">Reference Number</h3>
                <p>{viewingPurchase.reference_number}</p>
              </div>
              <div>
                <h3 className="font-bold">Date</h3>
                <p>{new Date(viewingPurchase.date).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="font-bold">Supplier</h3>
                <p>{viewingPurchase.supplier_name}</p>
              </div>
              <div>
                <h3 className="font-bold">Supplier Contact</h3>
                <p>{viewingPurchase.supplier_contact || 'N/A'}</p>
              </div>
              <div>
                <h3 className="font-bold">Payment Status</h3>
                <p>
                  <span className={`badge ${
                    viewingPurchase.payment_status === 'PAID' ? 'badge-success' : 
                    viewingPurchase.payment_status === 'PARTIAL' ? 'badge-warning' : 
                    viewingPurchase.payment_status === 'CANCELLED' ? 'badge-error' : 
                    'badge-ghost'
                  }`}>
                    {viewingPurchase.payment_status_display}
                  </span>
                </p>
              </div>
              <div>
                <h3 className="font-bold">Payment Method</h3>
                <p>{viewingPurchase.payment_method_display}</p>
              </div>
              <div className="md:col-span-2">
                <h3 className="font-bold">Notes</h3>
                <p>{viewingPurchase.notes || 'N/A'}</p>
              </div>
            </div>

            <div className="divider">Items</div>

            <Table 
              columns={itemColumns} 
              data={viewingPurchase.items || []} 
              isLoading={false}
            />

            <div className="flex justify-end">
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title">Total Amount</div>
                  <div className="stat-value text-primary">${viewingPurchase.total_amount.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
        )}
        {ensuredPurchases.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold mb-2">No Purchases Found</h2>
            <p className="text-gray-500 text-center max-w-md mb-6">
              You haven't created any purchases yet. Click the "Add Purchase" button to create your first purchase.
            </p>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default Purchases;
