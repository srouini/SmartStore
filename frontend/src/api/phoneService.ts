import api from './axios';
import { PaginatedResponse } from './supplierService';

export interface Phone {
  id: number;
  name: string;
  brand: number;
  brand_name: string;
  model: number;
  model_name: string;
  code: string;
  cost_price: number;
  selling_unite_price: number;
  selling_semi_bulk_price: number | null;
  selling_bulk_price: number | null;
  description: string | null;
  note: string | null;
  sku: string | null;
  photo: string | null;
  created_at: string;
  updated_at: string;
  product_type: string;
  processor: string | null;
  ram_gb: number | null;
  storage_gb: number | null;
  screen_size_inch: number | null;
  screen_type: string | null;
  screen_type_display: string | null;
  operating_system: string | null;
  rear_camera_mp: string | null;
  front_camera_mp: string | null;
  battery_mah: number | null;
  color: string | null;
  condition: string;
  condition_display: string;
  version: string;
  version_display: string;
  phone_type: string;
  phone_type_display: string;
  stock_quantity: number;
}

const phoneService = {
  // Get all phones
  getAllPhones: async (params?: Record<string, any>) => {
    try {
      const response = await api.get<PaginatedResponse<Phone>>('phones/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get phone by ID
  getPhoneById: async (id: number) => {
    try {
      const response = await api.get(`phones/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create phone
  createPhone: async (phoneData: FormData) => {
    try {
      const response = await api.post('phones/', phoneData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update phone
  updatePhone: async (id: number, phoneData: FormData) => {
    try {
      const response = await api.put(`phones/${id}/`, phoneData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete phone
  deletePhone: async (id: number) => {
    try {
      const response = await api.delete(`phones/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search phones by code
  searchByCode: async (code: string, page?: number, pageSize?: number) => {
    try {
      const params: Record<string, any> = { code };
      if (page) params.page = page;
      if (pageSize) params.page_size = pageSize;
      
      const response = await api.get<PaginatedResponse<Phone>>('phones/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search phones by name
  searchByName: async (name: string, page?: number, pageSize?: number) => {
    try {
      const params: Record<string, any> = { name };
      if (page) params.page = page;
      if (pageSize) params.page_size = pageSize;
      
      const response = await api.get<PaginatedResponse<Phone>>('phones/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get phones by brand
  getByBrand: async (brandId: number, page?: number, pageSize?: number) => {
    try {
      const params: Record<string, any> = { brand: brandId };
      if (page) params.page = page;
      if (pageSize) params.page_size = pageSize;
      
      const response = await api.get<PaginatedResponse<Phone>>('phones/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default phoneService;
