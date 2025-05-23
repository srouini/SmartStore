import api from './axios';
import { Supplier } from './purchaseService';

// Define pagination types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

const supplierService = {
  // Get all suppliers with pagination
  getAllSuppliers: async (params?: Record<string, any>) => {
    try {
      const response = await api.get<PaginatedResponse<Supplier>>('suppliers/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get supplier by ID
  getSupplierById: async (id: number) => {
    try {
      const response = await api.get(`suppliers/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create supplier
  createSupplier: async (supplierData: Partial<Supplier>) => {
    try {
      const response = await api.post('suppliers/', supplierData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update supplier
  updateSupplier: async (id: number, supplierData: Partial<Supplier>) => {
    try {
      const response = await api.put(`suppliers/${id}/`, supplierData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete supplier
  deleteSupplier: async (id: number) => {
    try {
      const response = await api.delete(`suppliers/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search suppliers by name with pagination
  searchByName: async (name: string, page?: number, pageSize?: number) => {
    try {
      const params: Record<string, any> = { name };
      if (page) params.page = page;
      if (pageSize) params.page_size = pageSize;
      
      const response = await api.get<PaginatedResponse<Supplier>>('suppliers/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default supplierService;
