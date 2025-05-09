import React, { useState, useEffect } from 'react';
import brandService from '../api/brandService';
import type { Brand } from '../api/brandService';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import BrandModal from '../components/modals/BrandModal';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Brands: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  // Ensure brands is always an array
  const ensuredBrands = Array.isArray(brands) ? brands : [];
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  // Form handling is now in the BrandModal component

  // Fetch brands on component mount
  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async (params?: Record<string, any>) => {
    try {
      setIsLoading(true);
      
      // Add pagination parameters
      const paginationParams = {
        ...params,
        page: currentPage,
        page_size: pageSize
      };
      
      const data = await brandService.getAllBrands(paginationParams);
      
      // Check if data is an object with results property (paginated response)
      if (data && typeof data === 'object' && 'results' in data) {
        setBrands(data.results);
        setTotalItems(data.count);
        setHasNextPage(!!data.next);
        setHasPrevPage(!!data.previous);
        setTotalPages(Math.ceil(data.count / pageSize));
      } else if (Array.isArray(data)) {
        setBrands(data);
        setTotalItems(data.length);
        setTotalPages(Math.ceil(data.length / pageSize));
        setHasNextPage(currentPage * pageSize < data.length);
        setHasPrevPage(currentPage > 1);
      } else {
        console.error('Unexpected data format:', data);
        setBrands([]);
        setTotalItems(0);
        setTotalPages(0);
        setHasNextPage(false);
        setHasPrevPage(false);
        setError('Received invalid data format from server');
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Error fetching brands:', err);
      setError('Failed to load brands. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle page change
  useEffect(() => {
    fetchBrands();
  }, [currentPage, pageSize]);
  
  const handleSearch = () => {
    if (!searchQuery) {
      fetchBrands();
      return;
    }
    
    setIsLoading(true);
    setCurrentPage(1); // Reset to first page on new search
    
    brandService.searchByName(searchQuery, currentPage, pageSize)
      .then(data => {
        if (data && typeof data === 'object' && 'results' in data) {
          setBrands(data.results);
          setTotalItems(data.count);
          setHasNextPage(!!data.next);
          setHasPrevPage(!!data.previous);
          setTotalPages(Math.ceil(data.count / pageSize));
        } else {
          // Fallback for non-paginated response
          setBrands(Array.isArray(data) ? data : []);
          setTotalItems(Array.isArray(data) ? data.length : 0);
          setTotalPages(Math.ceil((Array.isArray(data) ? data.length : 0) / pageSize));
        }
        setError(null);
      })
      .catch(err => {
        console.error('Error searching brands by name:', err);
        setError('Search failed. Please try again.');
        setBrands([]);
      })
      .finally(() => setIsLoading(false));
  };

  const handleCreateBrand = () => {
    setEditingBrand(null);
    setIsModalOpen(true);
  };

  const handleEditBrand = (brand: Brand) => {
    setEditingBrand(brand);
    setIsModalOpen(true);
  };

  const handleDeleteBrand = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this brand?')) return;
    
    try {
      await brandService.deleteBrand(id);
      setBrands(brands.filter(brand => brand.id !== id));
    } catch (err: any) {
      console.error('Error deleting brand:', err);
      setError('Failed to delete brand. Please try again.');
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      
      if (data.origin_country) {
        formData.append('origin_country', data.origin_country);
      }
      
      if (data.website) {
        formData.append('website', data.website);
      }
      
      if (data.description) {
        formData.append('description', data.description);
      }
      
      if (data.picture && data.picture[0]) {
        formData.append('picture', data.picture[0]);
      }
      
      if (editingBrand) {
        await brandService.updateBrand(editingBrand.id, formData);
      } else {
        await brandService.createBrand(formData);
      }
      
      setIsModalOpen(false);
      fetchBrands();
    } catch (err: any) {
      console.error('Error saving brand:', err);
      setError('Failed to save brand. Please try again.');
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' },
    { 
      header: 'Logo', 
      accessor: 'picture',
      render: (value: string) => value ? 
        <img src={value} alt="Brand logo" className="w-10 h-10 object-contain" /> : 
        <div className="w-10 h-10 bg-gray-200 flex items-center justify-center text-xs">No logo</div>
    },
    { header: 'Country', accessor: 'origin_country' },
    { header: 'Website', accessor: 'website' },
    {
      header: 'Actions',
      accessor: 'id',
      render: (_: any, item: Brand) => (
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              handleEditBrand(item);
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
              handleDeleteBrand(item.id);
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
          <h1 className="text-2xl font-bold">Brands</h1>
          <p className="text-sm text-gray-500 mt-1">Brands are phone manufacturers (e.g., Apple, Samsung) that have multiple models</p>
        </div>
        <Button onClick={handleCreateBrand}>Add Brand</Button>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      <div className="mb-4">
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">Search by Brand Name</span>
          </label>
          <div className="flex">
            <input 
              type="text" 
              className="input input-bordered w-full" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter brand name"
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
          data={ensuredBrands} 
          isLoading={isLoading} 
          onRowClick={handleEditBrand}
        />
        
        {/* Server-side Pagination */}
        {totalItems > 0 && (
          <div className="flex justify-between items-center mt-6 px-4 py-3">
            <div className="text-sm text-base-content/70">
              Showing {brands.length} of {totalItems} brands
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

      <BrandModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={onSubmit}
        editingBrand={editingBrand}
      />
    </div>
  );
};

export default Brands;
