import api from './axios';
import { PaginatedResponse } from '../types/pagination';

export interface Model {
  id: number;
  brand: number;
  brand_name: string;
  name: string;
  description: string | null;
  release_date: string | null;
}

const modelService = {
  // Get all models with pagination support
  getAllModels: async (params?: Record<string, any>) => {
    try {
      const response = await api.get<PaginatedResponse<Model>>('models/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get models by brand ID with pagination support
  getModelsByBrand: async (brandId: number, page?: number, pageSize?: number) => {
    try {
      const params: Record<string, any> = { brand: brandId };
      if (page) params.page = page;
      if (pageSize) params.page_size = pageSize;
      
      const response = await api.get<PaginatedResponse<Model>>('models/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Search models by name
  searchByName: async (name: string, page?: number, pageSize?: number) => {
    try {
      const params: Record<string, any> = { name };
      if (page) params.page = page;
      if (pageSize) params.page_size = pageSize;
      
      const response = await api.get<PaginatedResponse<Model>>('models/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get model by ID
  getModelById: async (id: number) => {
    try {
      const response = await api.get(`models/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create model
  createModel: async (modelData: Partial<Model>) => {
    try {
      const response = await api.post('models/', modelData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update model
  updateModel: async (id: number, modelData: Partial<Model>) => {
    try {
      const response = await api.put(`models/${id}/`, modelData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete model
  deleteModel: async (id: number) => {
    try {
      const response = await api.delete(`models/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default modelService;
