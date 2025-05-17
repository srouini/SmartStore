import React, { useState, useEffect } from 'react';
import modelService from '../api/modelService';
import brandService from '../api/brandService';
import type { Brand } from '../api/brandService';

// Extended Model interface with all new specification fields
interface Model {
  id?: number;
  name: string;
  brand: number | Brand;
  brand_name?: string;
  description?: string;
  release_date?: string;
  
  // Network
  network_technology?: string;
  
  // Launch
  launch_announced?: string;
  launch_status?: string;
  
  // Body
  body_dimensions?: string;
  body_weight?: string;
  body_build?: string;
  body_sim?: string;
  body_water_resistant?: string;
  
  // Display
  display_type?: string;
  display_size?: string;
  display_resolution?: string;
  
  // Platform
  platform_os?: string;
  platform_chipset?: string;
  platform_cpu?: string;
  platform_gpu?: string;
  
  // Memory
  memory_card_slot?: string;
  memory_internal?: string;
  
  // Camera
  main_camera?: string;
  selfie_camera?: string;
  
  // Sound
  sound_loudspeaker?: string;
  sound_jack?: string;
  
  // Communications
  comms_nfc?: string;
  comms_infrared_port?: string;
  comms_usb?: string;
  
  // Features
  features_sensors?: string;
  
  // Battery
  battery_type?: string;
  battery_charging?: string;
  
  // Misc
  misc_colors?: string;
}
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import ModelModal, { ModelFormData } from '../components/modals/ModelModal';
import { FiChevronLeft, FiChevronRight, FiTrash2 } from 'react-icons/fi';
import { TbEdit } from 'react-icons/tb';
import { MdPlaylistRemove } from 'react-icons/md';

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
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

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
  
  // Fetch models when page changes
  useEffect(() => {
    if (selectedBrand) {
      fetchModelsByBrand(selectedBrand);
    } else {
      fetchModels();
    }
  }, [currentPage, pageSize]);

  const fetchModels = async () => {
    try {
      setIsLoading(true);
      
      const params = {
        page: currentPage,
        page_size: pageSize
      };
      
      const data = await modelService.getAllModels(params);
      
      if (data && typeof data === 'object' && 'results' in data) {
        setModels(data.results);
        setTotalItems(data.count);
        setHasNextPage(!!data.next);
        setHasPrevPage(!!data.previous);
        setTotalPages(Math.ceil(data.count / pageSize));
      } else if (Array.isArray(data)) {
        setModels(data);
        setTotalItems(data.length);
        setTotalPages(Math.ceil(data.length / pageSize));
        setHasNextPage(currentPage * pageSize < data.length);
        setHasPrevPage(currentPage > 1);
      } else {
        setModels([]);
        setTotalItems(0);
        setTotalPages(0);
        setHasNextPage(false);
        setHasPrevPage(false);
      }
      
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
      
      const data = await modelService.getModelsByBrand(brandId, currentPage, pageSize);
      
      if (data && typeof data === 'object' && 'results' in data) {
        setModels(data.results);
        setTotalItems(data.count);
        setHasNextPage(!!data.next);
        setHasPrevPage(!!data.previous);
        setTotalPages(Math.ceil(data.count / pageSize));
      } else if (Array.isArray(data)) {
        setModels(data);
        setTotalItems(data.length);
        setTotalPages(Math.ceil(data.length / pageSize));
        setHasNextPage(currentPage * pageSize < data.length);
        setHasPrevPage(currentPage > 1);
      } else {
        setModels([]);
        setTotalItems(0);
        setTotalPages(0);
        setHasNextPage(false);
        setHasPrevPage(false);
      }
      
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
      
      if (data && typeof data === 'object' && 'results' in data) {
        setBrands(data.results);
      } else if (Array.isArray(data)) {
        setBrands(data);
      } else {
        setBrands([]);
      }
    } catch (err: any) {
      console.error('Error fetching brands:', err);
    }
  };

  const handleCreateModel = () => {
    setEditingModel(null);
    setIsModalOpen(true);
  };

  const handleEditModel = (model: Model) => {
    setEditingModel(model);
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

  const onSubmit = async (data: ModelFormData) => {
    if (editingModel?.id) {
      try {
        const updatedModel = await modelService.updateModel(editingModel.id, data);
        setModels(models.map(model => model.id === editingModel.id ? updatedModel : model));
        setIsModalOpen(false);
        setEditingModel(null);
      } catch (error) {
        console.error('Error updating model:', error);
        setError('Failed to update model');
      }
    } else {
      try {
        const newModel = await modelService.createModel(data);
        setModels([...models, newModel]);
        setIsModalOpen(false);
      } catch (error) {
        console.error('Error creating model:', error);
        setError('Failed to create model');
      }
    }
  };

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedBrand(value ? parseInt(value) : null);
    setCurrentPage(1); // Reset to first page on brand change
  };
  
  const handleSearch = () => {
    if (!searchQuery) {
      if (selectedBrand) {
        fetchModelsByBrand(selectedBrand);
      } else {
        fetchModels();
      }
      return;
    }
    
    setIsLoading(true);
    setCurrentPage(1); // Reset to first page on new search
    
    modelService.searchByName(searchQuery, currentPage, pageSize)
      .then(data => {
        if (data && typeof data === 'object' && 'results' in data) {
          setModels(data.results);
          setTotalItems(data.count);
          setHasNextPage(!!data.next);
          setHasPrevPage(!!data.previous);
          setTotalPages(Math.ceil(data.count / pageSize));
        } else {
          // Fallback for non-paginated response
          setModels(Array.isArray(data) ? data : []);
          setTotalItems(Array.isArray(data) ? data.length : 0);
          setTotalPages(Math.ceil((Array.isArray(data) ? data.length : 0) / pageSize));
        }
        setError(null);
      })
      .catch(err => {
        console.error('Error searching models by name:', err);
        setError('Search failed. Please try again.');
        setModels([]);
      })
      .finally(() => setIsLoading(false));
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
        <div className="flex space-x-2">
          <button 
            className="btn btn-sm btn-tertiary text-info" 
            onClick={(e) => {
              e.stopPropagation();
              handleEditModel(item);
            }}
            title="Edit"
          >
            <TbEdit size={20}/>
          </button>
          <button 
            className="btn btn-sm btn-tertiary text-error" 
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteModel(item.id);
            }}
            title="Delete"
          >
            <MdPlaylistRemove size={20} />
          </button>
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

      <div className="mb-4 flex flex-wrap gap-4">
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
        
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">Search by Model Name</span>
          </label>
          <div className="flex">
            <input 
              type="text" 
              className="input input-bordered w-full" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter model name"
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
          data={models} 
          isLoading={isLoading} 
          onRowClick={handleEditModel}
        />
        
        {/* Server-side Pagination */}
        {totalItems > 0 && (
          <div className="flex justify-between items-center mt-6 px-4 py-3">
            <div className="text-sm text-base-content/70">
              Showing {models.length} of {totalItems} models
            </div>
            <div className="join">
              <button 
                className="join-item btn btn-sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={!hasPrevPage}
              >
                <FiChevronLeft />
              </button>
              
              {/* Generate page buttons */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Calculate which page numbers to show
                let pageNum;
                if (totalPages <= 5) {
                  // If 5 or fewer pages, show all
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
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button 
                className="join-item btn btn-sm"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={!hasNextPage}
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        )}
      </Card>

      <ModelModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={onSubmit}
        editingModel={editingModel}
      />
    </div>
  );
};

export default Models;
