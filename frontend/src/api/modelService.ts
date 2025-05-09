import api from './axios';

export interface Model {
  id: number;
  brand: number;
  brand_name: string;
  name: string;
  description: string | null;
  release_date: string | null;
}

const modelService = {
  // Get all models
  getAllModels: async () => {
    try {
      const response = await api.get('models/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get models by brand ID
  getModelsByBrand: async (brandId: number) => {
    try {
      const response = await api.get(`models/?brand_id=${brandId}`);
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
