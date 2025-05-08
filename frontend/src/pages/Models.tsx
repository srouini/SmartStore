import React, { useState, useEffect } from 'react';
import modelService from '../api/modelService';
import type { Model } from '../api/modelService';
import brandService from '../api/brandService';
import type { Brand } from '../api/brandService';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { useForm } from 'react-hook-form';

const Models: React.FC = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  
  // Ensure arrays are always arrays
  const ensuredBrands = Array.isArray(brands) ? brands : [];
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Model>();

  // Fetch models and brands on component mount
  useEffect(() => {
    fetchModels();
    fetchBrands();
  }, []);

  // Fetch models filtered by brand if selectedBrand changes
  useEffect(() => {
    if (selectedBrand) {
      fetchModelsByBrand(selectedBrand);
    } else {
      fetchModels();
    }
  }, [selectedBrand]);

  const fetchModels = async () => {
    try {
      setIsLoading(true);
      const data = await modelService.getAllModels();
      setModels(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching models:', err);
      setError('Failed to load models. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchModelsByBrand = async (brandId: number) => {
    try {
      setIsLoading(true);
      const data = await modelService.getModelsByBrand(brandId);
      setModels(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching models by brand:', err);
      setError('Failed to load models. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const data = await brandService.getAllBrands();
      setBrands(data);
    } catch (err: any) {
      console.error('Error fetching brands:', err);
    }
  };

  const handleCreateModel = () => {
    setEditingModel(null);
    reset({
      name: '',
      brand: selectedBrand || undefined,
      description: '',
      release_date: ''
    });
    setIsModalOpen(true);
  };

  const handleEditModel = (model: Model) => {
    setEditingModel(model);
    reset({
      name: model.name,
      brand: model.brand,
      description: model.description || '',
      release_date: model.release_date ? model.release_date.split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteModel = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this model?')) return;
    
    try {
      await modelService.deleteModel(id);
      setModels(models.filter(model => model.id !== id));
    } catch (err: any) {
      console.error('Error deleting model:', err);
      setError('Failed to delete model. Please try again.');
    }
  };

  const onSubmit = async (data: any) => {
    try {
      if (editingModel) {
        await modelService.updateModel(editingModel.id, data);
      } else {
        await modelService.createModel(data);
      }
      
      setIsModalOpen(false);
      if (selectedBrand) {
        fetchModelsByBrand(selectedBrand);
      } else {
        fetchModels();
      }
    } catch (err: any) {
      console.error('Error saving model:', err);
      setError('Failed to save model. Please try again.');
    }
  };

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedBrand(value ? parseInt(value) : null);
  };

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Brand', accessor: 'brand_name' },
    { 
      header: 'Release Date', 
      accessor: 'release_date',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-'
    },
    { header: 'Description', accessor: 'description' },
    {
      header: 'Actions',
      accessor: 'id',
      render: (_: any, item: Model) => (
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              handleEditModel(item);
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
              handleDeleteModel(item.id);
            }}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Phone Models</h1>
          <p className="text-sm text-gray-500 mt-1">Models represent specific product lines (e.g., iPhone 14, Galaxy S23) under a brand</p>
        </div>
        <Button onClick={handleCreateModel}>Add Model</Button>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      <div className="mb-4">
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">Filter by Brand</span>
          </label>
          <select 
            className="select select-bordered" 
            value={selectedBrand || ''}
            onChange={handleBrandChange}
          >
            <option value="">All Brands</option>
            {ensuredBrands.map(brand => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </select>
        </div>
      </div>

      <Card>
        <Table 
          columns={columns} 
          data={models} 
          isLoading={isLoading} 
          onRowClick={handleEditModel}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingModel ? 'Edit Model' : 'Add Model'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)}>Save</Button>
          </>
        }
      >
        <form className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Brand*</span>
            </label>
            <select
              className={`select select-bordered ${errors.brand ? 'select-error' : ''}`}
              {...register('brand', { required: 'Brand is required' })}
            >
              <option value="">Select a brand</option>
              {ensuredBrands.map(brand => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
            {errors.brand && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.brand.message}</span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Model Name*</span>
              <span className="label-text-alt text-info">e.g., iPhone 14, Galaxy S23</span>
            </label>
            <input
              type="text"
              className={`input input-bordered ${errors.name ? 'input-error' : ''}`}
              {...register('name', { required: 'Model name is required' })}
              placeholder="Enter the model name without variant details"
            />
            {errors.name && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.name.message}</span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Release Date</span>
            </label>
            <input
              type="date"
              className="input input-bordered"
              {...register('release_date')}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              className="textarea textarea-bordered"
              rows={3}
              {...register('description')}
            ></textarea>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Models;
