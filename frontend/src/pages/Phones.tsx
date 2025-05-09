import React, { useState, useEffect } from 'react';
import phoneService from '../api/phoneService';
import type { Phone } from '../api/phoneService';
import brandService from '../api/brandService';
import type { Brand } from '../api/brandService';
import modelService from '../api/modelService';
import type { Model } from '../api/modelService';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { useForm } from 'react-hook-form';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// Define PhoneFormData interface to match the form data structure
interface PhoneFormData {
  name: string;
  brand?: number;
  model?: number;
  cost_price: number;
  selling_unite_price: number;
  selling_semi_bulk_price?: number;
  selling_bulk_price?: number;
  description?: string;
  note?: string;
  processor?: string;
  ram_gb?: number;
  storage_gb?: number;
  screen_size_inch?: number;
  screen_type?: string;
  operating_system?: string;
  rear_camera_mp?: string;
  front_camera_mp?: string;
  battery_mah?: number;
  color?: string;
  condition: string;
  version: string;
  phone_type: string;
  photo?: FileList;
}
import PhoneModal from '../components/modals/PhoneModal';

const Phones: React.FC = () => {
  const [phones, setPhones] = useState<Phone[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  
  // Ensure brands and models are always arrays
  const ensuredBrands = Array.isArray(brands) ? brands : [];
  const ensuredModels = Array.isArray(models) ? models : [];
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPhone, setEditingPhone] = useState<Phone | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { register, reset, watch, setValue, formState: { errors } } = useForm<Phone>();

  // Fetch phones, brands, and models on component mount
  useEffect(() => {
    fetchPhones();
    fetchBrands();
    fetchModels();
  }, []);

  // Effect to refetch when page changes
  useEffect(() => {
    if (!isLoading) {
      fetchPhones();
    }
  }, [currentPage, pageSize]);

  // We no longer need to filter models based on brand as we're showing all models
  // and letting the user select directly from the full list
  
  // Auto-populate phone name when model changes
  const watchedModel = watch('model');
  useEffect(() => {
    if (watchedModel) {
      const modelId = parseInt(watchedModel.toString());
      const selectedModel = models.find(model => model.id === modelId);
      const selectedBrand = brands.find(brand => brand.id === selectedModel?.brand);
      
      if (selectedModel && selectedBrand) {
        // Auto-populate the name field with brand and model names
        const autoName = `${selectedBrand.name} ${selectedModel.name}`;
        setValue('name', autoName);
        
        // If we have the model, we know the brand, so set it automatically
        setValue('brand', selectedModel.brand);
      }
    }
  }, [watchedModel, models, brands, setValue]);

  const fetchPhones = async (params?: Record<string, any>) => {
    try {
      setIsLoading(true);
      
      // Add pagination parameters
      const paginationParams = {
        ...params,
        page: currentPage,
        page_size: pageSize
      };
      
      const data = await phoneService.getAllPhones(paginationParams);
      
      // Handle paginated response if available
      if (data && typeof data === 'object' && 'results' in data) {
        setPhones(data.results);
        setTotalItems(data.count);
        setHasNextPage(!!data.next);
        setHasPrevPage(!!data.previous);
        setTotalPages(Math.ceil(data.count / pageSize));
      } else {
        // Fallback for non-paginated response
        setPhones(Array.isArray(data) ? data : []);
        setTotalItems(Array.isArray(data) ? data.length : 0);
        setTotalPages(Math.ceil((Array.isArray(data) ? data.length : 0) / pageSize));
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Error fetching phones:', err);
      setError('Failed to load phones. Please try again.');
      setPhones([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const data = await brandService.getAllBrands();
      // Check if data is an array or if it has results property
      if (Array.isArray(data)) {
        setBrands(data);
      } else if (data && typeof data === 'object' && 'results' in data) {
        setBrands(data.results);
      } else {
        // If neither, set an empty array
        console.warn('Unexpected format for brands data:', data);
        setBrands([]);
      }
    } catch (err: any) {
      console.error('Error fetching brands:', err);
      setBrands([]);
    }
  };

  const fetchModels = async () => {
    try {
      const data = await modelService.getAllModels();
      // Check if data is an array or if it has results property
      if (Array.isArray(data)) {
        setModels(data);
      } else if (data && typeof data === 'object' && 'results' in data) {
        setModels(data.results);
      } else {
        // If neither, set an empty array
        console.warn('Unexpected format for models data:', data);
        setModels([]);
      }
    } catch (err: any) {
      console.error('Error fetching models:', err);
      setModels([]);
    }
  };

  const handleCreatePhone = () => {
    setEditingPhone(null);
    reset({
      name: '',
      brand: undefined,
      model: undefined,
      // code is autogenerated in the backend
      cost_price: 0,
      selling_unite_price: 0,
      condition: 'new',
      version: 'global',
      phone_type: 'ordinary'
    });
    setIsModalOpen(true);
  };

  const handleEditPhone = (phone: Phone) => {
    setEditingPhone(phone);
    // Set the model first
    setValue('model', phone.model);
    // Brand will be auto-set based on the model
    
    reset({
      name: phone.name,
      brand: phone.brand,
      model: phone.model,
      // code is autogenerated in the backend
      cost_price: phone.cost_price,
      selling_unite_price: phone.selling_unite_price,
      selling_semi_bulk_price: phone.selling_semi_bulk_price || undefined,
      selling_bulk_price: phone.selling_bulk_price || undefined,
      description: phone.description || '',
      note: phone.note || '',
      // sku removed as requested
      processor: phone.processor || '',
      ram_gb: phone.ram_gb || undefined,
      storage_gb: phone.storage_gb || undefined,
      screen_size_inch: phone.screen_size_inch || undefined,
      screen_type: phone.screen_type || '',
      operating_system: phone.operating_system || '',
      rear_camera_mp: phone.rear_camera_mp || '',
      front_camera_mp: phone.front_camera_mp || '',
      battery_mah: phone.battery_mah || undefined,
      color: phone.color || '',
      condition: phone.condition,
      version: phone.version,
      phone_type: phone.phone_type
    });
    setIsModalOpen(true);
  };

  const handleDeletePhone = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this phone?')) return;
    
    try {
      await phoneService.deletePhone(id);
      setPhones(phones.filter(phone => phone.id !== id));
    } catch (err: any) {
      console.error('Error deleting phone:', err);
      setError('Failed to delete phone. Please try again.');
    }
  };

  const handlePhoneSubmit = async (data: PhoneFormData) => {
    try {
      const formData = new FormData();
      
      // Add all form fields to FormData except 'photo' (we'll handle that separately)
      Object.keys(data).forEach(key => {
        if (key !== 'photo' && data[key] !== undefined && data[key] !== null && data[key] !== '') {
          formData.append(key, data[key]);
        }
      });
      
      // Handle file upload - only include photo if a new file is selected
      if (data.photo && data.photo[0]) {
        formData.append('photo', data.photo[0]);
      }
      
      if (editingPhone) {
        await phoneService.updatePhone(editingPhone.id, formData);
      } else {
        await phoneService.createPhone(formData);
      }
      
      setIsModalOpen(false);
      fetchPhones();
    } catch (err: any) {
      console.error('Error saving phone:', err);
      setError('Failed to save phone. Please try again.');
    }
  };

  const handleSearch = () => {
    if (!searchQuery) {
      fetchPhones();
      return;
    }
    
    setIsLoading(true);
    setCurrentPage(1); // Reset to first page on new search
    
    // Determine if search query is a code or name
    if (/^[A-Z0-9-]+$/.test(searchQuery)) {
      // Looks like a code
      phoneService.searchByCode(searchQuery, currentPage, pageSize)
        .then(data => {
          if (data && typeof data === 'object' && 'results' in data) {
            setPhones(data.results);
            setTotalItems(data.count);
            setHasNextPage(!!data.next);
            setHasPrevPage(!!data.previous);
            setTotalPages(Math.ceil(data.count / pageSize));
          } else {
            // Fallback for non-paginated response
            setPhones(Array.isArray(data) ? data : []);
            setTotalItems(Array.isArray(data) ? data.length : 0);
            setTotalPages(Math.ceil((Array.isArray(data) ? data.length : 0) / pageSize));
          }
          setError(null);
        })
        .catch(err => {
          console.error('Error searching phones by code:', err);
          setError('Search failed. Please try again.');
          setPhones([]);
        })
        .finally(() => setIsLoading(false));
    } else {
      // Assume it's a name
      phoneService.searchByName(searchQuery, currentPage, pageSize)
        .then(data => {
          if (data && typeof data === 'object' && 'results' in data) {
            setPhones(data.results);
            setTotalItems(data.count);
            setHasNextPage(!!data.next);
            setHasPrevPage(!!data.previous);
            setTotalPages(Math.ceil(data.count / pageSize));
          } else {
            // Fallback for non-paginated response
            setPhones(Array.isArray(data) ? data : []);
            setTotalItems(Array.isArray(data) ? data.length : 0);
            setTotalPages(Math.ceil((Array.isArray(data) ? data.length : 0) / pageSize));
          }
          setError(null);
        })
        .catch(err => {
          console.error('Error searching phones by name:', err);
          setError('Search failed. Please try again.');
          setPhones([]);
        })
        .finally(() => setIsLoading(false));
    }
  };
  
  const handleBrandFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const brandId = value ? parseInt(value) : null;
    setSelectedBrand(brandId);
    setCurrentPage(1); // Reset to first page on filter change
    
    if (brandId) {
      // Filter phones by brand
      setIsLoading(true);
      phoneService.getByBrand(brandId, currentPage, pageSize)
        .then(data => {
          if (data && typeof data === 'object' && 'results' in data) {
            setPhones(data.results);
            setTotalItems(data.count);
            setHasNextPage(!!data.next);
            setHasPrevPage(!!data.previous);
            setTotalPages(Math.ceil(data.count / pageSize));
          } else {
            // Fallback for non-paginated response
            setPhones(Array.isArray(data) ? data : []);
            setTotalItems(Array.isArray(data) ? data.length : 0);
            setTotalPages(Math.ceil((Array.isArray(data) ? data.length : 0) / pageSize));
          }
          setError(null);
        })
        .catch(err => {
          console.error('Error filtering phones by brand:', err);
          setError('Failed to filter phones. Please try again.');
          setPhones([]);
        })
        .finally(() => setIsLoading(false));
    } else {
      // Reset to show all phones
      fetchPhones();
    }
  };

  const columns = [
    { 
      header: 'Photo', 
      accessor: 'photo',
      render: (value: string) => value ? 
        <img src={value} alt="Phone" className="w-12 h-12 object-contain" /> : 
        <div className="w-12 h-12 bg-gray-200 flex items-center justify-center text-xs">No image</div>
    },
    { header: 'Name', accessor: 'name' },
    { header: 'Code', accessor: 'code' },
    { header: 'Brand', accessor: 'brand_name' },
    { header: 'Model', accessor: 'model_name' },
    { 
      header: 'Price', 
      accessor: 'selling_unite_price',
      render: (value: any) => `$${Number(value).toFixed(2)}`
    },
    { 
      header: 'Stock', 
      accessor: 'stock_quantity',
      render: (value: number) => (
        <span className={`badge ${value > 0 ? 'badge-success' : 'badge-error'}`}>
          {value}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (_: any, item: Phone) => (
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              handleEditPhone(item);
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
              handleDeletePhone(item.id);
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
        <h1 className="text-2xl font-bold">Phones</h1>
        <Button onClick={handleCreatePhone}>Add Phone</Button>
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
            onChange={handleBrandFilterChange}
          >
            <option value="">All Brands</option>
            {ensuredBrands.map(brand => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </select>
        </div>

        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">Search by Name or Code</span>
          </label>
          <div className="flex">
            <input 
              type="text" 
              className="input input-bordered w-full" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter name or code"
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
          data={phones}
          isLoading={isLoading}
          onRowClick={handleEditPhone}
        />
        
        {/* Server-side Pagination */}
        {totalItems > 0 && (
          <div className="flex justify-between items-center mt-6 px-4 py-3">
            <div className="text-sm text-base-content/70">
              Showing {phones.length} of {totalItems} phones
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

      <PhoneModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handlePhoneSubmit}
        editingPhone={editingPhone}
      />
    </div>
  );
};

export default Phones;
