import React, { useState, useEffect } from 'react';
import brandService from '../api/brandService';
import type { Brand } from '../api/brandService';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import BrandModal from '../components/modals/BrandModal';

const Brands: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  // Ensure brands is always an array
  const ensuredBrands = Array.isArray(brands) ? brands : [];
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form handling is now in the BrandModal component

  // Fetch brands on component mount
  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setIsLoading(true);
      const data = await brandService.getAllBrands();
      console.log('Brands API response:', data);
      
      // Check if data is an object with results property (paginated response)
      if (data && typeof data === 'object' && 'results' in data) {
        console.log('Setting brands from results array:', data.results);
        setBrands(data.results);
      } else if (Array.isArray(data)) {
        console.log('Setting brands from direct array:', data);
        setBrands(data);
      } else {
        console.error('Unexpected data format:', data);
        setBrands([]);
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

      <Card>
        <Table 
          columns={columns} 
          data={ensuredBrands} 
          isLoading={isLoading} 
          onRowClick={handleEditBrand}
        />
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
