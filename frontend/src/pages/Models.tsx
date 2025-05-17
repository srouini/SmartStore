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
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { useForm } from 'react-hook-form';
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
        <form className="space-y-4" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px' }}>
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
          
          {/* Network Section */}
          <div className="collapse collapse-arrow bg-base-200 rounded-lg mt-4">
            <input type="checkbox" className="peer" /> 
            <div className="collapse-title text-md font-medium">
              Network Specifications
            </div>
            <div className="collapse-content">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Network Technology</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  {...register('network_technology')}
                  placeholder="e.g., GSM / HSPA / LTE / 5G"
                />
              </div>
            </div>
          </div>
          
          {/* Launch Section */}
          <div className="collapse collapse-arrow bg-base-200 rounded-lg mt-2">
            <input type="checkbox" className="peer" />
            <div className="collapse-title text-md font-medium">
              Launch Information
            </div>
            <div className="collapse-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Announced</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    {...register('launch_announced')}
                    placeholder="e.g., 2023, October"
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Status</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    {...register('launch_status')}
                    placeholder="e.g., Available, Coming soon"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Body Section */}
          <div className="collapse collapse-arrow bg-base-200 rounded-lg mt-2">
            <input type="checkbox" className="peer" />
            <div className="collapse-title text-md font-medium">
              Body Specifications
            </div>
            <div className="collapse-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Dimensions</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    {...register('body_dimensions')}
                    placeholder="e.g., 160.8 x 77.8 x 8.4 mm"
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Weight</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    {...register('body_weight')}
                    placeholder="e.g., 175 g"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Build</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    {...register('body_build')}
                    placeholder="e.g., Glass front, aluminum frame"
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">SIM</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    {...register('body_sim')}
                    placeholder="e.g., Dual SIM, Nano-SIM"
                  />
                </div>
              </div>
              
              <div className="form-control mt-2">
                <label className="label">
                  <span className="label-text">Water Resistance</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  {...register('body_water_resistant')}
                  placeholder="e.g., IP68, water resistant up to 30 minutes"
                />
              </div>
            </div>
          </div>
          
          {/* Display Section */}
          <div className="collapse collapse-arrow bg-base-200 rounded-lg mt-2">
            <input type="checkbox" className="peer" />
            <div className="collapse-title text-md font-medium">
              Display Specifications
            </div>
            <div className="collapse-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Type</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    {...register('display_type')}
                    placeholder="e.g., AMOLED, 120Hz, HDR10+"
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Size</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    {...register('display_size')}
                    placeholder="e.g., 6.5 inches"
                  />
                </div>
              </div>
              
              <div className="form-control mt-2">
                <label className="label">
                  <span className="label-text">Resolution</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  {...register('display_resolution')}
                  placeholder="e.g., 1080 x 2400 pixels"
                />
              </div>
            </div>
          </div>
          
          {/* Platform Section */}
          <div className="collapse collapse-arrow bg-base-200 rounded-lg mt-2">
            <input type="checkbox" className="peer" />
            <div className="collapse-title text-md font-medium">
              Platform Specifications
            </div>
            <div className="collapse-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">OS</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    {...register('platform_os')}
                    placeholder="e.g., Android 13, iOS 16"
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Chipset</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    {...register('platform_chipset')}
                    placeholder="e.g., Snapdragon 8 Gen 2"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">CPU</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    {...register('platform_cpu')}
                    placeholder="e.g., Octa-core (1x3.2 GHz Cortex-X3)"
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">GPU</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    {...register('platform_gpu')}
                    placeholder="e.g., Adreno 740"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Memory Section */}
          <div className="collapse collapse-arrow bg-base-200 rounded-lg mt-2">
            <input type="checkbox" className="peer" />
            <div className="collapse-title text-md font-medium">
              Memory Specifications
            </div>
            <div className="collapse-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Card Slot</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    {...register('memory_card_slot')}
                    placeholder="e.g., microSDXC"
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Internal Storage</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    {...register('memory_internal')}
                    placeholder="e.g., 128GB 8GB RAM, 256GB 12GB RAM"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Camera Section */}
          <div className="collapse collapse-arrow bg-base-200 rounded-lg mt-2">
            <input type="checkbox" className="peer" />
            <div className="collapse-title text-md font-medium">
              Camera Specifications
            </div>
            <div className="collapse-content">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Main Camera</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  rows={2}
                  {...register('main_camera')}
                  placeholder="e.g., 50 MP, f/1.8, 24mm (wide), 10 MP, f/2.4, 70mm (telephoto)"
                ></textarea>
              </div>
              
              <div className="form-control mt-2">
                <label className="label">
                  <span className="label-text">Selfie Camera</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  rows={2}
                  {...register('selfie_camera')}
                  placeholder="e.g., 12 MP, f/2.2, 23mm (wide)"
                ></textarea>
              </div>
            </div>
          </div>
          
          {/* Sound Section */}
          <div className="collapse collapse-arrow bg-base-200 rounded-lg mt-2">
            <input type="checkbox" className="peer" />
            <div className="collapse-title text-md font-medium">
              Sound Specifications
            </div>
            <div className="collapse-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Loudspeaker</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    {...register('sound_loudspeaker')}
                    placeholder="e.g., Yes, with stereo speakers"
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">3.5mm Jack</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    {...register('sound_jack')}
                    placeholder="e.g., No, Yes"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Communications Section */}
          <div className="collapse collapse-arrow bg-base-200 rounded-lg mt-2">
            <input type="checkbox" className="peer" />
            <div className="collapse-title text-md font-medium">
              Communications
            </div>
            <div className="collapse-content">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">NFC</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    {...register('comms_nfc')}
                    placeholder="e.g., Yes, No"
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Infrared Port</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    {...register('comms_infrared_port')}
                    placeholder="e.g., Yes, No"
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">USB</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    {...register('comms_usb')}
                    placeholder="e.g., USB Type-C 2.0"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Features Section */}
          <div className="collapse collapse-arrow bg-base-200 rounded-lg mt-2">
            <input type="checkbox" className="peer" />
            <div className="collapse-title text-md font-medium">
              Features
            </div>
            <div className="collapse-content">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Sensors</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  rows={2}
                  {...register('features_sensors')}
                  placeholder="e.g., Fingerprint (under display), accelerometer, gyro, compass"
                ></textarea>
              </div>
            </div>
          </div>
          
          {/* Battery Section */}
          <div className="collapse collapse-arrow bg-base-200 rounded-lg mt-2">
            <input type="checkbox" className="peer" />
            <div className="collapse-title text-md font-medium">
              Battery Specifications
            </div>
            <div className="collapse-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Type</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    {...register('battery_type')}
                    placeholder="e.g., Li-Po 5000 mAh, non-removable"
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Charging</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    {...register('battery_charging')}
                    placeholder="e.g., 25W wired, 15W wireless"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Misc Section */}
          <div className="collapse collapse-arrow bg-base-200 rounded-lg mt-2">
            <input type="checkbox" className="peer" />
            <div className="collapse-title text-md font-medium">
              Miscellaneous
            </div>
            <div className="collapse-content">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Available Colors</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  {...register('misc_colors')}
                  placeholder="e.g., Black, Blue, Silver, Green"
                />
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Models;
