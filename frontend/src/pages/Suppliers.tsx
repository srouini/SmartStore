import React, { useState, useEffect } from 'react';
import supplierService, { PaginatedResponse } from '../api/supplierService';
import { Supplier } from '../api/purchaseService';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiX, FiCheck, FiPhone, FiMail, FiFileText, FiUser, FiAlertCircle, FiLogIn, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { TbEdit } from 'react-icons/tb';
import { FaDeleteLeft } from 'react-icons/fa6';
import { RiDeleteBack2Line } from 'react-icons/ri';
import { AiOutlineDeleteRow, AiOutlineHighlight } from 'react-icons/ai';
import { MdPlaylistRemove } from 'react-icons/md';

const Suppliers: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // Updated state to handle paginated data
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  
  const [authError, setAuthError] = useState<boolean>(false);

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

  // Component initialization
  useEffect(() => {
    // Always try to fetch suppliers on mount, regardless of auth state
    // The API call will handle auth errors
    console.log('Suppliers component mounted');
    fetchSuppliers();
  }, []);

  // Effect to refetch when page changes
  useEffect(() => {
    if (!isLoading) {
      fetchSuppliers();
    }
  }, [currentPage, pageSize]);

  const fetchSuppliers = async (params?: Record<string, any>) => {
    try {
      setIsLoading(true);
      
      // Add pagination parameters
      const paginationParams = {
        ...params,
        page: currentPage,
        page_size: pageSize
      };
      
      console.log('Fetching suppliers with params:', paginationParams);
      
      const response = await supplierService.getAllSuppliers(paginationParams);
      console.log('Suppliers data received:', response);
      
      // Handle paginated response
      if (response && 'results' in response) {
        // Set suppliers from results array
        setSuppliers(response.results);
        
        // Update pagination state
        setTotalItems(response.count);
        setHasNextPage(!!response.next);
        setHasPrevPage(!!response.previous);
        
        // Calculate total pages
        const calculatedTotalPages = Math.ceil(response.count / pageSize);
        setTotalPages(calculatedTotalPages > 0 ? calculatedTotalPages : 1);
        
        // If no suppliers exist, show a message about adding sample data
        if (response.results.length === 0 && currentPage === 1) {
          setError('No suppliers found. You can add suppliers manually or create sample data.');
        } else {
          setError(null);
        }
      } else {
        // Fallback for non-paginated response (shouldn't happen)
        setSuppliers(Array.isArray(response) ? response : []);
        setTotalItems(Array.isArray(response) ? response.length : 0);
        setTotalPages(1);
        setHasNextPage(false);
        setHasPrevPage(false);
        
        if (Array.isArray(response) && response.length === 0) {
          setError('No suppliers found. You can add suppliers manually or create sample data.');
        }
      }
    } catch (err: any) {
      console.error('Error fetching suppliers:', err);
      setSuppliers([]);
      
      // Check if it's an authentication error
      if (err.response && err.response.status === 401) {
        console.error('Authentication error - 401 Unauthorized');
        setAuthError(true);
        setError('Authentication required. Please log in to access suppliers.');
      } else {
        setError('Failed to load suppliers. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to create sample supplier data
  const createSampleData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Sample supplier data
      setSuccess('Sample supplier data created successfully!');
      fetchSuppliers(); // Refresh the list
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error creating sample data:', err);
      setError('Failed to create sample data. Please try again.');
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

  const confirmDelete = (id: number) => {
    setSupplierToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSupplier = async () => {
    if (!supplierToDelete) return;
    
    try {
      setIsLoading(true);
      await supplierService.deleteSupplier(supplierToDelete);
      setIsDeleteModalOpen(false);
      setSuccess('Supplier deleted successfully');
      fetchSuppliers();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error deleting supplier:', err);
      setError('Failed to delete supplier. Please try again.');
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      if (editingSupplier) {
        await supplierService.updateSupplier(editingSupplier.id, data);
        setSuccess('Supplier updated successfully');
      } else {
        await supplierService.createSupplier(data);
        setSuccess('Supplier created successfully');
      }
      setIsModalOpen(false);
      fetchSuppliers();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error saving supplier:', err);
      setError('Failed to save supplier. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery) {
      fetchSuppliers();
      return;
    }
    
    setIsLoading(true);
    setCurrentPage(1); // Reset to first page on new search
    
    supplierService.searchByName(searchQuery, currentPage, pageSize)
      .then(response => {
        if (response && 'results' in response) {
          setSuppliers(response.results);
          setTotalItems(response.count);
          setTotalPages(Math.ceil(response.count / pageSize));
          setHasNextPage(!!response.next);
          setHasPrevPage(!!response.previous);
        } else {
          setSuppliers([]);
          setTotalItems(0);
          setTotalPages(1);
          setHasNextPage(false);
          setHasPrevPage(false);
        }
        setError(null);
      })
      .catch(err => {
        console.error('Error searching suppliers:', err);
        setError('Failed to search suppliers. Please try again.');
        setSuppliers([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  
  // Pagination handlers
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  
  const goToNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };
  
  const goToPrevPage = () => {
    if (hasPrevPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Define columns with explicit debugging for render functions
  const columns = [
    { 
      header: 'Name', 
      accessor: 'name',
      render: (value: string, item: Supplier) => {
        return <div className="font-medium">{value || 'N/A'}</div>;
      }
    },
    { 
      header: 'Contact', 
      accessor: 'tel',
      render: (value: string) => {
        return (
          <div className="flex items-center">
            <FiPhone className="mr-2 text-base-content/70" />
            <span>{value || 'N/A'}</span>
          </div>
        );
      }
    },
    { 
      header: 'Email', 
      accessor: 'email',
      render: (value: string) => {
        return (
          <div className="flex items-center">
            <FiMail className="mr-2 text-base-content/70" />
            <span>{value || 'N/A'}</span>
          </div>
        );
      }
    },
    { 
      header: 'Code', 
      accessor: 'code',
      render: (value: string) => {
        return (
          <div className="flex items-center">
            <FiFileText className="mr-2 text-base-content/70" />
            <span>{value || 'N/A'}</span>
          </div>
        );
      }
    },
    { 
      header: 'TVA', 
      accessor: 'soumis_tva',
      render: (value: boolean) => {
        return (
          <div className={`badge ${value ? 'badge-success' : 'badge-error'} gap-1`}>
            {value ? <FiCheck size={14} /> : <FiX size={14} />}
            {value ? 'Yes' : 'No'}
          </div>
        );
      }
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (_: any, item: Supplier) => {
        return (
          <div className="flex space-x-2">
            <button 
              className="btn btn-sm btn-tertiary text-info" 
              onClick={() => handleEditSupplier(item)}
              title="Edit"
            >
              <TbEdit size={20}/>

            </button>
            <button 
              className="btn btn-sm btn-tertiary text-error" 
              onClick={() => confirmDelete(item.id)}
              title="Delete"
            >
              <MdPlaylistRemove size={20} />

            </button>
          </div>
        );
      }
    }
  ];

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {authError ? (
        <div className="bg-base-100 shadow-xl rounded-box overflow-hidden">
          <div className="p-6 border-b border-base-300">
            <h2 className="text-2xl font-bold">Authentication Required</h2>
            <p className="text-base-content/70">You need to be logged in to access the suppliers page</p>
          </div>
          
          <div className="p-12 flex flex-col items-center justify-center gap-6">
            <div className="text-center">
              <FiAlertCircle size={64} className="mx-auto mb-4 text-warning" />
              <h3 className="text-xl font-bold mb-2">Not Authenticated</h3>
              <p className="max-w-md mx-auto mb-6">
                You must be logged in to view and manage suppliers. Please log in with your account credentials to continue.
              </p>
              <Button onClick={handleLogin} className="btn-primary">
                <FiLogIn className="mr-2" /> Log In
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-base-100 shadow-xl rounded-box overflow-hidden">
          <div className="p-6 border-b border-base-300">
            <h2 className="text-2xl font-bold">Suppliers</h2>
            <p className="text-base-content/70">Manage your supplier information</p>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div className="flex items-center w-full md:w-auto space-x-2">
                <div className="relative w-full md:w-64">
                  <input
                    type="text"
                    placeholder="Search suppliers..."
                    className="input input-bordered w-full pr-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <button 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-primary transition-colors duration-200"
                    onClick={handleSearch}
                    aria-label="Search"
                  >
                    <FiSearch size={18} />
                  </button>
                </div>
                <Button 
                  onClick={handleSearch} 
                  className="btn btn-primary text-primary-content flex items-center gap-2"
                >
                  <FiSearch size={16} />
                  Search
                </Button>
              </div>
              <Button onClick={handleCreateSupplier} className="w-full md:w-auto">
                <FiPlus className="mr-2" /> Add Supplier
              </Button>
            </div>

            {error && (
              <div className="alert alert-error mb-4">
                <FiX className="stroke-current shrink-0 h-6 w-6" />
                <span>{error}</span>
                {error.includes('No suppliers found') && (
                  <button 
                    className="btn btn-sm btn-outline ml-4"
                    onClick={createSampleData}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="loading loading-spinner loading-xs mr-2"></span>
                    ) : null}
                    Create Sample Data
                  </button>
                )}
              </div>
            )}

            {success && (
              <div className="alert alert-success mb-4">
                <FiCheck className="stroke-current shrink-0 h-6 w-6" />
                <span>{success}</span>
              </div>
            )}

            <div className="overflow-x-auto">
              <Table
                key={`suppliers-table-${suppliers.length}`}
                columns={columns}
                data={suppliers}
                isLoading={isLoading}
              />
              {!isLoading && suppliers.length === 0 && (
                <div className="text-center py-12 flex flex-col items-center gap-4">
                  <p className="text-base-content/70">No suppliers found</p>
                  <button 
                    className="btn btn-primary"
                    onClick={createSampleData}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="loading loading-spinner loading-xs mr-2"></span>
                    ) : (
                      <FiPlus className="mr-2" />
                    )}
                    Create Sample Data
                  </button>
                </div>
              )}
            </div>
            
            {/* Server-side Pagination */}
            {totalItems > 0 && (
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-base-content/70">
                  Showing {suppliers.length} of {totalItems} suppliers
                </div>
                <div className="join">
                  <button 
                    className="join-item btn btn-sm"
                    onClick={goToPrevPage}
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
                        onClick={() => paginate(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button 
                    className="join-item btn btn-sm"
                    onClick={goToNextPage}
                    disabled={!hasNextPage}
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Supplier Form Modal */}
      <Modal
        isOpen={isModalOpen}
        title={editingSupplier ? `Edit Supplier: ${editingSupplier.name}` : 'Add New Supplier'}
        onClose={() => setIsModalOpen(false)}
        size="2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Name*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-base-content/50">
                <FiUser />
              </div>
              <input
                type="text"
                className={`input input-bordered w-full pl-10 ${errors.name ? 'input-error' : ''}`}
                placeholder="Enter supplier name"
                {...register('name', { required: 'Name is required' })}
              />
            </div>
            {errors.name && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.name.message as string}</span>
              </label>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Address</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24"
                placeholder="Enter address"
                {...register('address')}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-base-content/50">
                  <FiMail />
                </div>
                <input
                  type="email"
                  className={`input input-bordered w-full pl-10 ${errors.email ? 'input-error' : ''}`}
                  placeholder="email@example.com"
                  {...register('email', {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
              </div>
              {errors.email && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.email.message as string}</span>
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Phone</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-base-content/50">
                  <FiPhone />
                </div>
                <input
                  type="text"
                  className="input input-bordered w-full pl-10"
                  placeholder="Enter phone number"
                  {...register('tel')}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Code</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-base-content/50">
                  <FiFileText />
                </div>
                <input
                  type="text"
                  className="input input-bordered w-full pl-10"
                  placeholder="Enter supplier code"
                  {...register('code')}
                />
              </div>
            </div>
          </div>

          <div className="divider">Tax Information</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">RC</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Enter RC number"
                {...register('RC')}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">NIF</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Enter NIF number"
                {...register('NIF')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">AI</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Enter AI number"
                {...register('AI')}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">NIS</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Enter NIS number"
                {...register('NIS')}
              />
            </div>
          </div>

          <div className="form-control bg-base-200 p-4 rounded-lg">
            <label className="label cursor-pointer justify-start gap-4">
              <input
                type="checkbox"
                className="toggle toggle-primary"
                {...register('soumis_tva')}
              />
              <div>
                <span className="label-text font-medium">Subject to TVA</span>
                <p className="text-xs text-base-content/70 mt-1">Enable if this supplier is subject to TVA taxation</p>
              </div>
            </label>
          </div>

          <div className="flex justify-end space-x-3 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <span className="loading loading-spinner loading-xs mr-2"></span>
              ) : null}
              {editingSupplier ? 'Update Supplier' : 'Create Supplier'}
            </Button>
          </div>
        </form>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        title="Confirm Delete"
        onClose={() => setIsDeleteModalOpen(false)}
        size="sm"
      >
        <div className="p-4 text-center">
          <div className="text-error mb-4 flex justify-center">
            <FiTrash2 size={48} />
          </div>
          <h3 className="text-lg font-bold mb-2">Delete Supplier</h3>
          <p className="mb-6">Are you sure you want to delete this supplier? This action cannot be undone.</p>
          
          <div className="flex justify-center space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="error"
              onClick={handleDeleteSupplier}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-xs mr-2"></span>
              ) : null}
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Suppliers;
