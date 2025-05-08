import api from './axios';

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
  getAllBrands: async () => {
    try {
      const response = await api.get('brands/');
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
      const response = await api.put(`brands/${id}/`, brandData, {
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
