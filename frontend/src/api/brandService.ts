import api from './axios';
import { PaginatedResponse } from '../types/pagination';

export interface Brand {
  id: number;
  name: string;
  origin_country: string | null;
  picture: string | null;
  description: string | null;
  website: string | null;
}

const brandService = {
  // Get all brands
  getAllBrands: async (params?: Record<string, any>) => {
    try {
      const response = await api.get<PaginatedResponse<Brand>>('brands/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Search brands by name
  searchByName: async (name: string, page?: number, pageSize?: number) => {
    try {
      const params: Record<string, any> = { name };
      if (page) params.page = page;
      if (pageSize) params.page_size = pageSize;
      const response = await api.get<PaginatedResponse<Brand>>('brands/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get brand by ID
  getBrandById: async (id: number) => {
    try {
      const response = await api.get(`brands/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create brand
  createBrand: async (brandData: FormData) => {
    try {
      const response = await api.post('brands/', brandData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update brand
  updateBrand: async (id: number, brandData: FormData) => {
    try {
      // Use PATCH instead of PUT to allow partial updates
      // This prevents clearing the image when none is provided
      const response = await api.patch(`brands/${id}/`, brandData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete brand
  deleteBrand: async (id: number) => {
    try {
      const response = await api.delete(`brands/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default brandService;
