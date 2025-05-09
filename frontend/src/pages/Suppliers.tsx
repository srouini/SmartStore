import React, { useState, useEffect } from 'react';
import supplierService from '../api/supplierService';
import { Supplier } from '../api/purchaseService';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { useForm } from 'react-hook-form';

const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const ensuredSuppliers = Array.isArray(suppliers) ? suppliers : [];
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>({
    defaultValues: {
      name: '',
      address: '',
      email: '',
      tel: '',
      code: '',
      RC: '',
      NIF: '',
      AI: '',
      NIS: '',
      soumis_tva: true
    }
  });

  // Fetch suppliers on component mount
  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async (params?: Record<string, any>) => {
    try {
      setIsLoading(true);
      const data = await supplierService.getAllSuppliers(params);
      setSuppliers(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching suppliers:', err);
      setError('Failed to load suppliers. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSupplier = () => {
    setEditingSupplier(null);
    reset({
      name: '',
      address: '',
      email: '',
      tel: '',
      code: '',
      RC: '',
      NIF: '',
      AI: '',
      NIS: '',
      soumis_tva: true
    });
    setIsModalOpen(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    reset({
      name: supplier.name,
      address: supplier.address,
      email: supplier.email,
      tel: supplier.tel,
      code: supplier.code,
      RC: supplier.RC,
      NIF: supplier.NIF,
      AI: supplier.AI,
      NIS: supplier.NIS,
      soumis_tva: supplier.soumis_tva
    });
    setIsModalOpen(true);
  };

  const handleDeleteSupplier = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) {
      return;
    }

    try {
      await supplierService.deleteSupplier(id);
      fetchSuppliers();
    } catch (err: any) {
      console.error('Error deleting supplier:', err);
      setError('Failed to delete supplier. Please try again.');
    }
  };

  const onSubmit = async (data: any) => {
    try {
      if (editingSupplier) {
        await supplierService.updateSupplier(editingSupplier.id, data);
      } else {
        await supplierService.createSupplier(data);
      }
      setIsModalOpen(false);
      fetchSuppliers();
    } catch (err: any) {
      console.error('Error saving supplier:', err);
      setError('Failed to save supplier. Please try again.');
    }
  };

  const handleSearch = () => {
    if (!searchQuery) {
      fetchSuppliers();
      return;
    }
    
    supplierService.searchByName(searchQuery)
      .then(data => {
        setSuppliers(data);
        setError(null);
      })
      .catch(err => {
        console.error('Error searching suppliers:', err);
        setError('Failed to search suppliers. Please try again.');
      });
  };

  const columns = [
    { header: 'Name', accessor: 'name' },
    { 
      header: 'Contact', 
      accessor: 'tel',
      render: (value: string) => value || 'N/A'
    },
    { 
      header: 'Email', 
      accessor: 'email',
      render: (value: string) => value || 'N/A'
    },
    { 
      header: 'Code', 
      accessor: 'code',
      render: (value: string) => value || 'N/A'
    },
    { 
      header: 'TVA', 
      accessor: 'soumis_tva',
      render: (value: boolean) => value ? 'Yes' : 'No'
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (_: any, item: Supplier) => (
        <div className="flex space-x-2">
          <button onClick={() => handleEditSupplier(item)} className="btn btn-sm btn-warning">Edit</button>
          <button onClick={() => handleDeleteSupplier(item.id)} className="btn btn-sm btn-error">Delete</button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Suppliers</h1>
        <Button onClick={handleCreateSupplier}>Add Supplier</Button>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-4">
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">Search by Name</span>
          </label>
          <div className="flex">
            <input 
              type="text" 
              className="input input-bordered w-full" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter supplier name"
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
          data={ensuredSuppliers} 
          isLoading={isLoading} 
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Name*</span>
            </label>
            <input
              type="text"
              className={`input input-bordered ${errors.name ? 'input-error' : ''}`}
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.name.message as string}</span>
              </label>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Address</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                {...register('address')}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                className={`input input-bordered ${errors.email ? 'input-error' : ''}`}
                {...register('email', {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
              {errors.email && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.email.message as string}</span>
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Phone</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                {...register('tel')}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Code</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                {...register('code')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">RC</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                {...register('RC')}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">NIF</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                {...register('NIF')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">AI</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                {...register('AI')}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">NIS</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                {...register('NIS')}
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Subject to TVA</span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                {...register('soumis_tva')}
              />
            </label>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingSupplier ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Suppliers;
