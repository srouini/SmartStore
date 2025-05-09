import api from './axios';
import { Supplier } from './purchaseService';

const supplierService = {
  // Get all suppliers
  getAllSuppliers: async (params?: Record<string, any>) => {
    try {
      const response = await api.get('suppliers/', { params });
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

  // Search suppliers by name
  searchByName: async (name: string) => {
    try {
      const response = await api.get(`suppliers/?name=${name}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default supplierService;
