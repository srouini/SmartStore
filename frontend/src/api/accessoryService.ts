import api from './axios';
import { PaginatedResponse } from '../types/pagination';

export interface Accessory {
  id: number;
  name: string;
  brand: number;
  brand_name: string;
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
  accessory_category: string;
  accessory_category_display: string;
  color: string | null;
  material: string | null;
  compatible_phones: number[];
  compatible_phones_info: Array<{ id: number; name: string; code: string }>;
  voltage_v: number | null;
  amperage_a: number | null;
  wattage_w: number | null;
  battery_capacity_mah: number | null;
  cable_type: string | null;
  length_cm: number | null;
  connection_type: string | null;
  wireless_range_m: number | null;
  noise_cancellation: boolean;
  hardness_rating: string | null;
  finish: string | null;
  additional_specs: Record<string, any> | null;
  stock_quantity: number;
}

const accessoryService = {
  // Get all accessories
  getAllAccessories: async (params?: Record<string, any>) => {
    try {
      const response = await api.get<PaginatedResponse<Accessory>>('accessories/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get accessory by ID
  getAccessoryById: async (id: number) => {
    try {
      const response = await api.get(`accessories/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create accessory
  createAccessory: async (accessoryData: FormData) => {
    try {
      const response = await api.post('accessories/', accessoryData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update accessory
  updateAccessory: async (id: number, accessoryData: FormData) => {
    try {
      const response = await api.put(`accessories/${id}/`, accessoryData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete accessory
  deleteAccessory: async (id: number) => {
    try {
      const response = await api.delete(`accessories/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search accessories by code
  searchByCode: async (code: string, page?: number, pageSize?: number) => {
    try {
      const params: Record<string, any> = { code };
      if (page) params.page = page;
      if (pageSize) params.page_size = pageSize;
      const response = await api.get<PaginatedResponse<Accessory>>('accessories/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search accessories by name
  searchByName: async (name: string, page?: number, pageSize?: number) => {
    try {
      const params: Record<string, any> = { name };
      if (page) params.page = page;
      if (pageSize) params.page_size = pageSize;
      const response = await api.get<PaginatedResponse<Accessory>>('accessories/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get accessories by category
  getByCategory: async (category: string, page?: number, pageSize?: number) => {
    try {
      const params: Record<string, any> = { category };
      if (page) params.page = page;
      if (pageSize) params.page_size = pageSize;
      const response = await api.get<PaginatedResponse<Accessory>>('accessories/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get accessories compatible with a specific phone
  getCompatibleWithPhone: async (phoneId: number, page?: number, pageSize?: number) => {
    try {
      const params: Record<string, any> = { compatible_with: phoneId };
      if (page) params.page = page;
      if (pageSize) params.page_size = pageSize;
      const response = await api.get<PaginatedResponse<Accessory>>('accessories/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default accessoryService;
